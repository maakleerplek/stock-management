import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './barcodescanner.css';
import { handleSend, type ItemData } from './sendCodeHandler';

const qrcodeRegionId = "reader";

interface ScannerProps {
    logs: string[];
    addLog: (msg: string) => void;
    onItemScanned?: (item: ItemData) => void;
}

function Scanner({ logs, addLog, onItemScanned = () => {} }: ScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [barcode, setBarcode] = useState('No result');
    const [scannedItem, setScannedItem] = useState<ItemData | null>(null);
    const isProcessing = useRef(false);
    const [showLoading, setShowLoading] = useState(false);

    const startScan = useCallback(() => {
        setScannedItem(null);
        isProcessing.current = false;
        setShowLoading(false);
        setIsScanning(true);
    }, []);

    const stopScan = useCallback(() => {
        setIsScanning(false);
    }, []);
    
    useEffect(() => {
        if (!isScanning) {
            return;
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        const onScanSuccess = async (decodedText: string) => {
            if (isProcessing.current) {
                return;
            }
            isProcessing.current = true;
            setShowLoading(true);

            try {
                addLog(`Scanned: ${decodedText}`);
                setBarcode(decodedText);
                const fetchedItem = await handleSend(decodedText, addLog);
                setScannedItem(fetchedItem);
                if (fetchedItem) onItemScanned(fetchedItem);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Error during scan processing: ${errorMessage}`);
            } finally {
                setShowLoading(false);
                isProcessing.current = false;
                stopScan();
            }
        };

        const onScanFailure = (error: any) => {
            // Ignore frequent "no code found" errors
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        return () => {
            html5QrcodeScanner.clear().catch(error => {
                // Ignore cleanup errors
            });
        };
    }, [isScanning, addLog, stopScan, onItemScanned]);

    return (
        <div className="scanner-container">
            {!isScanning ? (
                <button onClick={startScan}>Scan Item</button>
            ) : (
                <button onClick={stopScan}>Stop Scan</button>
            )}

            {isScanning && <div id={qrcodeRegionId} className="scanner-view"></div>}

            {showLoading && !scannedItem && <div className="loading-spinner"></div>}
            <p>Last Scanned: {barcode}</p>
        </div>
    );
}

export default Scanner;