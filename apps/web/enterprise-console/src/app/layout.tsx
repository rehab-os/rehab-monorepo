import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { Providers } from '../components/providers';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import './global.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RehabOS - Enterprise Console',
  description: 'Physiotherapy Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <Providers>
          <MantineProvider
            theme={{
              primaryColor: 'violet',
              colors: {
                violet: [
                  '#f3f0ff',
                  '#e5dbff',
                  '#d0bfff',
                  '#b197fc',
                  '#9775fa',
                  '#845ef7',
                  '#7950f2',
                  '#7048e8',
                  '#6741d9',
                  '#5f3dc4',
                ],
              },
              fontFamily: 'Inter, sans-serif',
              defaultRadius: 'md',
              components: {
                Button: {
                  defaultProps: {
                    size: 'md',
                  },
                },
                TextInput: {
                  defaultProps: {
                    size: 'md',
                  },
                },
              },
            }}
          >
            <Notifications position="top-right" />
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
