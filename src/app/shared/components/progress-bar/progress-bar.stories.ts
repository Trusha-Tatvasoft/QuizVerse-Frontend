import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
  title: 'Components/ProgressBar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100 },
    },
    theme: {
      control: 'radio',
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Default: Story = {
  args: {
    percentage: 25,
    theme: 'primary',
  },
  render: (args) => ({
    props: args,
    template: `
        <div style="min-width: 300px;">
          <app-progress-bar [percentage]="percentage" [theme]="theme"></app-progress-bar>
        </div>
      `,
  }),
};

export const Secondary: Story = {
  args: {
    percentage: 75,
    theme: 'secondary',
  },
  render: (args) => ({
    props: args,
    template: `
        <div style="min-width: 300px;">
          <app-progress-bar [percentage]="percentage" [theme]="theme"></app-progress-bar>
        </div>
      `,
  }),
};
