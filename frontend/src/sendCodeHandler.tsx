/**
 * @file sendCodeHandler.tsx
 * @fileoverview This file contains the logic for handling barcode sends and item data.
 * It defines the data structures for items and API responses, and provides functions
 * to communicate with the backend API.
 */

/**
 * @interface ItemData
 * @description Defines the structure for an item's data as returned by the API.
 * This interface is used to type the item object received from the backend.
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
}

/**
 * @interface ApiResponse
 * @description Defines the structure of the API response when fetching item data.
 * It includes a status message and the item data itself.
 */
interface ApiResponse {
    status: string;
    item: ItemData;
}

/**
 * @function handleSend
 * @description Sends a barcode to the backend to retrieve item data.
 * It makes a POST request to the backend API with the scanned QR code ID.
 *
 * @param {string} code - The barcode string to send to the backend.
 * @param {(log: string) => void} addLog - A callback function to log messages.
 * @returns {Promise<ItemData | null>} A promise that resolves with the item data or null if an error occurs.
 */
export async function handleSend(
    code: string,
    addLog: (log: string) => void,
): Promise<ItemData | null> {
    // Construct the full URL for the API endpoint from environment variables.
    const url = `${import.meta.env.VITE_BACKEND_URL}/get-item-from-qr`;

    // Validate the barcode before sending.
    if (!code || code === "No result") {
        addLog("Send: No barcode data to send.");
        return null;
    }

    addLog(`Send: Sending barcode "${code}" to ${url}...`);

    try {
        // Make a POST request to the backend.
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_id: code }), // Send the barcode as qr_id.
        });

        // Check if the server responded with an error.
        if (!response.ok) {
            const text = await response.text();
            addLog(`Send: Error from server - ${text}`);
            return null;
        }

        // Parse the JSON response from the server.
        const data: ApiResponse = await response.json();
        addLog(`Send: Response received - ${JSON.stringify(data)}`);

        // If the response contains item data, log the details.
        if (data && data.item) {
            // Destructure the item object for easier access to its properties.
            const {
                id,
                name,
                quantity,
                price,
                description,
                serial,
                location,
                status: itemStatus, // Rename to avoid conflict with ApiResponse status.
                thumbnail
            } = data.item;

            // Log the details in a structured and readable format.
            addLog("--- Item Details ---");
            addLog(`ID: ${id}`);
            addLog(`Name: ${name}`);
            addLog(`Quantity: ${quantity}`);
            addLog(`Price: ${price}`);
            addLog(`Description: ${description}`);
            addLog(`Serial: ${serial || 'N/A'}`);
            addLog(`Location: ${location || 'N/A'}`);
            addLog(`Image URL: ${thumbnail || 'N/A'}`);
            addLog(`Status: ${itemStatus}`);
            addLog("--------------------");

            // Return the item data.
            return data.item;
        }
        return null;
    } catch (error) {
        // Handle any network or other errors during the fetch.
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Send: Error - ${errorMessage}`);
        return null;
    }
}

/**
 * @function handleItemRemove
 * @description Resets the item state to null and logs a message.
 * This function is intended to be used to clear the displayed item data.
 *
 * @param {(item: ItemData | null) => void} setItem - The state setter function for the item.
 * @param {(log: string) => void} addLog - A callback function to log messages.
 */
export function handleItemRemove(
    setItem: (item: ItemData | null) => void,
    addLog: (log: string) => void
) {
    setItem(null);
    addLog("Item display has been reset.");
}
