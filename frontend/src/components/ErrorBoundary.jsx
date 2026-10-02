import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>Something went wrong.</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {this.state.error?.message || "An unexpected error occurred in this module."}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Application
          </Button>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
