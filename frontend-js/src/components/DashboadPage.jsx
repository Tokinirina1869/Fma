import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowRight, FaList, FaChild, FaUserTie, FaUsers, FaUserGraduate,
  FaChalkboardTeacher, FaMoneyCheckAlt, FaExclamationTriangle,
  FaCalendarDay, FaCalendarAlt, FaChevronDown, FaSync
} from "react-icons/fa";
import CountUp from "react-countup";
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  Area, AreaChart, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

/* ── Constants ── */
const SECONDARY_COLOR = '#4F46E5';
const BASE_URL        = 'https://fma-inscription.onrender.com/api';
const AGE_COLORS      = ['#EF4444', '#10B981'];
const GENDER_COLORS   = ['#EC4899', '#3B82F6'];
const MONTH_COLORS    = ['#4F46E5','#818CF8','#6366F1','#A5B4FC','#C7D2FE','#3730A3','#4338CA','#6D28D9','#7C3AED','#8B5CF6','#A78BFA','#DDD6FE'];

/* ── Helpers ── */
const formatAriary = (v) => new Intl.NumberFormat('fr-MG').format(v ?? 0);

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const displayValue = d.pourcentage
    ? `${formatAriary(d.total)} Apprenants (${d.pourcentage}%)`
    : unit === 'Ar'
      ? `${formatAriary(payload[0].value)} Ar`
      : `${formatAriary(payload[0].value)} ${unit}`;
  return (
    <div className="bg-white px-3 py-2 border border-gray-200 rounded-xl shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-indigo-600 font-bold">{displayValue}</p>
    </div>
  );
};

const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
    <FaExclamationTriangle size={32} />
    <p className="text-sm text-center">{message}</p>
  </div>
);

