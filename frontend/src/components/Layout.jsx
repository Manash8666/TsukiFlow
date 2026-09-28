import { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Badge, Chip } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Assignment as AssignmentIcon, Inventory as InventoryIcon, HighQuality as QualityIcon, Assessment as ReportIcon, Notifications as NotificationsIcon, PrecisionManufacturing as LogoIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Production Plan', icon: <AssignmentIcon />, path: '/production-plan' },
  { text: 'Inventory Levels', icon: <InventoryIcon />, path: '/inventory-levels' },
  { text: 'Product Quality', icon: <QualityIcon />, path: '/product-quality' },
  { text: 'Reports & Analytics', icon: <ReportIcon />, path: '/reports' },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 1.5, px: 3 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)' }}>
          <LogoIcon sx={{ color: '#fff' }} />
        </Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: 800, letterSpacing: 1, color: '#f8fafc' }}>
          TsukiFlow
        </Typography>
      </Toolbar>
      
      <List sx={{ px: 2, flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#f8fafc',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.95rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 3 }}>
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Plant Capacity</Typography>
          <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>84% Used</Typography>
          <Chip label="Optimal" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold' }} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'TsukiFlow'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: 'text.secondary', '&:hover': { color: '#f8fafc' } }}>
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 0.5, borderRadius: 8, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <Avatar src="https://i.pravatar.cc/150?img=11" sx={{ width: 38, height: 38, border: '2px solid #3b82f6' }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} color="text.primary">Alex Manager</Typography>
                <Typography variant="caption" color="text.secondary">Production Head</Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)' } }}>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` }, pt: { xs: 10, md: 12 } }}>
        {children}
      </Box>
    </Box>
  );
}
