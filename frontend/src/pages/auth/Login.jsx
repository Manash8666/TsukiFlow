import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { PrecisionManufacturing as LogoIcon } from '@mui/icons-material';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
      });
      
      if (!response.ok) throw new Error('Invalid credentials');
      
      const data = await response.json();
      dispatch(setCredentials({ user: data.user, token: data.access_token }));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
      <Card sx={{ maxWidth: 420, width: '100%', p: 2, bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <LogoIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Sign in to TsukiFlow
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField 
              fullWidth margin="normal" label="Username" variant="outlined" 
              onChange={e => setFormData(p => ({...p, username: e.target.value}))} 
            />
            <TextField 
              fullWidth margin="normal" label="Password" type="password" variant="outlined"
              onChange={e => setFormData(p => ({...p, password: e.target.value}))} 
            />
            <Button fullWidth type="submit" variant="contained" color="primary" size="large" sx={{ mt: 4, py: 1.5 }}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
