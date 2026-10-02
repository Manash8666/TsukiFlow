import { Box, Typography, Grid, Button, Avatar, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { PlayArrow, Stop, Engineering, Warning, RecordVoiceOver } from '@mui/icons-material';
import { useState } from 'react';
import { useLogDowntimeMutation, useGetMachinesQuery } from '../store/apiSlice';

export default function WorkerKiosk() {
  const { data: machines = [] } = useGetMachinesQuery();
  const [logDowntime, { isLoading }] = useLogDowntimeMutation();
  const [downtimeModalOpen, setDowntimeModalOpen] = useState(false);
  const [machineStatus, setMachineStatus] = useState('RUNNING'); // RUNNING or STOPPED

  const machineId = 1;
  const currentMachine = machines.find(m => m.id === machineId);
  const temp = currentMachine ? currentMachine.temperature : 60;
  const hours = currentMachine ? currentMachine.operating_hours : 100;
  
  // Calculate mock dynamic OEE (for demo) based on hours and status
  const availability = machineStatus === 'RUNNING' ? 95 : 60;
  const performance = Math.max(50, 100 - (temp - 60)); 
  const quality = 98; // hardcoded for kiosk demo
  const oee = Math.round((availability * performance * quality) / 10000);

  const downtimeReasons = [
    { code: 'SETUP', label: 'Setup / Changeover (बदलाव)' },
    { code: 'NO_MATERIAL', label: 'Material Shortage (सामग्री की कमी)' },
    { code: 'FAULT', label: 'Machine Fault (मशीन में खराबी)' },
    { code: 'NO_OPERATOR', label: 'Operator Unavailable (ऑपरेटर अनुपलब्ध)' },
  ];

  const handleStart = () => {
    setMachineStatus('RUNNING');
    alert('Machine Started successfully.');
  };

  const handleStopClick = () => {
    setDowntimeModalOpen(true);
  };

  const handleSelectReason = async (reasonCode) => {
    try {
      await logDowntime({
        machine_id: 1, // hardcoded for CNC-Lathe-01
        reason: reasonCode,
        duration_minutes: 0, // start of downtime
        timestamp: new Date().toISOString()
      }).unwrap();
      
      setMachineStatus('STOPPED');
      setDowntimeModalOpen(false);
      alert(`Downtime logged: ${reasonCode}`);
    } catch (err) {
      console.error(err);
      alert('Failed to log downtime');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
      {/* Kiosk Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <Engineering sx={{ fontSize: '3rem' }} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="white">Raju - Shift A</Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>Machine: CNC-Lathe-01 | Status: {machineStatus}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">Current OEE / प्रदर्शन</Typography>
            <Typography variant="h4" color={oee > 85 ? "success.main" : "warning.main"} fontWeight="bold">
              {oee}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              A:{availability}% | P:{performance}% | Q:{quality}%
            </Typography>
          </Box>
          <Button variant="outlined" color="primary" sx={{ fontSize: '1.5rem', py: 1.5, px: 4, borderRadius: 2 }}>
            हिंदी / English
          </Button>
        </Box>
      </Box>

      {/* Massive Touch Buttons for 10th-Pass Workers */}
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={6}>
          <Button 
            fullWidth 
            variant="contained" 
            color="success" 
            onClick={handleStart}
            disabled={machineStatus === 'RUNNING'}
            sx={{ height: '100%', minHeight: '300px', borderRadius: 4, fontSize: '3.5rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}
          >
            <PlayArrow sx={{ fontSize: '8rem' }} />
            START / शुरू
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button 
            fullWidth 
            variant="contained" 
            color="error" 
            onClick={handleStopClick}
            disabled={machineStatus === 'STOPPED'}
            sx={{ height: '100%', minHeight: '300px', borderRadius: 4, fontSize: '3.5rem', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }}
          >
            <Stop sx={{ fontSize: '8rem' }} />
            STOP / रोकें
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button 
            fullWidth 
            variant="contained" 
            color="warning" 
            onClick={handleStopClick}
            sx={{ height: '200px', borderRadius: 4, fontSize: '2.2rem', fontWeight: 'bold' }}
            startIcon={<Warning sx={{ fontSize: '5rem !important', mr: 2 }} />}
          >
            Machine Fault / खराबी
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button 
            fullWidth 
            variant="contained" 
            color="info" 
            onClick={() => alert('Yuzu Voice Assist triggered')}
            sx={{ height: '200px', borderRadius: 4, fontSize: '2.2rem', fontWeight: 'bold', bgcolor: 'secondary.main' }}
            startIcon={<RecordVoiceOver sx={{ fontSize: '5rem !important', mr: 2 }} />}
          >
            Voice Assist / मदद
          </Button>
        </Grid>
      </Grid>

      {/* Downtime Reason Modal */}
      <Dialog open={downtimeModalOpen} onClose={() => setDowntimeModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontSize: '2rem', textAlign: 'center', py: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Why is the machine stopping?
          <Typography variant="h6" color="text.secondary">मशीन क्यों रुक रही है?</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
          {!isLoading && (
            <List sx={{ pt: 0 }}>
              {downtimeReasons.map((reason) => (
                <ListItem disablePadding key={reason.code} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <ListItemButton onClick={() => handleSelectReason(reason.code)} sx={{ py: 3, textAlign: 'center' }}>
                    <ListItemText primary={reason.label} primaryTypographyProps={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'error.main' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
