import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { handleSend } from './sendCodeHandler'; // Remove ItemData import
import { motion } from 'framer-motion';
import { Card, Button, Typography, Box, CircularProgress } from '@mui/material';
import { QrCode2, Stop }from '@mui/icons-material';
import { useToast } from './ToastContext';

const QR_READER_ID = 'reader';
const noop = () => {};

interface ScannerProps {
  addLog: (msg: string) => void;
  onItemScanned?: (barcode: string) => void; // Change type to string
}

function Scanner({ addLog, onItemScanned = noop }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [barcode, setBarcode] = useState('No result');
  const [showLoading, setShowLoading] = useState(false);
  const { addToast } = useToast();

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
        onItemScannedRef.current(decodedText); // Pass decodedText directly
        const fetchedItem = await handleSend(decodedText, addLog);
        if (fetchedItem) {
          addToast(`✓ Found: ${fetchedItem.name}`, 'success');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addLog(`Error processing scan: ${errorMessage}`);
        addToast(`Failed to process scan: ${errorMessage}`, 'error');
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
  }, [isScanning, addLog, stopScan, addToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, p: 3, width: '100%', maxWidth: 400, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QrCode2 sx={{ fontSize: '1.8rem', color: 'primary.main' }} />
        <Typography variant="h5" component="h2">Barcode Scanner</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
        {!isScanning ? (
          <Button variant="contained" startIcon={<QrCode2 />} onClick={startScan}>Scan Item</Button>
        ) : (
          <Button variant="contained" color="error" startIcon={<Stop />} onClick={stopScan}>
            Stop Scan
          </Button>
        )}
      </Box>

      {isScanning && <Box id={QR_READER_ID} sx={{ width: '100%', maxWidth: 400, aspectRatio: '1 / 1', borderRadius: 1.5, overflow: 'hidden', border: '2px solid', borderColor: 'primary.main', position: 'relative', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}></Box>}
      {showLoading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 1.5 }}>
          <CircularProgress />
        </Box>
      )}

      <Typography variant="body2" sx={{ mt: 2 }}>
        Last Scanned: <Typography component="span" variant="body2" sx={{ fontWeight: 'medium', bgcolor: 'background.default', p: 0.5, borderRadius: 1 }}>{barcode}</Typography>
      </Typography>
    </Card>
    </motion.div>
  );
}

export default Scanner;