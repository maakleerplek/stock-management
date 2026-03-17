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

// InvenTree Configuration (set via VITE_INVENTREE_URL at build time)
export const INVENTREE_CONFIG = {
  URL: import.meta.env.VITE_INVENTREE_URL || 'https://inventree.localhost',
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

export interface ExtraService {
  id: string;
  name: string;
  price: number;
  unit: string;
}

// Extra Services List (dynamic)
export let EXTRA_SERVICES: ExtraService[] = [
  { id: 'laser', name: 'Laser Cutter', price: 0.50, unit: 'min' },
  { id: 'fdm', name: 'FDM 3D Printer', price: 0.10, unit: 'g' },
];

/**
 * Updates the global EXTRA_SERVICES list with new data from the backend.
 */
export const updateExtraServices = (services: ExtraService[]) => {
  EXTRA_SERVICES = services;
};

// Payment Configuration (configurable via .env)
export const PAYMENT = {
  BENEFICIARY_NAME: import.meta.env.VITE_PAYMENT_NAME || 'Stock Manager',
  IBAN: import.meta.env.VITE_PAYMENT_IBAN || 'BE00000000000000',
} as const;

// Authentication
export const AUTH = {
  VOLUNTEER_PASSWORD: import.meta.env.VITE_VOLUNTEER_PASSWORD || 'volunteer',
} as const;
