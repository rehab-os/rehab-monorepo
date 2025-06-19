'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  TextInput,
  Card,
  Badge,
  Stack,
  Modal,
  SimpleGrid,
  Box,
  Checkbox,
  ScrollArea,
  Tabs,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { ThemeIcon, Textarea } from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconLock,
  IconEdit,
  IconTrash,
  IconDots,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { notifications } from '@mantine/notifications';
import ApiManager from '../../../services/data';
import { useForm } from '@mantine/form';
import { formatDate } from '@rehab/shared';
import { motion } from 'framer-motion';

export default function RolesPage() {
  const dispatch = useAppDispatch();
  const { roles, loading } = useAppSelector((state) => state.role);
  const [search, setSearch] = useState('');
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [permissionsModalOpened, setPermissionsModalOpened] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const form = useForm({
    initialValues: {
      name: '',
      display_name: '',
      description: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      display_name: (value) => (!value ? 'Display name is required' : null),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    ApiManager.getRoles();
    const permResponse = await ApiManager.getPermissions();
    if (permResponse.success) {
      setPermissions(permResponse.data);
    }
  };

  const handleCreate = async (values: typeof form.values) => {
    try {
      const response = await ApiManager.createRole(values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Role created successfully',
          color: 'green',
        });
        setCreateModalOpened(false);
        form.reset();
        loadData();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create role',
        color: 'red',
      });
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;

    try {
      const response = await ApiManager.assignPermissions(selectedRole, {
        permission_ids: selectedPermissions,
      });
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Permissions assigned successfully',
          color: 'green',
        });
        setPermissionsModalOpened(false);
        setSelectedPermissions([]);
        loadData();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to assign permissions',
        color: 'red',
      });
    }
  };

  const openPermissionsModal = (roleId: string, currentPermissions: any[]) => {
    setSelectedRole(roleId);
    setSelectedPermissions(currentPermissions.map((p) => p.id));
    setPermissionsModalOpened(true);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.display_name.toLowerCase().includes(search.toLowerCase())
  );

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Container size="xl" className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Roles & Permissions</Title>
              <Text c="dimmed" size="sm">
                Manage user roles and their permissions
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              className="gradient-primary"
            >
              Create Role
            </Button>
          </Group>

          <TextInput
            placeholder="Search roles..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="max-w-md"
          />

          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {filteredRoles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="h-full hover:shadow-lg transition-shadow"
                >
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color={role.is_system_role ? 'orange' : 'violet'}
                      >
                        {role.is_system_role ? (
                          <IconLock size={28} />
                        ) : (
                          <IconShieldCheck size={28} />
                        )}
                      </ThemeIcon>
                    </Group>
                    <Menu shadow="sm" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconShieldCheck size={14} />}
                          onClick={() =>
                            openPermissionsModal(
                              role.id,
                              role.permissions || []
                            )
                          }
                        >
                          Manage Permissions
                        </Menu.Item>
                        {!role.is_system_role && (
                          <>
                            <Menu.Item leftSection={<IconEdit size={14} />}>
                              Edit
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                            >
                              Delete
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <Text size="lg" fw={600} mt="md">
                    {role.display_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {role.name}
                  </Text>

                  {role.description && (
                    <Text size="sm" c="dimmed" mt="xs" lineClamp={2}>
                      {role.description}
                    </Text>
                  )}

                  <Group mt="md" gap="xs">
                    {role.is_system_role && (
                      <Badge color="orange" variant="light">
                        System Role
                      </Badge>
                    )}
                    <Badge variant="light">
                      {role.permissions?.length || 0} permissions
                    </Badge>
                  </Group>

                  <Text size="xs" c="dimmed" mt="md">
                    Created {formatDate(role.created_at)}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Stack>
      </motion.div>

      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create Role"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack>
            <TextInput
              label="Role Name"
              placeholder="e.g., clinic_manager"
              description="Lowercase, no spaces, use underscores"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Display Name"
              placeholder="e.g., Clinic Manager"
              required
              {...form.getInputProps('display_name')}
            />
            <Textarea
              label="Description"
              placeholder="Describe the role's purpose and responsibilities"
              rows={3}
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setCreateModalOpened(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                Create Role
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={permissionsModalOpened}
        onClose={() => setPermissionsModalOpened(false)}
        title="Manage Permissions"
        size="lg"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Select permissions to assign to this role
          </Text>
          <ScrollArea h={400}>
            <Stack gap="lg">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <Box key={resource}>
                  <Text fw={600} tt="capitalize" mb="xs">
                    {resource}
                  </Text>
                  <Stack gap="xs" pl="md">
                    {(perms as any).map((permission:any) => (
                      <Checkbox
                        key={permission.id}
                        label={
                          <Group gap="xs">
                            <Text size="sm">{permission.action}</Text>
                            {permission.description && (
                              <Text size="xs" c="dimmed">
                                - {permission.description}
                              </Text>
                            )}
                          </Group>
                        }
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              permission.id,
                            ]);
                          } else {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (id) => id !== permission.id
                              )
                            );
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={() => setPermissionsModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignPermissions}
              className="gradient-primary"
            >
              Save Permissions
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
