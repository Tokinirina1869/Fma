import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt, FaSearch, FaChartLine, FaIdCard,
  FaFileAlt, FaShieldAlt, FaMobileAlt, FaRocket, FaUsers, FaGraduationCap, FaUniversity,
  FaAward, FaArrowRight, FaLaptop, FaHandshake, FaHeart, FaCog, FaSync, FaDatabase,
  FaCheckCircle, FaClock, FaStar, FaSchool, FaBriefcase, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaTwitter,
  FaFacebook, FaLinkedin, FaExternalLinkAlt
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

// Animations variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const socialIconVariants = {
  hover: { scale: 1.2, rotate: 5, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Reusable Styled Box
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

function Accueil() {
  const [isSticky, setIsSticky] = useState(false);
  const [stats, setStats] = useState({ students: 0, formations: 0, inscriptions: 0, successRate: 0 });

  // Sticky Header
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated Stats (smoother)
  useEffect(() => {
    const targets = { students: 1250, formations: 15, inscriptions: 890, successRate: 94 };
    const duration = 1500;
    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setStats({
        students: Math.floor(targets.students * progress),
        formations: Math.floor(targets.formations * progress),
        inscriptions: Math.floor(targets.inscriptions * progress),
        successRate: Math.floor(targets.successRate * progress),
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
      levels: ["Seconde", "Première", "Terminale A","Terminale C", "Terminale D"],
      color: "from-blue-500 to-blue-600",
      features: ["Programme scolaire officiel", "Préparation au baccalauréat", "Encadrement pédagogique"]
    },
    {
      type: "professionnelle",
      icon: FaBriefcase,
      title: "Inscription Professionnelle",
      description: "Formations spécialisées",
      domains: ["Langues étrangères", "Informatique", "Musique", "Coupe et Couture", "Patisserie"],
      color: "from-green-500 to-green-600",
      features: ["Formations certifiantes", "Apprentissage pratique", "Débouchés professionnels"]
    }
  ];

  const features = [
    { icon: FaUserGraduate, title: "Inscription Simplifiée", description: "Processus rapide et intuitif pour les deux filières", color: "from-blue-500 to-blue-600" },
    { icon: FaChalkboardTeacher, title: "Gestion Pédagogique", description: "Administration complète des programmes", color: "from-green-500 to-green-600" },
    { icon: FaIdCard, title: "Cartes Étudiantes", description: "Génération automatique et sécurisée", color: "from-purple-500 to-purple-600" },
    { icon: FaFileAlt, title: "Dossiers Numériques", description: "Archivage sécurisé des documents", color: "from-orange-500 to-orange-600" },
    { icon: FaChartLine, title: "Suivi Personnalisé", description: "Analytics et progression des apprenants", color: "from-red-500 to-red-600" },
    { icon: FaShieldAlt, title: "Sécurité des Données", description: "Protection avancée des informations", color: "from-indigo-500 to-indigo-600" }
  ];

  const processSteps = [
    { step: "01", icon: FaSearch, title: "Choix de la Filière", description: "Académique ou Professionnelle" },
    { step: "02", icon: FaFileAlt, title: "Dossier d'Inscription", description: "Formulaire adapté à votre choix" },
    { step: "03", icon: FaCheckCircle, title: "Validation", description: "Verification des informations" },
    { step: "04", icon: FaUserGraduate, title: "Intégration", description: "Début des cours ou formation" }
  ];

  const advantages = [
    { icon: FaClock, title: "Gain de Temps", description: "Processus optimisé et rapide" },
    { icon: FaDatabase, title: "Centralisation", description: "Toutes les données en un seul endroit" },
    { icon: FaSync, title: "Mise à Jour", description: "Informations en temps réel" },
    { icon: FaLaptop, title: "Accessibilité", description: "Plateforme disponible 24h/24" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Headers />
      </motion.header>

      {/* Hero */}
      <section className="relative py-28 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full -translate-y-36 translate-x-36 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full translate-y-48 -translate-x-48 opacity-20"></div>
        
        <div className="text-center container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-blue-100 text-sm font-medium mb-6"
          >
            <FaStar className="mr-2 text-yellow-300" /> Plateforme N°1 de Gestion Éducative
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Application Web pour la Gestion d'Inscription
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="block text-blue-200 text-3xl lg:text-4xl mt-4"
            >
             FMA Laura Vicuna Anjarasoa Ankofafa 
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-xl lg:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto"
          >
            Une plateforme unique pour gérer votre parcours éducatif, qu'il soit académique ou professionnel
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white group text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl flex items-center mx-auto"
              >
                Commencer mon Inscription
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FaArrowRight className="ml-2" />
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Inscription Types */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 text-white">
              Deux Filières d'Excellence
            </h2>
            <p className="text-center mb-12 max-w-2xl mx-auto text-white">
              Choisissez la voie qui correspond à votre projet éducatif et professionnel
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-auto"
          >
            {inscriptionTypes.map((type, index) => (
              <motion.div key={index} variants={itemVariants}>
                <ColoredCard color={type.color}>
                  <div className="flex items-start mb-4">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm mr-4"
                    >
                      <type.icon className="text-2xl text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                      <p className="text-blue-100 text-lg">{type.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">
                      {type.type === "academique" ? "Classes disponibles :" : "Domaines de formation :"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(type.levels || type.domains)?.map((item, idx) => (
                        <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Avantages :</h4>
                    <ul className="space-y-1">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <FaCheckCircle className="text-white mr-2 text-xs" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ColoredCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 dark:text-white">
              Processus d'Inscription
            </h2>
            <p className="text-center mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
              4 étapes simples pour intégrer notre centre, que vous choisissiez la voie académique ou professionnelle
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {processSteps.map((step, index) => (
              <Card key={index} className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-4 mt-4">
                  <step.icon className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 dark:text-white">
              Fonctionnalités Complètes
            </h2>
            <p className="text-center mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
              Une plateforme adaptée aux besoins de l'éducation académique et de la formation professionnelle
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <ColoredCard color={feature.color}>
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm"
                  >
                    <feature.icon className="text-2xl" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </ColoredCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-4 dark:text-white">
              Avantages Clés
            </h2>
            <p className="text-center mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
              Pourquoi choisir notre plateforme de gestion éducative ?
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {advantages.map((advantage, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4"
                  >
                    <advantage.icon className="text-xl text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold dark:text-white mb-2">{advantage.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{advantage.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer amélioré */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 bg-white/50 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne 1 : Logo et description */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <img src={fma} alt="FMA" width={60} className="rounded-full" />
                <h3 className="text-xl font-bold mt-3 mx-4 dark:text-white">FMA Fianarantsoa</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Fille de Marie Auxiliatrice<br />
                Communauté religieuse à Madagascar
              </p>
            </div>

            {/* Colonne 2 : Contact */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Contact</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center justify-center md:justify-start">
                  <FaPhoneAlt size={20} className="mr-2 text-blue-400" />
                  {contactInfo.telephone}
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <FaEnvelope size={20} className="mr-2 text-blue-400" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:underline">
                    {contactInfo.email}
                  </a>
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <FaMapMarkerAlt size={20} className="mr-2 text-blue-400" />
                  {contactInfo.lieu}
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <motion.a
                    href="https://facebook.com/100091173631516/posts/683797494669366/?app.fbl"
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={socialIconVariants}
                    whileHover="hover"
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                    aria-label="Facebook"
                  >
                    <div className="flex items-center justify-center md:justify-start">
                      <FaFacebook size={20} className='text-blue-400' />
                      <span className='mx-2 text-gray-600 dark:text-gray-400'>LCfp Laura Vicuna Ankofafa</span>
                    </div>
                  </motion.a>
                </p>
              </div>
            </div>

            {/* Colonne 3 : Localisation */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Localisation</h3>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-lg overflow-hidden shadow-xl"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3713.9231416796374!2d47.11154657531207!3d-21.432265780319963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x21e7b9002d50bcef%3A0x2c346ebb7a7657bc!2sFMA!5e0!3m2!1sfr!2smg!4v1771550028469!5m2!1sfr!2smg"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Carte FMA Laura Vicuna"
                  className="w-full"
                />
              </motion.div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=FMA+Laura+Vicuna+Anjarasoa+Ankofafa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-2 transition-colors"
              >
                Agrandir la carte <FaExternalLinkAlt className="ml-1 text-xs" />
              </a>
            </div>
          </div>

          {/* Séparateur et copyright */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 FMA Fianarantsoa — Tous droits réservés</p>
            <p className="mt-1 text-xs">Fille de Marie Auxiliatrice - Madagascar</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default Accueil;