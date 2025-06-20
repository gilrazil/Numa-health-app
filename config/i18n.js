import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Define translations
const translations = {
  en: {
    // Gender Screen
    gender: {
      title: "What's your gender?",
      subtitle: "This helps us provide more accurate nutrition recommendations",
      male: "Male",
      female: "Female", 
      other: "Other",
      continue: "Continue"
    },
    // Age, Height, Weight Screen
    profile: {
      title: "Tell us about yourself",
      subtitle: "This information helps us personalize your experience",
      age: "Age",
      ageYears: "years",
      height: "Height",
      heightCm: "cm",
      weight: "Weight", 
      weightKg: "kg",
      continue: "Continue"
    },
    // Goal Screen
    goal: {
      title: "What's your goal?",
      subtitle: "We'll tailor our recommendations to help you achieve it",
      reduce: "Reduce Weight",
      reduceDesc: "Lose weight in a healthy, sustainable way",
      maintain: "Maintain Weight", 
      maintainDesc: "Keep your current weight and improve nutrition",
      increase: "Increase Weight",
      increaseDesc: "Gain weight and build muscle mass",
      continue: "Continue"
    }
  },
  he: {
    // Gender Screen
    gender: {
      title: "מה המין שלך?",
      subtitle: "זה עוזר לנו לספק המלצות תזונה מדויקות יותר",
      male: "זכר",
      female: "נקבה",
      other: "אחר", 
      continue: "המשך"
    },
    // Age, Height, Weight Screen
    profile: {
      title: "ספר לנו על עצמך",
      subtitle: "המידע הזה עוזר לנו להתאים את החוויה שלך",
      age: "גיל",
      ageYears: "שנים",
      height: "גובה",
      heightCm: "ס״מ", 
      weight: "משקל",
      weightKg: "ק״ג",
      continue: "המשך"
    },
    // Goal Screen
    goal: {
      title: "מה המטרה שלך?",
      subtitle: "נתאים את ההמלצות שלנו כדי לעזור לך להשיג אותה",
      reduce: "הפחתת משקל",
      reduceDesc: "ירידה במשקל בצורה בריאה ובת קיימא",
      maintain: "שמירה על משקל",
      maintainDesc: "שמירה על המשקל הנוכחי ושיפור התזונה",
      increase: "עלייה במשקל", 
      increaseDesc: "עלייה במשקל ובניית מסת שריר",
      continue: "המשך"
    }
  },
  ar: {
    // Gender Screen
    gender: {
      title: "ما هو جنسك؟",
      subtitle: "هذا يساعدنا في تقديم توصيات غذائية أكثر دقة",
      male: "ذكر",
      female: "أنثى",
      other: "آخر",
      continue: "متابعة"
    },
    // Age, Height, Weight Screen  
    profile: {
      title: "أخبرنا عن نفسك",
      subtitle: "هذه المعلومات تساعدنا في تخصيص تجربتك",
      age: "العمر",
      ageYears: "سنة",
      height: "الطول", 
      heightCm: "سم",
      weight: "الوزن",
      weightKg: "كغ",
      continue: "متابعة"
    },
    // Goal Screen
    goal: {
      title: "ما هو هدفك؟",
      subtitle: "سنقوم بتخصيص توصياتنا لمساعدتك في تحقيقه",
      reduce: "تقليل الوزن",
      reduceDesc: "فقدان الوزن بطريقة صحية ومستدامة",
      maintain: "الحفاظ على الوزن",
      maintainDesc: "الحفاظ على وزنك الحالي وتحسين التغذية", 
      increase: "زيادة الوزن",
      increaseDesc: "زيادة الوزن وبناء الكتلة العضلية",
      continue: "متابعة"
    }
  },
  es: {
    // Gender Screen
    gender: {
      title: "¿Cuál es tu género?",
      subtitle: "Esto nos ayuda a proporcionar recomendaciones nutricionales más precisas",
      male: "Masculino",
      female: "Femenino",
      other: "Otro",
      continue: "Continuar"
    },
    // Age, Height, Weight Screen
    profile: {
      title: "Cuéntanos sobre ti",
      subtitle: "Esta información nos ayuda a personalizar tu experiencia",
      age: "Edad",
      ageYears: "años",
      height: "Altura",
      heightCm: "cm",
      weight: "Peso",
      weightKg: "kg", 
      continue: "Continuar"
    },
    // Goal Screen
    goal: {
      title: "¿Cuál es tu objetivo?",
      subtitle: "Adaptaremos nuestras recomendaciones para ayudarte a lograrlo",
      reduce: "Reducir Peso",
      reduceDesc: "Perder peso de manera saludable y sostenible",
      maintain: "Mantener Peso",
      maintainDesc: "Mantener tu peso actual y mejorar la nutrición",
      increase: "Aumentar Peso",
      increaseDesc: "Ganar peso y desarrollar masa muscular",
      continue: "Continuar"
    }
  },
  fr: {
    // Gender Screen
    gender: {
      title: "Quel est votre sexe ?",
      subtitle: "Cela nous aide à fournir des recommandations nutritionnelles plus précises",
      male: "Homme",
      female: "Femme",
      other: "Autre",
      continue: "Continuer"
    },
    // Age, Height, Weight Screen
    profile: {
      title: "Parlez-nous de vous",
      subtitle: "Ces informations nous aident à personnaliser votre expérience",
      age: "Âge",
      ageYears: "ans",
      height: "Taille",
      heightCm: "cm",
      weight: "Poids",
      weightKg: "kg",
      continue: "Continuer"
    },
    // Goal Screen
    goal: {
      title: "Quel est votre objectif ?",
      subtitle: "Nous adapterons nos recommandations pour vous aider à l'atteindre",
      reduce: "Réduire le Poids",
      reduceDesc: "Perdre du poids de manière saine et durable",
      maintain: "Maintenir le Poids",
      maintainDesc: "Garder votre poids actuel et améliorer la nutrition",
      increase: "Augmenter le Poids",
      increaseDesc: "Prendre du poids et développer la masse musculaire",
      continue: "Continuer"
    }
  }
};

// Configure i18n
const i18n = new I18n(translations);

// Set the locale based on device settings using Expo Localization
const deviceLanguage = Localization.locale?.split('-')[0] || 'en';

// Map device language to supported languages
const getSupportedLanguage = (deviceLang) => {
  const supportedLanguages = ['en', 'he', 'ar', 'es', 'fr'];
  
  // Direct match
  if (supportedLanguages.includes(deviceLang)) {
    return deviceLang;
  }
  
  // Language family mapping
  const languageMap = {
    'iw': 'he', // Hebrew alternative code
    'ar': 'ar', // Arabic
    'es': 'es', // Spanish
    'fr': 'fr', // French
  };
  
  return languageMap[deviceLang] || 'en'; // Default to English
};

i18n.locale = getSupportedLanguage(deviceLanguage);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Helper function to get current language info
export const getCurrentLanguageInfo = () => {
  const locale = i18n.locale;
  const isRTL = ['he', 'ar'].includes(locale);
  
  return {
    locale,
    isRTL,
    languageName: {
      'en': 'English',
      'he': 'עברית', 
      'ar': 'العربية',
      'es': 'Español',
      'fr': 'Français'
    }[locale] || 'English'
  };
};

// Helper function to translate with fallback
export const t = (key, options = {}) => {
  return i18n.t(key, options);
};

export default i18n; 