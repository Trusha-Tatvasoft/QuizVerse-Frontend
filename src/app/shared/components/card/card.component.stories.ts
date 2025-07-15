import { Meta, StoryFn } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';

export default {
  title: 'Components/Data Card',
  component: CardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatCardModule, MatIconModule],
    }),
  ],
} as Meta<CardComponent>;

const Template: StoryFn<Partial<CardComponent>> = (args: Partial<CardComponent>) => ({
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  cardConfig: {
    title: 'Platform Fee',
    value: '15%',
    subtitle: 'Standard rate',
    valueColor: 'black',
    subtitleColor: 'purple',
    icon: 'person_add',
    iconColor: 'purple',
    tag: {
      id: 'status-down',
      label: 'Active',
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor: 'lightPurple',
      textColor: 'purple',
    },
  },
};

export const WithTag = Template.bind({});
WithTag.args = {
  cardConfig: {
    title: 'Server Health',
    value: 'Critical',
    subtitle: 'System failure',
    valueColor: 'black',
    subtitleColor: 'green',
    icon: '',
    iconColor: 'purple',
    tag: {
      id: 'status-down',
      label: 'Down',
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor: 'lightGreen',
      textColor: 'green',
    },
  },
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  cardConfig: {
    title: 'Total Users',
    value: '12,543',
    subtitle: '+5.2% from last month',
    valueColor: 'black',
    subtitleColor: 'yellow',
    icon: 'person_add',
    iconColor: 'yellow',
  },
};
