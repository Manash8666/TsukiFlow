import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    secondary: { main: '#ec4899', light: '#f472b6', dark: '#db2777' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    info: { main: '#0ea5e9' },
    error: { main: '#ef4444' },
    background: {
      default: 'transparent', 
      paper: 'rgba(30, 41, 59, 0.7)', 
    },
    text: { primary: '#f8fafc', secondary: '#94a3b8' }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)', transform: 'translateY(-1px)' }
        },
        containedSecondary: {
          '&:hover': { boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)' }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
        head: { fontWeight: 600, backgroundColor: 'rgba(15, 23, 42, 0.5)' }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 }
      }
    }
  },
});

export default theme;
