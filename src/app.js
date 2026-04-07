import React, { useState, useEffect } from 'react';
import { Box, Text, Newline } from 'ink';

// Fumadocs-inspired palette
// Primary: purple/violet — #a855f7 / #7c3aed
// Accent: cyan — #06b6d4
// Background: dark — #0c0a09
// Muted: #78716c
// Success: #22c55e
// Warning: #f59e0b

const PURPLE = '#a855f7';
const VIOLET = '#7c3aed';
const CYAN = '#06b6d4';
const MUTED = '#78716c';
const SUCCESS = '#22c55e';
const WHITE = '#fafaf9';

function Header() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color={VIOLET} bold>{'┌─────────────────────────────────────┐'}</Text>
      </Box>
      <Box>
        <Text color={VIOLET} bold>{'│  '}</Text>
        <Text color={PURPLE} bold>🏗️  IaC Toolbox CLI</Text>
        <Text color={VIOLET} bold>{'                  │'}</Text>
      </Box>
      <Box>
        <Text color={VIOLET} bold>{'│  '}</Text>
        <Text color={MUTED}>Infrastructure as Code, simplified</Text>
        <Text color={VIOLET} bold>{'  │'}</Text>
      </Box>
      <Box>
        <Text color={VIOLET} bold>{'└─────────────────────────────────────┘'}</Text>
      </Box>
    </Box>
  );
}

function StatusBadge({ label, value, color }) {
  return (
    <Box marginBottom={0}>
      <Text color={MUTED}>{label}: </Text>
      <Text color={color || CYAN} bold>{value}</Text>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color={PURPLE} bold>▸ </Text>
        <Text color={WHITE} bold>{title}</Text>
      </Box>
      <Box flexDirection="column" marginLeft={2}>
        {children}
      </Box>
    </Box>
  );
}

function LoadingDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <Text color={CYAN}>{dots}</Text>;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      <Header />

      {!ready ? (
        <Box>
          <Text color={MUTED}>Initializing</Text>
          <LoadingDots />
        </Box>
      ) : (
        <>
          <Section title="Environment">
            <StatusBadge label="Status"   value="● Ready"  color={SUCCESS} />
            <StatusBadge label="Runtime"  value={`Node ${process.version}`} />
            <StatusBadge label="Platform" value={process.platform} />
          </Section>

          <Section title="Hello, World!">
            <Text color={WHITE}>
              Welcome to <Text color={PURPLE} bold>IaC Toolbox CLI</Text>.
            </Text>
            <Text color={MUTED}>
              Your infrastructure commands will live here.
            </Text>
          </Section>

          <Box marginTop={1}>
            <Text color={MUTED} dimColor>────────────────────────────────────────</Text>
          </Box>
          <Box>
            <Text color={MUTED}>Press </Text>
            <Text color={CYAN} bold>Ctrl+C</Text>
            <Text color={MUTED}> to exit</Text>
          </Box>
        </>
      )}
    </Box>
  );
}
