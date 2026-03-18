import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEye, FaList, FaStar, FaUsers, FaSearch, FaFileExcel,
  FaChartBar, FaChartPie, FaSpinner, FaExclamationTriangle,
  FaFileWord, FaCalendarAlt, FaChevronDown, FaSync, FaBriefcase
} from "react-icons/fa";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import CountUp from "react-countup";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

/* ── Config ── */
const API_URL        = import.meta.env.VITE_API_URL || "https://fma-inscription.onrender.com/api";
const PIE_COLORS     = ["#4F46E5", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6", "#F472B6"];
const SEXE_COLORS    = ["#3B82F6", "#EC4899"];
const AGE_COLORS     = ["#EF4444", "#10B981"];

/* ── Helpers ── */
const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-56 text-gray-400 gap-2">
    <FaExclamationTriangle size={28} />
    <p className="text-sm text-center">{message}</p>
  </div>
);

const Skeleton = ({ h = "h-28", className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-2xl ${h} ${className}`} />
);

/* ══════════════════════════════════════════════════════════ */
const DashboadFormation = ({ onViewListPro }) => {

  /* ── State dashboard ── */
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [anneeScolaireStats, setAnneeScolaireStats] = useState("");
  const [anneesDispos,     setAnneesDispos]      = useState([]);
  const [labelAS,          setLabelAS]           = useState("");

  const [total,            setTotal]            = useState(0);
  const [formationCounts,  setFormationCounts]  = useState({});
  const [topParcours,      setTopParcours]       = useState(null);
  const [trimestreData,    setTrimestreData]     = useState([]);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState([]);
  const [effectifsFormation, setEffectifsFormation] = useState([]);
  const [sexeData,         setSexeData]          = useState([]);
  const [ageData,          setAgeData]           = useState([]);

  /* ── State filtres liste ── */
  const [parcours,         setParcours]          = useState([]);
  const [duree,            setDuree]             = useState("");
  const [nomFormation,     setNomFormation]      = useState("");
  const [anneeScolaire,    setAnneeScolaire]     = useState("");
  const [anneeEtude,       setAnneeEtude]        = useState("");
  const [apprenants,       setApprenants]        = useState([]);

  /* ── Fetch dashboard ── */
  const fetchDashboard = async (annee = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = annee ? { annee_scolaire: annee } : {};

      const [dashRes, parcoursRes] = await Promise.allSettled([
        axios.get(`${API_URL}/dashboard/formation-stats`, { params }),
        axios.get(`${API_URL}/parcours/list`),
      ]);

      if (dashRes.status === "fulfilled") {
        const d = dashRes.value.data?.data || {};

        setTotal(d.total_inscriptions || 0);
        setFormationCounts(d.formation_counts || {});
        setTopParcours(d.top_formation || null);
        setTrimestreData(d.trimestre_data || []);
        setEvolutionMensuelle(d.evolution_mensuelle || []);
        setEffectifsFormation(d.effectifs_formation || []);
        setSexeData(
          (d.repartition_sexe || []).map(r => ({
            name:  r.name === "M" ? "Masculin" : r.name === "F" ? "Féminin" : r.name,
            value: Number(r.value),
          }))
        );
        setAgeData((d.repartition_age || []).map(r => ({ name: r.name, value: Number(r.value) })));
        setLabelAS(d.annee_scolaire?.label || "");
        if (d.annees_disponibles?.length) setAnneesDispos(d.annees_disponibles);
      } else {
        setError("Impossible de charger les statistiques.");
      }

      if (parcoursRes.status === "fulfilled") {
        setParcours(parcoursRes.value.data?.data || []);
      }

    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(anneeScolaireStats); }, [anneeScolaireStats]);

  /* ── Lister apprenants ── */
  const handleListerParOrdre = async () => {
    if (!duree || !nomFormation || !anneeScolaire || (duree === "2 ans" && !anneeEtude)) {
      return Swal.fire({
        icon: "warning",
        text: duree === "2 ans"
          ? "Veuillez sélectionner tous les filtres (y compris l'année d'étude) !"
          : "Veuillez sélectionner tous les filtres !",
        background: "#1e1e2f", color: "white",
      });
    }
    try {
      const params = { duree, nom_formation: nomFormation, annee_scolaire: anneeScolaire };
      if (duree === "2 ans") params.annee_etude = anneeEtude;
      const res  = await axios.get(`${API_URL}/inscriptions/filter`, { params });
      const data = res.data.Data || [];
      setApprenants(data);
      Swal.fire({
        icon: data.length === 0 ? "warning" : "success",
        text: data.length === 0 ? "Aucun apprenant trouvé !" : `${data.length} apprenant(s) trouvé(s) !`,
        background: "#1e1e2f", color: "white",
      });
    } catch (err) {
      Swal.fire({ icon: "error", text: "Erreur lors du chargement des inscrits.", background: "#1e1e2f", color: "white" });
    }
  };

  /* ── Export Word ── */
  async function handleExportWord() {
    if (!nomFormation || !anneeScolaire || !apprenants.length) {
      return Swal.fire({ icon: "warning", text: "Filtrez et listez d'abord !", background: "#1e1e2f", color: "white" });
    }
    const date = new Date().toLocaleDateString("fr-FR");
    const html = `<html><head><meta charset="UTF-8"><style>
      body{font-family:Arial;margin:30px}h1{color:#1D4ED8;text-align:center}
      table{border-collapse:collapse;width:100%;margin-top:20px}
      thead{background:#1D4ED8;color:white}th,td{border:1px solid #ddd;padding:8px;text-align:center}
      tbody tr:nth-child(even){background:#f2f2f2}
    </style></head><body>
      <h1>Centre de Formation Professionnelle (CFP)</h1>
      <h3>LISTE DES APPRENANTS — ${nomFormation} | ${anneeScolaire}</h3>
      <p style="text-align:right;font-size:.9em;color:#666">Édition du ${date}</p>
      <table><thead><tr>
        <th>Matricule</th><th>Nom & Prénoms</th><th>Naissance</th><th>Sexe</th><th>Adresse</th><th>Durée</th><th>Formation</th>
      </tr></thead><tbody>
        ${apprenants.map(a => `<tr>
          <td>${a.matricule||""}</td><td>${a.nom||""} ${a.prenom||""}</td>
          <td>${a.naiss||""} à ${a.lieunaiss||""}</td><td>${a.sexe||""}</td>
          <td>${a.adresse||""}</td><td>${a.duree||""}</td><td>${a.nomformation||""}</td>
        </tr>`).join("")}
      </tbody></table>
      <p style="text-align:center;font-style:italic;margin-top:20px">Généré le ${date}</p>
    </body></html>`;

    const blob     = new Blob([html], { type: "application/msword" });
    const fileName = `Liste_${nomFormation.replace(/\s/g,"")}_${anneeScolaire}.doc`;
    try {
      if (window.showSaveFilePicker) {
        const fh = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "Document Word", accept: { "application/msword": [".doc"] } }] });
        const w  = await fh.createWritable(); await w.write(blob); await w.close();
        Swal.fire({ icon: "success", text: "Word enregistré !", background: "#1e1e2f", color: "white" });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
      }
    } catch (err) { if (err.name !== "AbortError") Swal.fire({ icon: "error", text: "Erreur Word.", background: "#1e1e2f", color: "white" }); }
  }

  /* ── Export Excel ── */
  async function handleExportExcel() {
    if (!nomFormation || !anneeScolaire || !apprenants.length) {
      return Swal.fire({ icon: "warning", text: "Filtrez et listez d'abord !", background: "#1e1e2f", color: "white" });
    }
    const headers = ["Matricule","Nom & Prénoms","Date & Lieu Naissance","Sexe","Adresse","Durée","Formation"];
    const rows    = apprenants.map(a => [a.matricule,`${a.nom||""} ${a.prenom||""}`,`${a.naiss||""} à ${a.lieunaiss||""}`,a.sexe||"",a.adresse||"",a.duree||"",a.nomformation||""]);
    const ws      = XLSX.utils.aoa_to_sheet([["LISTE DES APPRENANTS"],[`${nomFormation} | ${anneeScolaire}`],[],headers,...rows]);
    ws["!cols"]   = [15,25,30,10,30,15,20].map(wch => ({ wch }));
    ws["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:6} },{ s:{r:1,c:0}, e:{r:1,c:6} }];
    const wb      = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Apprenants");
    const blob    = new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileName = `Liste_${nomFormation.replace(/\s/g,"")}_${anneeScolaire}.xlsx`;
    try {
      if (window.showSaveFilePicker) {
        const fh = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "Excel", accept: {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx"]} }] });
        const w  = await fh.createWritable(); await w.write(blob); await w.close();
        Swal.fire({ icon: "success", text: "Excel enregistré !", background: "#1e1e2f", color: "white" });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
      }
    } catch (err) { if (err.name !== "AbortError") Swal.fire({ icon: "error", text: "Erreur Excel.", background: "#1e1e2f", color: "white" }); }
  }

  /* ── Error state ── */
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <FaExclamationTriangle className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-3">Données partielles</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => fetchDashboard(anneeScolaireStats)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">
            Réessayer
          </button>
          <button onClick={() => setError(null)}
            className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition text-sm">
            Continuer
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
      <p className="text-lg text-indigo-600 font-semibold">Chargement...</p>
    </div>
  );

  /* ── Sub-components ── */
  const ChartCard = ({ title, data, colors = PIE_COLORS }) => (
    <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition border border-gray-100">
      <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
        <span className="w-1 h-4 rounded-full bg-indigo-600" /> {title}
      </h2>
      {data?.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
              outerRadius={100} innerRadius={48} paddingAngle={3} labelLine={false}
              label={({ name, percent }) => `${(percent*100).toFixed(1)}%`}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`${v} apprenants`, "Effectif"]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : <EmptyChart message="Aucune donnée disponible" />}
    </div>
  );

  const kpiCards = [
    { title: "Effectif Total",    value: total,                           color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-400" },
    { title: "Musique",           value: formationCounts.musique       || 0, color: "text-red-600",    bg: "bg-red-50",     border: "border-red-400" },
    { title: "Informatique",      value: formationCounts.informatique  || 0, color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-400" },
    { title: "Coupe & Couture",   value: formationCounts.coupe_couture || 0, color: "text-pink-600",   bg: "bg-pink-50",    border: "border-pink-400" },
    { title: "Langues",           value: formationCounts.langues       || 0, color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-400" },
    { title: "Pâtisserie",        value: formationCounts.patisserie    || 0, color: "text-teal-600",   bg: "bg-teal-50",    border: "border-teal-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
            <FaBriefcase className="text-white" size={17} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">Dashboard Formation</h1>
            {labelAS && (
              <p className="text-xs text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                <FaCalendarAlt size={10} /> Année scolaire {labelAS}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sélecteur AS */}
          <div className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <FaCalendarAlt className="text-indigo-500" size={13} />
            <select value={anneeScolaireStats} onChange={(e) => setAnneeScolaireStats(e.target.value)}
              className="appearance-none bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer pr-5">
              <option value="">Année en cours</option>
              {anneesDispos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <FaChevronDown className="text-gray-400 absolute right-3 pointer-events-none" size={11} />
          </div>

          <button onClick={() => fetchDashboard(anneeScolaireStats)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition text-sm font-semibold">
            <FaSync size={12} /> Actualiser
          </button>

          <button onClick={onViewListPro}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition text-sm">
            <FaEye size={13} /> Voir la liste
          </button>
        </div>
      </div>

      {/* ── Bandeau établissement ── */}
      <div className="bg-indigo-600 rounded-2xl px-6 py-4 mb-6 shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white font-semibold text-base italic text-center">
            « Centre de Formation Professionnelle Laura Vicuña — Anjarasoa Ankofafa »
          </p>
          {topParcours && (
            <div className="flex items-center gap-2 bg-white/15 border border-white/25 text-white text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
              <FaStar className="text-yellow-300" size={13} />
              {topParcours.nomformation}
              <span className="text-white/70 text-xs">({topParcours.total} inscrits)</span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpiCards.map((item, idx) => (
          <div key={idx}
            className={`${item.bg} rounded-2xl p-4 border-l-4 ${item.border} shadow hover:shadow-md transition`}>
            <p className="text-xs font-semibold text-gray-500 mb-2">{item.title}</p>
            <p className={`text-2xl font-extrabold text-center ${item.color}`}>
              <CountUp end={item.value} duration={1.5} separator=" " />
            </p>
            {idx > 0 && total > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-1 ${item.border.replace("border","bg")} rounded-full transition-all duration-700`}
                    style={{ width: `${(item.value / total) * 100}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                  {((item.value / total) * 100 || 0).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Filtre + Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow p-5 border border-indigo-100">
          <h2 className="text-sm font-bold text-indigo-700 mb-4 flex items-center gap-2 border-b pb-3">
            <FaSearch size={13} /> Filtres des apprenants
          </h2>
          <div className="space-y-3">
            {[
              { label: "Durée de la formation", value: duree, onChange: (v) => { setDuree(v); setAnneeEtude(""); },
                options: [["", "— Sélectionner —"],["3 mois","3 mois"],["2 ans","2 ans"]] },
              { label: "Formation", value: nomFormation, onChange: setNomFormation,
                options: [["","— Sélectionner —"], ...parcours.map(p => [p.nomformation, p.nomformation])] },
              { label: "Année scolaire", value: anneeScolaire, onChange: setAnneeScolaire,
                options: [["","— Sélectionner —"], ...anneesDispos.map(a => [a,a])] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</label>
                <select value={value} onChange={(e) => onChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition">
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}

            {duree === "2 ans" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Année d'étude</label>
                <select value={anneeEtude} onChange={(e) => setAnneeEtude(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition">
                  <option value="">— Sélectionner —</option>
                  <option value="1ere année">1ère année</option>
                  <option value="2eme année">2ème année</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <button onClick={handleListerParOrdre}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-sm shadow">
              <FaSearch size={12} /> Afficher la liste
            </button>
            <button onClick={handleExportWord}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm shadow">
              <FaFileWord size={12} /> Exporter Word
            </button>
            <button onClick={handleExportExcel}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-sm shadow">
              <FaFileExcel size={12} /> Exporter Excel
            </button>
          </div>
        </div>

        {/* Table résultats */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
            <span className="w-1 h-4 rounded-full bg-indigo-600" />
            Liste des apprenants filtrés
            {apprenants.length > 0 && (
              <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-0.5 rounded-full">
                {apprenants.length} apprenant(s)
              </span>
            )}
          </h2>
          <div className="max-h-[420px] overflow-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-indigo-600 text-white">
                <tr>
                  {["Matricule","Nom & Prénoms","Naissance","Sexe","Adresse"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apprenants.length > 0 ? apprenants.map((a, i) => (
                  <tr key={i} className="hover:bg-indigo-50/40 transition">
                    <td className="px-3 py-2 text-center font-medium text-gray-700">{a.matricule}</td>
                    <td className="px-3 py-2 font-bold text-gray-800">{a.nom} <span className="font-normal">{a.prenom}</span></td>
                    <td className="px-3 py-2 text-center text-gray-600">{a.naiss} <span className="text-xs">à</span> {a.lieunaiss}</td>
                    <td className="px-3 py-2 text-center">{a.sexe}</td>
                    <td className="px-3 py-2 text-gray-600">{a.adresse}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400 italic text-sm">
                    Utilisez les filtres pour afficher les apprenants.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Graphiques ligne 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Répartition par formation" data={effectifsFormation} />
        <ChartCard title="Répartition par sexe"      data={sexeData}           colors={SEXE_COLORS} />
        <ChartCard title="Répartition par âge"       data={ageData}            colors={AGE_COLORS} />
      </div>

      {/* ── Graphiques ligne 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Évolution mensuelle */}
        <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
            <span className="w-1 h-4 rounded-full bg-indigo-600" />
            Évolution mensuelle — {labelAS}
          </h2>
          {evolutionMensuelle.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={evolutionMensuelle} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => v.slice(0,3)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => [`${v} apprenants`, "Inscrits"]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3}
                  fill="#4F46E5" fillOpacity={0.15}
                  dot={{ r: 4, fill: "#4F46E5", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Aucune donnée mensuelle disponible" />}
        </div>

        {/* Effectifs par trimestre */}
        <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
            <span className="w-1 h-4 rounded-full bg-indigo-600" />
            Effectifs par trimestre — {labelAS}
          </h2>
          {trimestreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trimestreData} margin={{ top: 16, right: 10, left: 0, bottom: 8 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="trimestre" tick={{ fontSize: 13, fontWeight: 700 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => [`${v} apprenants`, "Effectif"]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="total" name="Effectif" fill="#4F46E5" radius={[8,8,0,0]} maxBarSize={60}
                  label={{ position: "top", fill: "#4F46E5", fontSize: 12, fontWeight: "bold" }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Aucune donnée trimestrielle disponible" />}
        </div>
      </div>

    </div>
  );
};

export default DashboadFormation;