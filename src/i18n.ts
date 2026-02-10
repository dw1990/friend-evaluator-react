import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Hier definieren wir die Texte
const resources = {
  // DEUTSCH (Nur wenn Browser = Deutsch)
  de: {
    translation: {
      nav: { overview: 'Übersicht', analysis: 'Analyse', data: 'Daten verwalten' },
      matrix: { status: 'Status', filter: 'Filter', addFriend: 'Hinzufügen' },
      // ... deine ganzen anderen deutschen Texte hier ...
      categories: {
        super: 'Super',
        good: 'Gut',
        neutral: 'Neutral',
        draining: 'Belastend',
        toxic: 'Toxisch',
        no_go: 'NO-GO'
      }
    }
  },
  // ENGLISCH (Standard für ALLE anderen)
  en: {
    translation: {
      nav: { overview: 'Overview', analysis: 'Analysis', data: 'Manage Data' },
      matrix: { status: 'Status', filter: 'Filter', addFriend: 'Add' },
      // ... englische Texte ...
      categories: {
        super: 'Super',
        good: 'Good',
        neutral: 'Neutral',
        draining: 'Draining',
        toxic: 'Toxic',
        no_go: 'DEALBREAKER'
      }
    }
  }
};

i18n
  .use(LanguageDetector) // Das Plugin aktiviert die Browser-Erkennung
  .use(initReactI18next)
  .init({
    resources,
    
    // WICHTIG: Das ist deine Regel!
    // Wenn die erkannte Sprache nicht 'de' ist, nimm 'en'.
    fallbackLng: 'en', 
    
    // Optional: Konfiguration des Detektors
    detection: {
      // Prüfe nur den Browser (navigator), keine Cookies oder URL
      order: ['navigator'], 
      // Speichere die Sprache nicht dauerhaft, sondern prüfe jedes Mal neu
      caches: [] 
    },

    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;