/* ── Skeleton loader ── */
const Skeleton = ({ h = "h-32", className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-2xl ${h} ${className}`} />
);

/* ══════════════════════════════════════════════════════════ */
function DashboardPage({ autre }) {
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [anneeScolaire,    setAnneeScolaire]     = useState('');   // '' = en cours
  const [anneesDispos,     setAnneesDispos]      = useState([]);
  const [dashboardData,    setDashboardData]     = useState(null);
  const [labelAS,          setLabelAS]           = useState('');

  /* ── Fetch ── */
  const fetchData = async (annee = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = annee ? { annee_scolaire: annee } : {};
      const res  = await axios.get(`${BASE_URL}/dashboard/global-stats`, { params });
      const data = res.data.data || {};

      setDashboardData({
        totals: {
          general:   data.total_general   || 0,
          eleve:     data.total_eleve     || 0,
          formation: data.total_formation || 0,
          paiement:  data.total_paiement  || 0,
          montant:   data.total_montant_annee_scolaire || 0,
        },
        demographics: {
          mineurs: data.mineurs_global || 0,
          majeurs: data.majeurs_global || 0,
        },
        charts: {
          ageData:          data.age_data              || [],
          sexeData:         data.sexe_data             || [],
          paiementsSemaine: data.paiements_semaine     || [],
          paiementsMois:    data.paiements_mois        || [],
          inscriptionsParMois: data.inscriptions_par_mois || [],
        },
        dailyTotals:  data.inscriptions_par_jour || [],
        today: {
          total: data.inscrit_today       || 0,
          cfp:   data.inscrit_today_cfp   || 0,
          lycee: data.inscrit_today_lycee || 0,
        },
      });

      setLabelAS(data.annee_scolaire?.label || '');
      if (data.annees_disponibles?.length) setAnneesDispos(data.annees_disponibles);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement. Veuillez rafraîchir.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(anneeScolaire); }, [anneeScolaire]);

  /* ── Error state ── */
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <FaExclamationTriangle className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-3">Erreur de chargement</h2>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <button onClick={() => fetchData(anneeScolaire)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
          Réessayer
        </button>
      </div>
    </div>
  );

  const { totals, demographics, charts, dailyTotals, today } = dashboardData || {};

  /* ── KPI cards config ── */
  const statsCards = [
    { title: "Total Inscrits",       icon: FaUsers,            value: totals?.general,   color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-400' },
    { title: "Académiques",          icon: FaUserGraduate,     value: totals?.eleve,     color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-400' },
    { title: "Professionnel",        icon: FaChalkboardTeacher,value: totals?.formation, color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-400' },
    { title: "Nb Paiements",         icon: FaMoneyCheckAlt,    value: totals?.paiement,  color: 'text-cyan-600',   bg: 'bg-cyan-50',    border: 'border-cyan-400' },
    { title: "Mineur(s)",            icon: FaChild,            value: demographics?.mineurs, color: 'text-red-500',  bg: 'bg-red-50',   border: 'border-red-400' },
    { title: "Majeur(s)",            icon: FaUserTie,          value: demographics?.majeurs, color: 'text-teal-500', bg: 'bg-teal-50',  border: 'border-teal-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
            <FaList className="text-white" size={16} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">Tableau de bord Général</h1>
            {labelAS && (
              <p className="text-xs text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                <FaCalendarAlt size={10} /> Année scolaire {labelAS}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sélecteur d'année scolaire */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
              <FaCalendarAlt className="text-indigo-500" size={13} />
              <select
                value={anneeScolaire}
                onChange={(e) => setAnneeScolaire(e.target.value)}
                className="appearance-none bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer pr-6"
              >
                <option value="">Année en cours</option>
                {anneesDispos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <FaChevronDown className="text-gray-400 absolute right-3 pointer-events-none" size={11} />
            </div>
          </div>

          {/* Rafraîchir */}
          <button onClick={() => fetchData(anneeScolaire)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition text-sm font-semibold"
          >
            <FaSync size={12} /> Actualiser
          </button>

          {/* Autre pages */}
          <button onClick={autre}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition text-sm"
          >
            Autres pages <FaArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* ── Bandeau "aujourd'hui" ── */}
      <div className="bg-indigo-600 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <FaCalendarDay size={15} />
          Inscriptions aujourd'hui
        </div>
        <div className="flex items-center gap-6 text-white text-sm font-semibold">
          <div className="text-center">
            <p className="text-2xl font-extrabold">{loading ? '…' : today?.total}</p>
            <p className="text-indigo-200 text-xs">Total</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-2xl font-extrabold">{loading ? '…' : today?.cfp}</p>
            <p className="text-indigo-200 text-xs">CFP</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-2xl font-extrabold">{loading ? '…' : today?.lycee}</p>
            <p className="text-indigo-200 text-xs">Lycée</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-lg font-extrabold">{loading ? '…' : `${formatAriary(totals?.montant)} Ar`}</p>
            <p className="text-indigo-200 text-xs">Recette totale (AS)</p>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} h="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statsCards.map((item, idx) => (
            <div key={idx}
              className={`${item.bg} rounded-2xl p-4 flex flex-col justify-between border-l-4 ${item.border} shadow hover:shadow-md transition`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-500 leading-tight">{item.title}</h3>
                <item.icon className={`${item.color} flex-shrink-0`} size={18} />
              </div>
              <p className={`text-2xl font-extrabold text-center ${item.color}`}>
                <CountUp end={item.value ?? 0} duration={1.5} separator=" " />
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Graphiques ligne 1 ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} h="h-80" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Pie Âge */}
          <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
              <span className="w-1 h-4 bg-indigo-600 rounded-full" /> Répartition par Âge
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              {charts.ageData.length > 0 ? (
                <PieChart>
                  <Pie data={charts.ageData} dataKey="total" nameKey="categorie"
                    cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4}
                    label={({ pourcentage }) => `${pourcentage}%`} labelLine={false}
                  >
                    {charts.ageData.map((_, i) => <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                </PieChart>
              ) : <EmptyChart message="Aucune donnée d'âge disponible" />}
            </ResponsiveContainer>
          </div>

          {/* Pie Sexe */}
          <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
              <span className="w-1 h-4 bg-indigo-600 rounded-full" /> Répartition par Sexe
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              {charts.sexeData.length > 0 ? (
                <PieChart>
                  <Pie data={charts.sexeData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4} label labelLine={false}
                  >
                    {charts.sexeData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${formatAriary(v)} Apprenants`, "Total"]}
                    contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                </PieChart>
              ) : <EmptyChart message="Aucune donnée disponible" />}
            </ResponsiveContainer>
          </div>

          {/* Pie Recette par mois */}
          <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
              <span className="w-1 h-4 bg-indigo-600 rounded-full" /> Recette par mois
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              {charts.paiementsMois.length > 0 ? (
                <PieChart>
                  <Pie data={charts.paiementsMois} dataKey="montant" nameKey="mois"
                    cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4} labelLine={false}
                    label={({ montant }) => `${formatAriary(montant)}`}
                  >
                    {charts.paiementsMois.map((_, i) => <Cell key={i} fill={MONTH_COLORS[i % MONTH_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${formatAriary(v)} Ar`, "Montant"]}
                    contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                </PieChart>
              ) : <EmptyChart message="Aucune donnée de paiement disponible" />}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Graphiques ligne 2 ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Skeleton h="h-80" /> <Skeleton h="h-80" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* BarChart recette 4 semaines */}
          <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
              <span className="w-1 h-4 bg-indigo-600 rounded-full" /> Recette (4 dernières semaines)
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              {charts.paiementsSemaine.length > 0 ? (
                <BarChart data={charts.paiementsSemaine} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="semaine" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={(v) => `${formatAriary(v)}`} />
                  <Tooltip content={<CustomTooltip unit="Ar" />} labelFormatter={(l) => `Semaine : ${l}`} />
                  <Bar dataKey="montant" name="Montant" maxBarSize={55} radius={[8, 8, 0, 0]} animationDuration={1200}
                    label={{ position: 'top', formatter: (v) => formatAriary(v), fill: '#4f46e5', fontSize: 11, fontWeight: 'bold' }}
                  >
                    {charts.paiementsSemaine.map((_, i) => <Cell key={i} fill={SECONDARY_COLOR} />)}
                  </Bar>
                </BarChart>
              ) : <EmptyChart message="Aucune donnée hebdomadaire" />}
            </ResponsiveContainer>
          </div>

          {/* Area chart inscriptions semaine courante */}
          <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
              <span className="w-1 h-4 bg-indigo-600 rounded-full" />
              <FaCalendarDay className="text-indigo-600" size={13} /> Inscrits cette semaine
            </h2>
            {dailyTotals.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={265}>
                  <AreaChart data={dailyTotals} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jour" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9ca3af" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v, n) => {
                        if (n === "total") return [`${v} inscrits`, "Total"];
                        if (n === "cfp")   return [`${v}`, "CFP"];
                        if (n === "lycee") return [`${v}`, "Lycée"];
                        return [v, n];
                      }}
                      labelFormatter={(l) => `Jour : ${l}`}
                      contentStyle={{ borderRadius: 10, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="total" stroke={SECONDARY_COLOR} strokeWidth={3}
                      fill={SECONDARY_COLOR} fillOpacity={0.15}
                      dot={{ r: 5, fill: SECONDARY_COLOR, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 7 }}
                    />
                    <Area type="monotone" dataKey="cfp"   stroke="#10B981" fill="none" strokeWidth={2} dot={{ r: 3 }} />
                    <Area type="monotone" dataKey="lycee" stroke="#F59E0B" fill="none" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="border-t pt-2 mt-1 flex justify-between text-sm font-bold text-indigo-700">
                  <span>Total semaine</span>
                  <span>{dailyTotals.reduce((a, d) => a + d.total, 0)}</span>
                </div>
              </>
            ) : <EmptyChart message="Aucune inscription cette semaine" />}
          </div>
        </div>
      )}

      {/* ── Nouveau : Inscriptions par mois (année scolaire) ── */}
      {loading ? (
        <Skeleton h="h-72" />
      ) : (
        <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-600 rounded-full" />
              Inscriptions par mois — Année scolaire {labelAS}
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">
              {charts.inscriptionsParMois.reduce((a, m) => a + m.total, 0)} au total
            </span>
          </div>
          {charts.inscriptionsParMois.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.inscriptionsParMois} margin={{ top: 16, right: 16, left: 0, bottom: 8 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mois" stroke="#9ca3af" tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(0, 3)} />
                <YAxis stroke="#9ca3af" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v, n) => {
                    if (n === "total") return [`${v}`, "Total"];
                    if (n === "cfp")   return [`${v}`, "CFP"];
                    if (n === "lycee") return [`${v}`, "Lycée"];
                    return [v, n];
                  }}
                  labelFormatter={(l) => `Mois : ${l}`}
                  contentStyle={{ borderRadius: 10, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Total"  fill={SECONDARY_COLOR} radius={[6,6,0,0]} maxBarSize={40} />
                <Bar dataKey="cfp"   name="CFP"    fill="#10B981"         radius={[6,6,0,0]} maxBarSize={40} />
                <Bar dataKey="lycee" name="Lycée"  fill="#F59E0B"         radius={[6,6,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message={`Aucune inscription pour l'année scolaire ${labelAS}`} />}
        </div>
      )}

    </div>
  );
}

export default DashboardPage;