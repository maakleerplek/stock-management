import { useState, useRef, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent, Button, Typography, Box, CircularProgress, TextField, InputAdornment, IconButton } from '@mui/material';
import { QrCode2, Stop, AddCircle, CheckCircle } from '@mui/icons-material';

interface ScannerProps {
  onScan: (barcode: string) => void;
  compact?: boolean;
}

function BarcodeScanner({ onScan, compact = false }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [barcode, setBarcode] = useState('No result');
  const [isLoading, setIsLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus manual input on mount if not scanning
  useEffect(() => {
    if (!isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  const handleScan = (text: string) => {
    const now = Date.now();
    // Prevent double-scanning the same item too quickly (2 second cooldown)
    if (text === barcode && now - lastScanTime < 2000) {
        console.log(`[Scanner] Ignored duplicate scan: ${text}`);
        return;
    }

    console.log(`[Scanner] Successfully scanned: ${text}`);
    setBarcode(text);
    setLastScanTime(now);
    onScan(text);
    
    // Visual & Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(50); // Short buzz
    }
    
    setShowSuccessOverlay(true);
    setTimeout(() => setShowSuccessOverlay(false), 600);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (manualInput.trim()) {
      console.log(`[Scanner] Manual entry submitted: ${manualInput.trim()}`);
      handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleError = (error: unknown) => {
    console.error('[Scanner] Hardware/Software error:', error);
  };

  const startScan = () => {
    console.log('[Scanner] Initializing camera...');
    setIsLoading(true);
    setIsScanning(true);
    // Simulate a small loading state while the camera initializes
    setTimeout(() => setIsLoading(false), 500);
  };

  const stopScan = () => {
    console.log('[Scanner] Stopping camera.');
    setIsScanning(false);
    setIsLoading(false);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: { xs: 320, sm: 360 },
        bgcolor: compact ? 'transparent' : 'background.paper',
        boxShadow: compact ? 'none' : undefined,
        border: compact ? 'none' : undefined,
      }}>
        {!compact && (
          <CardHeader
            title="Barcode Scanner"
            avatar={<QrCode2 />}
            titleTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold' }}
            sx={{ p: { xs: 1.5, sm: 2 } }}
          />
        )}

        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }, 
          p: { xs: 1.5, sm: 2 }, 
          pt: 0 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
            {!isScanning ? (
              <Button
                variant="contained"
                size="small"
                startIcon={<QrCode2 />}
                onClick={startScan}
                sx={{ borderRadius: 3, px: 2, py: 0.8, textTransform: 'none', fontSize: '0.9rem' }}
              >
                Use Camera
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Stop />}
                onClick={stopScan}
                sx={{ borderRadius: 3, px: 2, py: 0.8, textTransform: 'none', fontSize: '0.9rem' }}
              >
                Stop Camera
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
              mt: 1,
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
                  scanDelay={500} // Faster re-scan delay for different codes
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

          <AnimatePresence>
            {showSuccessOverlay && (
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  bgcolor: 'rgba(0,0,0,0.1)' // Very subtle dimming to focus on the popup
                }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(16, 185, 129, 0.95)', // Solid success green
                    color: 'white',
                    borderRadius: '28px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  }}
                >
                  <CheckCircle sx={{ fontSize: '6rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Added!
                  </Typography>
                </motion.div>
              </Box>
            )}
          </AnimatePresence>

          {!isScanning && (
             <Box component="form" onSubmit={handleManualSubmit} sx={{ width: '100%', mt: 1 }}>
               <TextField
                 fullWidth
                 size="small"
                 variant="outlined"
                 placeholder="Type or scan with USB scanner..."
                 value={manualInput}
                 onChange={(e) => setManualInput(e.target.value)}
                 inputRef={inputRef}
                 InputProps={{
                   endAdornment: (
                     <InputAdornment position="end">
                       <IconButton type="submit" edge="end" color="primary" disabled={!manualInput.trim()}>
                         <AddCircle fontSize="small" />
                       </IconButton>
                     </InputAdornment>
                   ),
                 }}
               />
             </Box>
          )}

          <Box sx={{
            mt: 1,
            p: 1,
            width: '100%',
            bgcolor: 'action.hover',
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="text.secondary">
              Last Scanned:
              <Typography component="span" variant="body2" sx={{ ml: 1, fontWeight: 'bold', color: 'primary.main' }}>
                {barcode}
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default BarcodeScanner;
