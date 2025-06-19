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
  Select,
  Grid,
  NumberInput,
  SimpleGrid,
  ThemeIcon,
  Box,
  Textarea,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconStethoscope,
  IconMapPin,
  IconPhone,
  IconMail,
  IconBed,
  IconClock,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { notifications } from '@mantine/notifications';
import ApiManager from '../../../services/data';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';

export default function ClinicsPage() {
  const dispatch = useAppDispatch();
  const { clinics, loading } = useAppSelector((state) => state.clinic);
  const { organizations } = useAppSelector((state) => state.organization);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      total_beds: undefined as number | undefined,
      admin_phone: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      address: (value) => (!value ? 'Address is required' : null),
      city: (value) => (!value ? 'City is required' : null),
      state: (value) => (!value ? 'State is required' : null),
      pincode: (value) => (!value ? 'Pincode is required' : null),
      phone: (value) => (!value ? 'Phone is required' : null),
      admin_phone: (value) => (!value ? 'Admin phone is required' : null),
    },
  });

  useEffect(() => {
    ApiManager.getOrganizations();
    ApiManager.getClinics();
  }, []);

  const handleCreate = async (values: typeof form.values) => {
    if (!selectedOrg) {
      notifications.show({
        title: 'Error',
        message: 'Please select an organization',
        color: 'red',
      });
      return;
    }

    try {
      const response = await ApiManager.createClinic(selectedOrg, values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Clinic created successfully',
          color: 'green',
        });
        setCreateModalOpened(false);
        form.reset();
        ApiManager.getClinics();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create clinic',
        color: 'red',
      });
    }
  };

  const filteredClinics = clinics.filter((clinic:any) =>
    clinic.name.toLowerCase().includes(search.toLowerCase())
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
              <Title order={2}>Clinics</Title>
              <Text c="dimmed" size="sm">
                Manage your clinic locations
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              className="gradient-primary"
            >
              Add Clinic
            </Button>
          </Group>

          <Group>
            <TextInput
              placeholder="Search clinics..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="flex-1"
            />
            <Select
              placeholder="Filter by organization"
              data={organizations.map((org:any) => ({
                value: org.id,
                label: org.name,
              }))}
              clearable
              className="w-64"
            />
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {filteredClinics.map((clinic:any) => (
              <motion.div
                key={clinic.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <Group justify="space-between" mb="xs">
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color="violet"
                    >
                      <IconStethoscope size={28} />
                    </ThemeIcon>
                    <Badge color={clinic.is_active ? 'green' : 'red'}>
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Group>

                  <Text size="lg" fw={600} mt="md">
                    {clinic.name}
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Code: {clinic.code}
                  </Text>

                  <Stack gap="xs" mt="md">
                    <Group gap="xs" wrap="nowrap">
                      <IconMapPin size={16} className="text-gray-500" />
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {clinic.address}, {clinic.city}, {clinic.state} -{' '}
                        {clinic.pincode}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconPhone size={16} className="text-gray-500" />
                      <Text size="sm" c="dimmed">
                        {clinic.phone}
                      </Text>
                    </Group>
                    {clinic.email && (
                      <Group gap="xs">
                        <IconMail size={16} className="text-gray-500" />
                        <Text size="sm" c="dimmed">
                          {clinic.email}
                        </Text>
                      </Group>
                    )}
                    {clinic.total_beds && (
                      <Group gap="xs">
                        <IconBed size={16} className="text-gray-500" />
                        <Text size="sm" c="dimmed">
                          {clinic.total_beds} beds
                        </Text>
                      </Group>
                    )}
                  </Stack>

                  <Button
                    variant="light"
                    fullWidth
                    mt="md"
                    onClick={() => console.log('View clinic:', clinic.id)}
                  >
                    View Details
                  </Button>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Stack>
      </motion.div>

      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create Clinic"
        size="xl"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack>
            <Select
              label="Organization"
              placeholder="Select organization"
              data={organizations.map((org:any) => ({
                value: org.id,
                label: org.name,
              }))}
              value={selectedOrg}
              onChange={(value) => setSelectedOrg(value || '')}
              required
            />

            <TextInput
              label="Clinic Name"
              placeholder="Enter clinic name"
              required
              {...form.getInputProps('name')}
            />

            <Textarea
              label="Address"
              placeholder="Enter full address"
              required
              rows={3}
              {...form.getInputProps('address')}
            />

            <Grid gutter="md">
              <Grid.Col span={4}>
                <TextInput
                  label="City"
                  placeholder="Enter city"
                  required
                  {...form.getInputProps('city')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="State"
                  placeholder="Enter state"
                  required
                  {...form.getInputProps('state')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Pincode"
                  placeholder="Enter pincode"
                  required
                  {...form.getInputProps('pincode')}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Phone"
                  placeholder="+91 98765 43210"
                  required
                  {...form.getInputProps('phone')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="clinic@example.com"
                  type="email"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md">
              <Grid.Col span={4}>
                <NumberInput
                  label="Total Beds"
                  placeholder="Enter number of beds"
                  min={0}
                  {...form.getInputProps('total_beds')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Latitude"
                  placeholder="Enter latitude"
                  decimalScale={6}
                  {...form.getInputProps('latitude')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Longitude"
                  placeholder="Enter longitude"
                  decimalScale={6}
                  {...form.getInputProps('longitude')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Admin Phone"
              placeholder="+91 98765 43210"
              required
              {...form.getInputProps('admin_phone')}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setCreateModalOpened(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                Create Clinic
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
