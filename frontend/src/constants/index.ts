// Constants file for the frontend application

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001',
  ENDPOINTS: {
    GET_ITEM_FROM_QR: '/get-item-from-qr',
    TAKE_ITEM: '/take-item',
    ADD_ITEM: '/add-item',
    SET_ITEM: '/set-item',
    GET_CATEGORIES: '/get-categories',
    GET_LOCATIONS: '/get-locations',
    CREATE_PART: '/create-part',
    UPDATE_PART: '/update-part',
    CREATE_STOCK_ITEM: '/create-stock-item',
    UPLOAD_PART_IMAGE: '/upload-part-image',
  },
} as const;

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeType = typeof THEMES[keyof typeof THEMES];

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'themePreference',
} as const;

// Default Values
export const DEFAULTS = {
  CURRENCY: 'EUR',
  PART_CURRENCY: 'EUR',
  TOAST_DURATION: 4000,
  GRID_COLUMNS: {
    XS: '1fr',
    MD: '1fr 1fr',
  },
  MOTION_DURATION: 0.6,
} as const;

// Form Validation Rules
export const VALIDATION = {
  PART_NAME: {
    MIN_LENGTH: 1,
    REQUIRED: 'Part name is required',
  },
  QUANTITY: {
    MIN: 0,
    INVALID: 'Quantity must be a valid number',
  },
  CATEGORY: {
    REQUIRED: 'Category is required',
  },
  LOCATION: {
    REQUIRED: 'Location is required',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error',
  FETCH_FAILED: 'Failed to fetch data',
  INVALID_RESPONSE: 'Invalid response from server',
  IMAGE_UPLOAD_FAILED: 'Image upload failed',
  STOCK_CREATION_FAILED: 'Failed to create initial stock',
  PART_UPDATE_FAILED: 'Failed to update part',
  PART_CREATION_FAILED: 'Failed to create part',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PART_CREATED: 'Part created successfully!',
  PART_UPDATED: 'Part updated successfully!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  STOCK_CREATED: 'Initial stock created successfully!',
  CATEGORIES_FETCHED: 'Categories fetched successfully',
  LOCATIONS_FETCHED: 'Locations fetched successfully',
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// InvenTree Configuration
export const INVENTREE_CONFIG = {
  URL: 'https://192.168.68.64.sslip.io',
} as const;

// Authentication
export const AUTH = {
  VOLUNTEER_PASSWORD: import.meta.env.VITE_VOLUNTEER_PASSWORD || 'volunteer',
} as const;