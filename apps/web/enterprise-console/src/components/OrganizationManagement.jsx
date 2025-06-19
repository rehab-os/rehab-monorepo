// components/OrganizationManagement.jsx
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
  ActionIcon,
  Text,
  Divider,
  Modal,
  TextInput,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

import {
  IconPlus,
  IconEdit,
  IconBuildingHospital,
  IconClipboardList,
  IconCheck,
  IconPhone,
  IconMail,
} from '@tabler/icons-react';
import { NotificationContext } from '../app/layout'; // Adjust import path
import { mockData } from '../services/data'; // Adjust import path

export function OrganizationManagement() {
  const { showNotification } = React.useContext(NotificationContext);
  const [organizations, setOrganizations] = useState(mockData.organizations);
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [selectedOrg, setSelectedOrg] = useState(null); // Used for editing, not implemented in this snippet

  const form = useForm({
    initialValues: {
      name: '',
      type: '',
      registration_no: '',
      gst_no: '',
      admin_phone: '',
      admin_name: '',
      admin_email: '',
    },
  });

  const handleSubmit = (values) => {
    const newOrg = {
      id: Date.now().toString(),
      ...values,
      slug: values.name.toLowerCase().replace(/\s+/g, '-'),
      is_active: true,
      created_at: new Date(),
      clinics_count: 0,
    };

    setOrganizations([...organizations, newOrg]);
    showNotification({
      title: 'Success',
      message: 'Organization created successfully',
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
          <Title order={3}>Organizations</Title>
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={open}
            gradient={{ from: 'teal', to: 'lime' }}
            variant="gradient"
          >
            Add Organization
          </Button>
        </Group>

        <Grid>
          {organizations.map((org) => (
            <Grid.Col key={org.id} xs={12} sm={6} lg={4}>
              <Card
                shadow="sm"
                radius="md"
                withBorder
                style={{ animation: 'fadeIn 0.5s ease-out' }}
              >
                <Group position="apart" mb="xs">
                  <Badge color="teal" variant="light">
                    {org.type}
                  </Badge>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setSelectedOrg(org); // Set selected org for potential future edit functionality
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Group>

                <Text weight={600} size="lg" mb="xs">
                  {org.name}
                </Text>

                <Stack spacing="xs">
                  <Group spacing="xs">
                    <IconBuildingHospital size={14} color="#ADB5BD" />
                    <Text size="sm" color="dimmed">
                      {org.clinics_count} Clinics
                    </Text>
                  </Group>

                  {org.registration_no && (
                    <Group spacing="xs">
                      <IconClipboardList size={14} color="#ADB5BD" />
                      <Text size="sm" color="dimmed">
                        Reg: {org.registration_no}
                      </Text>
                    </Group>
                  )}
                </Stack>

                <Divider my="sm" />

                <Group position="apart">
                  <Badge color={org.is_active ? 'green' : 'red'} variant="dot">
                    {org.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Text size="xs" color="dimmed">
                    {new Date(org.created_at).toLocaleDateString()}
                  </Text>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={close}
        title="Create Organization"
        size="lg"
      >
        <Stack spacing="md">
          <TextInput
            label="Organization Name"
            placeholder="Enter organization name"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="Type"
            placeholder="Select type"
            required
            data={[
              { value: 'HOSPITAL', label: 'Hospital' },
              { value: 'CLINIC_CHAIN', label: 'Clinic Chain' },
              { value: 'STANDALONE_CLINIC', label: 'Standalone Clinic' },
            ]}
            {...form.getInputProps('type')}
          />

          <Grid>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Registration Number"
                placeholder="REG123456"
                {...form.getInputProps('registration_no')}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="GST Number"
                placeholder="GST123456"
                {...form.getInputProps('gst_no')}
              />
            </Grid.Col>
          </Grid>

          <Divider label="Admin Details" labelPosition="center" />

          <TextInput
            label="Admin Name"
            placeholder="John Doe"
            required
            {...form.getInputProps('admin_name')}
          />

          <Grid>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Admin Phone"
                placeholder="+91 1234567890"
                required
                icon={<IconPhone size={16} />}
                {...form.getInputProps('admin_phone')}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                label="Admin Email"
                placeholder="admin@example.com"
                icon={<IconMail size={16} />}
                {...form.getInputProps('admin_email')}
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
              Create Organization
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
