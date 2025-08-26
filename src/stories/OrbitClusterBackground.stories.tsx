import React from 'react';
import OrbitClusterBackground from '../OrbitClusterBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof OrbitClusterBackground> = {
  title: 'Backgrounds/OrbitClusterBackground',
  component: OrbitClusterBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof OrbitClusterBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <OrbitClusterBackground {...args} />
    </div>
  ),
  args: { particleSizeMin: 1, particleSizeMax: 3 }
};
