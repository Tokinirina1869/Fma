import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaList, FaStar, FaMusic, FaLaptopCode, FaCut, FaLanguage, FaBirthdayCake, FaUsers, FaSearch, FaFileExcel, FaChartBar, FaChartPie, FaSpinner, FaExclamationTriangle, FaFileWord } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import CountUp from 'react-countup';
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

// Définitions de couleurs modernes pour Tailwind
const PRIMARY_COLOR = '#1D4ED8';
const SECONDARY_COLOR = '#059669';
const PIE_COLORS = [
  '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#F472B6'
];

const sexe_Colors = ["#bf0c33ff", "#143C78"];
const minmaj_Colors = ["#061389ff", "#087f0aff"];

const url = "http://localhost:8000/api";

// Composant pour la carte KPI
const KpiCard = ({ title, icon, value, color, bg }) => {
  const IconComponent = ({ className }) => <i className={`${icon} ${className}`}></i>;

  return (
    <div className={`rounded-xl shadow-xl p-5 flex flex-col justify-between ${bg} transition duration-300 hover:shadow-2xl border-l-4 ${color.replace('text', 'border')}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg text-center font-medium text-gray-600 leading-snug">{title}</h3>
        <IconComponent className={`w-6 h-6 text-2xl ${color}`} />
      </div>
      <p className={`text-3xl text-center font-extrabold ${color}`}>
        <CountUp end={value} duration={1.5} separator=" " />
      </p>
    </div>
  );
};

// Tooltip personnalisé pour Recharts
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border border-gray-200 rounded-lg shadow-md">
        <p className="font-semibold text-gray-800">{`Trimestre: ${label}`}</p>
        <p className="text-sm text-blue-600">{`Effectif: ${new Intl.NumberFormat('fr-FR').format(payload[0].value)} inscrits`}</p>
      </div>
    );
  }
  return null;
};

// Composant pour les graphiques vides
const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <FaExclamationTriangle className="w-12 h-12 mb-2" />
    <p className="text-center">{message}</p>
  </div>
);

const DashboadFormation = ({ onViewListPro }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États avec valeurs par défaut sécurisées
  const [total, setTotal] = useState(0);
  const [totalMusic, setTotalMusic] = useState(0);
  const [totalInfo, setTotalInfo] = useState(0);
  const [totalCoupe, setTotalCoupe] = useState(0);
  const [totalLangues, setTotalLangues] = useState(0);
  const [totalPatisserie, setTotalPatisserie] = useState(0);
  const [topParcours, setTopParcours] = useState(null);

  const [duree, setDuree] = useState('');
  const [nomFormation, setNomFormation] = useState('');
  const [anneeScolaire, setAnneeScolaire] = useState('');
  // Nouvel état pour l'année d'étude (1ère ou 2ème année)
  const [anneeEtude, setAnneeEtude] = useState('');
  const [apprenants, setApprenants] = useState([]);

  const [data, setData] = useState([]);
  const [parcours, setParcours] = useState([]);
  const [stats, setStats] = useState({ effectifs: [] });
  const [cfp, setCfp] = useState({ sexes: [] });
  const [mincfp, setMinCfp] = useState([]);

  // -----------------------------
  // 1. Data Fetching UNIFIÉ avec gestion d'erreur robuste
  // -----------------------------
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // SEULEMENT 2 APPELS MAINTENANT !
      const requests = [
        axios.get(`${url}/dashboard/data`),        // Toutes les stats en une fois
        axios.get(`${url}/parcours/list`)          // Liste des parcours
      ];

      const results = await Promise.allSettled(requests);
      const getData = (result, defaultValue = null) =>
        result.status === 'fulfilled' ? result.value.data : defaultValue;

      // Données du dashboard
      const dashboardResult = getData(results[0], {});
      const dashboardData = dashboardResult.data || {};

      // Liste des parcours
      const parcoursResult = getData(results[1], {});
      const parcoursData = parcoursResult.data || [];

      // Extraction et transformation des données avec fallbacks sécurisés
      const transformedTrimestre = (dashboardData.trimestre_data || []).map(item => ({
        annee: item.annee,
        trimestre: item.trimestre,
        total: item.total
      }));

      const formationCounts = dashboardData.formation_counts || {};
      const effectifsFormation = dashboardData.effectifs_formation || [];
      const repartitionSexe = dashboardData.repartition_sexe || [];
      const repartitionAge = dashboardData.repartition_age || [];
      const topFormation = dashboardData.top_formation || null;

      // Mise à jour de tous les states
      setData(transformedTrimestre);
      setTotal(dashboardData.total_inscriptions || 0);

      // Données des formations
      setTotalMusic(formationCounts.musique || 0);
      setTotalInfo(formationCounts.informatique || 0);
      setTotalCoupe(formationCounts.coupe_couture || 0);
      setTotalLangues(formationCounts.langues || 0);
      setTotalPatisserie(formationCounts.patisserie || 0);

      setTopParcours(topFormation);
      setParcours(parcoursData);
      setStats({ effectifs: effectifsFormation });
      setCfp({ sexes: repartitionSexe });
      setMinCfp(repartitionAge);

      console.log('Données chargées:', {
        total: dashboardData.total_inscriptions,
        formations: formationCounts,
        topFormation: topFormation,
        parcoursCount: parcoursData.length
      });

    } catch (err) {
      console.error("Erreur générale lors du chargement:", err);
      setError("Erreur lors du chargement des données. Veuillez rafraîchir la page.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 2. useEffect UNIQUE
  // -----------------------------
  useEffect(() => {
    fetchAllData();
  }, []);

  // -----------------------------
  // 3. Utility Functions
  // -----------------------------
  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    return years.reverse();
  };

  // -----------------------------
  // 4. Handlers avec gestion d'erreur améliorée
  // -----------------------------
  const handleListerParOrdre = async () => {
    // Validation : pour une formation de 2 ans, l'année d'étude est obligatoire
    if (!duree || !nomFormation || !anneeScolaire || (duree === "2 ans" && !anneeEtude)) {
      return Swal.fire({
        icon: 'warning',
        text: duree === "2 ans"
          ? "Veuillez sélectionner tous les filtres (y compris l'année d'étude : 1ère ou 2ème année) !"
          : "Veuillez sélectionner tous les filtres !",
        showConfirmButton: true,
        background: '#1e1e2f',
        color: 'white',
      });
    }

    try {
      const params = {
        duree,
        nom_formation: nomFormation,
        annee_scolaire: anneeScolaire,
      };
      // Ajouter annee_etude seulement si nécessaire
      if (duree === "2 ans") {
        params.annee_etude = anneeEtude;
      }

      const response = await axios.get(`${url}/inscriptions/filter`, { params });

      const data = response.data.Data || [];
      setApprenants(data);

      if (data.length === 0) {
        Swal.fire({
          icon: 'warning',
          text: "Aucun apprenant trouvé pour ces critères!",
          showConfirmButton: true,
          background: '#1e1e2f',
          color: 'white',
        });
      } else {
        Swal.fire({
          icon: 'success',
          text: `${data.length} apprenant(s) trouvé(s)!`,
          showConfirmButton: true,
          background: '#1e1e2f',
          color: 'white',
        });
      }

    } catch (error) {
      console.error(error);

      if (error.response?.status === 429) {
        Swal.fire({
          icon: 'error',
          title: 'Trop de requêtes',
          text: 'Veuillez patienter avant de refiltrer',
          background: '#1e1e2f',
          color: 'white',
        });
      } else {
        Swal.fire({
          icon: 'error',
          text: "Une erreur est survenue lors du chargement des inscrits!",
          showConfirmButton: true,
          background: '#1e1e2f',
          color: 'white',
        });
      }
    }
  };

  // --- FONCTION D'EXPORT WORD (corrigée sans dépendance externe) ---
  async function handleExportWord() {
    if (!duree || !nomFormation || !anneeScolaire || !apprenants || apprenants.length === 0) {
      return Swal.fire({
        icon: "warning",
        text: "Veuillez filtrer et afficher des apprenants avant d'exporter !",
        background: "#1e1e2f",
        color: "white",
      });
    }

    const currentDate = new Date().toLocaleDateString('fr-FR');

    const htmlContent = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des apprenants</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          h1 { color: #1D4ED8; text-align: center; }
          h3 { text-align: center; }
          .date { text-align: right; font-size: 0.9em; color: #666; }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px; 
            page-break-inside: auto; 
          }
          thead { 
            display: table-header-group; 
            background-color: #1D4ED8; 
            color: white; 
          }
          th { 
            padding: 8px; 
            text-align: center; 
            border: 1px solid #1D4ED8; 
          }
          td { 
            border: 1px solid #ddd; 
            padding: 8px; 
          }
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
          }
          tbody tr:nth-child(even) { 
            background-color: #f2f2f2; 
          }
          .footer { 
            margin-top: 20px; 
            font-style: italic; 
            text-align: center;
          }
          @media print {
            thead {
              display: table-header-group;
            }
          }
        </style>
      </head>
      <body>
        <h1>Centre de Formation Professionnelle (CFP)</h1>
        <h3>LISTE DES APPRENANTS FILTRÉS</h3>
        <p><strong>Formation :</strong> ${nomFormation} | <strong>Année scolaire :</strong> ${anneeScolaire}</p>
        <p class="date">Édition du : ${currentDate}</p>
        
        <table>
          <thead>
            <tr>
              <th>N° Matricule</th>
              <th>Nom & Prénom(s)</th>
              <th>Date et lieu de Naissance</th>
              <th>Sexe</th>
              <th>Adresse</th>
              <th>Durée</th>
              <th>Formation</th>
            </tr>
          </thead>
          <tbody>
            ${apprenants.map(liste => `
              <tr>
                <td>${liste.matricule || ''}</td>
                <td>${liste.nom || ''} ${liste.prenom || ''}</td>
                <td>${liste.naiss || ''} à ${liste.lieunaiss || ''}</td>
                <td>${liste.sexe || ''}</td>
                <td>${liste.adresse || ''}</td>
                <td>${liste.duree || ''}</td>
                <td>${liste.nomformation || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p class="footer">Document généré automatiquement - ${currentDate}</p>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const fileName = `Liste_${nomFormation.replace(/\s/g, '')}_${anneeScolaire}.doc`;

    // Utilisation de l'API File System Access si disponible, sinon fallback
    try {
      if (window.showSaveFilePicker) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "Document Word",
              accept: { "application/msword": [".doc"] },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        Swal.fire({
          icon: "success",
          text: "Document Word enregistré avec succès !",
          background: "#1e1e2f",
          color: "white",
        });
      } else {
        // Fallback : créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        Swal.fire({
          icon: "info",
          text: "Le fichier Word a été téléchargé automatiquement.",
          background: "#1e1e2f",
          color: "white",
        });
      }
    } catch (err) {
      console.error("Annulé ou erreur :", err);
      if (err.name !== "AbortError") {
        Swal.fire({
          icon: "error",
          text: "Erreur lors de l'enregistrement du fichier Word.",
          background: "#1e1e2f",
          color: "white",
        });
      }
    }
  }

  async function handleExportExcel() {
    if (!duree || !nomFormation || !anneeScolaire || !apprenants || apprenants.length === 0) {
      return Swal.fire({
        icon: "warning",
        text: "Sélectionnez et listez les apprenants avant d'exporter !",
        background: "#1e1e2f",
        color: "white",
      });
    }

    try {
      const headers = [
        "N° Matricule", "Nom & Prénom(s)", "Date et lieu de Naissance", "Sexe", "Adresse Actuelle", "Durée de la formation", "Formation",
      ];

      const rows = apprenants.map((e) => [
        e.matricule || "",
        `${e.nom || ""} ${e.prenom || ""}`,
        `${e.naiss || ""} à ${e.lieunaiss || ""}`,
        e.sexe || "",
        e.adresse || "",
        e.duree || "",
        e.nomformation || "",
      ]);

      const data = [
        ["LISTE DES APPRENANTS FILTRÉS"],
        [`Formation : ${nomFormation} | Année : ${anneeScolaire}`],
        [],
        headers,
        ...rows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);

      ws["!cols"] = [
        { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      ];

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Liste Apprenants");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const fileName = `Liste_${nomFormation.replace(/\s/g, "")}_${anneeScolaire}.xlsx`;

      if (window.showSaveFilePicker) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: "Fichier Excel", accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } }],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          Swal.fire({ icon: "success", text: "Excel enregistré avec succès !", background: "#1e1e2f", color: "white" });
        } catch (error) {
          if (error.name !== "AbortError") {
            throw error;
          }
        }
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        Swal.fire({ icon: "info", text: "Le fichier Excel a été téléchargé automatiquement.", background: "#1e1e2f", color: "white" });
      }
    } catch (err) {
      console.error("Erreur export Excel :", err);
      if (err.name !== "AbortError") {
        Swal.fire({ icon: "error", text: "Erreur lors de l'enregistrement du fichier Excel.", background: "#1e1e2f", color: "white" });
      }
    }
  }

  // -----------------------------
  // 5. Render avec gestion d'erreur
  // -----------------------------
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Données partielles</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchAllData}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              Réessayer
            </button>
            <button
              onClick={() => setError(null)}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition duration-300"
            >
              Continuer quand même
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
      <p className="text-xl text-indigo-600">Chargement des données...</p>
    </div>
  );

  const DashboardContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">

      {/* Header and Top Info */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <FaList className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Tableau de bord de Formation</h1>
        </div>
        <p className="text-xl italic">« Centre de Formation Professionnelle Laura Vicuna Anjarasoa (CFP) »</p>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02] active:scale-95"
          onClick={onViewListPro}
        >
          <FaEye /> Voir la liste
        </button>
      </div>

      {/* Top Course Info */}
      <div className="mb-8 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-xl shadow-md">
        <p className="flex items-center font-bold text-gray-800">
          <FaStar className="w-5 h-5 mr-3 text-yellow-500" />
          Formation la plus suivie :
          <span className="mx-2 text-indigo-700 font-extrabold">
            {topParcours ? topParcours.nomformation : "Aucune donnée"}
          </span>
          {topParcours && (
            <span className="text-sm text-gray-600">
              ({topParcours.total} inscrits)
            </span>
          )}
        </p>
      </div>

      {/* KPI Cards (6 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {[
          { title: "Effectif Total", icon: "fas fa-users", value: total, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Musique", icon: "fas fa-music", value: totalMusic, color: "text-red-600", bg: "bg-red-50" },
          { title: "Informatique", icon: "fas fa-laptop-code", value: totalInfo, color: "text-yellow-600", bg: "bg-yellow-50" },
          { title: "Coupe et Coutûre", icon: "fas fa-cut", value: totalCoupe, color: "text-pink-600", bg: "bg-pink-50" },
          { title: "Langues", icon: "fas fa-language", value: totalLangues, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Pâtisserie", icon: "fas fa-birthday-cake", value: totalPatisserie, color: "text-teal-600", bg: "bg-teal-50" },
        ].map((item, idx) => (
          <KpiCard key={idx} {...item} />
        ))}
      </div>

      {/* Filter and Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* Filter Card (Col 1-4) */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl shadow-xl p-6 h-full transition duration-300 hover:shadow-2xl">
            <h2 className="text-xl font-bold mb-5 border-b pb-2 text-center">
              <FaSearch className="inline mr-2 text-indigo-600" /> Filtre des apprenants
            </h2>
            <div className="space-y-4">

              {/* Durée de la Formation */}
              <div>
                <label className="block text-sm font-medium mb-1">Durée de la Formation</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  value={duree}
                  onChange={(e) => {
                    setDuree(e.target.value);
                    // Réinitialiser l'année d'étude quand on change la durée
                    setAnneeEtude('');
                  }}
                >
                  <option value="">--- Durée de la Formation ---</option>
                  <option value="3 mois">3 mois</option>
                  <option value="2 ans">2 ans</option>
                </select>
              </div>

              {/* Nom Formation */}
              <div>
                <label className="block text-sm font-medium mb-1">Nom Formation</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  value={nomFormation}
                  onChange={(e) => setNomFormation(e.target.value)}
                >
                  <option value="">--- Nom de la Formation ---</option>
                  {parcours.map((p) => (
                    <option key={p.code_formation} value={p.nomformation}>{p.nomformation}</option>
                  ))}
                </select>
              </div>

              {/* Année Scolaire */}
              <div>
                <label className="block text-sm font-medium mb-1">Année Scolaire</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  value={anneeScolaire}
                  onChange={(e) => setAnneeScolaire(e.target.value)}
                >
                  <option value="">--- Année Scolaire ---</option>
                  {generateAnnee().map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Année d'étude (visible seulement pour les formations de 2 ans) */}
              {duree === "2 ans" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Année d'étude</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    value={anneeEtude}
                    onChange={(e) => setAnneeEtude(e.target.value)}
                  >
                    <option value="">--- Sélectionnez l'année ---</option>
                    <option value="1ere année">1ère année</option>
                    <option value="2eme année">2ème année</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <button
                className="flex items-center justify-center w-full px-4 py-2 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition duration-300 transform hover:scale-[1.01]"
                style={{ backgroundColor: '#10B981', boxShadow: '0 4px 6px rgba(29, 78, 216, 0.4)' }}
                onClick={handleListerParOrdre}
              >
                <FaSearch className="mr-2" /> Afficher la liste
              </button>

              <button
                className="flex items-center justify-center w-full px-4 py-2 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition duration-300 transform hover:scale-[1.01]"
                onClick={handleExportWord}
              >
                <FaFileWord className="mr-2" /> Exporter en Word
              </button>

              <button
                className="flex items-center justify-center w-full px-4 py-2 text-white font-bold rounded-lg bg-green-600 hover:bg-green-700 shadow-lg transition duration-300 transform hover:scale-[1.01]"
                onClick={handleExportExcel}
              >
                <FaFileExcel className="mr-2" /> Exporter en Excel
              </button>
            </div>
          </div>
        </div>

        {/* Results Table (Col 5-12) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl shadow-xl p-6 h-full transition duration-300 hover:shadow-2xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
              Liste des Apprenants Filtrés ({apprenants.length})
            </h2>
            <div className="max-h-[500px] overflow-y-auto rounded-lg ring-1 ring-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-600 text-white sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="px-4 py-3 text-center text-sm font-semibold tracking-wide">N° Matricule</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold tracking-wide">Nom et Prénom(s)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold tracking-wide">Date et lieu de Naissance</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold tracking-wide">Sexe</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold tracking-wide">Adresse</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {apprenants.length > 0 ? apprenants.map((liste, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-center text-sm">{liste.matricule}</td>
                      <td className="px-4 py-2 text-center text-sm">
                        <span className="font-semibold">{liste.nom}</span> {liste.prenom}
                      </td>
                      <td className="px-4 py-2 text-center text-sm">{liste.naiss} à {liste.lieunaiss}</td>
                      <td className="px-4 py-2 text-center text-sm">{liste.sexe}</td>
                      <td className="px-4 py-2 text-center text-sm">{liste.adresse}</td>
                    </tr>
                  )) : (
                    <tr className='h-32'>
                      <td colSpan={5} className="text-center p-5 italic">
                        Utilisez les filtres pour rechercher les apprenants.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Répartition par formation */}
        <div className="rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            <FaChartPie className="inline mr-2" /> Répartition des effectifs par formation
          </h2>
          <div className="h-[450px]">
            {stats.effectifs && stats.effectifs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.effectifs} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={150} innerRadius={60} paddingAngle={3} labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {stats.effectifs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} élèves`, "Effectif"]}
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8 }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Aucune donnée de formation disponible" />
            )}
          </div>
        </div>

        {/* Chart 2: Répartition par sexe */}
        <div className="rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            <FaChartPie className="inline mr-2 text-indigo-600" /> Répartition des effectifs par sexe
          </h2>
          <div className="h-[450px]">
            {cfp.sexes && cfp.sexes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cfp.sexes} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={150} innerRadius={60} paddingAngle={3} labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {cfp.sexes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sexe_Colors[index % sexe_Colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} élèves`, "Effectif"]}
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8 }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Aucune donnée de sexe disponible" />
            )}
          </div>
        </div>

        {/* Chart 3: Répartition par âge */}
        <div className="rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            <FaChartPie className="inline mr-2 text-indigo-600" /> Répartition des effectifs par âge
          </h2>
          <div className="h-[450px]">
            {mincfp && mincfp.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mincfp}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    innerRadius={60}
                    paddingAngle={3}
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {mincfp.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={minmaj_Colors[index % minmaj_Colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} élèves`, "Effectif"]}
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8 }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Aucune donnée d'âge disponible" />
            )}
          </div>
        </div>

        {/* Chart 4: Effectifs par trimestre */}
        <div className="rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            <FaChartBar className="inline mr-2 text-indigo-600" /> Effectifs des apprenants par trimestre
          </h2>
          <div className="h-[450px]">
            {data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 30, right: 20, left: 10, bottom: 20 }} barCategoryGap='15%'>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="trimestre" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey='total'
                    fill={PRIMARY_COLOR}
                    name="Nombre d'inscrits"
                    maxBarSize={50}
                    radius={[8, 8, 0, 0]}
                    animationDuration={1200}
                    label={{ position: 'top', fill: PRIMARY_COLOR, fontSize: 13, fontWeight: 'bold' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Aucune donnée trimestrielle disponible" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      <DashboardContent />
    </div>
  );
};

export default DashboadFormation;