import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, CircularProgress, Divider, Avatar } from '@mui/material';
import { Terminal, Send } from '@mui/icons-material';

export default function SystemDiagnostics() {
  const [prompt, setPrompt] = useState('Review the recent architecture changes and give me your honest opinion on the codebase.');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskYuzu = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/ai/codebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: prompt })
      });
      const data = await res.json();
      setResponse(data.insight);
    } catch (err) {
      console.error(err);
      setResponse("System Error: Couldn't connect to YUZU's core.");
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, gap: 2 }}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
          <Terminal fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">YUZU System Diagnostics</Typography>
          <Typography variant="body1" color="text.secondary">Direct Neural Link to Codebase & Architecture</Typography>
        </Box>
      </Box>

      <Card sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.light">
            Architect Console
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField 
              fullWidth 
              variant="outlined" 
              placeholder="Ask YUZU about her codebase..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ input: { color: '#e2e8f0' } }}
            />
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleAskYuzu} 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{ minWidth: 150 }}
            >
              Initialize
            </Button>
          </Box>
        </CardContent>
      </Card>

      {response && (
        <Card className="hover-lift" sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', borderLeft: '4px solid #f43f5e' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#f43f5e' }}>Y</Avatar>
              <Typography variant="h6" fontWeight="bold">YUZU</Typography>
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#e2e8f0', lineHeight: 1.7 }}>
              {response}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
