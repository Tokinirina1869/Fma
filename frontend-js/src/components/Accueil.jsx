import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt, FaSearch, FaChartLine, FaIdCard,
  FaFileAlt, FaShieldAlt, FaMobileAlt, FaRocket, FaUsers, FaGraduationCap, FaUniversity,
  FaAward, FaArrowRight, FaLaptop, FaHandshake, FaHeart, FaCog, FaSync, FaDatabase,
  FaCheckCircle, FaClock, FaStar, FaSchool, FaBriefcase, FaPhoneAlt, FaMapMarkerAlt,
  FaEnvelope, FaTwitter, FaFacebook, FaLinkedin, FaExternalLinkAlt, FaPen
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Headers from './Header';
import fma from "../assets/fma.png";

const contactInfo = {
  telephone: "038 45 059 58",
  email: "cfplvfianara@gmail.com",
  adresse: "Anjarasoa Ankofafa Fianarantsoa, BP 1142",
  lieu: "FMA - Fille de Marie Auxiliatrice, Fianarantsoa"
};

/* ── Animation variants (inchangés) ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};
const socialIconVariants = {
  hover: { scale: 1.2, rotate: 5, transition: { duration: 0.2 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.05, y: -5, transition: { duration: 0.3, ease: "easeInOut" } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

/* ── Reusable cards ── */
const Card = ({ children, className = "" }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    whileHover="hover"
    viewport={{ once: true, margin: "-50px" }}
    className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    {children}
  </motion.div>
);

