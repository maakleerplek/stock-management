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

interface ApiResponse {
    status: string;
    item: ItemData;
}

// --- Extracted function ---
export async function handleSend(
    code: string,
    addLog: (log: string) => void,
): Promise<ItemData | null> {
    const url = `${import.meta.env.VITE_BACKEND_URL}/get-item-from-qr`;
    if (!code || code === "No result") {
        addLog("Send: No barcode data to send.");
        return null;
    }

    addLog(`Send: Sending barcode "${code}" to ${url}...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_id: code }), // <-- use qr_id
        });

        if (!response.ok) {
            const text = await response.text();
            addLog(`Send: Error from server - ${text}`);
            return null;
        }

        const data: ApiResponse = await response.json();
        addLog(`Send: Response received - ${JSON.stringify(data)}`);

        if (data && data.item) {
            // Destructure the item object into constants
            const {
                id,
                name,
                quantity,
                price,
                description,
                serial,
                location,
                status: itemStatus, // rename to avoid conflict with ApiResponse status
                thumbnail
            } = data.item;

            // Log the details in a structured way
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

            return data.item;
        }
        return null;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`Send: Error - ${errorMessage}`);
        return null;
    }
}
