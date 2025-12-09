/**
 * @file sendCodeHandler.tsx
 * 
 * This file handles all communication with the backend API for inventory management.
 * It provides functions to:
 * - Fetch items by barcode/QR code
 * - Remove items from stock (checkout)
 * - Fetch item thumbnails
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents all data for a single inventory item
 */
export interface ItemData {
    id: number;                    // Unique item identifier
    quantity: number;              // Current stock quantity
    serial: string | null;         // Serial number (if applicable)
    location: string | null;       // Storage location
    status: string;                // Item status (e.g., "active", "inactive")
    name: string;                  // Item name
    description: string;           // Item description
    price: number;                 // Price per unit
    image: string | null;      // URL to item image
    part_id: number | null;        // Part ID from inventory system
}

/**
 * Response structure from the backend when fetching an item
 */
interface ApiResponse {
    status: string;
    item: ItemData;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export const API_ENDPOINTS = {
    GET_ITEM_FROM_QR: '/get-item-from-qr',
    TAKE_ITEM: '/take-item',
    ADD_ITEM: '/add-item',
};

interface ApiCallOptions {
    method: string;
    body?: object;
    addLog: (log: string) => void;
}

async function apiCall<T>(
    endpoint: string,
    options: ApiCallOptions,
): Promise<T | null> {
    const { method, body, addLog } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const text = await response.text();
            addLog(`Error: Server returned ${response.status} - ${text}`);
            return null;
        }

        return await response.json() as T;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Network error during ${method} ${endpoint}: ${errorMessage}`);
        return null;
    }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch item data using a barcode or QR code
 * 
 * @param code - The barcode/QR code to look up
 * @param addLog - Function to log messages to the UI
 * @returns The item data if found, null if not found or error occurred
 * 
 * @example
 * const item = await handleSend("ABC123", addLog);
 */
export async function handleSend(
    code: string,
    addLog: (log: string) => void,
): Promise<ItemData | null> {
    // Validate input
    if (!code || code === "No result") {
        addLog("Error: No barcode data to send.");
        return null;
    }

    addLog(`Fetching item for barcode: ${code}`);

    const data = await apiCall<ApiResponse>(
        API_ENDPOINTS.GET_ITEM_FROM_QR,
        {
            method: "POST",
            body: { qr_id: code },
            addLog,
        }
    );

    if (!data) {
        // apiCall handles logging for network errors or !response.ok
        addLog("Error: Could not retrieve item data."); // Generic error if apiCall returned null
        return null;
    }

    // Return item if found
    if (data.item) {
        const { name, quantity, price } = data.item;
        addLog(`✓ Found: ${name} (Qty: ${quantity}, €${price.toFixed(2)})`);
        return data.item;
    }

    addLog("Error: No item found for this barcode.");
    return null;
}

/**
 * Remove item from stock (checkout operation)
 * 
 * @param itemId - The ID of the item to remove
 * @param quantity - How many units to remove
 * @param addLog - Function to log messages to the UI
 * @returns True if successful, false if failed
 * 
 * @example
 * const success = await handleTakeItem(5, 2, addLog);
 */
export async function handleTakeItem(
    itemId: number,
    quantity: number,
    addLog: (log: string) => void,
): Promise<boolean> {
    const result = await apiCall<unknown>(
        API_ENDPOINTS.TAKE_ITEM,
        {
            method: "POST",
            body: { itemId, quantity },
            addLog,
        }
    );

    if (!result) {
        addLog(`Error: Failed to remove item ${itemId}.`);
        return false;
    }

    // Assuming apiCall returns null on error and result on success
    return true;
}

/**
 * Add item to stock (volunteer mode operation)
 * 
 * @param itemId - The ID of the item to add
 * @param quantity - How many units to add
 * @param addLog - Function to log messages to the UI
 * @returns True if successful, false if failed
 * 
 * @example
 * const success = await handleAddItem(5, 2, addLog);
 */
export async function handleAddItem(
    itemId: number,
    quantity: number,
    addLog: (log: string) => void,
): Promise<boolean> {
    const result = await apiCall<unknown>(
        API_ENDPOINTS.ADD_ITEM,
        {
            method: "POST",
            body: { itemId, quantity },
            addLog,
        }
    );

    if (!result) {
        addLog(`Error: Failed to add item ${itemId}.`);
        return false;
    }

    // Assuming apiCall returns null on error and result on success
    return true;
}