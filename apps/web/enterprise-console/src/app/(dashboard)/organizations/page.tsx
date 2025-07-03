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
  Table,
  Badge,
  ActionIcon,
  Menu,
  Stack,
  Avatar,
  Modal,
  Select,
  Textarea,
  Grid,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconBuildingHospital,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import ApiManager from '../../../services/data';
import { useForm } from '@mantine/form';
import { formatDate, getInitials } from '@rehab/shared';
import { motion } from 'framer-motion';

export default function OrganizationsPage() {
  const dispatch = useAppDispatch();
  const { organizations, loading } = useAppSelector(
    (state) => state.organization
  );
  const [search, setSearch] = useState('');
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      registration_no: '',
      gst_no: '',
      pan_no: '',
      admin_phone: '',
      admin_name: '',
      admin_email: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      admin_phone: (value) => (!value ? 'Admin phone is required' : null),
      admin_name: (value) => (!value ? 'Admin name is required' : null),
    },
  });

  useEffect(() => {
    ApiManager.getOrganizations();
  }, []);

  const handleCreate = async (values: typeof form.values) => {
    try {
      const response = await ApiManager.createOrganization(values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Organization created successfully',
          color: 'green',
        });
        setCreateModalOpened(false);
        form.reset();
        ApiManager.getOrganizations();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create organization',
        color: 'red',
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    modals.openConfirmModal({
      title: 'Delete Organization',
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{name}</strong>? This action
          cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await ApiManager.deleteOrganization(id);
          if (response.success) {
            notifications.show({
              title: 'Success',
              message: 'Organization deleted successfully',
              color: 'green',
            });
            ApiManager.getOrganizations();
          }
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete organization',
            color: 'red',
          });
        }
      },
    });
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

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
              <Title order={2}>Organizations</Title>
              <Text c="dimmed" size="sm">
                Manage your healthcare organizations
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              className="gradient-primary"
            >
              Add Organization
            </Button>
          </Group>

          <Grid gutter="lg">
            <Grid.Col span={12}>
              <Card shadow="sm" radius="md">
                <Group mb="md">
                  <TextInput
                    placeholder="Search organizations..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    className="flex-1"
                  />
                </Group>

                <Table.ScrollContainer minWidth={800}>
                  <Table verticalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Organization</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Registration No</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredOrganizations.map((org) => (
                        <Table.Tr key={org.id}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar color="violet" radius="xl">
                                {getInitials(org.name)}
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {org.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {org.slug}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light">
                              {org.type.replace('_', ' ')}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{org.registration_no || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{formatDate(org.created_at)}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={org.is_active ? 'green' : 'red'}>
                              {org.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Menu shadow="sm" width={200}>
                              <Menu.Target>
                                <ActionIcon variant="subtle">
                                  <IconDots size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEye size={14} />}>
                                  View Details
                                </Menu.Item>
                                <Menu.Item leftSection={<IconEdit size={14} />}>
                                  Edit
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => handleDelete(org.id, org.name)}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </motion.div>

      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create Organization"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack>
            <TextInput
              label="Organization Name"
              placeholder="Enter organization name"
              required
              {...form.getInputProps('name')}
            />
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Registration Number"
                  placeholder="Enter registration number"
                  {...form.getInputProps('registration_no')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="GST Number"
                  placeholder="Enter GST number"
                  {...form.getInputProps('gst_no')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="PAN Number"
              placeholder="Enter PAN number"
              {...form.getInputProps('pan_no')}
            />
            <Title order={5} mt="md">
              Admin Details
            </Title>
            <TextInput
              label="Admin Name"
              placeholder="Enter admin name"
              required
              {...form.getInputProps('admin_name')}
            />
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Admin Phone"
                  placeholder="+91 98765 43210"
                  required
                  {...form.getInputProps('admin_phone')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Admin Email"
                  placeholder="admin@example.com"
                  type="email"
                  {...form.getInputProps('admin_email')}
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setCreateModalOpened(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                Create Organization
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
