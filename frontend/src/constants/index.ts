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
    CREATE_PART: '/create-part',
    UPDATE_PART: '/update-part/{part_pk}',
    CREATE_STOCK_ITEM: '/create-stock-item',
    UPLOAD_PART_IMAGE: '/upload-part-image/{part_id}',
  },
} as const;

// InvenTree Configuration (set via VITE_INVENTREE_URL at build time)
export const INVENTREE_CONFIG = {
  URL: import.meta.env.VITE_INVENTREE_URL || 'https://inventree.localhost',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'themePreference',
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
  PAYCONIQ_MERCHANT_ID: import.meta.env.VITE_PAYCONIQ_MERCHANT_ID || '616941d236664900073738ce',
} as const;

// Authentication
export const AUTH = {
  VOLUNTEER_PASSWORD: import.meta.env.VITE_VOLUNTEER_PASSWORD || 'volunteer',
} as const;
