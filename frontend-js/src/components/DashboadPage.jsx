import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowRight, FaList, FaChild, FaUserTie, FaUsers, FaUserGraduate, FaChalkboardTeacher, FaMoneyCheckAlt, FaExclamationTriangle, FaCalendarDay } from "react-icons/fa";
import CountUp from "react-countup";
import {
  PieChart, Pie, Cell, Legend, Tooltip, Area,AreaChart,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const SECONDARY_COLOR = '#4F46E5';
const url = 'http://localhost:8000/api';

const CHART_COLORS_PRIMARY = [SECONDARY_COLOR, '#818CF8', '#A569BD', '#FF8042', '#00C49F', '#FFBB28']; 
const AGE_COLORS = ['#EF4444', '#10B981']; 
const GENDER_COLORS = ['#EC4899', '#3B82F6']; 

// Fonction de formatage pour les nombres en Ariary
const formatAriary = (value) => {
  return new Intl.NumberFormat('mg-MG').format(value);
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    let displayValue;
    if (data.pourcentage) {
      displayValue = `${formatAriary(data.total)} Apprenants (${data.pourcentage}%)`;
    } else if (unit === 'Ar') {
      displayValue = `${formatAriary(payload[0].value)} ${unit}`;
    } else {
      displayValue = `${formatAriary(payload[0].value)} ${unit}`;
    }

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
        <p className="text-sm text-gray-800 font-semibold">{label}</p>
        <p className="text-sm text-indigo-600">{displayValue}</p>
      </div>
    );
  }
  return null;
};

