import { Typography, Box, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material';
import { Build, AssignmentTurnedIn, CheckCircleOutlined, CancelOutlined } from '@mui/icons-material';
import { useGetTasksQuery, useAddTaskMutation, useGetGRNsQuery, useUpdateGRNStatusMutation } from '../store/apiSlice';
import TaskForm from '../components/forms/TaskForm';
import { useState } from 'react';

export default function ProductQuality() {
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: grns = [] } = useGetGRNsQuery();
  const [addTask] = useAddTaskMutation();
  const [updateGRNStatus] = useUpdateGRNStatusMutation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleUpdateGRN = async (id, status) => {
    try {
      await updateGRNStatus({ grn_id: id, status }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Product Quality</Typography>
          <Typography variant="body1" color="text.secondary">Live tasks and inspection data from DB.</Typography>
        </Box>
        <Button variant="contained" color="primary" size="large" startIcon={<Build />} onClick={() => setIsFormOpen(true)}>
          Log New Inspection
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card className="hover-lift" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleOutlined color="success" fontSize="large" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">94.2%</Typography>
                  <Typography variant="body2" color="text.secondary">Overall Pass Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="hover-lift" sx={{ bgcolor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CancelOutlined color="error" fontSize="large" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">5.8%</Typography>
                  <Typography variant="body2" color="text.secondary">Defect Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="hover-lift" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentTurnedIn color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">{tasks ? tasks.length : 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Inspections Logged</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt: 4 }}>Incoming Quality Control (IQC) - GRN Quarantine</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)' }}>
            <TableRow>
              <TableCell>GRN ID</TableCell>
              <TableCell>PO ID</TableCell>
              <TableCell>Received Qty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grnLoading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : grns && grns.filter(g => g.status === 'QUARANTINE').length === 0 ? (
               <TableRow><TableCell colSpan={5} align="center">No GRNs in quarantine.</TableCell></TableRow>
            ) : (
              grns?.filter(g => g.status === 'QUARANTINE').map((row) => (
                <TableRow key={row.id} className="hover-lift" sx={{ transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell fontWeight={600}>GRN-{row.id}</TableCell>
                  <TableCell>PO-{row.po_id}</TableCell>
                  <TableCell>{row.received_quantity}</TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" color="warning" variant="filled" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" color="success" variant="outlined" sx={{ mr: 1 }} onClick={() => handleUpdateGRN(row.id, 'APPROVED')}>Approve</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => handleUpdateGRN(row.id, 'REJECTED')}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TaskForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={async (data) => {
          await addTask(data);
          setIsFormOpen(false);
        }}
      />
    </Box>
  );
}
