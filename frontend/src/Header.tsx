import { Box, Grid, Button, IconButton, Tooltip } from '@mui/material';
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
}

function Header({ theme, toggleTheme, setVolunteerModalOpen, setAddPartFormModalOpen, setAddCategoryModalOpen, setAddLocationModalOpen, onOpenInvenTree }: HeaderProps) {
  const { isVolunteerMode, setIsVolunteerMode } = useVolunteer();

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

  return (
    <Box sx={{ width: '100%', backgroundColor: isVolunteerMode ? 'info.main' : 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
      <Grid container maxWidth="lg" sx={{ mx: 'auto', px: 2, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Logo />
          {isVolunteerMode && (
            <Box sx={{
              display: 'inline-block',
              ml: { xs: 0, sm: 2 },
              mt: { xs: 1, sm: 0 },
              px: 2,
              py: 0.5,
              backgroundColor: 'info.dark',
              color: 'info.contrastText',
              borderRadius: 1.5,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              📝 VOLUNTEER MODE
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tooltip title="Open InvenTree">
            <IconButton
              color="primary"
              onClick={onOpenInvenTree || (() => window.open(INVENTREE_CONFIG.URL, '_blank'))}
              size="small"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
          {isVolunteerMode && (
            <>
              <Button
                variant="contained"
                color="info"
                onClick={() => setAddCategoryModalOpen(true)}
                size="small"
              >
                Add Category
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => setAddLocationModalOpen(true)}
                size="small"
              >
                Add Location
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => setAddPartFormModalOpen(true)}
                size="small"
              >
                Add New Part
              </Button>
            </>
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
  );
}

export default Header;
