import { useState } from 'react';
import { Typography, Box, Card, CardContent, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material';
import { Add as AddIcon, AutoAwesome as SparklesIcon } from '@mui/icons-material';
import { useGetPlansQuery, useAddPlanMutation } from '../store/apiSlice';
import PlanForm from '../components/forms/PlanForm';

export default function ProductionPlan() {
  const { data: plans, isLoading, error } = useGetPlansQuery();
  const [addPlan] = useAddPlanMutation();
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getAiInsight = async () => {
    setInsightLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: "Analyzing current production plans for optimization." })
      });
      const data = await response.json();
      setAiInsight(data.insight);
    } catch (error) {
      setAiInsight("Failed to load insights. Make sure the backend is running.");
    }
    setInsightLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Production Plans
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} color="primary" size="large" onClick={() => setIsFormOpen(true)}>
          New Plan
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                <SparklesIcon />
                <Typography variant="h6" fontWeight={600}>AI Optimization Insights</Typography>
              </Box>
              {aiInsight ? (
                <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {aiInsight}
                </Typography>
              ) : (
                <Button variant="outlined" onClick={getAiInsight} disabled={insightLoading}>
                  {insightLoading ? 'Analyzing...' : 'Generate Insights for Schedule'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.paper' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Plan ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name (ID)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'error.main' }}>Failed to load plans</TableCell>
              </TableRow>
            ) : plans && plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No production plans found.</TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{plan.id}</TableCell>
                  <TableCell>{plan.name} (PID: {plan.product_id})</TableCell>
                  <TableCell>{plan.quantity}</TableCell>
                  <TableCell>{plan.start_date}</TableCell>
                  <TableCell>{plan.end_date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={plan.status} 
                      size="small"
                      color={plan.status === 'In Progress' ? 'primary' : 'default'} 
                      variant={plan.status === 'In Progress' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PlanForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={async (data) => {
          await addPlan(data);
          setIsFormOpen(false);
        }}
      />
    </Box>
  );
}
