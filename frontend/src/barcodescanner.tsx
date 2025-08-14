import { useState } from 'react';
import BarcodeScanner from 'react-qr-barcode-scanner';
import { Result } from '@zxing/library';
import TestingTerminal from './testing-terminal';

function Scanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [barcode, setBarcode] = useState('No result');
    const [stopStream, setStopStream] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const startScan = () => {
        setBarcode('No result');
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
    const handleUpdate = (err: any, result?: Result) => {
        if (result) {
            const code = result.getText();
            setBarcode(code);
            setLogs((prev) => [...prev, `Scanned: ${code}`]);
            stopScan();
        }

        // The `err` argument will be populated if an error occurs during scanning.
        // You can optionally handle it here. e.g. if (err) { console.error(err); }
    };

    return (
        <div className="scanner-container">
            {!isScanning ? (
                <button onClick={startScan}>Start Scan</button>
            ) : (
                <button onClick={stopScan}>Stop Scan</button>
            )}

            {isScanning && <BarcodeScanner width={500} height={500} onUpdate={handleUpdate} stopStream={stopStream} />}
            <p>Last Scanned: {barcode}</p>
            <TestingTerminal logs={logs} />
        </div>
    );
}

export default Scanner;