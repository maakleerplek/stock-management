import { Box, Grid, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Logo from './logo';
import LightOrDarkButton from './LightOrDarkButton';
import { useVolunteer } from './VolunteerContext';
import { INVENTREE_CONFIG } from './constants';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  setVolunteerModalOpen: (open: boolean) => void;
  setAddPartFormModalOpen: (open: boolean) => void;
  setAddCategoryModalOpen: (open: boolean) => void;
  setAddLocationModalOpen: (open: boolean) => void;
  onOpenInvenTree?: () => void;
  onOpenInventory?: () => void;
  isInventoryOpen?: boolean;
}

function Header({ theme, toggleTheme, setVolunteerModalOpen, setAddPartFormModalOpen, setAddCategoryModalOpen, setAddLocationModalOpen, onOpenInvenTree, onOpenInventory, isInventoryOpen }: HeaderProps) {
  const { isVolunteerMode, setIsVolunteerMode } = useVolunteer();

  const handleVolunteerToggle = () => {
    if (isVolunteerMode) {
      if (window.confirm("Are you sure you want to exit Volunteer Mode?")) {
        // Exit volunteer mode immediately
        setIsVolunteerMode(false);
        setAddPartFormModalOpen(false); // Close add part form if open
        if (onOpenInventory && isInventoryOpen) {
          onOpenInventory(); // Close inventory list if open
        }
      }
    } else {
      // Show password dialog
      setVolunteerModalOpen(true);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: isVolunteerMode ? 'info.main' : 'background.paper', 
      borderBottom: '1px solid', 
      borderColor: 'divider', 
      py: { xs: 1, sm: 2 } 
    }}>
      <Grid container maxWidth="lg" sx={{ mx: 'auto', px: { xs: 1.5, sm: 2 }, justifyContent: 'space-between', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'nowrap' }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Logo />
          {isVolunteerMode && (
            <Box sx={{
              display: { xs: 'none', md: 'inline-block' },
              px: 1.5,
              py: 0.5,
              backgroundColor: 'info.dark',
              color: 'info.contrastText',
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              VOLUNTEER MODE
            </Box>
          )}
        </Box>

        {/* Buttons Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', flex: 1, minWidth: 0 }}>
          {/* Main Action Row */}
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isVolunteerMode && (
              <>
                <Button
                  variant="contained"
                  color="info"
                  onClick={onOpenInventory}
                  size="small"
                  sx={{ 
                    bgcolor: isInventoryOpen ? 'info.dark' : 'info.main',
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    px: { xs: 1, sm: 2 },
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                >
                  {isInventoryOpen ? 'Back' : 'List'}
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  onClick={onOpenInvenTree || (() => window.open(INVENTREE_CONFIG.URL, '_blank'))}
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '0.9rem!important', display: { xs: 'none', sm: 'inline-flex' } }} />}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                    px: { xs: 1, sm: 2 },
                    whiteSpace: 'nowrap'
                  }}
                >
                  InvenTree
                </Button>
              </>
            )}
            <Button
              variant={isVolunteerMode ? 'contained' : 'outlined'}
              color={isVolunteerMode ? 'info' : 'inherit'}
              onClick={handleVolunteerToggle}
              size="small"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                px: { xs: 1, sm: 2 },
                whiteSpace: 'nowrap'
              }}
            >
              {isVolunteerMode ? 'Exit' : 'Volunteer'}
            </Button>
            <LightOrDarkButton toggleTheme={toggleTheme} theme={theme} />
          </Box>

          {/* Form Actions Row (Volunteer Only) */}
          {isVolunteerMode && (
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="info"
                onClick={() => setAddCategoryModalOpen(true)}
                size="small"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                  py: { xs: 0.5, sm: 0.25 },
                  px: { xs: 1.25, sm: 1.5 },
                  bgcolor: 'rgba(255,255,255,0.15)',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                + Category
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => setAddLocationModalOpen(true)}
                size="small"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                  py: { xs: 0.5, sm: 0.25 },
                  px: { xs: 1.25, sm: 1.5 },
                  bgcolor: 'rgba(255,255,255,0.15)',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                + Location
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => setAddPartFormModalOpen(true)}
                size="small"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                  py: { xs: 0.5, sm: 0.25 },
                  px: { xs: 1.25, sm: 1.5 },
                  bgcolor: 'rgba(255,255,255,0.15)',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                + Part
              </Button>
            </Box>
          )}
        </Box>
      </Grid>
    </Box>
  );
}

export default Header;
