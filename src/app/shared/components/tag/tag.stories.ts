import { Meta, StoryObj } from '@storybook/angular';
import { TagComponent } from './tag.component';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<TagComponent> = {
  title: 'Components/Tag',
  component: TagComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [TagComponent],
    }),
  ],
  argTypes: {
    onSelect: { action: 'Tag selected' },
    onClose: { action: 'Tag closed' },
  },
};

export default meta;

type Story = StoryObj<TagComponent>;

export const Static: Story = {
  name: 'Static',
  args: {
    tagConfig: {
      id: 'tag-static',
      label: 'Static Tag',
      type: 'static',
      isSelected: false,
      backgroundColor: 'lightGreen',
      textColor: 'green',
    },
  },
};

export const Selectable: Story = {
  name: 'Selectable (Unselected)',
  args: {
    tagConfig: {
      id: 'tag-selectable',
      label: 'Selectable',
      type: 'selectable',
      isSelected: false,
      backgroundColor: 'white',
      textColor: 'black',
    },
  },
};

