import logo from './assets/HTL.png';
import { Typography, CardMedia, Box } from '@mui/material';

function Logo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
      <Box
        component="a"
        href="https://maakleerplek.be/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="maakleerplek website"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}
      >
        <CardMedia
          component="img"
          image={logo}
          alt="maakleerplek logo"
          sx={{ height: 60, width: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid', borderColor: 'divider', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 0 4px var(--mui-palette-primary-main)' } }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">Inventree Assistant</Typography>
        <Typography variant="body2" color="text.secondary">by Maakleerplek</Typography>
      </Box>
    </Box>
  );
}

export default Logo;