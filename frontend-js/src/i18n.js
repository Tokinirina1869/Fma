import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// The resources object holds all your translation files
const resources = {
  fr: {
    translation: {
      home: 'Accueil',
      theme: 'Thème',
      lightMode: 'Mode Clair',
      darkMode: 'Mode Sombre',
      languages: 'Langues',
      title: 'FMA Anjarasoa Ankofafa'
    }
  },
  en: {
    translation: {
      home: 'Home',
      theme: 'Theme',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      languages: 'Languages',
      title: 'FMA Anjarasoa Ankofafa'
    }
  },
  mg: {
    translation: {
      home: 'Tohina',
      theme: 'Loko',
      lightMode: 'Maivana',
      darkMode: 'Maizina',
      languages: 'Tenin-jatovolahy',
      title: 'FMA Anjarasoa Ankofafa'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
    }
  });

export default i18n;
