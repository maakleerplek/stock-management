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
    thumbnail: string | null;      // URL to item image
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

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

    const url = `${API_BASE_URL}/get-item-from-qr`;
    addLog(`Fetching item for barcode: ${code}`);

    try {
        // Send request to backend
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_id: code }),
        });

        // Check if response is successful
        if (!response.ok) {
            const text = await response.text();
            addLog(`Error: Server returned ${response.status} - ${text}`);
            return null;
        }

        // Parse response
        const data: ApiResponse = await response.json();

        // Return item if found
        if (data?.item) {
            const { name, quantity, price } = data.item;
            addLog(`✓ Found: ${name} (Qty: ${quantity}, €${price.toFixed(2)})`);
            return data.item;
        }

        addLog("Error: No item found for this barcode.");
        return null;
    } catch (error) {
        // Handle network errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Network error: ${errorMessage}`);
        return null;
    }
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
    const url = `${API_BASE_URL}/take-item`;

    try {
        // Send request to backend
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, quantity }),
        });

        // Check if response is successful
        if (!response.ok) {
            addLog(`Error: Failed to remove item ${itemId} (${response.status})`);
            return false;
        }

        return true;
    } catch (error) {
        // Handle network errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Network error removing item: ${errorMessage}`);
        return false;
    }
}