import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { GitHub, Info } from '@mui/icons-material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
        py: 4,
        marginTop: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
            mb: 3,
          }}
        >
          {/* Product Info */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Stock Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Inventory management system with barcode scanning and checkout functionality.
            </Typography>
          </Box>

          {/* Version & Info */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              System Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Version:</strong> 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Status:</strong> Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Built with:</strong> React + MUI
              </Typography>
            </Box>
          </Box>

          {/* Resources */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ fontSize: '1.2rem' }} />
                <Link
                  href="https://docs.inventree.org/en/stable/"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  Documentation
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Link
                  href="https://forms.office.com/Pages/ResponsePage.aspx?id=na_P3-cbHE-C0Dt1rSax0GOEml8Fu2tKkljOunyJSCNUMUk1SkM4UUIxRExGNVRRNlhZVzU1UkVQSS4u"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  Give feedback
                </Link>
              </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GitHub sx={{ fontSize: '1.2rem' }} />
                <Link
                  href="https://github.com/maakleerplek/stock-management"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  GitHub
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Stock Management System. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Powered by Maakleerplek VZW
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
