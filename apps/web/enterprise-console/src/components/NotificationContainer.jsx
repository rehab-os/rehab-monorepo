// components/NotificationContainer.jsx
'use client'; // This directive marks it as a Client Component

import React from 'react';
import { Box, Notification } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react'; // Assuming these icons are used

export function NotificationContainer({ notifications, onClose }) {
  return (
    <Box
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          icon={notification.icon}
          color={notification.color}
          title={notification.title}
          onClose={() => onClose(notification.id)}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          {notification.message}
        </Notification>
      ))}
    </Box>
  );
}
