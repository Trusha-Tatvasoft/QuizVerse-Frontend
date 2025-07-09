import { Meta, StoryFn } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';

export default {
  title: 'Components/Data Card',
  component: CardComponent,
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
  title: 'Platform Fee',
  value: '15%',
  status: 'Active',
  subtitle: 'Standard rate',
  valueColor: 'black',
  subtitleColor: 'green',
  backgroundColor: 'white',
};

export const WithStatus = Template.bind({});
WithStatus.args = {
  title: 'Server Health',
  value: 'Critical',
  status: 'Down',
  valueColor: 'black',
  subtitleColor: 'purple',
  backgroundColor: 'white',
};

export const WithoutStatus = Template.bind({});
WithoutStatus.args = {
  title: 'Total Users',
  value: '12,543',
  subtitle: '+5.2% from last month',
  icon: 'person_add',
  valueColor: 'black',
  subtitleColor: 'orange',
  backgroundColor: 'white',
};