function DashboardPage({ autre }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États unifiés
  const [dashboardData, setDashboardData] = useState({
    totals: {
      general: 0,
      eleve: 0,
      formation: 0,
      paiement: 0
    },
    demographics: {
      mineurs: 0,
      majeurs: 0
    },
    charts: {
      ageData: [],
      sexeData: [],
      paiementsSemaine: [],
      paiementsMois: []
    },
    dailyTotals: []
  });

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${url}/dashboard/global-stats`);
      const data = response.data.data || {};

      setDashboardData({
        totals: {
          general: data.total_general || 0,
          eleve: data.total_eleve || 0,
          formation: data.total_formation || 0,
          paiement: data.total_paiement || 0
        },
        demographics: {
          mineurs: data.mineurs_global || 0,
          majeurs: data.majeurs_global || 0
        },
        charts: {
          ageData: data.age_data || [],
          sexeData: data.sexe_data || [],
          paiementsSemaine: data.paiements_semaine || [],
          paiementsMois: data.paiements_mois || []
        },
        dailyTotals: data.inscriptions_par_jour || [] 
      });

    } catch (err) {
      console.error("Erreur générale lors du chargement:", err);
      setError("Erreur lors du chargement des données. Veuillez rafraîchir la page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Composant d'erreur
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchAllData}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center space-x-2 text-xl text-indigo-600">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Chargement des données...</span>
        </div>
      </div>
    );
  }

  const { totals, demographics, charts, dailyTotals } = dashboardData;

  const statsCards = [
    {title: "Total Apprenants", icon: FaUsers, value: totals.general, color:'text-indigo-600', bg: 'bg-indigo-50' },
    {title: "Total Académiques", icon: FaUserGraduate, value: totals.eleve, color:'text-green-600', bg: 'bg-green-50' },
    {title: "Total Professionnel", icon: FaChalkboardTeacher, value: totals.formation, color:'text-yellow-600', bg: 'bg-yellow-50' },
    {title: "Paiements Effectué(s)", icon: FaMoneyCheckAlt, value: totals.paiement, color:'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const demographicCards = [
    {title: "Mineur(s)", icon: FaChild, value: demographics.mineurs, color:'text-red-500', bg: 'bg-red-50' },
    {title: "Majeur(s)", icon: FaUserTie, value: demographics.majeurs, color:'text-teal-500', bg: 'bg-teal-50' },
  ];

  // Composant pour les graphiques vides
  const EmptyChart = ({ message }) => (
    <div className="flex flex-col items-center text-center justify-center h-64 text-gray-500">
      <FaExclamationTriangle className="w-12 h-12 mb-2" />
      <p className="text-center">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      
      {/* Header and Action Button */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <FaList className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Tableau de bord Général</h1>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02] active:scale-95"
          onClick={autre} 
        >
          Autre Pages <FaArrowRight />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {[...statsCards, ...demographicCards].map((item, idx) => (
          <div 
            key={idx} 
            className={`${item.bg} rounded-2xl shadow-xl p-5 flex flex-col justify-between border-l-4 ${item.color.replace('text', 'border')} transition duration-300 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg text-center font-bold text-gray-600 leading-snug">{item.title}</h3>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <p className={`text-3xl font-extrabold text-center ${item.color}`}>
              {item.title.includes('Paiements') 
                ? `${formatAriary(item.value)}`
                : <CountUp end={item.value} duration={1.5} separator=" " />
              }
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Répartition par Âge */}
        <div className="rounded-2xl shadow-xl p-6 lg:col-span-1 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            Répartition par Âge
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            {charts.ageData.length > 0 ? (
              <PieChart>
                <Pie data={charts.ageData} dataKey="total" nameKey="categorie" cx="50%" cy="50%" 
                  outerRadius={150} innerRadius={60} paddingAngle={4} label={({ categorie, pourcentage }) => `${pourcentage}%`} labelLine={false}
                >
                  {charts.ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }}/>
              </PieChart>
            ) : (
              <EmptyChart message="Aucune donnée d'âge disponible" />
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Chart 2: Répartition par Sexe */}
        <div className="rounded-2xl shadow-xl p-6 lg:col-span-1 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            Répartition par Sexe
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            {charts.sexeData.length > 0 ? (
              <PieChart>
                <Pie data={charts.sexeData} dataKey="value" nameKey="name" cx="50%" cy="50%" 
                  outerRadius={150} innerRadius={60} paddingAngle={4} labelLine={false} label
                >
                  {charts.sexeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatAriary(value)} Apprenants`, "Total"]}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }}/>
              </PieChart>
            ) : (
              <EmptyChart message="Aucune donnée de sexe disponible" />
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Paiements par Mois */}
        <div className="rounded-2xl shadow-xl p-6 lg:col-span-1 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            Recette par mois
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            {charts.paiementsMois.length > 0 ? (
              <PieChart>
                <Pie data={charts.paiementsMois} dataKey="montant" nameKey="mois" cx="50%" cy="50%" 
                  outerRadius={150} innerRadius={60} paddingAngle={4} labelLine={false} label={({ montant }) => formatAriary(montant)}
                >
                  {charts.paiementsMois.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS_PRIMARY[index % CHART_COLORS_PRIMARY.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatAriary(value)} Ar`, "Montant Total"]}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }}/>
              </PieChart>
            ) : (
              <EmptyChart message="Aucune donnée de paiement disponible" />
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center">
            Recette (4 Dernières Semaines)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            {charts.paiementsSemaine.length > 0 ? (
              <BarChart data={charts.paiementsSemaine} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="semaine" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280" 
                  tickFormatter={(value) => `${formatAriary(value)} Ar`}
                  domain={['dataMin - 10000', 'dataMax + 10000']}
                />
                <Tooltip 
                  content={<CustomTooltip unit="Ar" />}
                  labelFormatter={(label) => `Semaine : ${label}`}
                />
                <Legend />
                <Bar dataKey="montant" name="Montant" maxBarSize={60} radius={[8, 8, 0, 0]} animationDuration={1500}
                  label={{ 
                    position: 'top', 
                    formatter: (value) => formatAriary(value),
                    fill: "#4f46e5", 
                    fontSize: 12, 
                    fontWeight: 'bold' 
                  }}
                >
                  {charts.paiementsSemaine.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECONDARY_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <EmptyChart message="Aucune donnée de paiement hebdomadaire disponible" />
            )}
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl shadow-xl p-6 transition duration-300">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-center flex items-center justify-center gap-2">
            <FaCalendarDay className="text-indigo-600" />Nombre des inscrits chaque jour
          </h2>
          {dailyTotals.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyTotals} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="jour" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "total") return [`${value} inscrits`, "Total"];
                      if (name === "cfp") return [`${value}`, "CFP"];
                      if (name === "lycee") return [`${value}`, "Lycée"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Jour : ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={SECONDARY_COLOR}
                    strokeWidth={3}
                    fill={SECONDARY_COLOR}
                    fillOpacity={0.3}
                    dot={{ r: 5, fill: SECONDARY_COLOR, stroke: 'white', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                  <Area type="monotone" dataKey="cfp" stroke="#10B981" fill="none" strokeWidth={2} dot={{ r: 3 }} /> 
                  <Area type="monotone" dataKey="lycee" stroke="#F59E0B" fill="none" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-indigo-700">
                <span>Total dans une semaine</span>
                <span>{dailyTotals.reduce((acc, d) => acc + d.total, 0)}</span>
              </div>
            </>
          ) : (
            <EmptyChart message="Aucune inscription cette semaine" />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;