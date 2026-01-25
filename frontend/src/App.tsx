import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import AddPartForm, { type PartFormData, type SelectOption } from './AddPartForm';
import type { ItemData } from './sendCodeHandler';
import ShoppingWindow from './ShoppingWindow';
import BarcodeScannerContainer from './BarcodeScannerContainer';
import Footer from './Footer';
import Header from './Header';
import InvenTreePage from './InvenTreePage';
import { CssBaseline, Box, Dialog, DialogContent } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import { ToastProvider, useToast } from './ToastContext';
import { VolunteerProvider } from './VolunteerContext';
import VolunteerModal from './VolunteerModal';
import { API_CONFIG, STORAGE_KEYS, DEFAULTS } from './constants';
import { 
  getInitialTheme, 
  createApiUrl, 
  getErrorMessage, 
  parseNumericFields,
  createApiErrorHandler
} from './utils/helpers';

function AppContent() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [currentPage, setCurrentPage] = useState<'main' | 'inventree'>('main');
  const [scannedItem, setScannedItem] = useState<ItemData | null>(null);
  const [, setLogs] = useState<string[]>([]); // Ignore logs variable
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [addPartFormModalOpen, setAddPartFormModalOpen] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState<number | null>(null);
  const { addToast } = useToast();

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const handleApiError = useCallback(createApiErrorHandler(addToast), [addToast]);

// Fetch categories and locations on component mount
  useEffect(() => {
    const fetchCategoriesAndLocations = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          fetch(createApiUrl(API_CONFIG.ENDPOINTS.GET_CATEGORIES)),
          fetch(createApiUrl(API_CONFIG.ENDPOINTS.GET_LOCATIONS)),
        ]);

        // Handle categories response
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (categoriesData.status === 'ok') {
            setCategories(categoriesData.categories);
          } else {
            setCategories([]);
            addToast(`Error fetching categories: ${categoriesData.message}`, 'error');
          }
        } else {
          setCategories([]);
          addToast(`Network error fetching categories: ${categoriesRes.statusText}`, 'error');
        }

        // Handle locations response
        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          if (locationsData.status === 'ok') {
            setLocations(locationsData.locations);
          } else {
            setLocations([]);
            addToast(`Error fetching locations: ${locationsData.message}`, 'error');
          }
        } else {
          setLocations([]);
          addToast(`Network error fetching locations: ${locationsRes.statusText}`, 'error');
        }
      } catch (error) {
        setCategories([]);
        setLocations([]);
        handleApiError(error, 'fetching categories and locations');
      }
    };

    fetchCategoriesAndLocations();
  }, [addToast, handleApiError]);

// Helper function to upload image
  const uploadPartImage = async (image: File, partId: string): Promise<void> => {
    try {
      const imageFormData = new FormData();
      imageFormData.append('file', image);
      
      const imageResponse = await fetch(
        createApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_PART_IMAGE, undefined).replace('{part_id}', partId),
        { method: 'POST', body: imageFormData }
      );

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.detail || 'Failed to upload image');
      }
      
      addToast('Image uploaded successfully!', 'success');
    } catch (error) {
      addToast(`Warning: Image upload failed: ${getErrorMessage(error)}`, 'warning');
    }
  };

  // Helper function to create initial stock
  const createInitialStock = async (formData: PartFormData, partId: string): Promise<void> => {
    const { initialQuantity, locationId, purchasePrice } = parseNumericFields(formData);

    if (initialQuantity > 0 && partId && locationId > 0) {
      addToast('Creating initial stock...', 'info');
      
      const stockResponse = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.CREATE_STOCK_ITEM), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partId: parseInt(partId),
          quantity: initialQuantity,
          locationId,
          notes: `Initial stock for new part: ${formData.partName}`,
          barcode: formData.barcode,
          purchasePrice,
          purchasePriceCurrency: DEFAULTS.CURRENCY,
        }),
      });

      if (!stockResponse.ok) {
        const errorData = await stockResponse.json();
        throw new Error(errorData.detail || 'Failed to create initial stock');
      }
      
      addToast('Initial stock created successfully!', 'success');
    }
  };

  // Helper function to update existing part
  const updateExistingPart = async (formData: PartFormData): Promise<{ status: string; message?: string }> => {
    const response = await fetch(
      createApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PART).replace('{part_pk}', formData.partId!),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          storageLocation: formData.storageLocation,
          barcode: formData.barcode,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update part');
    }

    addToast('Part updated successfully!', 'success');
    return response.json();
  };

  // Helper function to create new part
  const createNewPart = async (formData: PartFormData): Promise<{ partId: string }> => {
    const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.CREATE_PART), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partName: formData.partName,
        description: formData.description,
        initialQuantity: formData.initialQuantity,
        minimumStock: formData.minimumStock,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create part');
    }

    const result = await response.json();
    addToast('Part created successfully!', 'success');
    return { partId: result.partId };
  };

  // Main form submission handler
  const handleAddPartSubmit = async (formData: PartFormData): Promise<{ partId: string }> => {
    try {
      if (formData.partId) {
        // Step 2: Update existing part
        await updateExistingPart(formData);

        // Upload image if provided
        if (formData.image) {
          await uploadPartImage(formData.image, formData.partId);
        }

        // Create initial stock
        await createInitialStock(formData, formData.partId);

        setAddPartFormModalOpen(false);
        return { partId: formData.partId };
      } else {
        // Step 1: Create new part
        return await createNewPart(formData);
      }
    } catch (error) {
      handleApiError(error, 'part submission');
      throw error;
    }
  };

const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    const updateTheme = () => {
      setTheme(newTheme);
      localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, newTheme);
    };

    // Use the View Transitions API if available
    if (!document.startViewTransition) {
      updateTheme();
      return;
    }

    // Wrap the state update in startViewTransition
    document.startViewTransition(updateTheme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />

<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DEFAULTS.MOTION_DURATION, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          {currentPage === 'inventree' ? (
            <InvenTreePage onBack={() => setCurrentPage('main')} />
          ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Header
              theme={theme}
              toggleTheme={toggleTheme}
              setVolunteerModalOpen={setVolunteerModalOpen}
              setAddPartFormModalOpen={setAddPartFormModalOpen}
              onOpenInvenTree={() => setCurrentPage('inventree')}
            />
          <Box sx={{ flex: 1, py: 4 }}>
            <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: DEFAULTS.GRID_COLUMNS.XS, md: DEFAULTS.GRID_COLUMNS.MD }, gap: 3 }}>
                <BarcodeScannerContainer 
                  onItemScanned={(item) => {
                    setScannedItem(null); // Reset first to ensure re-trigger
                    setScannedItem(item);
                  }}
                  checkoutTotal={checkoutTotal}
                />
                <Box>
                  <ShoppingWindow 
                    addLog={addLog} 
                    scannedItem={scannedItem}
                    onCheckoutTotalChange={setCheckoutTotal}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Footer />
        </Box>
          )}
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
