import { Box, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { INVENTREE_CONFIG } from './constants';

interface InvenTreePageProps {
  onBack: () => void;
}

function InvenTreePage({ onBack }: InvenTreePageProps) {
  // Use the configured InvenTree URL (relative path proxied by Caddy)
  const inventreeUrl = INVENTREE_CONFIG.URL;

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 1, 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Tooltip title="Back to Stock Management">
          <IconButton onClick={onBack} color="primary">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box component="span" sx={{ fontWeight: 'bold' }}>
          InvenTree Inventory System
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <iframe
          src={inventreeUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="InvenTree Inventory System"
        />
      </Box>
    </Box>
  );
}

export default InvenTreePage;
