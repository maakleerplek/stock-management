import { useState, useRef, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent, Button, Typography, Box, CircularProgress, TextField, InputAdornment, IconButton } from '@mui/material';
import { QrCode2, Stop, KeyboardReturn, CheckCircle } from '@mui/icons-material';

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
    setTimeout(() => setShowSuccessOverlay(false), 1500);
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
        gap: 2,
        width: '100%',
        maxWidth: 360,
        bgcolor: compact ? 'transparent' : 'background.paper',
        boxShadow: compact ? 'none' : undefined,
        border: compact ? 'none' : undefined,
      }}>
        {!compact && (
          <CardHeader
            title="Barcode Scanner"
            avatar={<QrCode2 />}
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
        )}

        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 1.5 : 2, p: compact ? 1.5 : 2, pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
            {!isScanning ? (
              <Button
                variant="contained"
                size="medium"
                startIcon={<QrCode2 />}
                onClick={startScan}
                sx={{ borderRadius: 3, px: 3, py: 1, textTransform: 'none', fontSize: '1rem' }}
              >
                Use Camera
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                size="medium"
                startIcon={<Stop />}
                onClick={stopScan}
                sx={{ borderRadius: 3, px: 3, py: 1, textTransform: 'none', fontSize: '1rem' }}
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
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                style={{
                  position: 'fixed', // Use fixed to show over everything if needed, or keep absolute if scoped
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(16, 185, 129, 0.9)', // Stronger green
                  color: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  zIndex: 1000,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  pointerEvents: 'none'
                }}
              >
                <CheckCircle sx={{ fontSize: '4rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Added!
                </Typography>
              </motion.div>
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
                         <KeyboardReturn fontSize="small" />
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
