import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Medical green
      dark: '#1B5E20',
      light: '#4CAF50',
      contrastText: '#FFFFFF', 
    },
    secondary: {
      main: '#000000', // Black for buttons
      dark: '#333333',
      light: '#666666',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA', // Light grey-blue for dashboard background
      paper: '#FFFFFF', 
    },
    text: {
      primary: '#1F2937', 
      secondary: '#6B7280',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Rubik", "Helvetica", "Arial", sans-serif',
    fontSize: 13, // Smaller base font size
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-1.5px', color: '#0A192F' },
    h2: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.5px', color: '#0A192F' },
    h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.25px', color: '#0A192F' },
    h4: { fontSize: '1.25rem', fontWeight: 600, color: '#0A192F' },
    h5: { fontSize: '1.1rem', fontWeight: 500, color: '#0A192F' },
    h6: { fontSize: '0.95rem', fontWeight: 500, color: '#0A192F' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.5px',
      fontSize: '0.85rem', // Smaller buttons
    },
  },
  shape: {
    borderRadius: 8, // More minimalistic and tighter border radius
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small', // Use small variants everywhere for inputs
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: '24px', // Highly rounded buttons as in the login image
          padding: '8px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            background: '#000000',
            color: '#FFFFFF',
            '&:hover': {
              background: '#333333',
            },
          },
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 4px 16px 0 rgba(10, 25, 47, 0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px 0 rgba(10, 25, 47, 0.1)',
          },
        },
      },
    },
  },
});

export default theme;
