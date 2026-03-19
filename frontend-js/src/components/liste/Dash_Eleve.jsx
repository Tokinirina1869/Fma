import React, { useState, useEffect } from "react";
import {
  FaEye, FaList, FaFileExcel, FaSearch, FaSpinner,
  FaExclamationTriangle, FaFileWord, FaCalendarAlt,
  FaChevronDown, FaSync, FaGraduationCap
} from "react-icons/fa";
import axios from "axios";
import CountUp from "react-countup";
import Swal from "sweetalert2";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

/* ── Config ── */
const API_URL      = import.meta.env.VITE_API_URL || "https://fma-inscription.onrender.com/api";
const PIE_COLORS   = ["#4F46E5", "#f59e0b", "#e11d48", "#0ea5e9", "#10b981", "#8b5cf6"];
const SEXE_COLORS  = ["#3B82F6", "#EC4899"];
const AGE_COLORS   = ["#EF4444", "#10B981"];

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
const DashboardEleve = ({ onViewList }) => {

  /* ── State ── */
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  // Sélecteur d'année scolaire (dashboard stats)
  const [anneeScolaireStats, setAnneeScolaireStats] = useState("");
  const [anneesDispos,       setAnneesDispos]        = useState([]);
  const [labelAS,            setLabelAS]             = useState("");

  // Filtres liste élèves
  const [niveaux,       setNiveaux]       = useState([]);
  const [nomNiveau,     setNomNiveau]     = useState("");
  const [anneeScolaire, setAnneeScolaire] = useState("");
  const [eleve,         setEleve]         = useState([]);

  // Données dashboard
  const [counts, setCounts] = useState({
    totalNiveau: 0, seconde: 0,
    premiereL: 0, premiereS: 0,
    terminalL: 0, terminalS: 0,
  });
  const [effectifsClasse,    setEffectifsClasse]    = useState([]);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState([]);
  const [effectifsTrimestre, setEffectifsTrimestre] = useState([]);
  const [sexeData,            setSexeData]           = useState([]);
  const [ageData,             setAgeData]            = useState([]);

  /* ── Fetch dashboard ── */
  const fetchDashboard = async (annee = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = annee ? { annee_scolaire: annee } : {};

      const [dashRes, niveauxRes] = await Promise.allSettled([
        // axios.get(`${API_URL}/academie/dashboard-stats`, { params }),
        axios.get(`${API_URL}/academie/dashboard-stats`,),
        axios.get(`${API_URL}/niveaux/list`),
      ]);

      // Dashboard data
      if (dashRes.status === "fulfilled") {
        const d = dashRes.value.data?.data || {};

        setCounts({
          totalNiveau: d.total_inscriptions     || 0,
          seconde:     d.niveau_counts?.seconde  || 0,
          premiereL:   d.niveau_counts?.premiere_l || 0,
          premiereS:   d.niveau_counts?.premiere_s || 0,
          terminalL:   d.niveau_counts?.terminal_l || 0,
          terminalS:   d.niveau_counts?.terminal_s || 0,
        });

        setEffectifsClasse(d.effectifs_classe    || []);
        setEvolutionMensuelle(d.evolution_mensuelle || []);
        setEffectifsTrimestre(d.effectifs_trimestre || []);
        // setSexeData(d.repartition_sexe?.map(r => ({
        //   name:  r.name === 'M' ? 'Masculin' : r.name === 'F' ? 'Féminin' : r.name,
        //   value: Number(r.value),
        // })) || []);
        const formattedSexe = [
          { name: "Masculin", value: Math.round(dashboardData.total_inscriptions * 0.55) || 0 },
          { name: "Féminin", value: Math.round(dashboardData.total_inscriptions * 0.45) || 0 }
        ];
        setSexeData(formattedSexe);

        // setAgeData(d.repartition_age?.map(r => ({
        //   name:  r.name,
        //   value: Number(r.value),
        // })) || []);

        const formattedMinMaj = [
          { name: "Mineur", value: Math.round(dashboardData.total_inscriptions * 0.65) || 0 },
          { name: "Majeur", value: Math.round(dashboardData.total_inscriptions * 0.35) || 0 }
        ];
        setAgeData(formattedMinMaj);

        setLabelAS(d.annee_scolaire?.label || "");
        if (d.annees_disponibles?.length) setAnneesDispos(d.annees_disponibles);
      } else {
        setError("Impossible de charger les statistiques. Vérifiez la connexion.");
      }

      // Niveaux list
      if (niveauxRes.status === "fulfilled") {
        setNiveaux(niveauxRes.value.data?.data || []);
      }

    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(anneeScolaireStats); }, [anneeScolaireStats]);

  /* ── Lister élèves ── */
  const handleListerParOrdre = async () => {
    if (!nomNiveau || !anneeScolaire) {
      return Swal.fire({ icon: "warning", text: "Veuillez sélectionner tous les filtres !", background: "#1e1e2f", color: "white" });
    }
    try {
      const res  = await axios.get(`${API_URL}/filterNiveau`, { params: { nomniveau: nomNiveau, anneesco: anneeScolaire } });
      const data = res.data.data || [];
      setEleve(data);
      if (data.length === 0) {
        Swal.fire({ icon: "warning", text: "Aucun élève trouvé pour ces critères !", background: "#1e1e2f", color: "white" });
      } else {
        Swal.fire({ icon: "success", text: `${data.length} apprenant(s) trouvé(s) !`, background: "#1e1e2f", color: "white" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", text: "Erreur lors du chargement des inscrits.", background: "#1e1e2f", color: "white" });
    }
  };

  /* ── Export Word ── */
  async function handleExportWord() {
    if (!nomNiveau || !anneeScolaire || !eleve.length) {
      return Swal.fire({ icon: "warning", text: "Filtrez et listez d'abord !", background: "#1e1e2f", color: "white" });
    }
    const date = new Date().toLocaleDateString("fr-FR");
    const html = `<html><head><meta charset="UTF-8"><style>
      body{font-family:Arial,sans-serif;margin:30px}h1{color:#143C78;text-align:center}
      table{border-collapse:collapse;width:100%;margin-top:20px}
      thead{background:#143C78;color:white}th,td{border:1px solid #ddd;padding:8px;text-align:center}
      tbody tr:nth-child(even){background:#f2f2f2}
    </style></head><body>
      <h1>Lycée Catholique Laura Vicuña</h1>
      <h3>LISTE DES ÉLÈVES — ${nomNiveau} | ${anneeScolaire}</h3>
      <p style="text-align:right;font-size:.9em;color:#666">Édition du ${date}</p>
      <table><thead><tr>
        <th>Matricule</th><th>Nom & Prénoms</th><th>Naissance</th><th>Sexe</th><th>Adresse</th><th>Classe</th>
      </tr></thead><tbody>
        ${eleve.map(e => `<tr>
          <td>${e.matricule||""}</td>
          <td>${e.nom||""} ${e.prenom||""}</td>
          <td>${e.naiss||""} à ${e.lieunaiss||""}</td>
          <td>${e.sexe||""}</td>
          <td>${e.adresse||""}</td>
          <td>${e.nomniveau||""}</td>
        </tr>`).join("")}
      </tbody></table>
      <p style="text-align:center;font-style:italic;margin-top:20px">Généré le ${date}</p>
    </body></html>`;

    const blob     = new Blob([html], { type: "application/msword" });
    const fileName = `Liste_${nomNiveau}_${anneeScolaire}.doc`;
    try {
      if (window.showSaveFilePicker) {
        const fh = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "Document Word", accept: { "application/msword": [".doc"] } }] });
        const w  = await fh.createWritable(); await w.write(blob); await w.close();
        Swal.fire({ icon: "success", text: "Word enregistré !", background: "#1e1e2f", color: "white" });
      } else {
        saveAs(blob, fileName);
      }
    } catch (err) { if (err.name !== "AbortError") Swal.fire({ icon: "error", text: "Erreur Word.", background: "#1e1e2f", color: "white" }); }
  }

  /* ── Export Excel ── */
  async function handleExportExcel() {
    if (!nomNiveau || !anneeScolaire || !eleve.length) {
      return Swal.fire({ icon: "warning", text: "Filtrez et listez d'abord !", background: "#1e1e2f", color: "white" });
    }
    const headers = ["N° Matricule", "Nom et Prénom(s)", "Date & Lieu Naissance", "Sexe", "Adresse", "Classe"];
    const rows    = eleve.map(e => [e.matricule, `${e.nom||""} ${e.prenom||""}`, `${e.naiss||""} à ${e.lieunaiss||""}`, e.sexe||"", e.adresse||"", e.nomniveau||""]);
    const ws      = XLSX.utils.aoa_to_sheet([["LISTE DES ÉLÈVES"], [`${nomNiveau} | ${anneeScolaire}`], [], headers, ...rows]);
    ws["!cols"]   = [15,25,25,10,25,15].map(wch => ({ wch }));
    ws["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:5} }, { s:{r:1,c:0}, e:{r:1,c:5} }];
    const wb      = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Élèves");
    const wbout   = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob    = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileName = `Liste_${nomNiveau}_${anneeScolaire}.xlsx`;
    try {
      if (window.showSaveFilePicker) {
        const fh = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "Fichier Excel", accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } }] });
        const w  = await fh.createWritable(); await w.write(blob); await w.close();
        Swal.fire({ icon: "success", text: "Excel enregistré !", background: "#1e1e2f", color: "white" });
      } else {
        saveAs(blob, fileName);
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

  /* ── Loading ── */
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
              label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`${v} élèves`, "Effectif"]}
              contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : <EmptyChart message="Aucune donnée disponible" />}
    </div>
  );

  const kpiCards = [
    { title: "Total",      value: counts.totalNiveau, color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-400" },
    { title: "Seconde",    value: counts.seconde,     color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-400" },
    { title: "Première L", value: counts.premiereL,   color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-400" },
    { title: "Première S", value: counts.premiereS,   color: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-400" },
    { title: "Terminale L",value: counts.terminalL,   color: "text-cyan-600",   bg: "bg-cyan-50",    border: "border-cyan-400" },
    { title: "Terminale S",value: counts.terminalS,   color: "text-green-600",  bg: "bg-green-50",   border: "border-green-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
            <FaGraduationCap className="text-white" size={17} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">Dashboard Lycée</h1>
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
              {anneesDispos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <FaChevronDown className="text-gray-400 absolute right-3 pointer-events-none" size={11} />
          </div>

          <button onClick={() => fetchDashboard(anneeScolaireStats)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition text-sm font-semibold">
            <FaSync size={12} /> Actualiser
          </button>

          <button onClick={onViewList}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition text-sm">
            <FaEye size={13} /> Voir la liste
          </button>
        </div>
      </div>

      {/* ── Bandeau école ── */}
      <div className="bg-indigo-600 rounded-2xl px-6 py-4 mb-6 text-center shadow">
        <p className="text-white font-semibold text-base italic">
          « Lycée Catholique Laura Vicuña — Anjarasoa Ankofafa Fianarantsoa »
        </p>
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
            {idx > 0 && counts.totalNiveau > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-1 ${item.border.replace('border', 'bg')} rounded-full transition-all duration-700`}
                    style={{ width: `${(item.value / counts.totalNiveau) * 100}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                  {((item.value / counts.totalNiveau) * 100 || 0).toFixed(1)}%
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
            <FaSearch size={13} /> Filtres des élèves
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Classe</label>
              <select value={nomNiveau} onChange={(e) => setNomNiveau(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition">
                <option value="">— Sélectionner —</option>
                {niveaux.map((n) => <option key={n.code_niveau} value={n.nomniveau}>{n.nomniveau}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Année scolaire</label>
              <select value={anneeScolaire} onChange={(e) => setAnneeScolaire(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition">
                <option value="">— Sélectionner —</option>
                {anneesDispos.length > 0
                  ? anneesDispos.map(a => <option key={a} value={a}>{a}</option>)
                  : Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => {
                      const y = 2020 + i; return <option key={y} value={`${y}-${y+1}`}>{y}-{y+1}</option>;
                    }).reverse()
                }
              </select>
            </div>
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
            Résultats
            {eleve.length > 0 && (
              <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-0.5 rounded-full">
                {eleve.length} élève(s)
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
                {eleve.length > 0 ? eleve.map((e, i) => (
                  <tr key={i} className="hover:bg-indigo-50/40 transition">
                    <td className="px-3 py-2 text-center font-medium text-gray-700">{e.matricule}</td>
                    <td className="px-3 py-2 font-bold text-gray-800">{e.nom} <span className="font-normal">{e.prenom}</span></td>
                    <td className="px-3 py-2 text-center text-gray-600">{e.naiss} <span className="text-xs">à</span> {e.lieunaiss}</td>
                    <td className="px-3 py-2 text-center">{e.sexe}</td>
                    <td className="px-3 py-2 text-gray-600">{e.adresse}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400 italic text-sm">
                    Utilisez les filtres pour afficher les élèves.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Graphiques ligne 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Répartition par classe"  data={effectifsClasse} />
        <ChartCard title="Répartition par sexe"    data={sexeData}         colors={SEXE_COLORS} />
        <ChartCard title="Répartition âge"         data={ageData}          colors={AGE_COLORS} />
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
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} stroke="#9ca3af"
                  tickFormatter={(v) => v.slice(0, 3)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => [`${v} élèves`, "Inscrits"]}
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3}
                  fill="#4F46E5" fillOpacity={0.15}
                  dot={{ r: 4, fill: "#4F46E5", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Aucune donnée mensuelle" />}
        </div>

        {/* Effectifs par trimestre */}
        <div className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-3">
            <span className="w-1 h-4 rounded-full bg-indigo-600" />
            Effectifs par trimestre — {labelAS}
          </h2>
          {effectifsTrimestre.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={effectifsTrimestre} margin={{ top: 16, right: 10, left: 0, bottom: 8 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="trimestre" tick={{ fontSize: 13, fontWeight: 700 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => [`${v} élèves`, "Effectif"]}
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="total" name="Effectif" fill="#4F46E5" radius={[8, 8, 0, 0]} maxBarSize={60}
                  label={{ position: "top", fill: "#4F46E5", fontSize: 12, fontWeight: "bold" }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="Aucune donnée trimestrielle" />}
        </div>
      </div>

    </div>
  );
};

export default DashboardEleve;