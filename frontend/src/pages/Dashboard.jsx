import { Typography, Box, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Inventory as InventoryIcon, PrecisionManufacturing, WarningAmber, ArrowForward } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mon', prod: 4000, targets: 2400 },
  { name: 'Tue', prod: 3000, targets: 1398 },
  { name: 'Wed', prod: 2000, targets: 9800 },
  { name: 'Thu', prod: 2780, targets: 3908 },
  { name: 'Fri', prod: 1890, targets: 4800 },
  { name: 'Sat', prod: 2390, targets: 3800 },
  { name: 'Sun', prod: 3490, targets: 4300 },
];

const yieldData = [
  { name: 'Week 1', pass: 95, fail: 5 },
  { name: 'Week 2', pass: 92, fail: 8 },
  { name: 'Week 3', pass: 98, fail: 2 },
  { name: 'Week 4', pass: 96, fail: 4 },
]

export default function Dashboard() {
  const metrics = [
    { title: 'Total Production', value: '24,592', change: '+12.5%', isUp: true, icon: <PrecisionManufacturing />, color: 'primary.main' },
    { title: 'Active Orders', value: '142', change: '+4.2%', isUp: true, icon: <InventoryIcon />, color: 'success.main' },
    { title: 'Quality Issues', value: '18', change: '-2.4%', isUp: false, icon: <WarningAmber />, color: 'warning.main' },
    { title: 'OEE Score', value: '87.4%', change: '+1.2%', isUp: true, icon: <TrendingUp />, color: 'secondary.main' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" gutterBottom>
          Welcome back, Alex! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          Here's what's happening on the factory floor today.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="hover-lift" sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${item.color}33 0%, transparent 70%)` }} />
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${item.color}22`, color: item.color }}>
                    {item.icon}
                  </Box>
                  <Chip 
                    label={item.change} 
                    size="small" 
                    sx={{ 
                      bgcolor: item.isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      color: item.isUp ? '#10b981' : '#f43f5e',
                      fontWeight: 'bold',
                      borderRadius: 2
                    }} 
                    icon={item.isUp ? <TrendingUp fontSize="small" color="inherit"/> : <TrendingDown fontSize="small" color="inherit"/>} 
                  />
                </Box>
                <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="h4" fontWeight="800">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="hover-lift" sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="bold">Production Volume</Typography>
              <Button size="small" endIcon={<ArrowForward />}>View Report</Button>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }} />
                  <Area type="monotone" dataKey="prod" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorProd)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="hover-lift" sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="bold">Quality Yield</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={30}>
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} />
                  <Bar dataKey="pass" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="fail" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
