import React from 'react';
import NebulaBackground from '../NebulaBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof NebulaBackground> = {
  title: 'Backgrounds/NebulaBackground',
  component: NebulaBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof NebulaBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <NebulaBackground {...args} />
    </div>
  ),
  args: { blobCount: 8 }
};
