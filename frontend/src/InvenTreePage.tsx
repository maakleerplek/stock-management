import { Box, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { INVENTREE_CONFIG } from './constants';

interface InvenTreePageProps {
  onBack: () => void;
}

function InvenTreePage({ onBack }: InvenTreePageProps) {
  // Use the proxied InvenTree URL (same origin, no certificate issues)
  const inventreeUrl = INVENTREE_CONFIG.URL;

  const handleOpenInNewTab = () => {
    window.open(inventreeUrl, '_blank');
  };

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
        <Box component="span" sx={{ fontWeight: 'bold', flex: 1 }}>
          InvenTree Inventory System
        </Box>
        <Tooltip title="Open in new tab">
          <IconButton onClick={handleOpenInNewTab} color="primary" size="small">
            <OpenInNewIcon />
          </IconButton>
        </Tooltip>
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
