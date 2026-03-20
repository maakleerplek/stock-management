import { useState, useRef, useEffect, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardHeader, CardContent, Button, Typography, Box, CircularProgress, TextField, InputAdornment, IconButton, Alert } from '@mui/material';
import { QrCode2, Stop, AddCircle, Refresh } from '@mui/icons-material';

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerKey, setScannerKey] = useState(0); // Used to force remount scanner
  const inputRef = useRef<HTMLInputElement>(null);
  const loadingTimeoutRef = useRef<number | null>(null);
  const cameraTimeoutRef = useRef<number | null>(null);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
      if (cameraTimeoutRef.current) {
        window.clearTimeout(cameraTimeoutRef.current);
      }
    };
  }, []);

  // Auto-focus manual input on mount if not scanning
  useEffect(() => {
    if (!isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  // Check camera permission proactively
  const checkCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported on this device');
        return false;
      }

      // Try to get camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Release the stream immediately - we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is in use by another application. Try closing other apps.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
      return false;
    }
  }, []);

  const handleScan = (text: string) => {
    const now = Date.now();
    // Prevent double-scanning the same item too quickly (500ms cooldown)
    if (text === barcode && now - lastScanTime < 500) {
      console.log(`[Scanner] Ignored duplicate scan (cooldown): ${text}`);
      return;
    }

    console.log(`[Scanner] Successfully scanned: ${text}`);
    setBarcode(text);
    setLastScanTime(now);
    onScan(text);
    
    // Visual & Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
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
    const err = error as Error;
    
    // Only show error if it's a real camera issue, not just "no code detected"
    if (err.message && !err.message.includes('No MultiFormat Readers')) {
      setCameraError(`Scanner error: ${err.message}`);
    }
  };

  const startScan = async () => {
    console.log('[Scanner] Initializing camera...');
    setCameraError(null);
    
    // Clear any existing timeouts
    if (loadingTimeoutRef.current) window.clearTimeout(loadingTimeoutRef.current);
    if (cameraTimeoutRef.current) window.clearTimeout(cameraTimeoutRef.current);
    
    setIsLoading(true);
    
    // Check camera permission first
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }
    
    // Permission granted, start scanner
    setIsScanning(true);
    setScannerKey(prev => prev + 1); // Force fresh scanner instance
    
    // Set a timeout to detect if camera doesn't start
    cameraTimeoutRef.current = window.setTimeout(() => {
      if (isLoading) {
        console.warn('[Scanner] Camera initialization timeout');
        setCameraError('Camera took too long to start. Try again or use manual input.');
        setIsLoading(false);
      }
    }, 5000);
    
    // Normal loading delay
    loadingTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      if (cameraTimeoutRef.current) {
        window.clearTimeout(cameraTimeoutRef.current);
        cameraTimeoutRef.current = null;
      }
    }, 800);
  };

  const stopScan = () => {
    console.log('[Scanner] Stopping camera.');
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (cameraTimeoutRef.current) {
      window.clearTimeout(cameraTimeoutRef.current);
      cameraTimeoutRef.current = null;
    }
    setIsScanning(false);
    setIsLoading(false);
    setCameraError(null);
  };

  const retryCamera = () => {
    setCameraError(null);
    stopScan();
    // Small delay before retrying
    setTimeout(() => {
      startScan();
    }, 300);
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
        boxShadow: compact ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
        border: compact ? 'none' : undefined,
        overflow: 'hidden'
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
          {/* Camera Error Alert */}
          {cameraError && (
            <Alert 
              severity="warning" 
              sx={{ width: '100%', mb: 1 }}
              action={
                <IconButton size="small" onClick={retryCamera} color="inherit">
                  <Refresh fontSize="small" />
                </IconButton>
              }
            >
              {cameraError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 1 }}>
            {!isScanning ? (
              <Button
                variant="contained"
                size="small"
                startIcon={<QrCode2 />}
                onClick={startScan}
                disabled={isLoading}
                sx={{ borderRadius: 3, px: 2, py: 0.8, textTransform: 'none', fontSize: '0.9rem' }}
              >
                {isLoading ? 'Starting...' : 'Use Camera'}
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<Stop />}
                  onClick={stopScan}
                  sx={{ borderRadius: 3, px: 2, py: 0.8, textTransform: 'none', fontSize: '0.9rem' }}
                >
                  Stop
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={retryCamera}
                  sx={{ borderRadius: 3, px: 1.5, py: 0.8, textTransform: 'none', fontSize: '0.9rem' }}
                >
                  Retry
                </Button>
              </>
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
              borderColor: cameraError ? 'warning.main' : 'primary.main',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.2)'
            }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 1 }}>
                  <CircularProgress color="primary" />
                  <Typography variant="caption" color="grey.500">Initializing camera...</Typography>
                </Box>
              ) : (
                <Scanner
                  key={scannerKey}
                  onScan={(detectedCodes) => {
                    if (detectedCodes.length > 0) {
                      handleScan(detectedCodes[0].rawValue);
                    }
                  }}
                  onError={handleError}
                  allowMultiple={false}
                  scanDelay={500}
                  formats={[
                    'qr_code',
                    'ean_13',
                    'ean_8',
                    'code_128',
                    'code_39',
                    'upc_a',
                    'upc_e',
                    'data_matrix',
                    'itf',
                    'codabar'
                  ]}
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

          {/* Manual input - always visible */}
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
