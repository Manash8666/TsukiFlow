import { Typography, Box, Card, CardContent, Grid, Button, CircularProgress, Chip } from '@mui/material';
import { Memory as MemoryIcon, Thermostat, Build } from '@mui/icons-material';
import { useGetMachinesQuery } from '../store/apiSlice';
import { useState } from 'react';

export default function EquipmentHealth() {
  const { data: machines, isLoading } = useGetMachinesQuery();
  const [analyzing, setAnalyzing] = useState(null);

  const simulateYuzuAnalysis = (id) => {
    setAnalyzing(id);
    setTimeout(() => {
      setAnalyzing(null);
      alert("YUZU Insight: Vibration anomalies detected. Bearings likely to fail in ~72 hours. Schedule immediate maintenance during off-peak hours.");
    }, 2000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>IoT Equipment Health</Typography>
          <Typography variant="body1" color="text.secondary">Real-time predictive maintenance monitoring powered by YUZU.</Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<MemoryIcon />}>Sync Sensors</Button>
      </Box>

      {isLoading && <CircularProgress />}

      <Grid container spacing={3}>
        {machines && machines.map((machine) => (
          <Grid item xs={12} md={6} lg={4} key={machine.id}>
            <Card className="hover-lift" sx={{ border: '1px solid rgba(255,255,255,0.05)', bgcolor: machine.status === 'Warning' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(30, 41, 59, 0.8)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">{machine.name}</Typography>
                  <Chip 
                    label={machine.status} 
                    color={machine.status === 'Operational' ? 'success' : machine.status === 'Warning' ? 'warning' : 'error'} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{machine.machine_type}</Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                        <Thermostat fontSize="small" /> <Typography variant="caption">Temp</Typography>
                      </Box>
                      <Typography variant="h6" color={machine.temperature > 80 ? 'error.main' : 'text.primary'}>
                        {machine.temperature}°C
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                        <MemoryIcon fontSize="small" /> <Typography variant="caption">Vibration</Typography>
                      </Box>
                      <Typography variant="h6" color={machine.vibration > 3.0 ? 'error.main' : 'text.primary'}>
                        {machine.vibration} mm/s
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button 
                  fullWidth 
                  variant="outlined" 
                  color={machine.status === 'Warning' ? 'warning' : 'primary'}
                  startIcon={analyzing === machine.id ? <CircularProgress size={20} /> : <Build />}
                  onClick={() => simulateYuzuAnalysis(machine.id)}
                  disabled={analyzing === machine.id}
                >
                  {analyzing === machine.id ? 'YUZU is Analyzing...' : 'Run Diagnostics'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
