import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A', // Navy Blue
      dark: '#172554',
      light: '#3B82F6',
      contrastText: '#FFFFFF', 
    },
    secondary: {
      main: '#3B82F6', // Fluid Blue
      dark: '#2563EB',
      light: '#60A5FA',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F0F8FF', // Alice Blue, watery soft background
      paper: 'rgba(255, 255, 255, 0.7)', // Glassy translucent paper
    },
    text: {
      primary: '#0A192F', // Deep oceanic blue for text
      secondary: '#475569',
    },
    divider: 'rgba(30, 58, 138, 0.2)', // Soft navy divider
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
          borderRadius: '8px',
          padding: '6px 16px',
          boxShadow: '0 2px 8px 0 rgba(30, 58, 138, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
            color: '#FFFFFF',
            '&:hover': {
              background: 'linear-gradient(135deg, #172554 0%, #2563EB 100%)',
            },
          },
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 16px 0 rgba(10, 25, 47, 0.05)',
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
