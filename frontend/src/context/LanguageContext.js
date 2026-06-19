import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// Translations
const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    
    // Navigation
    home: 'Home',
    book: 'Book',
    matches: 'Matches',
    discover: 'Discover',
    profile: 'Profile',
    
    // Profile
    editProfile: 'Edit Profile',
    followers: 'Followers',
    following: 'Following',
    settings: 'Settings',
    
    // Settings
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    security: 'Security',
    savedPosts: 'Saved Posts',
    archive: 'Archive',
    yourActivity: 'Your Activity',
    deleteAccount: 'Delete Account',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    helpCenter: 'Help Center',
    about: 'About',
    
    // Booking
    bookNow: 'Book Now',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    confirmBooking: 'Confirm Booking',
    myBookings: 'My Bookings',
    
    // Matches
    createMatch: 'Create Match',
    joinMatch: 'Join Match',
    setScore: 'Set Score',
    matchDetails: 'Match Details',
    
    // Facility
    facilities: 'Facilities',
    addFacility: 'Add Facility',
    manageFacility: 'Manage Facility',
    becomeFacilityOwner: 'Become a Facility Owner',
  },
  hi: {
    // Common
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    done: 'हो गया',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    confirm: 'पुष्टि करें',
    back: 'वापस',
    next: 'अगला',
    search: 'खोजें',
    
    // Auth
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    register: 'पंजीकरण',
    email: 'ईमेल',
    password: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?',
    
    // Navigation
    home: 'होम',
    book: 'बुक करें',
    matches: 'मैच',
    discover: 'खोजें',
    profile: 'प्रोफाइल',
    
    // Profile
    editProfile: 'प्रोफाइल संपादित करें',
    followers: 'फॉलोअर्स',
    following: 'फॉलोइंग',
    settings: 'सेटिंग्स',
    
    // Settings
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    privacy: 'गोपनीयता',
    security: 'सुरक्षा',
    savedPosts: 'सहेजी गई पोस्ट',
    archive: 'संग्रह',
    yourActivity: 'आपकी गतिविधि',
    deleteAccount: 'खाता हटाएं',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    helpCenter: 'सहायता केंद्र',
    about: 'के बारे में',
    
    // Booking
    bookNow: 'अभी बुक करें',
    selectDate: 'तारीख चुनें',
    selectTime: 'समय चुनें',
    confirmBooking: 'बुकिंग की पुष्टि करें',
    myBookings: 'मेरी बुकिंग',
    
    // Matches
    createMatch: 'मैच बनाएं',
    joinMatch: 'मैच में शामिल हों',
    setScore: 'स्कोर सेट करें',
    matchDetails: 'मैच विवरण',
    
    // Facility
    facilities: 'सुविधाएं',
    addFacility: 'सुविधा जोड़ें',
    manageFacility: 'सुविधा प्रबंधित करें',
    becomeFacilityOwner: 'सुविधा मालिक बनें',
  },
  es: {
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    done: 'Hecho',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    search: 'Buscar',
    
    // Auth
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    
    // Navigation
    home: 'Inicio',
    book: 'Reservar',
    matches: 'Partidos',
    discover: 'Descubrir',
    profile: 'Perfil',
    
    // Profile
    editProfile: 'Editar perfil',
    followers: 'Seguidores',
    following: 'Siguiendo',
    settings: 'Configuración',
    
    // Settings
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    notifications: 'Notificaciones',
    privacy: 'Privacidad',
    security: 'Seguridad',
    savedPosts: 'Publicaciones guardadas',
    archive: 'Archivo',
    yourActivity: 'Tu actividad',
    deleteAccount: 'Eliminar cuenta',
    termsOfService: 'Términos de servicio',
    privacyPolicy: 'Política de privacidad',
    helpCenter: 'Centro de ayuda',
    about: 'Acerca de',
    
    // Booking
    bookNow: 'Reservar ahora',
    selectDate: 'Seleccionar fecha',
    selectTime: 'Seleccionar hora',
    confirmBooking: 'Confirmar reserva',
    myBookings: 'Mis reservas',
    
    // Matches
    createMatch: 'Crear partido',
    joinMatch: 'Unirse al partido',
    setScore: 'Establecer puntuación',
    matchDetails: 'Detalles del partido',
    
    // Facility
    facilities: 'Instalaciones',
    addFacility: 'Agregar instalación',
    manageFacility: 'Gestionar instalación',
    becomeFacilityOwner: 'Convertirse en propietario',
  },
};

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
        setT(translations[savedLang]);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (langCode) => {
    try {
      if (translations[langCode]) {
        setLanguage(langCode);
        setT(translations[langCode]);
        await AsyncStorage.setItem('language', langCode);
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
    languages: LANGUAGES,
    translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
