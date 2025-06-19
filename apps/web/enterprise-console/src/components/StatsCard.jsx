// components/StatsCard.jsx
'use client';

import { Card, Group, Text, ThemeIcon } from '@mantine/core';
import React from 'react'; // Not strictly necessary if no hooks, but good practice

export function StatsCard({ title, value, icon, color, description }) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ animation: 'fadeIn 0.5s ease-out' }}
    >
      <Group position="apart">
        <div>
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            {title}
          </Text>
          <Text size="xl" weight={700} mt="xs">
            {value}
          </Text>
          {description && (
            <Text size="xs" color="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon size="xl" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
