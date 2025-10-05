import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './barcodescanner.css';
import { handleSend, type ItemData } from './sendCodeHandler';

const qrcodeRegionId = "reader";

// A stable empty function for the default prop value.
const noop = () => {};

interface ScannerProps {
    logs: string[];
    addLog: (msg: string) => void;
    onItemScanned?: (item: ItemData) => void;
}

function Scanner({ addLog, onItemScanned = noop }: ScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [barcode, setBarcode] = useState('No result');
    const isProcessing = useRef(false);
    const onItemScannedRef = useRef(onItemScanned);
    const [showLoading, setShowLoading] = useState(false);

    const startScan = useCallback(() => {
        isProcessing.current = false;
        setShowLoading(false);
        setIsScanning(true);
    }, []);

    const stopScan = useCallback(() => {
        setIsScanning(false);
    }, []);
    
    useEffect(() => {
        onItemScannedRef.current = onItemScanned;
    }, [onItemScanned]);

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
                if (fetchedItem) {
                    onItemScannedRef.current(fetchedItem);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addLog(`Error during scan processing: ${errorMessage}`);
            } finally {
                setShowLoading(false);
                isProcessing.current = false;
                stopScan();
            }
        };

        const onScanFailure = () => {
            // Ignore frequent "no code found" errors
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        return () => {
            html5QrcodeScanner.clear().catch(error => {
                // This can fail if the scanner is already closed.
                addLog(`Scanner cleanup error (ignoring): ${error}`);
            });
        };
    }, [isScanning, addLog, stopScan]);

    return (
        <div className="scanner-container">
            {!isScanning ? (
                <button onClick={startScan}>Scan Item</button>
            ) : (
                <button onClick={stopScan}>Stop Scan</button>
            )}

            {isScanning && <div id={qrcodeRegionId} className="scanner-view"></div>}

            {showLoading && <div className="loading-spinner"></div>}
            <p>Last Scanned: {barcode}</p>
        </div>
    );
}

export default Scanner;