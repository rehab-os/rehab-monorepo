'use client';

import {
  AppShell,
  Burger,
  Group,
  Avatar,
  Text,
  Menu,
  UnstyledButton,
  Box,
  useMantineColorScheme,
  ActionIcon,
  Badge,
  Indicator,
} from '@mantine/core';
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconMoon,
  IconSun,
  IconBell,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/auth.slice';
import { getInitials } from '@rehab/shared';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <AppShell.Header className="border-b border-gray-200 dark:border-gray-700">
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Box className="gradient-primary px-3 py-1 rounded-lg">
            <Text fw={700} c="white" size="lg">
              RehabOS
            </Text>
          </Box>
        </Group>

        <Group>
          <ActionIcon
            variant="light"
            onClick={() => toggleColorScheme()}
            size="lg"
            radius="md"
          >
            {colorScheme === 'dark' ? (
              <IconSun size={20} />
            ) : (
              <IconMoon size={20} />
            )}
          </ActionIcon>

          <Indicator inline label={3} size={16}>
            <ActionIcon variant="light" size="lg" radius="md">
              <IconBell size={20} />
            </ActionIcon>
          </Indicator>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar color="violet" radius="xl">
                    {user ? getInitials(user.full_name) : ''}
                  </Avatar>
                  <Box>
                    <Text size="sm" fw={500}>
                      {user?.full_name}
                    </Text>
                    <Badge size="xs" variant="light">
                      Owner
                    </Badge>
                  </Box>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<IconUser size={16} />}>
                Profile
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={16} />}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
