/**
 * @file sendCodeHandler.tsx
 * API client for communicating with the backend inventory system
 */

export interface ItemData {
    id: number;
    quantity: number;
    serial: string | null;
    location: string | null;
    status: string;
    name: string;
    description: string;
    price: number;
    thumbnail: string | null;
    part_id: number | null;
}

interface ApiResponse {
    status: string;
    item: ItemData;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

/**
 * Fetch item data from a barcode/QR code
 */
export async function handleSend(
    code: string,
    addLog: (log: string) => void,
): Promise<ItemData | null> {
    if (!code || code === "No result") {
        addLog("Error: No barcode data to send.");
        return null;
    }

    const url = `${API_BASE_URL}/get-item-from-qr`;
    addLog(`Fetching item for barcode: ${code}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_id: code }),
        });

        if (!response.ok) {
            const text = await response.text();
            addLog(`Error: Server returned ${response.status} - ${text}`);
            return null;
        }

        const data: ApiResponse = await response.json();

        if (data?.item) {
            const { name, quantity, price } = data.item;
            addLog(`✓ Found: ${name} (Qty: ${quantity}, €${price.toFixed(2)})`);
            return data.item;
        }

        addLog("Error: No item found for this barcode.");
        return null;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Network error: ${errorMessage}`);
        return null;
    }
}

/**
 * Remove item from stock via checkout
 */
export async function handleTakeItem(
    itemId: number,
    quantity: number,
    addLog: (log: string) => void,
): Promise<boolean> {
    const url = `${API_BASE_URL}/take-item`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, quantity }),
        });

        if (!response.ok) {
            addLog(`Error: Failed to remove item ${itemId} (${response.status})`);
            return false;
        }

        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Network error removing item: ${errorMessage}`);
        return false;
    }
}