// Constants file for the frontend application

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || '/api',
  ENDPOINTS: {
    GET_ITEM_FROM_QR: '/get-item-from-qr',
    TAKE_ITEM: '/take-item',
    ADD_ITEM: '/add-item',
    SET_ITEM: '/set-item',
    GET_CATEGORIES: '/get-categories',
    GET_LOCATIONS: '/get-locations',
    GET_ALL_ITEMS: '/get-all-items',
    CREATE_PART: '/create-part',
    UPDATE_PART: '/update-part/{part_pk}',
    CREATE_STOCK_ITEM: '/create-stock-item',
    UPLOAD_PART_IMAGE: '/upload-part-image/{part_id}',
    CREATE_CATEGORY: '/create-category',
    CREATE_LOCATION: '/create-location',
  },
} as const;

// InvenTree Configuration
// Point directly to the InvenTree port to avoid proxy redirect issues
// Uses 8442 for HTTP and 8443 for HTTPS to match the Caddy configuration
const getInvenTreeUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol; // 'http:' or 'https:'
    
    // If we are on HTTPS, we must use the HTTPS port (8443)
    if (protocol === 'https:') {
      return `https://${hostname}:8443/`;
    }
    
    // Default to port 8442 for HTTP
    return `http://${hostname}:8442/`;
  }
  return '/inventree/';
};

export const INVENTREE_CONFIG = {
  URL: getInvenTreeUrl(),
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'themePreference',
  VOLUNTEER_MODE: 'volunteerModeActive',
} as const;

// Default Values
export const DEFAULTS = {
  CURRENCY: import.meta.env.VITE_CURRENCY || 'EUR',
  TOAST_DURATION: 4000,
  GRID_COLUMNS: {
    XS: '1fr',
    MD: '1fr 1fr',
  },
  MOTION_DURATION: 0.6,
} as const;

// Extra Services Pricing (configurable via .env)
export const PRICING = {
  LASER_PER_MINUTE: parseFloat(import.meta.env.VITE_LASER_PRICE_PER_MIN || '0.50'),
  PRINTING_PER_GRAM: parseFloat(import.meta.env.VITE_PRINT_PRICE_PER_GRAM || '0.10'),
} as const;

// Payment Configuration (configurable via .env)
export const PAYMENT = {
  BENEFICIARY_NAME: import.meta.env.VITE_PAYMENT_NAME || 'Stock Manager',
  IBAN: import.meta.env.VITE_PAYMENT_IBAN || 'BE00000000000000',
} as const;

// Authentication
export const AUTH = {
  VOLUNTEER_PASSWORD: import.meta.env.VITE_VOLUNTEER_PASSWORD || 'volunteer',
} as const;
