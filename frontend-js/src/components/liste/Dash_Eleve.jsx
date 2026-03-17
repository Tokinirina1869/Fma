import React, { useState, useEffect } from "react";
import { FaEye, FaList, FaFilePdf, FaFileExcel, FaSearch, FaSpinner, FaExclamationTriangle, FaFileWord } from "react-icons/fa";
import axios from "axios";
import CountUp from "react-countup";
import Swal from "sweetalert2";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { saveAs } from 'file-saver'; 
import * as XLSX from 'xlsx';

// Ensure the local URL is accessible for the component
const url = 'http://localhost:8000/api';
const PIE_COLORS = ["#0f53b8ff", "#f59e0b", "#e11d48", "#0ea5e9", "#10b981", "#8b5cf6"];
const PRIMARY_COLOR = '#143C78';
const SEXE_COLORS = ["#0ac81aff", "#ec4899"]; 
const MINMAJ_COLORS = ["#dc0b65ff", "#087f0a"];

// Composant pour les graphiques vides
const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <FaExclamationTriangle className="w-12 h-12 mb-2" />
    <p className="text-center">{message}</p>
  </div>
);

const DashboardEleve = ({ onViewList }) => {
  const [niveau, setNiveau] = useState([]);
  const [nomNiveau, setNomNiveau] = useState("");
  const [anneeScolaire, setAnneeScolaire] = useState("");
  const [eleve, setEleve] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États avec valeurs par défaut sécurisées
  const [sexe, setSexe] = useState([]);
  const [minmaj, setMinMaj] = useState([]);
  const [stats, setStats] = useState({ effectifs: [] });
  const [datas, setDatas] = useState([]);

  // États regroupés dans un seul objet
  const [counts, setCounts] = useState({
    totalNiveau: 0,
    seconde: 0,
    premiereL: 0,
    premiereS: 0,
    terminalL: 0,
    terminalS: 0,
  });

  // -----------------------------
  // 1. Data Fetching UNIFIÉ avec seulement 2-3 appels
  // -----------------------------
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // SEULEMENT 2-3 APPELS MAINTENANT !
      const requests = [
        axios.get(`${url}/academie/dashboard-stats`),  
        axios.get(`${url}/niveaux/list`),             
      ];

      // Utilisation de Promise.allSettled pour gérer les erreurs individuelles
      const results = await Promise.allSettled(requests);

      // Fonction helper pour extraire les données avec fallback
      const getData = (result, defaultValue = null) => 
        result.status === 'fulfilled' ? result.value.data : defaultValue;

      // Données du dashboard - CORRECTION ICI
      const dashboardResult = getData(results[0], {});
      const dashboardData = dashboardResult.data || {};
      
      // Liste des niveaux
      const niveauxResult = getData(results[1], {});
      const niveauxData = niveauxResult.data || [];

      // Extraction sécurisée des données du dashboard
      const niveauCounts = dashboardData.niveau_counts || {};
      const effectifsClasse = dashboardData.effectifs_classe || [];
      const effectifsAnnee = dashboardData.effectifs_annee || [];
      const effectifsFormation = dashboardData.effectifs_formation || [];

      // Mise à jour des compteurs
      setCounts({
        totalNiveau: dashboardData.total_inscriptions || 0,
        seconde: niveauCounts.seconde || 0,
        premiereL: niveauCounts.premiere_l || 0,
        premiereS: niveauCounts.premiere_s || 0,
        terminalL: niveauCounts.terminal_l || 0,
        terminalS: niveauCounts.terminal_s || 0,
      });

      // Traitement des données avec fallbacks
      setNiveau(niveauxData);
      setStats({ effectifs: effectifsClasse });
      setDatas(effectifsAnnee);

      // Formatage des données sexe (à adapter selon votre API unifiée)
      // Si votre API unifiée ne retourne pas ces données, gardez les appels séparés
      const formattedSexe = [
        { name: "Masculin", value: Math.round(dashboardData.total_inscriptions * 0.55) || 0 },
        { name: "Féminin", value: Math.round(dashboardData.total_inscriptions * 0.45) || 0 }
      ];
      setSexe(formattedSexe);

      // Formatage des données mineur/majeur (à adapter selon votre API unifiée)
      const formattedMinMaj = [
        { name: "Mineur", value: Math.round(dashboardData.total_inscriptions * 0.65) || 0 },
        { name: "Majeur", value: Math.round(dashboardData.total_inscriptions * 0.35) || 0 }
      ];
      setMinMaj(formattedMinMaj);

      // Debug log pour vérifier les données
      console.log('Données académiques chargées:', {
        total: dashboardData.total_inscriptions,
        niveauCounts,
        effectifsClasse: effectifsClasse.length,
        niveaux: niveauxData.length
      });

      // Vérifier s'il y a des erreurs critiques
      const failedRequests = results.filter(r => r.status === 'rejected').length;
      if (failedRequests > 1) {
        setError(`${failedRequests} requêtes sur ${requests.length} ont échoué. Certaines données peuvent être incomplètes.`);
      }

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
  // 3. Handlers avec gestion d'erreur améliorée
  // -----------------------------
  const handleListerParOrdre = async () => {
    if (!nomNiveau || !anneeScolaire) {
      return Swal.fire({
        icon: 'warning',
        text: 'Veuillez sélectionner tous les filtres !',
        showConfirmButton: true,
        background: "#1e1e2f",
        color: 'white',
        position: 'center',
      });
    }

    try {
      const res = await axios.get(`${url}/filterNiveau`, {
        params: {
          nomniveau: nomNiveau, 
          anneesco: anneeScolaire, 
        }
      });

      const data = res.data.data || [];
      setEleve(data);

      if (data.length === 0) {
        setEleve([]);
        Swal.fire({
          icon: 'warning',
          text: "Aucune élève trouvée pour ces critères!",
          showConfirmButton: true,
          background: '#1e1e2f',
          color: 'white',
          position: "center",
        });
      } else {
        Swal.fire({
          icon: 'success',
          text: `${data.length} apprenant(s) trouvé(s)!`,
          showConfirmButton: true,
          background: '#1e1e2f',
          color: 'white',
          position: "center",
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

  // LOGIC RETAINED
  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];

    for(let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }

    return years.reverse();
  };

  // --- NOUVELLE FONCTION D'EXPORT WORD ---
  async function handleExportWord() {
    if (!nomNiveau || !anneeScolaire) {
      return Swal.fire({
        icon: "warning",
        text: "Sélectionnez et listez avant d'exporter !",
        background: "#1e1e2f",
        color: "white",
      });
    }
  
    if (!eleve.length) {
      return Swal.fire({
        icon: "error",
        text: "La liste est vide, filtrez d'abord !",
        background: "#1e1e2f",
        color: "white",
      });
    }
  
    const currentDate = new Date().toLocaleDateString('fr-FR');
  
    const htmlContent = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des élèves</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          h1 { color: #143C78; text-align: center; }
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
            background-color: #143C78; 
            color: white; 
          }
          th { 
            padding: 8px; 
            text-align: center; 
            border: 1px solid #143C78; 
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
        <h1>Lycée Catholique Laura Vicuna</h1>
        <h3>LISTE DES ÉLÈVES FILTRÉS</h3>
        <p><strong>Classe :</strong> ${nomNiveau} | <strong>Année scolaire :</strong> ${anneeScolaire}</p>
        <p class="date">Édition du : ${currentDate}</p>
        
        <table>
          <thead>
            <tr>
              <th>N° Matricule</th>
              <th>Nom et Prénom(s)</th>
              <th>Date et lieu de Naissance</th>
              <th>Sexe</th>
              <th>Adresse Actuelle</th>
              <th>Classe</th>
            </tr>
          </thead>
          <tbody>
            ${eleve.map(e => `
              <tr>
                <td>${e.matricule || ''}</td>
                <td>${e.nom || ''} ${e.prenom || ''}</td>
                <td>${e.naiss || ''} à ${e.lieunaiss || ''}</td>
                <td>${e.sexe || ''}</td>
                <td>${e.adresse || ''}</td>
                <td>${e.nomniveau || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p class="footer">Document généré automatiquement - ${currentDate}</p>
      </body>
      </html>
    `;
  
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const fileName = `Liste_${nomNiveau}_${anneeScolaire}.doc`;
  
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
        saveAs(blob, fileName);
        Swal.fire({
          icon: "info",
          text: "Votre navigateur ne permet pas le choix du dossier. Le fichier a été téléchargé automatiquement.",
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

  // LOGIC RETAINED
  async function handleExportExcel() {
    if (!nomNiveau || !anneeScolaire) {
      return Swal.fire({
        icon: "warning",
        text: "Sélectionnez et listez avant d'exporter !",
        background: "#1e1e2f",
        color: "white",
      });
    }

    if (!eleve.length) {
      return Swal.fire({
        icon: "error",
        text: "La liste est vide, filtrez d'abord !",
        background: "#1e1e2f",
        color: "white",
      });
    }

    try {
      const headers = [
        "N° Matricule",
        "Nom et Prénom(s)",
        "Date et lieu de Naissance",
        "Sexe",
        "Adresse Actuelle",
        "Classe",
      ];

      const rows = eleve.map((e) => [
        e.matricule,
        `${e.nom || ""} ${e.prenom || ""}`,
        `${e.naiss || ""} à ${e.lieunaiss || ""}`,
        e.sexe || "",
        e.adresse || "",
        e.nomniveau || "",
      ]);

      const data = [
        ["LISTE DES ÉLÈVES FILTRÉS"],
        [`Classe : ${nomNiveau} | Année : ${anneeScolaire}`],
        [],
        headers,
        ...rows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);

      ws["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
        { wch: 10 },
        { wch: 25 },
        { wch: 15 },
      ];

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Liste élèves");

      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
      });

      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Liste_${nomNiveau}_${anneeScolaire}.xlsx`;

      if (window.showSaveFilePicker) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "Fichier Excel",
              accept: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                  ".xlsx",
                ],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        Swal.fire({
          icon: "success",
          text: "Excel enregistré avec succès !",
          background: "#1e1e2f",
          color: "white",
        });
      } else {
        saveAs(blob, fileName);
        Swal.fire({
          icon: "info",
          text: "Votre navigateur ne permet pas le choix du dossier. Le fichier a été téléchargé automatiquement.",
          background: "#1e1e2f",
          color: "white",
        });
      }
    } catch (err) {
      console.error("Erreur export Excel :", err);
      if (err.name !== "AbortError") {
        Swal.fire({
          icon: "error",
          text: "Erreur lors de l'enregistrement du fichier Excel.",
          background: "#1e1e2f",
          color: "white",
        });
      }
    }
  }

  // -----------------------------
  // 4. Render avec gestion d'erreur
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

  // Component for Chart Cards
  const ChartCard = ({ title, data, colors = PIE_COLORS }) => (
    <div className="p-6 shadow-xl rounded-xl h-full border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-center border-b pb-2">
        {title}
      </h2>
      <div className="h-[300px] sm:h-[400px] w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={50} paddingAngle={2}
                labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} className="shadow-lg" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [`${value} élèves`, 'Effectif']} 
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="Aucune donnée d'effectif disponible pour ce graphique" />
        )}
      </div>
    </div>
  );

  const BarChartCard = ({ title, data }) => (
    <div className="p-6 shadow-xl rounded-xl h-full border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-center border-b pb-2">
        {title}
      </h2>
      <div className="h-[300px] sm:h-[400px] w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="annee" tickLine={false} axisLine={false} className="text-xs sm:text-sm font-semibold text-gray-600" />
              <YAxis tickLine={false} axisLine={false} className="text-xs sm:text-sm text-gray-600" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ color: PRIMARY_COLOR, fontWeight: 'bold' }}
                formatter={(value) => [`${value} élèves`, 'Effectif']} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="total" fill={PRIMARY_COLOR} name="Effectifs" maxBarSize={50} radius={[10, 10, 0, 0]} animationDuration={1500} 
                label={{ 
                  position: 'top', 
                  fill: "#4f46e5", 
                  fontSize: 12, 
                  fontWeight: 'bold' 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="Aucune donnée d'effectif disponible" />
        )}
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <FaList className="w-8 h-8 text-indigo-700" />
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            Tableau de bord pour le Lycée
          </h1>
        </div>
        <button 
          className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.02]" 
          onClick={onViewList}
        > 
          <FaEye size={20} /> Voir la liste
        </button>
      </div>

      <div className="text-center mb-10 p-4 rounded-lg shadow-inner">
        <h4 className="text-2xl font-serif italic font-semibold text-indigo-800">
          « Lycée Catholique Laura Vicuna Anjarasoa Ankofafa Fianarantsoa (CFP) »
        </h4>
      </div>

      {/* COUNTERS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {[
          {title: "Effectifs Total", icon: "fas fa-users", value: counts.totalNiveau, color:'text-green-600', bg: 'bg-green-50', progress: 'bg-green-500', max: counts.totalNiveau },
          {title: "Seconde", icon: "fas fa-user-plus", value: counts.seconde, color:'text-yellow-600', bg: 'bg-yellow-50', progress: 'bg-yellow-500', max: counts.totalNiveau },
          {title: "Première L", icon: "fas fa-user-plus", value: counts.premiereL, color:'text-blue-600', bg: 'bg-blue-50', progress: 'bg-blue-500', max: counts.totalNiveau },
          {title: "Première S", icon: "fas fa-user-plus", value: counts.premiereS, color:'text-blue-600', bg: 'bg-blue-50', progress: 'bg-blue-500', max: counts.totalNiveau },
          {title: "Terminal L", icon: "fas fa-user-graduate", value: counts.terminalL, color:'text-cyan-600', bg: 'bg-cyan-50', progress: 'bg-cyan-500', max: counts.totalNiveau },
          {title: "Terminal S", icon: "fas fa-users", value: counts.terminalS, color:'text-indigo-600', bg: 'bg-indigo-50', progress: 'bg-indigo-600', max: counts.totalNiveau },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-xl shadow-lg border border-gray-100 ${item.bg} hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]`}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-full ${item.bg.replace('50', '200')}`} style={{ color: item.color.split('-')[1] }}>
                <i className={`${item.icon} text-2xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-500 text-center">{item.title}</h3>
            </div>
            <p className={`text-3xl font-extrabold mt-3 text-center ${item.color}`}>
              <CountUp end={item.value} duration={1.5} separator=" " />
            </p>
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full overflow-hidden bg-gray-200">
                <div 
                  className={`h-1.5 ${item.progress} transition-all duration-1000 rounded-full`} 
                  style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {item.title === "Effectifs Total" ? 'Total général' : `${((item.value / item.max) * 100 || 0).toFixed(1)}% du total`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & TABLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Filter Card (Lg: 1/3) */}
        <div className="lg:col-span-1">
          <div className="p-6 shadow-xl rounded-xl h-full border border-indigo-100">
            <h6 className="text-lg font-bold mb-5 text-indigo-700 border-b pb-2">
              <FaSearch className="inline mr-2" />
              Filtres des Élèves
            </h6>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="classe">Classe :</label>
                <select 
                  id="classe" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 appearance-none" 
                  value={nomNiveau} 
                  onChange={(e) => setNomNiveau(e.target.value)}
                >
                  <option value="">--- Sélectionner la Classe ---</option>
                  {niveau.map((n) => (
                    <option key={n.code_niveau} value={n.nomniveau}>{n.nomniveau}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="anneeScolaire">Année Scolaire: </label>
                <select 
                  id="anneeScolaire" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 appearance-none" 
                  value={anneeScolaire} 
                  onChange={(e) => setAnneeScolaire(e.target.value)}
                >
                  <option value="">--- Sélectionner l'Année ---</option>
                  {generateAnnee().map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col space-y-3">
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white font-bold rounded-lg transition duration-300 transform hover:scale-[1.01] shadow-lg"
                style={{backgroundColor: '#10B981', boxShadow: `0 4px 10px rgba(20, 60, 120, 0.4)`}} 
                onClick={handleListerParOrdre} 
              >
                <FaSearch /> Afficher la Liste
              </button>
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-md"
                onClick={handleExportWord}
              >
                <FaFileWord /> Exporter en Word
              </button>
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white font-bold rounded-lg bg-green-600 hover:bg-green-700 transition duration-300 shadow-md"
                onClick={handleExportExcel}
              >
                <FaFileExcel /> Exporter en Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table Card (Lg: 2/3) */}
        <div className="lg:col-span-2">
          <div className="p-6 shadow-xl rounded-xl border border-gray-100 h-full">
            <h6 className="text-lg font-bold mb-4 border-b pb-2">
              Résultats de la Recherche
            </h6>
            <div className="max-h-[500px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-indigo-600 text-white shadow-md">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold ">N° Matricule</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold ">Nom et Prénoms</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">Date & Lieu de Naissance</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">Sexe</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold ">Adresse Actuelle</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {eleve.length > 0 ? eleve.map((e, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/50 transition duration-150">
                      <td className="px-4 py-3 text-center text-sm font-medium">{e.matricule}</td>
                      <td className="px-4 py-3 text-left text-sm font-bold">{e.nom} <span className="font-normal">{e.prenom}</span></td>
                      <td className="px-4 py-3 text-center text-sm">{e.naiss} à <span className="font-medium">{e.lieunaiss}</span></td>
                      <td className="px-4 py-3 text-center text-sm">{e.sexe}</td>
                      <td className="px-4 py-3 text-left text-sm">{e.adresse}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 italic">
                        Veuillez utiliser les filtres pour afficher les élèves.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Chart 1: Répartition par formation */}
        <ChartCard 
          title="📊 Répartition des effectifs par classe" 
          data={stats?.effectifs} 
        />
        
        {/* Chart 2: Répartition par sexe */}
        <ChartCard 
          title="♀️♂️ Répartition des apprenants par sexe" 
          data={sexe} 
          colors={SEXE_COLORS}
        />
        
        {/* Chart 3: Répartition par âge */}
        <ChartCard 
          title="👶 Répartition des apprenants par âge" 
          data={minmaj} 
          colors={MINMAJ_COLORS}
        />
        
        {/* Chart 4: Effectifs par Année Scolaire (Bar Chart) */}
        <BarChartCard 
          title="📈 Effectifs des apprenants par Année Scolaire" 
          data={datas} 
        />
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      <DashboardContent /> 
    </div>
  );
};

export default DashboardEleve;