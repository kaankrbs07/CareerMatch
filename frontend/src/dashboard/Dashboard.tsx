import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Outlet } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

const xThemeComponents = {

};

import { ChatProvider } from '../context/ChatContext';

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <ChatProvider>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          {/* Main content */}
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              background: theme.vars
                ? theme.vars.palette.background.default
                : theme.palette.background.default,
              overflow: 'auto',
              minHeight: '100vh',
            })}
          >
            <Header />
            <Stack
              spacing={3}
              sx={{
                alignItems: 'stretch', // Changed to stretch to ensure full width
                mx: 'auto',
                width: '100%',
                maxWidth: '100%', // Expanded to full width as requested
                px: { xs: 2, sm: 3, md: 4 },
                pb: 6,
                pt: { xs: 10, md: 10 },
              }}
            >
              <Outlet />
            </Stack>
          </Box>
        </Box>
      </ChatProvider>
    </AppTheme>
  );
}

