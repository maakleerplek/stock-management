/**
 * @file sendCodeHandler.tsx
 * 
 * This file handles all communication with the backend API for inventory management.
 * It provides functions to:
 * - Fetch items by barcode/QR code
 * - Remove items from stock (checkout)
 * - Add items to stock (volunteer mode)
 * - Set stock to absolute quantity
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
    image: string | null;          // URL to item image
    part_id: number | null;        // Part ID from inventory system
    ipn: string;                   // Internal Part Number
    category: string;              // Category name
}

/**
 * Wraps a scanned item with a unique counter so scanning the same barcode
 * twice in a row still triggers the ShoppingWindow useEffect.
 */
export interface ScanEvent {
    item: ItemData;
    id: number;
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

import { API_CONFIG } from './constants';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

// ============================================================================
// INTERNAL API HELPER
// ============================================================================

async function apiCall<T>(
    endpoint: string,
    method: string,
    body?: object,
): Promise<T | null> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.debug(`[API] ${method} ${url}`, body || '');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const text = await response.text().catch(() => 'No response text');
            console.error(`[API] Error: ${method} ${endpoint} returned ${response.status} ${response.statusText} - ${text}`);
            return null;
        }

        const data = await response.json() as T;
        console.debug(`[API] Success: ${method} ${endpoint}`);
        return data;
    } catch (error) {
        const err = error as Error;
        
        if (err.name === 'AbortError') {
            console.error(`[API] Timeout: ${method} ${endpoint}`);
        } else {
            console.error(`[API] Fetch failed for ${method} ${endpoint}:`, err);
        }
        
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
 * @returns The item data if found, null if not found or error occurred
 */
export async function handleSend(code: string): Promise<ItemData | null> {
    if (!code || code === "No result") {
        console.debug("No barcode data to send.");
        return null;
    }

    console.debug(`Fetching item for barcode: ${code}`);

    const data = await apiCall<ApiResponse>(
        API_ENDPOINTS.GET_ITEM_FROM_QR,
        "POST",
        { qr_id: code },
    );

    if (!data) {
        console.debug("Could not retrieve item data.");
        return null;
    }

    if (data.item) {
        const { name, quantity, price } = data.item;
        console.debug(`Found: ${name} (Qty: ${quantity}, €${price.toFixed(2)})`);
        return data.item;
    }

    console.debug("No item found for this barcode.");
    return null;
}

/**
 * Remove item from stock (checkout operation)
 */
export async function handleTakeItem(
    itemId: number,
    quantity: number,
): Promise<boolean> {
    const result = await apiCall<unknown>(
        API_ENDPOINTS.TAKE_ITEM,
        "POST",
        { itemId, quantity },
    );
    if (!result) {
        console.debug(`Failed to remove item ${itemId}.`);
        return false;
    }
    return true;
}

/**
 * Add item to stock (volunteer mode operation)
 */
export async function handleAddItem(
    itemId: number,
    quantity: number,
): Promise<boolean> {
    const result = await apiCall<unknown>(
        API_ENDPOINTS.ADD_ITEM,
        "POST",
        { itemId, quantity },
    );
    if (!result) {
        console.debug(`Failed to add item ${itemId}.`);
        return false;
    }
    return true;
}

/**
 * Set stock to an absolute quantity
 */
export async function handleSetItem(
    itemId: number,
    quantity: number,
): Promise<boolean> {
    const result = await apiCall<unknown>(
        API_ENDPOINTS.SET_ITEM,
        "POST",
        { itemId, quantity },
    );
    if (!result) {
        console.debug(`Failed to set item ${itemId}.`);
        return false;
    }
    return true;
}