// Utility functions for the frontend application

import type { PartFormData, PartFormErrors } from '../AddPartForm';
import type { ItemData } from '../sendCodeHandler';
import { VALIDATION, ERROR_MESSAGES } from '../constants';

// Theme utilities
export const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('themePreference');
  return savedTheme ? (savedTheme as 'light' | 'dark') : 'light';
};

// API utilities
export const createApiUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
  return `${base}${endpoint}`;
};

// Form validation utilities
export const validateStep1 = (formData: PartFormData): PartFormErrors => {
  const errors: PartFormErrors = {};

  if (!formData.partName || formData.partName.trim().length === 0) {
    errors.partName = VALIDATION.PART_NAME.REQUIRED;
  }

  const quantity = parseFloat(formData.initialQuantity);
  if (formData.initialQuantity && (isNaN(quantity) || quantity < VALIDATION.QUANTITY.MIN)) {
    errors.initialQuantity = VALIDATION.QUANTITY.INVALID;
  }

  return errors;
};

export const validateStep2 = (formData: PartFormData): PartFormErrors => {
  const errors: PartFormErrors = {};

  if (!formData.category || formData.category.trim().length === 0) {
    errors.category = VALIDATION.CATEGORY.REQUIRED;
  }

  if (!formData.storageLocation || formData.storageLocation.trim().length === 0) {
    errors.storageLocation = VALIDATION.LOCATION.REQUIRED;
  }

  return errors;
};

// Error handling utilities
export const getErrorMessage = (error: unknown, context?: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return ERROR_MESSAGES.FETCH_FAILED + (context ? ` in ${context}` : '');
};

// Form data utilities
export const parseNumericFields = (formData: PartFormData) => {
  return {
    initialQuantity: parseFloat(formData.initialQuantity) || 0,
    purchasePrice: parseFloat(formData.purchasePrice) || 0,
    locationId: parseInt(formData.storageLocation) || 0,
    partId: formData.partId ? parseInt(formData.partId) : undefined,
  };
};

// File utilities
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Scanned item utilities
export const createScannedItemResetHandler = (setter: (item: ItemData | null) => void) => {
  return (item: ItemData) => {
    setter(null); // Reset first to ensure re-trigger
    setTimeout(() => setter(item), 0);
  };
};

// Toast message utilities
export const createApiErrorHandler = (addToast: (message: string, type: 'error' | 'warning') => void) => {
  return (error: unknown, context: string, showWarning = false) => {
    const message = getErrorMessage(error, `${ERROR_MESSAGES.FETCH_FAILED} in ${context}`);
    addToast(message, showWarning ? 'warning' : 'error');
  };
};