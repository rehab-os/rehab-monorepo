'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Text,
  Title,
  Stack,
  Center,
  Group,
  PinInput,
  Transition,
  Box,
  BackgroundImage,
  Overlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPhone, IconShieldCheck } from '@tabler/icons-react';
import ApiManager from '../../../services/data';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const phoneForm = useForm({
    initialValues: {
      phone: '',
    },
    validate: {
      phone: (value) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(value) ? null : 'Invalid phone number';
      },
    },
  });

  const handleSendOtp = async (values: { phone: string }) => {
    setLoading(true);
    try {
      const response = await ApiManager.sendOtp({ phone: values.phone });
      if (response.success) {
        setPhone(values.phone);
        setStep('otp');
        notifications.show({
          title: 'OTP Sent',
          message: 'Please check your phone for the OTP',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: response.message || 'Failed to send OTP',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send OTP',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (otp: string) => {
    setLoading(true);
    try {
      const response = await ApiManager.login({ phone, otp });
      if (response.success) {
        notifications.show({
          title: 'Login Successful',
          message: 'Welcome to RehabOS!',
          color: 'green',
        });
        router.push('/dashboard');
      } else {
        notifications.show({
          title: 'Error',
          message: response.message || 'Invalid OTP',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Login failed',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="h-screen relative overflow-hidden">
      <BackgroundImage
        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070"
        className="h-full"
      >
        <Overlay
          gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
          zIndex={1}
          className="h-full flex items-center justify-center"
        >
          <Container size={420} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper radius="xl" p="xl" className="glass backdrop-blur-md">
                <Center mb="xl">
                  <Stack align="center" gap="xs">
                    <Box className="gradient-primary p-4 rounded-full">
                      <IconShieldCheck size={40} color="white" />
                    </Box>
                    <Title order={2} className="text-white">
                      RehabOS
                    </Title>
                    <Text size="sm" c="dimmed" className="text-gray-300">
                      Enterprise Console
                    </Text>
                  </Stack>
                </Center>

                <Transition
                  mounted={step === 'phone'}
                  transition="slide-right"
                  duration={400}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <div style={styles}>
                      <form onSubmit={phoneForm.onSubmit(handleSendOtp)}>
                        <Stack>
                          <TextInput
                            label="Phone Number"
                            placeholder="+91 98765 43210"
                            leftSection={<IconPhone size={16} />}
                            size="lg"
                            {...phoneForm.getInputProps('phone')}
                            classNames={{
                              input:
                                'bg-white/10 border-white/20 text-white placeholder-gray-400',
                              label: 'text-white',
                            }}
                          />
                          <Button
                            type="submit"
                            size="lg"
                            loading={loading}
                            className="gradient-primary"
                            fullWidth
                          >
                            Send OTP
                          </Button>
                        </Stack>
                      </form>
                    </div>
                  )}
                </Transition>

                <Transition
                  mounted={step === 'otp'}
                  transition="slide-left"
                  duration={400}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <div style={styles}>
                      <Stack>
                        <Text size="sm" ta="center" className="text-white">
                          Enter the 6-digit code sent to
                        </Text>
                        <Text fw={500} ta="center" className="text-white">
                          {phone}
                        </Text>
                        <Center>
                          <PinInput
                            length={6}
                            size="lg"
                            onComplete={handleLogin}
                            disabled={loading}
                            classNames={{
                              input: 'bg-white/10 border-white/20 text-white',
                            }}
                          />
                        </Center>
                        <Group justify="space-between" mt="md">
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => setStep('phone')}
                            disabled={loading}
                            className="text-white hover:bg-white/10"
                          >
                            Change Number
                          </Button>
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => handleSendOtp({ phone })}
                            disabled={loading}
                            className="text-white hover:bg-white/10"
                          >
                            Resend OTP
                          </Button>
                        </Group>
                      </Stack>
                    </div>
                  )}
                </Transition>
              </Paper>
            </motion.div>
          </Container>
        </Overlay>
      </BackgroundImage>
    </Box>
  );
}
