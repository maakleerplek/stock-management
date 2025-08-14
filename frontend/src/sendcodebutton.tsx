import React from 'react';

interface SendCodeButtonProps {
    barcode: string;
    addLog: (log: string) => void;
    url?: string; // Optional, default to google.com
}

const SendCodeButton: React.FC<SendCodeButtonProps> = ({ barcode, addLog, url = "https://www.google.com" }) => {
    const handleSend = async () => {
        if (!barcode || barcode === "No result") {
            addLog("Send: No barcode data to send.");
            return;
        }
        addLog(`Send: Sending barcode "${barcode}" to ${url}...`);
        try {
            // Example POST request, adjust as needed for your API
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ barcode }),
            });
            addLog(`Send: Request sent. Status: ${response.status}`);
        } catch (error) {
            addLog(`Send: Error - ${error}`);
        }
    };

    return (
        <button onClick={handleSend}>
            Send code
        </button>
    );
};

export default SendCodeButton;