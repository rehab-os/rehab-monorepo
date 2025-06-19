// components/ClinicManagement.jsx
'use client';

import React, { useState } from 'react';
import {
  Stack,
  Group,
  Title,
  Button,
  Table,
  Badge,
  ActionIcon,
  Text,
  Modal,
  TextInput,
  Textarea,
  Grid,
  Card,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

import {
  IconPlus,
  IconEdit,
  IconChevronRight,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCheck,
} from '@tabler/icons-react';
import { NotificationContext } from '../app/layout'; // Adjust import path
import { mockData } from '../services/data'; // Adjust import path

export function ClinicManagement() {
  const { showNotification } = React.useContext(NotificationContext);
  const [clinics, setClinics] = useState(mockData.clinics);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] =
    useDisclosure(false);
  const [modalOpened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  const handleViewDetails = (clinic) => {
    setSelectedClinic(clinic);
    openDetails();
  };

  const handleSubmit = (values) => {
    setClinics([
      ...clinics,
      {
        id: Date.now().toString(),
        organization_id: '1', // Assuming a default organization for new clinics
        ...values,
        is_active: true,
      },
    ]);
    showNotification({
      title: 'Success',
      message: 'Clinic added successfully',
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
          <Title order={3}>Clinics</Title>
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={open}
            gradient={{ from: 'teal', to: 'lime' }}
            variant="gradient"
          >
            Add Clinic
          </Button>
        </Group>

        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr key={clinic.id} style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <td>
                  <Text weight={600}>{clinic.name}</Text>
                </td>
                <td>{clinic.phone}</td>
                <td>
                  <Text size="sm">
                    {clinic.city}, {clinic.state}
                  </Text>
                </td>
                <td>
                  <Badge
                    color={clinic.is_active ? 'green' : 'red'}
                    variant="dot"
                  >
                    {clinic.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Group spacing="xs">
                    <Tooltip label="View Details">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleViewDetails(clinic)}
                      >
                        <IconChevronRight size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" color="gray">
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>

      {/* Clinic Details Modal */}
      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title="Clinic Details"
        size="lg"
      >
        {selectedClinic && (
          <Stack spacing="md">
            <Card withBorder radius="md" p="md">
              <Group position="apart" mb="md">
                <Text weight={600} size="lg">
                  {selectedClinic.name}
                </Text>
                <Badge color="green" variant="dot">
                  Active
                </Badge>
              </Group>

              <Grid>
                <Grid.Col xs={12} sm={6}>
                  <Group spacing="xs" mb="sm">
                    <IconPhone size={16} color="#ADB5BD" />
                    <Text size="sm">{selectedClinic.phone}</Text>
                  </Group>
                </Grid.Col>

                <Grid.Col xs={12} sm={6}>
                  <Group spacing="xs" mb="sm">
                    <IconMail size={16} color="#ADB5BD" />
                    <Text size="sm">{selectedClinic.email}</Text>
                  </Group>
                </Grid.Col>

                <Grid.Col xs={12}>
                  <Group spacing="xs" align="flex-start">
                    <IconMapPin
                      size={16}
                      color="#ADB5BD"
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <Text size="sm">
                        {selectedClinic.address}, {selectedClinic.city}
                      </Text>
                      <Text size="sm">
                        {selectedClinic.state} - {selectedClinic.pincode}
                      </Text>
                    </div>
                  </Group>
                </Grid.Col>
              </Grid>
            </Card>

            <Card withBorder radius="md" p="md">
              <Title order={5} mb="md">
                Services & Specializations
              </Title>
              <Group spacing="xs">
                <Badge variant="light" color="teal">
                  Physiotherapy
                </Badge>
                <Badge variant="light" color="teal">
                  Occupational Therapy
                </Badge>
                <Badge variant="light" color="teal">
                  Speech Therapy
                </Badge>
                <Badge variant="light" color="teal">
                  Neuro Rehabilitation
                </Badge>
              </Group>
            </Card>

            <Card withBorder radius="md" p="md">
              <Title order={5} mb="md">
                Statistics
              </Title>
              <Grid>
                <Grid.Col xs={6} sm={3}>
                  <Text size="xs" color="dimmed">
                    Total Patients
                  </Text>
                  <Text size="xl" weight={700}>
                    245
                  </Text>
                </Grid.Col>
                <Grid.Col xs={6} sm={3}>
                  <Text size="xs" color="dimmed">
                    Active Sessions
                  </Text>
                  <Text size="xl" weight={700}>
                    12
                  </Text>
                </Grid.Col>
                <Grid.Col xs={6} sm={3}>
                  <Text size="xs" color="dimmed">
                    Therapists
                  </Text>
                  <Text size="xl" weight={700}>
                    8
                  </Text>
                </Grid.Col>
                <Grid.Col xs={6} sm={3}>
                  <Text size="xs" color="dimmed">
                    Rating
                  </Text>
                  <Text size="xl" weight={700}>
                    4.8
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        )}
      </Modal>

      {/* Add Clinic Modal */}
      <Modal
        opened={modalOpened}
        onClose={close}
        title="Add New Clinic"
        size="lg"
      >
        <Stack spacing="md">
          <TextInput
            label="Clinic Name"
            placeholder="Enter clinic name"
            required
            {...form.getInputProps('name')}
          />

          <Grid>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Phone"
                placeholder="+91 1234567890"
                required
                icon={<IconPhone size={16} />}
                {...form.getInputProps('phone')}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Email"
                placeholder="clinic@example.com"
                icon={<IconMail size={16} />}
                {...form.getInputProps('email')}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Address"
            placeholder="Enter full address"
            required
            {...form.getInputProps('address')}
          />

          <Grid>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="City"
                placeholder="Mumbai"
                required
                {...form.getInputProps('city')}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="State"
                placeholder="Maharashtra"
                required
                {...form.getInputProps('state')}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Pincode"
                placeholder="400001"
                required
                {...form.getInputProps('pincode')}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Country"
                placeholder="India"
                required
                {...form.getInputProps('country')}
              />
            </Grid.Col>
          </Grid>

          <Group position="right" mt="md">
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={() => form.onSubmit(handleSubmit)()}
              gradient={{ from: 'teal', to: 'lime' }}
              variant="gradient"
            >
              Add Clinic
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
