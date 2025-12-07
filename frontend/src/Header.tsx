import { Box, Grid, Button } from '@mui/material';
import Logo from './logo';
import LightOrDarkButton from './LightOrDarkButton';
import { useVolunteer } from './VolunteerContext'; // Assuming VolunteerContext is needed here

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  setVolunteerModalOpen: (open: boolean) => void;
  setAddPartFormModalOpen: (open: boolean) => void;
}

function Header({ theme, toggleTheme, setVolunteerModalOpen, setAddPartFormModalOpen }: HeaderProps) {
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
  );
}

export default Header;
