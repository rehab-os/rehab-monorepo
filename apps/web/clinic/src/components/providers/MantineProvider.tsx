'use client'

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { neuroFlowTheme } from '../../theme/mantine.theme';

export function AppMantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={neuroFlowTheme} withGlobalStyles withNormalizeCSS>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}