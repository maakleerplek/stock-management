import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion } from 'framer-motion';
import { Card, Button, Typography, Box, CircularProgress } from '@mui/material';
import { QrCode2, Stop } from '@mui/icons-material';

interface ScannerProps {
  onScan: (barcode: string) => void;
  compact?: boolean;
}

function BarcodeScanner({ onScan, compact = false }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [barcode, setBarcode] = useState('No result');
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = (text: string) => {
    setBarcode(text);
    onScan(text);
    setIsScanning(false);
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
  };

  const startScan = () => {
    setIsLoading(true);
    setIsScanning(true);
    // Simulate a small loading state while the camera initializes
    setTimeout(() => setIsLoading(false), 500);
  };

  const stopScan = () => {
    setIsScanning(false);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? 2 : 3,
        p: compact ? 2 : 3,
        width: '100%',
        maxWidth: 450,
        borderRadius: 4,
        boxShadow: compact ? 'none' : '0 8px 32px rgba(0,0,0,0.08)',
        bgcolor: compact ? 'transparent' : 'background.paper',
        backgroundImage: 'none',
        border: compact ? 'none' : '1px solid',
        borderColor: 'divider',
      }}>
        {!compact && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <QrCode2 sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="bold">Barcode Scanner</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
          {!isScanning ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<QrCode2 />}
              onClick={startScan}
              sx={{ borderRadius: 3, px: 4, py: 1.5, textTransform: 'none', fontSize: '1.1rem' }}
            >
              Scan Item
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<Stop />}
              onClick={stopScan}
              sx={{ borderRadius: 3, px: 4, py: 1.5, textTransform: 'none', fontSize: '1.1rem' }}
            >
              Stop Scan
            </Button>
          )}
        </Box>

        {isScanning && (
          <Box sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            mt: 2,
            bgcolor: 'black',
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.2)'
          }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Scanner
                onScan={(detectedCodes) => {
                  if (detectedCodes.length > 0) {
                    handleScan(detectedCodes[0].rawValue);
                  }
                }}
                onError={handleError}
                allowMultiple={false}
                scanDelay={2000}
                constraints={{
                  facingMode: 'environment',
                }}
                components={{
                  torch: true,
                  finder: true,
                }}
                styles={{
                  container: { width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' }
                }}
              />
            )}
          </Box>
        )}

        <Box sx={{
          mt: 2,
          p: 1.5,
          width: '100%',
          bgcolor: 'action.hover',
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            Last Scanned:
            <Typography component="span" variant="body1" sx={{ ml: 1, fontWeight: 'bold', color: 'primary.main' }}>
              {barcode}
            </Typography>
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
}

export default BarcodeScanner;
