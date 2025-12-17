import { Box, Grid, Button, IconButton, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Logo from './logo';
import LightOrDarkButton from './LightOrDarkButton';
import { useVolunteer } from './VolunteerContext'; // Assuming VolunteerContext is needed here

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  setVolunteerModalOpen: (open: boolean) => void;
  setAddPartFormModalOpen: (open: boolean) => void;
  onOpenInvenTree?: () => void;
}

function Header({ theme, toggleTheme, setVolunteerModalOpen, setAddPartFormModalOpen, onOpenInvenTree }: HeaderProps) {
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
              borderRadius: 1.5,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              📝 VOLUNTEER MODE
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Open InvenTree">
            <IconButton
              color="primary"
              onClick={onOpenInvenTree || (() => window.open('https://10.72.3.141.sslip.io', '_blank'))}
              size="small"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
          {isVolunteerMode && (
            <Button
              variant="contained"
              color="info"
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
  );
}

export default Header;
