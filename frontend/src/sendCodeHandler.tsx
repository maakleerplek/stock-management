import React from 'react';

interface SendCodeButtonProps {
    barcode: string;
    addLog: (log: string) => void;
    url?: string; // Optional, default to local backend
}

// --- Extracted function ---
export async function handleSend(
    code: string,
    addLog: (log: string) => void,
    
) {
    const url = "http://127.0.0.1:8000/get-item-from-qr"
    if (!code || code === "No result") {
        addLog("Send: No barcode data to send.");
        return;
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
            return;
        }

        const data = await response.json();
        addLog(`Send: Response received - ${JSON.stringify(data)}`);

        // Optional: if the backend returns item name, log it
        if (data?.item?.name) {
            addLog(`Send: Item name - ${data.item.name}`);
        }
    } catch (error) {
        addLog(`Send: Error - ${error}`);
    }
}

// --- Button component ---
const SendCodeButton: React.FC<SendCodeButtonProps> = ({ barcode, addLog }) => {
    return (
        <button onClick={() => handleSend(barcode, addLog)}>
            Send code
        </button>
    );
};

export default SendCodeButton;
