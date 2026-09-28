import { Typography, Box, Card, CardContent, Grid, Button } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Widget A', value: 400 },
  { name: 'Gadget B', value: 300 },
  { name: 'Component C', value: 300 },
  { name: 'Assembly D', value: 200 },
];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function ReportsAnalytics() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Reports & Analytics</Typography>
          <Typography variant="body1" color="text.secondary">Export detailed analytics and review historical data.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary" startIcon={<DownloadIcon />}>Export CSV</Button>
          <Button variant="contained" color="secondary" startIcon={<PdfIcon />}>Generate PDF</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className="hover-lift" sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Production Distribution</Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
               <Card className="hover-lift" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">Quarterly Production Report</Typography>
                    <Typography variant="body2" color="text.secondary">Auto-generated summary for Q3 2026</Typography>
                  </Box>
                  <Button variant="contained">View</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
               <Card className="hover-lift" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">Yield Optimization Analysis</Typography>
                    <Typography variant="body2" color="text.secondary">AI generated insight report</Typography>
                  </Box>
                  <Button variant="contained" color="success">View</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
               <Card className="hover-lift" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">Supply Chain Forecast</Typography>
                    <Typography variant="body2" color="text.secondary">Predictive modeling for next 30 days</Typography>
                  </Box>
                  <Button variant="contained" color="warning">View</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
