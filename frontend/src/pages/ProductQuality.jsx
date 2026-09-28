import { Typography, Box, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material';
import { Build, AssignmentTurnedIn, CheckCircleOutline, CancelOutlined } from '@mui/icons-material';
import { useGetTasksQuery } from '../store/apiSlice';

export default function ProductQuality() {
  const { data: tasks, isLoading, error } = useGetTasksQuery();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Product Quality</Typography>
          <Typography variant="body1" color="text.secondary">Live tasks and inspection data from DB.</Typography>
        </Box>
        <Button variant="contained" color="primary" size="large" startIcon={<Build />}>Log New Inspection</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card className="hover-lift" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleOutline color="success" fontSize="large" />
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

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)' }}>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Process ID</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={4} align="center" color="error">Error loading data</TableCell></TableRow>
            ) : tasks && tasks.length === 0 ? (
               <TableRow><TableCell colSpan={4} align="center">No quality tasks found.</TableCell></TableRow>
            ) : (
              tasks.map((row) => (
                <TableRow key={row.id} className="hover-lift" sx={{ transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell fontWeight={600}>{row.id}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.process_id}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small"
                      color={row.status === 'Passed' ? 'success' : row.status === 'Failed' ? 'error' : 'warning'} 
                      variant="filled"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
