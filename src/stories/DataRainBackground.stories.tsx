import React from 'react';
import DataRainBackground from '../DataRainBackground';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DataRainBackground> = {
  title: 'Backgrounds/DataRainBackground',
  component: DataRainBackground,
  parameters: { layout: 'fullscreen' }
};

export default meta;
type Story = StoryObj<typeof DataRainBackground>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: '100vh' }}>
      <DataRainBackground {...args} />
    </div>
  ),
  args: { charSpeedMin: 1, charSpeedMax: 3 }
};
