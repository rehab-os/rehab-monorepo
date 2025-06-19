'use client';

import { useEffect } from 'react';
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Progress,
  ThemeIcon,
  Paper,
  RingProgress,
  Center,
  SimpleGrid,
  Container,
} from '@mantine/core';
import {
  IconBuildingHospital,
  IconStethoscope,
  IconUsers,
  IconCalendar,
  IconTrendingUp,
  IconActivity,
} from '@tabler/icons-react';
import { AreaChart, BarChart } from '@mantine/charts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import ApiManager from '../../../services/data';
import { motion } from 'framer-motion';

const statsData = [
  {
    title: 'Total Organizations',
    value: '12',
    icon: IconBuildingHospital,
    color: 'violet',
    progress: 75,
    trend: '+12%',
  },
  {
    title: 'Active Clinics',
    value: '48',
    icon: IconStethoscope,
    color: 'blue',
    progress: 90,
    trend: '+8%',
  },
  {
    title: 'Total Users',
    value: '2,453',
    icon: IconUsers,
    color: 'green',
    progress: 65,
    trend: '+23%',
  },
  {
    title: 'Appointments Today',
    value: '182',
    icon: IconCalendar,
    color: 'orange',
    progress: 82,
    trend: '+5%',
  },
];

const chartData = [
  { month: 'Jan', appointments: 1200, revenue: 45000 },
  { month: 'Feb', appointments: 1900, revenue: 52000 },
  { month: 'Mar', appointments: 1600, revenue: 48000 },
  { month: 'Apr', appointments: 2100, revenue: 61000 },
  { month: 'May', appointments: 2400, revenue: 69000 },
  { month: 'Jun', appointments: 2800, revenue: 78000 },
];

const clinicPerformance = [
  { clinic: 'Main Branch', patients: 450 },
  { clinic: 'North Clinic', patients: 380 },
  { clinic: 'South Clinic', patients: 320 },
  { clinic: 'East Clinic', patients: 290 },
  { clinic: 'West Clinic', patients: 260 },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state:any) => state.auth);

  useEffect(() => {
    // Load initial data
    ApiManager.getOrganizations();
    ApiManager.getClinics();
    ApiManager.getUsers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <Container size="xl" className="py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Stack gap="xl">
          <motion.div variants={itemVariants}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={2}>Welcome back, {user?.full_name}!</Title>
                <Text c="dimmed" size="sm">
                  Here&apos;s what&apos;s happening with your clinics today
                </Text>
              </div>
              <Text size="sm" c="dimmed">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </Group>
          </motion.div>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {statsData.map((stat, index) => (
              <motion.div key={stat.title} variants={itemVariants}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  className="hover:shadow-lg transition-shadow"
                >
                  <Group justify="space-between" mb="xs">
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color={stat.color}
                    >
                      <stat.icon size={28} />
                    </ThemeIcon>
                    <Text size="xs" c="green" fw={700}>
                      {stat.trend}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700} mt="xs">
                    {stat.value}
                  </Text>
                  <Progress
                    value={stat.progress}
                    mt="md"
                    size="sm"
                    radius="xl"
                    color={stat.color}
                  />
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <motion.div variants={itemVariants}>
                <Card shadow="sm" padding="lg" radius="md">
                  <Title order={4} mb="lg">
                    Revenue & Appointments Trend
                  </Title>
                  <AreaChart
                    h={300}
                    data={chartData}
                    dataKey="month"
                    series={[
                      { name: 'appointments', color: 'violet.6' },
                      { name: 'revenue', color: 'blue.6' },
                    ]}
                    curveType="natural"
                  />
                </Card>
              </motion.div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <motion.div variants={itemVariants}>
                <Card shadow="sm" padding="lg" radius="md" h="100%">
                  <Title order={4} mb="lg">
                    System Health
                  </Title>
                  <Center>
                    <RingProgress
                      size={180}
                      thickness={20}
                      sections={[
                        { value: 92, color: 'green' },
                        { value: 5, color: 'yellow' },
                        { value: 3, color: 'red' },
                      ]}
                      label={
                        <Center>
                          <ThemeIcon
                            color="green"
                            variant="light"
                            radius="xl"
                            size="xl"
                          >
                            <IconActivity size={30} />
                          </ThemeIcon>
                        </Center>
                      }
                    />
                  </Center>
                  <Stack gap="xs" mt="lg">
                    <Group justify="space-between">
                      <Text size="sm">Uptime</Text>
                      <Text size="sm" fw={500}>
                        99.9%
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Response Time</Text>
                      <Text size="sm" fw={500}>
                        128ms
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Active Sessions</Text>
                      <Text size="sm" fw={500}>
                        1,234
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>

            <Grid.Col span={12}>
              <motion.div variants={itemVariants}>
                <Card shadow="sm" padding="lg" radius="md">
                  <Title order={4} mb="lg">
                    Clinic Performance
                  </Title>
                  <BarChart
                    h={300}
                    data={clinicPerformance}
                    dataKey="clinic"
                    series={[{ name: 'patients', color: 'violet.6' }]}
                  />
                </Card>
              </motion.div>
            </Grid.Col>
          </Grid>
        </Stack>
      </motion.div>
    </Container>
  );
}
