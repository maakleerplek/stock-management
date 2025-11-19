import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './barcodescanner.css';
import { handleSend, type ItemData } from './sendCodeHandler';

const QR_READER_ID = "reader";
const noop = () => {};

interface ScannerProps {
    addLog: (msg: string) => void;
    onItemScanned?: (item: ItemData) => void;
}

function Scanner({ addLog, onItemScanned = noop }: ScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [barcode, setBarcode] = useState('No result');
    const [showLoading, setShowLoading] = useState(false);
    
    const isProcessing = useRef(false);
    const onItemScannedRef = useRef(onItemScanned);

    const startScan = useCallback(() => {
        isProcessing.current = false;
        setShowLoading(false);
        setIsScanning(true);
    }, []);

    const stopScan = useCallback(() => {
        setIsScanning(false);
    }, []);
    
    // Keep ref updated with current callback
    useEffect(() => {
        onItemScannedRef.current = onItemScanned;
    }, [onItemScanned]);

    // Scanner effect
    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner(
            QR_READER_ID,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        const onScanSuccess = async (decodedText: string) => {
            if (isProcessing.current) return;
            
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
                addLog(`Error processing scan: ${errorMessage}`);
            } finally {
                setShowLoading(false);
                isProcessing.current = false;
                stopScan();
            }
        };

        const onScanFailure = () => {
            // Suppress "no code found" errors
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(() => {
                // Ignore cleanup errors
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

            {isScanning && <div id={QR_READER_ID} className="scanner-view"></div>}
            {showLoading && <div className="loading-spinner"></div>}
            
            <p>Last Scanned: {barcode}</p>
        </div>
    );
}

export default Scanner;