const ColoredCard = ({ children, color }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    whileInView="visible"
    whileHover="hover"
    viewport={{ once: true, margin: "-50px" }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden`}
  >
    {children}
  </motion.div>
);

/* ── Section title helper ── */
const SectionTitle = ({ title, subtitle }) => (
  <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
    className="text-center mb-12"
  >
    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-3">{title}</h2>
    {subtitle && <p className="text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">{subtitle}</p>}
    <div className="mt-4 flex justify-center">
      <div className="h-1 w-16 rounded-full bg-indigo-600" />
      <div className="h-1 w-6 rounded-full bg-indigo-300 ml-1" />
    </div>
  </motion.div>
);

function Accueil() {
  const [stats, setStats] = useState({ students: 0, formations: 0, inscriptions: 0, successRate: 0 });

  useEffect(() => {
    const targets = { students: 1250, formations: 15, inscriptions: 890, successRate: 94 };
    const duration = 1500;
    const start = performance.now();
    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setStats({
        students:      Math.floor(targets.students      * progress),
        formations:    Math.floor(targets.formations    * progress),
        inscriptions:  Math.floor(targets.inscriptions  * progress),
        successRate:   Math.floor(targets.successRate   * progress),
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  const inscriptionTypes = [
    {
      type: "academique",
      icon: FaSchool,
      title: "Inscription Académique",
      description: "Lycée - Second cycle",
      levels: ["Seconde", "Première", "Terminale A", "Terminale C", "Terminale D"],
      color: "from-indigo-500 to-indigo-700",
      features: ["Programme scolaire officiel", "Préparation au baccalauréat", "Encadrement pédagogique"]
    },
    {
      type: "professionnelle",
      icon: FaBriefcase,
      title: "Inscription Professionnelle",
      description: "Formations spécialisées",
      domains: ["Langues étrangères", "Informatique", "Musique", "Coupe et Couture", "Pâtisserie"],
      color: "from-violet-500 to-purple-700",
      features: ["Formations certifiantes", "Apprentissage pratique", "Débouchés professionnels"]
    }
  ];

  const features = [
    { icon: FaUserGraduate,     title: "Inscription Simplifiée",  description: "Processus rapide et intuitif pour les deux filières",          color: "from-indigo-500 to-indigo-600" },
    { icon: FaChalkboardTeacher, title: "Gestion Pédagogique",     description: "Administration complète des programmes",                        color: "from-blue-500 to-blue-600" },
    { icon: FaIdCard,           title: "Cartes Étudiantes",       description: "Génération automatique et sécurisée",                           color: "from-violet-500 to-violet-600" },
    { icon: FaFileAlt,          title: "Dossiers Numériques",     description: "Archivage sécurisé des documents",                              color: "from-sky-500 to-sky-600" },
    { icon: FaChartLine,        title: "Suivi Personnalisé",      description: "Analytics et progression des apprenants",                       color: "from-cyan-500 to-cyan-600" },
    { icon: FaShieldAlt,        title: "Sécurité des Données",    description: "Protection avancée des informations",                           color: "from-teal-500 to-teal-600" },
  ];

  const processSteps = [
    { step: "01", icon: FaSearch,       title: "Choix de la Filière",      description: "Académique ou Professionnelle" },
    { step: "02", icon: FaFileAlt,      title: "Dossier d'Inscription",    description: "Formulaire adapté à votre choix" },
    { step: "03", icon: FaCheckCircle,  title: "Validation",               description: "Vérification des informations" },
    { step: "04", icon: FaUserGraduate, title: "Intégration",              description: "Début des cours ou formation" },
  ];

  const advantages = [
    { icon: FaClock,    title: "Gain de Temps",    description: "Processus optimisé et rapide" },
    { icon: FaDatabase, title: "Centralisation",   description: "Toutes les données en un seul endroit" },
    { icon: FaSync,     title: "Mise à Jour",       description: "Informations en temps réel" },
    { icon: FaLaptop,   title: "Accessibilité",    description: "Plateforme disponible 24h/24" },
  ];

  const statItems = [
    { value: stats.students,     suffix: "+", label: "Étudiants inscrits",   icon: FaUsers },
    { value: stats.formations,   suffix: "",  label: "Formations disponibles", icon: FaGraduationCap },
    { value: stats.inscriptions, suffix: "+", label: "Inscriptions traitées", icon: FaFileAlt },
    { value: stats.successRate,  suffix: "%", label: "Taux de réussite",      icon: FaAward },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Header */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <Headers />
      </motion.header>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative py-28 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full -translate-y-48 translate-x-48 opacity-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-violet-400 rounded-full translate-y-56 -translate-x-56 opacity-20 blur-2xl" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* ── BADGE INSCRIPTION ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-5 py-2 rounded-full shadow-xl ring-4 ring-white/30">
              <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full">
                <FaPen className="text-white" size={10} />
              </span>
              Inscriptions ouvertes — Année scolaire actuelle
              <span className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl lg:text-6xl font-bold text-white mb-5 leading-tight"
          >
            Application Web pour la<br />
            <span className="text-indigo-200">Gestion d'Inscription</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg lg:text-xl text-indigo-100 max-w-2xl mx-auto mb-4"
          >
            FMA Laura Vicuña — Anjarasoa Ankofafa
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-indigo-200/80 max-w-xl mx-auto mb-10 text-sm"
          >
            Une plateforme unique pour gérer votre parcours éducatif, qu'il soit académique ou professionnel
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold text-base shadow-2xl hover:bg-indigo-50 transition-all"
              >
                <FaPen size={14} />
                Commencer mon Inscription
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <FaArrowRight size={13} />
                </motion.span>
              </motion.button>
            </Link>
            <a href="#process">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/20 transition-all"
              >
                Découvrir la plateforme
              </motion.button>
            </a>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full block" preserveAspectRatio="none" height="60">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ══════════════════ INSCRIPTION TYPES ══════════════════ */}
      <section className="py-20 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Deux Filières d'Excellence</h2>
            <p className="text-indigo-200 max-w-2xl mx-auto">Choisissez la voie qui correspond à votre projet éducatif et professionnel</p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="h-1 w-16 rounded-full bg-white" />
              <div className="h-1 w-6 rounded-full bg-white/40" />
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {inscriptionTypes.map((type, i) => (
              <motion.div key={i} variants={itemVariants}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-7 text-white shadow-xl hover:bg-white/15 transition-all"
                >
                  {/* Inscription badge sur la carte */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <type.icon className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{type.title}</h3>
                        <p className="text-indigo-200 text-sm">{type.description}</p>
                      </div>
                    </div>
                    <Link to="/login">
                      <motion.span
                        whileHover={{ scale: 1.07 }}
                        className="flex items-center gap-1.5 bg-white text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow cursor-pointer hover:bg-indigo-50 transition-colors"
                      >
                        <FaPen size={9} /> S'inscrire
                      </motion.span>
                    </Link>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-2">
                      {type.type === "academique" ? "Classes disponibles" : "Domaines de formation"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(type.levels || type.domains)?.map((item, idx) => (
                        <span key={idx} className="bg-white/15 border border-white/20 px-3 py-1 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4 space-y-1.5">
                    {type.features.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <FaCheckCircle className="text-white/70 flex-shrink-0" size={12} />
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ PROCESS ══════════════════ */}
      <section id="process" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Processus d'Inscription"
            subtitle="4 étapes simples pour intégrer notre centre, que vous choisissiez la voie académique ou professionnelle"
          />
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900 rounded-2xl flex items-center justify-center mb-4 mt-4">
                    <step.icon className="text-2xl text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{step.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section className="py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Fonctionnalités Complètes"
            subtitle="Une plateforme adaptée aux besoins de l'éducation académique et de la formation professionnelle"
          />
          <motion.div
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={itemVariants}>
                <ColoredCard color={feature.color}>
                  <motion.div whileHover={{ rotate: 5 }} className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <feature.icon className="text-2xl text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm">{feature.description}</p>
                </ColoredCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ ADVANTAGES ══════════════════ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Avantages Clés"
            subtitle="Pourquoi choisir notre plateforme de gestion éducative ?"
          />
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {advantages.map((a, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card>
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-4">
                    <a.icon className="text-xl text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">{a.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{a.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 to-violet-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <FaPen size={11} />
              Inscriptions ouvertes maintenant
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Prêt à rejoindre Laura Vicuña ?</h2>
            <p className="text-indigo-200 max-w-xl mx-auto mb-8">
              Inscrivez-vous dès aujourd'hui et accédez à toutes les fonctionnalités de la plateforme.
            </p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold shadow-2xl hover:bg-indigo-50 transition-all"
              >
                <FaPen size={13} /> Commencer mon Inscription <FaArrowRight size={13} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <motion.footer
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="bg-white border-t border-gray-200 dark:border-gray-700 pt-12 pb-6 transition-colors duration-300"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Logo */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src={fma} alt="FMA" width={52} className="rounded-full ring-2 ring-indigo-200" />
                <div>
                  <h3 className="font-bold">FMA Fianarantsoa</h3>
                  <p className="text-xs text-indigo-600 font-bold">Filles de Marie Auxiliatrice</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Communauté religieuse à Madagascar, dédiée à l'éducation et à la formation professionnelle.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-600 rounded-full" /> Contact
              </h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2.5">
                  <FaPhoneAlt className="text-indigo-500 flex-shrink-0" size={13} />
                  {contactInfo.telephone}
                </p>
                <p className="flex items-center gap-2.5">
                  <FaEnvelope className="text-indigo-500 flex-shrink-0" size={13} />
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-indigo-600 transition-colors">
                    {contactInfo.email}
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <FaMapMarkerAlt className="text-indigo-500 flex-shrink-0" size={13} />
                  {contactInfo.lieu}
                </p>
                <motion.a
                  href="https://facebook.com/100091173631516/posts/683797494669366/?app.fbl"
                  target="_blank" rel="noopener noreferrer"
                  variants={socialIconVariants} whileHover="hover"
                  className="flex items-center gap-2.5 hover:text-indigo-600 transition-colors"
                >
                  <FaFacebook className="text-indigo-500 flex-shrink-0" size={14} />
                  LCfp Laura Vicuna Ankofafa
                </motion.a>
              </div>
            </div>

            {/* Map */}
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-600 rounded-full" /> Localisation
              </h3>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="rounded-xl overflow-hidden shadow-lg ring-1 ring-indigo-100"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3713.9231416796374!2d47.11154657531207!3d-21.432265780319963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x21e7b9002d50bcef%3A0x2c346ebb7a7657bc!2sFMA!5e0!3m2!1sfr!2smg!4v1771550028469!5m2!1sfr!2smg"
                  width="100%" height="180" style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Carte FMA Laura Vicuna"
                />
              </motion.div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=FMA+Laura+Vicuna+Anjarasoa+Ankofafa"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-2 transition-colors"
              >
                Agrandir la carte <FaExternalLinkAlt size={10} />
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 dark:border-gray-700 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} FMA Fianarantsoa — Tous droits réservés</p>
            <p>Filles de Marie Auxiliatrice — Madagascar</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default Accueil;