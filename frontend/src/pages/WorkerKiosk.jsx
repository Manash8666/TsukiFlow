import { Box, Typography, Grid, Button, Avatar } from '@mui/material';
import { PlayArrow, Stop, Engineering, Warning, RecordVoiceOver } from '@mui/icons-material';

export default function WorkerKiosk() {
  const handleAction = (action) => {
    // In a real app, this would hit an API endpoint to log the action
    alert(`System Recorded: ${action}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
      {/* Kiosk Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#3b82f6' }}>
            <Engineering sx={{ fontSize: '3rem' }} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="white">Raju - Shift A</Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>Machine: CNC-Lathe-01</Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="primary" sx={{ fontSize: '1.5rem', py: 1.5, px: 4, borderRadius: 2 }}>
          हिंदी / English
        </Button>
      </Box>

      {/* Massive Touch Buttons for 10th-Pass Workers */}
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={6}>
          <Button 
            fullWidth 
            variant="contained" 
            color="success" 
            onClick={() => handleAction('START MACHINE')}
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
            onClick={() => handleAction('STOP MACHINE')}
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
            onClick={() => handleAction('REPORT FAULT')}
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
            onClick={() => handleAction('VOICE ASSIST (YUZU)')}
            sx={{ height: '200px', borderRadius: 4, fontSize: '2.2rem', fontWeight: 'bold', bgcolor: '#6366f1' }}
            startIcon={<RecordVoiceOver sx={{ fontSize: '5rem !important', mr: 2 }} />}
          >
            Voice Assist / मदद
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
