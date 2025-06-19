// components/LoginPage.jsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stack,
  Center,
  ThemeIcon,
  Title,
  Text,
  Alert,
  TextInput,
  Button,
  PinInput,
  Group,
} from '@mantine/core';
import { IconHeart, IconPhone, IconCheck, IconX } from '@tabler/icons-react';
import { NotificationContext } from '../app/layout'; // Adjust import path
import { mockAuth } from '../services/data'; // Adjust import path

export function LoginPage({ onLogin }) {
  const { showNotification } = React.useContext(NotificationContext);
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await mockAuth.sendOtp(phone);
      showNotification({
        title: 'OTP Sent',
        message: 'Please check your phone for the verification code',
        color: 'teal',
        icon: <IconCheck />,
      });
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await mockAuth.login(phone, otp);
      showNotification({
        title: 'Login Successful',
        message: 'Welcome to RehabOS!',
        color: 'teal',
        icon: <IconCheck />,
      });
      onLogin(response.user);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      showNotification({
        title: 'Login Failed',
        message: 'Invalid OTP. Use 123456 for demo.',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0B7285 0%, #12B886 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-150px',
          right: '-150px',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: '-100px',
          left: '-100px',
          animation: 'float 8s ease-in-out infinite',
        }}
      />

      <Container size="xs">
        <Paper
          radius="lg"
          p="xl"
          shadow="xl"
          style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
          <Stack spacing="lg">
            <Center>
              <ThemeIcon
                size={80}
                radius="xl"
                variant="gradient"
                gradient={{ from: 'teal', to: 'lime' }}
              >
                <IconHeart size={40} />
              </ThemeIcon>
            </Center>

            <Stack spacing={4} align="center">
              <Title order={2} align="center">
                Welcome to RehabOS
              </Title>
              <Text color="dimmed" size="sm" align="center">
                Enterprise Healthcare Management System
              </Text>
            </Stack>

            {error && (
              <Alert color="red" variant="light" icon={<IconX />}>
                {error}
              </Alert>
            )}

            {step === 'phone' ? (
              <>
                <TextInput
                  label="Phone Number"
                  placeholder="+91 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<IconPhone size={16} />}
                  size="md"
                  required
                />

                <Button
                  fullWidth
                  size="md"
                  onClick={handleSendOtp}
                  loading={loading}
                  gradient={{ from: 'teal', to: 'lime' }}
                  variant="gradient"
                >
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <Stack spacing="xs">
                  <Text size="sm" weight={500}>
                    Enter OTP sent to {phone}
                  </Text>
                  <Center>
                    <PinInput
                      length={6}
                      value={otp}
                      onChange={setOtp}
                      size="md"
                      type="number"
                    />
                  </Center>
                  <Text size="xs" color="dimmed" align="center">
                    Use 123456 for demo
                  </Text>
                </Stack>

                <Button
                  fullWidth
                  size="md"
                  onClick={handleLogin}
                  loading={loading}
                  gradient={{ from: 'teal', to: 'lime' }}
                  variant="gradient"
                >
                  Verify & Login
                </Button>

                <Button
                  fullWidth
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                >
                  Change Phone Number
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
