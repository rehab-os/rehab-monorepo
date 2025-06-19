// components/RolePermissionManagement.jsx
'use client';

import React, { useState } from 'react';
import {
  Stack,
  Group,
  Title,
  Button,
  Grid,
  Card,
  Badge,
  Text,
  Modal,
  TextInput,
  Select,
  MultiSelect,
  ScrollArea,
  UnstyledButton,
  Center,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

import { IconPlus, IconCheck, IconShield } from '@tabler/icons-react';
import { NotificationContext } from '../app/layout'; // Adjust import path
import { mockData } from '../services/data'; // Adjust import path

export function RolePermissionManagement() {
  const { showNotification } = React.useContext(NotificationContext);
  const [roles, setRoles] = useState(mockData.roles);
  const [permissions] = useState(mockData.permissions);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalOpened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      display_name: '',
      description: '',
      permissions: [],
    },
  });

  const permissionsByResource = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const handleSubmit = (values) => {
    setRoles([
      ...roles,
      {
        id: Date.now().toString(),
        ...values,
        is_system_role: false,
      },
    ]);
    showNotification({
      title: 'Success',
      message: 'Role created successfully',
      color: 'teal',
      icon: <IconCheck />,
    });
    close();
    form.reset();
  };

  return (
    <>
      <Stack spacing="lg">
        <Group position="apart">
          <Title order={3}>Roles & Permissions</Title>
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={open}
            gradient={{ from: 'teal', to: 'lime' }}
            variant="gradient"
          >
            Create Role
          </Button>
        </Group>

        <Grid>
          <Grid.Col xs={12} md={6}>
            <Card shadow="sm" radius="md" p="lg" withBorder>
              <Title order={5} mb="md">
                Roles
              </Title>
              <Stack spacing="sm">
                {roles.map((role) => (
                  <UnstyledButton
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #DEE2E6',
                      background:
                        selectedRole?.id === role.id ? '#E6FCF5' : 'white',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Group position="apart">
                      <div>
                        <Text weight={600}>{role.display_name}</Text>
                        <Text size="sm" color="dimmed">
                          {role.description}
                        </Text>
                      </div>
                      <Badge
                        variant="light"
                        color={role.is_system_role ? 'blue' : 'gray'}
                      >
                        {role.is_system_role ? 'System' : 'Custom'}
                      </Badge>
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col xs={12} md={6}>
            {selectedRole ? (
              <Card shadow="sm" radius="md" p="lg" withBorder>
                <Title order={5} mb="md">
                  Permissions for {selectedRole.display_name}
                </Title>
                <ScrollArea h={400}>
                  <Stack spacing="md">
                    {Object.entries(permissionsByResource).map(
                      ([resource, perms]) => (
                        <div key={resource}>
                          <Text
                            weight={600}
                            size="sm"
                            mb="xs"
                            transform="capitalize"
                          >
                            {resource}
                          </Text>
                          <Stack spacing="xs" pl="md">
                            {perms.map((perm) => (
                              <Group key={perm.id} spacing="xs">
                                <IconCheck
                                  size={16}
                                  color={
                                    selectedRole.permissions.includes(perm.name)
                                      ? '#12B886'
                                      : '#DEE2E6'
                                  }
                                />
                                <Text
                                  size="sm"
                                  color={
                                    selectedRole.permissions.includes(perm.name)
                                      ? 'black'
                                      : 'dimmed'
                                  }
                                >
                                  {perm.action}
                                </Text>
                              </Group>
                            ))}
                          </Stack>
                        </div>
                      )
                    )}
                  </Stack>
                </ScrollArea>
              </Card>
            ) : (
              <Card shadow="sm" radius="md" p="lg" withBorder>
                <Center h={400}>
                  <Stack align="center" spacing="xs">
                    <IconShield size={48} color="#ADB5BD" />
                    <Text color="dimmed" size="sm">
                      Select a role to view permissions
                    </Text>
                  </Stack>
                </Center>
              </Card>
            )}
          </Grid.Col>
        </Grid>
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={close}
        title="Create New Role"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Role Name (internal)"
              placeholder="e.g., clinic_manager"
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
              placeholder="Brief description of this role's responsibilities"
              {...form.getInputProps('description')}
            />
            <MultiSelect
              label="Permissions"
              placeholder="Select permissions for this role"
              data={permissions.map((p) => ({ value: p.name, label: p.name }))}
              searchable
              clearable
              {...form.getInputProps('permissions')}
            />
            <Group position="right" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                gradient={{ from: 'teal', to: 'lime' }}
                variant="gradient"
              >
                Create Role
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
