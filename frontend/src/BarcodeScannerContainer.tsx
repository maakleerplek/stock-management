import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Scanner from './barcodescanner';
import Qrcode from './qrcode';
import { handleSend, type ItemData } from './sendCodeHandler';
import { useToast } from './ToastContext';

interface BarcodeScannerContainerProps {
  onItemScanned: (item: ItemData | null) => void;
  checkoutTotal?: number | null;
}

function BarcodeScannerContainer({ onItemScanned, checkoutTotal = null }: BarcodeScannerContainerProps) {
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const onScan = async (barcode: string) => {
    setIsProcessing(true);
    try {
      const fetchedItem = await handleSend(barcode);
      if (fetchedItem) {
        addToast(`✓ Found: ${fetchedItem.name}`, 'success');
        onItemScanned(fetchedItem);
      } else {
        addToast('No item found for this barcode', 'warning');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addToast(`Failed to process scan: ${errorMessage}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', position: 'relative' }}>
      <Scanner onScan={onScan} />

      {isProcessing && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255, 255, 255, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {checkoutTotal !== null && <Qrcode total={checkoutTotal} />}
    </Box>
  );
}

export default BarcodeScannerContainer;
