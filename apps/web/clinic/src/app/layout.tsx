import './global.css';
import { ReduxProvider } from '../components/providers/ReduxProvider';
import { AppMantineProvider } from '../components/providers/MantineProvider';
import { AuthProvider } from '../components/providers/AuthProvider';

export const metadata = {
  title: 'RehabOS Clinic',
  description: 'Clinical Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthProvider>
            <AppMantineProvider>
              {children}
            </AppMantineProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
