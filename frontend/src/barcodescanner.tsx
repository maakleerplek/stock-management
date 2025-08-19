import { useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner';
import { Result, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import TestingTerminal from './testing-terminal';
import { handleSend, type ItemData } from './sendCodeHandler';
import ItemDisplay from './ItemDisplay';

function Scanner() {
     const [isScanning, setIsScanning] = useState(false);
    const [barcode, setBarcode] = useState('No result');
    const [item, setItem] = useState<ItemData | null>(null);
    const [stopStream, setStopStream] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);


    const startScan = () => {
        setBarcode('No result');
        // Reset item state on new scan
        setItem(null);
        setIsProcessing(false);
        setStopStream(false);
        setIsScanning(true);
    };

    const stopScan = () => {
        // As per react-qr-barcode-scanner docs, we should stop the stream before unmounting.
        setStopStream(true);
        // A timeout of 0ms just pushes the execution to the next event loop tick,
        // allowing the state update to propagate before unmounting the component.
        setTimeout(() => setIsScanning(false), 0);
    };

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, msg]);
    };

    const handleUpdate = async (err: any, result?: Result) => {
        if (isProcessing) {
            return;
        }

        if (result) {
            setIsProcessing(true);
            const code = result.getText();
            addLog(`Scanned: ${code}`);
            setBarcode(code); // Set barcode after logging to see the change
            // Fetch item data and update the state
            const fetchedItem = await handleSend(code, addLog);
            setItem(fetchedItem);
            stopScan();
        }
        // Handle scanning errors, e.g., camera not found or permission denied
        if (err && !result) {
            // These exceptions are part of the normal scanning process and should be ignored.
            // They are thrown when a barcode is not found or is not valid in a single frame.
            if (
                err instanceof NotFoundException ||
                err instanceof ChecksumException ||
                err instanceof FormatException
            ) {
                return;
            }

            const errorMessage = err instanceof Error ? err.message : String(err);
            addLog(`Scan Error: ${errorMessage}`);
            stopScan();
        }
    };


    return (
        <div className="scanner-container">
            {!isScanning ? (
                <button onClick={startScan}>Scan Item</button>
            ) : (
                // The "Stop Scan" button is useful if the camera doesn't work
                // or the user wants to cancel.
                <button onClick={stopScan}>Stop Scan</button>
            )}

            {isScanning && <BarcodeScanner width={500} height={500} onUpdate={handleUpdate} stopStream={stopStream} />}
            <p>Last Scanned: {barcode}</p>
            <ItemDisplay item={item} addLog={addLog} />
            <TestingTerminal logs={logs} />
        </div>
    );
}

export default Scanner;