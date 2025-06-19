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
  Grid,
  Pagination,
  Textarea,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import ApiManager from '../../../services/data';
import { Gender, BloodGroup, UserStatus } from '@rehab/shared';
import { useForm } from '@mantine/form';
import {
  formatDate,
  formatPhoneNumber,
  getInitials,
} from '@rehab/shared';
import { motion } from 'framer-motion';
import { DateInput } from '@mantine/dates';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.user);
  const { organizations } = useAppSelector((state) => state.organization);
  const { clinics } = useAppSelector((state) => state.clinic);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      phone: '',
      full_name: '',
      email: '',
      date_of_birth: '',
      gender: '' as Gender | '',
      blood_group: '' as BloodGroup | '',
      emergency_contact: '',
      address: '',
    },
    validate: {
      phone: (value) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(value) ? null : 'Invalid phone number';
      },
      full_name: (value) => (!value ? 'Name is required' : null),
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? 'Invalid email' : null,
    },
  });

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = () => {
    ApiManager.getOrganizations();
    ApiManager.getClinics();
    ApiManager.getUsers({ page, limit: 10 });
  };

  const handleCreate = async (values: typeof form.values) => {
    try {
      const data = {
        ...values,
        gender: values.gender || undefined,
        blood_group: values.blood_group || undefined,
      };
      const response = await ApiManager.createUser(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'User created successfully',
          color: 'green',
        });
        setCreateModalOpened(false);
        form.reset();
        loadData();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create user',
        color: 'red',
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    modals.openConfirmModal({
      title: 'Delete User',
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
          const response = await ApiManager.deleteUser(id);
          if (response.success) {
            notifications.show({
              title: 'Success',
              message: 'User deleted successfully',
              color: 'green',
            });
            loadData();
          }
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete user',
            color: 'red',
          });
        }
      },
    });
  };

  const filteredUsers = users.users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)
  );

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'green';
      case UserStatus.INACTIVE:
        return 'gray';
      case UserStatus.SUSPENDED:
        return 'red';
      default:
        return 'gray';
    }
  };

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
              <Title order={2}>Users</Title>
              <Text c="dimmed" size="sm">
                Manage users and their roles
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              className="gradient-primary"
            >
              Add User
            </Button>
          </Group>

          <Card shadow="sm" radius="md">
            <Group mb="md">
              <TextInput
                placeholder="Search by name or phone..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="flex-1"
              />
              <Select
                placeholder="Filter by status"
                data={Object.values(UserStatus).map((status) => ({
                  value: status,
                  label: status,
                }))}
                clearable
                className="w-48"
              />
            </Group>

            <Table.ScrollContainer minWidth={1000}>
              <Table verticalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Contact</Table.Th>
                    <Table.Th>Roles</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Joined</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredUsers.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar color="violet" radius="xl">
                            {getInitials(user.full_name)}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              {user.full_name}
                            </Text>
                            <Badge size="xs" variant="light">
                              {user.profile_completed
                                ? 'Complete'
                                : 'Incomplete'}
                            </Badge>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{formatPhoneNumber(user.phone)}</Text>
                          {user.email && (
                            <Text size="xs" c="dimmed">
                              {user.email}
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {user.roles?.slice(0, 2).map((roleAssignment) => (
                            <Badge key={roleAssignment.id} variant="light">
                              {roleAssignment.role.display_name}
                            </Badge>
                          ))}
                          {user.roles && user.roles.length > 2 && (
                            <Badge variant="light" color="gray">
                              +{user.roles.length - 2}
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(user.user_status)}>
                          {user.user_status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(user.created_at)}</Text>
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
                              View Profile
                            </Menu.Item>
                            <Menu.Item leftSection={<IconEdit size={14} />}>
                              Edit
                            </Menu.Item>
                            <Menu.Item leftSection={<IconUserPlus size={14} />}>
                              Assign Role
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() =>
                                handleDelete(user.id, user.full_name)
                              }
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

            <Group justify="center" mt="xl">
              <Pagination
                value={page}
                onChange={setPage}
                total={Math.ceil(users.total / 10)}
              />
            </Group>
          </Card>
        </Stack>
      </motion.div>

      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create User"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="Enter full name"
              required
              {...form.getInputProps('full_name')}
            />

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  required
                  {...form.getInputProps('phone')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="user@example.com"
                  type="email"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md">
              <Grid.Col span={4}>
                <DateInput
                  label="Date of Birth"
                  placeholder="Select date"
                  valueFormat="YYYY-MM-DD"
                  {...form.getInputProps('date_of_birth')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  data={Object.values(Gender).map((g) => ({
                    value: g,
                    label: g,
                  }))}
                  {...form.getInputProps('gender')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Blood Group"
                  placeholder="Select blood group"
                  data={Object.values(BloodGroup).map((bg) => ({
                    value: bg,
                    label: bg.replace('_', ' '),
                  }))}
                  {...form.getInputProps('blood_group')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Emergency Contact"
              placeholder="+91 98765 43210"
              {...form.getInputProps('emergency_contact')}
            />

            <Textarea
              label="Address"
              placeholder="Enter full address"
              rows={3}
              {...form.getInputProps('address')}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setCreateModalOpened(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                Create User
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
