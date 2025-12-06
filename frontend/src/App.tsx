import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Scanner from './barcodescanner';
import Qrcode from './qrcode';
import Logo from './logo';
import AddPartForm, { type PartFormData, type SelectOption } from './AddPartForm';
import { handleSend, type ItemData } from './sendCodeHandler';
import LightOrDarkButton from './LightOrDarkButton';
import ShoppingWindow from './ShoppingWindow';
import Footer from './Footer';
import { Grid, CssBaseline, Box, Button, Dialog, DialogContent } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import { ToastProvider, useToast } from './ToastContext';
import { VolunteerProvider, useVolunteer } from './VolunteerContext';
import VolunteerModal from './VolunteerModal';

function AppContent() {
  const [theme, setTheme] = useState('light');
  const [scannedItem, setScannedItem] = useState<ItemData | null>(null);
  const [, setLogs] = useState<string[]>([]); // State for logs
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [addPartFormModalOpen, setAddPartFormModalOpen] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const { isVolunteerMode, setIsVolunteerMode } = useVolunteer();
  const { addToast } = useToast();

  // Fetch categories and locations on component mount
  useEffect(() => {
    const fetchCategoriesAndLocations = async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/get-categories`),
          fetch(`${BACKEND_URL}/get-locations`),
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (categoriesData.status === 'ok') {
            setCategories(categoriesData.categories);
          } else {
            console.error('Backend error fetching categories:', categoriesData.message);
            setCategories([]); // Ensure categories are reset on backend error
            addToast(`Error fetching categories: ${categoriesData.message}`, 'error');
          }
        } else {
          console.error('Network error fetching categories:', categoriesRes.statusText);
          setCategories([]); // Ensure categories are reset on network error
          addToast(`Network error fetching categories: ${categoriesRes.statusText}`, 'error');
        }

        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          if (locationsData.status === 'ok') {
            setLocations(locationsData.locations);
          } else {
            console.error('Backend error fetching locations:', locationsData.message);
            setLocations([]); // Ensure locations are reset on backend error
            addToast(`Error fetching locations: ${locationsData.message}`, 'error');
          }
        } else {
          console.error('Network error fetching locations:', locationsRes.statusText);
          setLocations([]); // Ensure locations are reset on network error
          addToast(`Network error fetching locations: ${locationsRes.statusText}`, 'error');
        }
      } catch (error) {
        console.error('Error fetching categories and locations:', error);
        // Fall back to empty arrays if fetching fails
        setCategories([]);
        setLocations([]);
        addToast(`Failed to fetch categories and locations: ${error}`, 'error');
      }
    };

    fetchCategoriesAndLocations();
  }, [addToast]);

  const handleAddPartSubmit = async (formData: PartFormData) => {
    console.log('Submitting Part Data:', formData);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001'; // Fallback for local development

    try {
      if (formData.partId) {
        // Step 2: Update existing part with category, location, and barcode
        const response = await fetch(`${BACKEND_URL}/update-part/${formData.partId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: formData.category,
            storageLocation: formData.storageLocation,
            barcode: formData.barcode,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to update part');
        }

        const result = await response.json();
        console.log('Part update successful:', result);
        addToast('Part updated successfully!', 'success');

        // --- NEW LOGIC FOR STOCK CREATION ---
        const initialQuantityNum = parseFloat(formData.initialQuantity);
        const locationIdNum = parseInt(formData.storageLocation);

        if (initialQuantityNum > 0 && formData.partId && !isNaN(initialQuantityNum) && !isNaN(locationIdNum)) {
          console.log('Creating initial stock for part:', formData.partId);
          addToast('Creating initial stock...', 'info');
          const stockResponse = await fetch(`${BACKEND_URL}/create-stock-item`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              partId: parseInt(formData.partId),
              quantity: initialQuantityNum,
              locationId: locationIdNum,
              notes: `Initial stock for new part: ${formData.partName}`,
              barcode: formData.barcode, // Pass the barcode here
              purchasePrice: parseFloat(formData.purchasePrice), // Assuming purchasePrice from form
              purchasePriceCurrency: "EUR", // Hardcoding to EUR for now
            }),
          });

          if (!stockResponse.ok) {
            const errorData = await stockResponse.json();
            throw new Error(errorData.detail || 'Failed to create initial stock');
          }
          console.log('Initial stock created successfully!');
          addToast('Initial stock created successfully!', 'success');
        }
        // --- END NEW LOGIC ---

        setAddPartFormModalOpen(false); // Close modal only on final successful submission
        return result;
      } else {
        // Step 1: Create new part
        const response = await fetch(`${BACKEND_URL}/create-part`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partName: formData.partName,
            // partNumber: formData.partNumber, // Removed
            description: formData.description,
            initialQuantity: formData.initialQuantity,
            // unit: formData.unit, // Removed
            // supplier: formData.supplier, // Removed
            // notes: formData.notes, // Removed
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create part');
        }

        const result = await response.json();
        console.log('Part creation successful:', result);
        addToast('Part created successfully!', 'success');
        // Do NOT close modal here, stay on step 2
        return { partId: result.partId }; // Expecting partId from backend for next step
      }
    } catch (error) {
      console.error('Error in part submission:', error);
      addToast(`Error: ${(error instanceof Error ? error.message : String(error))}`, 'error');
      throw error; // Re-throw to be caught by the form's error handling
    }
  };

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

  const handleVolunteerToggle = () => {
    if (isVolunteerMode) {
      // Exit volunteer mode immediately
      setIsVolunteerMode(false);
      setAddPartFormModalOpen(false); // Close add part form if open
    } else {
      // Show password dialog
      setVolunteerModalOpen(true);
    }
  };

  /** Add a log message to the terminal */
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);
  
  const handleItemScanned = async (barcode: string) => {
    setScannedItem(null); // Reset to null first to ensure re-trigger
    const fetchedItem = await handleSend(barcode, addLog);
    if (fetchedItem) {
      setScannedItem(fetchedItem);
    }
  }

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Box sx={{ width: '100%', backgroundColor: isVolunteerMode ? 'info.main' : 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
            <Grid container maxWidth="lg" sx={{ mx: 'auto', px: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Logo />
                {isVolunteerMode && (
                  <Box sx={{ 
                    display: 'inline-block', 
                    ml: 2, 
                    px: 2, 
                    py: 0.5, 
                    backgroundColor: 'info.dark',
                    color: 'info.contrastText',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    📝 VOLUNTEER MODE
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {isVolunteerMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setAddPartFormModalOpen(true)}
                    size="small"
                  >
                    Add New Part
                  </Button>
                )}
                <Button
                  variant={isVolunteerMode ? 'contained' : 'outlined'}
                  color={isVolunteerMode ? 'info' : 'inherit'}
                  onClick={handleVolunteerToggle}
                  size="small"
                >
                  {isVolunteerMode ? 'Exit Volunteer Mode' : 'Volunteer Mode'}
                </Button>
                <LightOrDarkButton toggleTheme={toggleTheme} theme={theme} />
              </Box>
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
        <VolunteerModal open={volunteerModalOpen} onClose={() => setVolunteerModalOpen(false)} />
        
        <Dialog open={addPartFormModalOpen} onClose={() => setAddPartFormModalOpen(false)} maxWidth="md" fullWidth>
          <DialogContent>
            <AddPartForm
              onSubmit={handleAddPartSubmit}
              categories={categories}
              locations={locations}
            />
          </DialogContent>
        </Dialog>

    </ThemeProvider>
  );
}

function App() {
  return (
    <VolunteerProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </VolunteerProvider>
  );
}

export default App;
