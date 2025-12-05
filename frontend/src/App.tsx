import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Scanner from './barcodescanner';
import Qrcode from './qrcode';
import Logo from './logo';
import { type ItemData } from './sendCodeHandler';
import LightOrDarkButton from './LightOrDarkButton';
import ShoppingWindow from './ShoppingWindow';
import Footer from './Footer';
import { Grid, CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import { ToastProvider } from './ToastContext';

function App() {
  const [theme, setTheme] = useState('light');
  const [scannedItem, setScannedItem] = useState<ItemData | null>(null);
  const [, setLogs] = useState<string[]>([]); // State for logs

  // This useEffect is no longer needed as ThemeProvider and CssBaseline handle theme switching.

  const toggleTheme = () => {
    // Use the View Transitions API if available
    if (!document.startViewTransition) {
      // Fallback for browsers that don't support the API
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
      return;
    }

    // Wrap the state update in startViewTransition
    document.startViewTransition(() => {
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    });
  };


  /** Add a log message to the terminal */
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);
  
  const handleItemScanned = (item: ItemData) => {
    setScannedItem(null); // Reset to null first to ensure re-trigger
    setTimeout(() => setScannedItem(item), 0);
  }

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <ToastProvider>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Box sx={{ width: '100%', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
            <Grid container maxWidth="lg" sx={{ mx: 'auto', px: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Logo />
              <LightOrDarkButton toggleTheme={toggleTheme} theme={theme} />
            </Grid>
          </Box>

          <Box sx={{ flex: 1, py: 4 }}>
            <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                  <Scanner addLog={addLog} onItemScanned={handleItemScanned} />
                  <Qrcode />
                </Box>
                <Box>
                  <ShoppingWindow addLog={addLog} scannedItem={scannedItem} />
                </Box>
              </Box>
            </Box>
          </Box>

          <Footer />
        </Box>
        </motion.div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
