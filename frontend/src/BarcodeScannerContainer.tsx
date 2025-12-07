import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import Scanner from './barcodescanner';
import Qrcode from './qrcode';
import { handleSend, type ItemData } from './sendCodeHandler';

interface BarcodeScannerContainerProps {
  onItemScanned: (item: ItemData | null) => void;
}

function BarcodeScannerContainer({ onItemScanned }: BarcodeScannerContainerProps) {
  const [, setLogs] = useState<string[]>([]); // State for logs

  /** Add a log message to the terminal */
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const handleItemScannedInternal = async (barcode: string) => {
    // Reset scannedItem in AppContent will happen via onItemScanned(null)
    const fetchedItem = await handleSend(barcode, addLog);
    onItemScanned(fetchedItem);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      <Scanner addLog={addLog} onItemScanned={handleItemScannedInternal} />
      <Qrcode />
    </Box>
  );
}

export default BarcodeScannerContainer;
