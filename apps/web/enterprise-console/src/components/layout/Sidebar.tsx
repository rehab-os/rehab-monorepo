'use client';

import { AppShell, NavLink, Stack, Text, Box } from '@mantine/core';
import {
  IconDashboard,
  IconBuildingHospital,
  IconStethoscope,
  IconUsers,
  IconShieldCheck,
  IconSettings,
  IconChartBar,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: IconDashboard, href: '/dashboard' },
  {
    label: 'Organizations',
    icon: IconBuildingHospital,
    href: '/organizations',
  },
  { label: 'Clinics', icon: IconStethoscope, href: '/clinics' },
  { label: 'Users', icon: IconUsers, href: '/users' },
  { label: 'Roles & Permissions', icon: IconShieldCheck, href: '/roles' },
  { label: 'Reports', icon: IconChartBar, href: '/reports' },
  { label: 'Settings', icon: IconSettings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppShell.Navbar p="md" className="bg-white dark:bg-gray-800">
      <Stack gap="xs">
        <Box mb="md">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Main Menu
          </Text>
        </Box>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            label={item.label}
            leftSection={<item.icon size={20} />}
            active={pathname === item.href}
            onClick={() => router.push(item.href)}
            variant="filled"
            className="rounded-lg"
          />
        ))}
      </Stack>
    </AppShell.Navbar>
  );
}
