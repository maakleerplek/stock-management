import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { Card, Button, Typography, Box } from '@mui/material';
import { QrCode2, Stop } from '@mui/icons-material';

const QR_READER_ID = 'reader';

interface ScannerProps {
  onScan: (barcode: string) => void;
}

function Scanner({ onScan }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [barcode, setBarcode] = useState('No result');

  const onScanRef = useRef(onScan);

  const startScan = useCallback(() => {
    setIsScanning(true);
  }, []);

  const stopScan = useCallback(() => {
    setIsScanning(false);
  }, []);

  // Keep ref updated with current callback
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Scanner effect
  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      QR_READER_ID,
      {
        fps: 30, // Increase frame rate for faster detection
        // Remove qrbox so the scanner looks at the entire frame, not just the center
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true // Use faster native API if available
        }
      },
      false
    );

    let isProcessing = false;

    const onScanSuccess = (decodedText: string) => {
      if (isProcessing) return;
      isProcessing = true;
      setBarcode(decodedText);

      // Pass the raw string to the parent
      onScanRef.current(decodedText);

      // Stop scanner automatically after a successful scan
      scanner.clear().then(() => {
        setIsScanning(false);
      }).catch(console.error);
    };

    scanner.render(onScanSuccess, (error) => {
      // Ignore routine scan errors
      console.debug(error);
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isScanning]);

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
            <Button variant="contained" startIcon={<QrCode2 />} onClick={startScan}>
              Scan Item
            </Button>
          ) : (
            <Button variant="contained" color="error" startIcon={<Stop />} onClick={stopScan}>
              Stop Scan
            </Button>
          )}
        </Box>

        {isScanning && (
          <Box id={QR_READER_ID} sx={{ width: '100%', maxWidth: 400, aspectRatio: '1 / 1', borderRadius: 1.5, overflow: 'hidden', border: '2px solid', borderColor: 'primary.main', position: 'relative', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}></Box>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          Last Scanned: <Typography component="span" variant="body2" sx={{ fontWeight: 'medium', bgcolor: 'background.default', p: 0.5, borderRadius: 1 }}>{barcode}</Typography>
        </Typography>
      </Card>
    </motion.div>
  );
}

export default Scanner;