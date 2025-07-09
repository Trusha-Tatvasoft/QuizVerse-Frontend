import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from './filled-button.component';

const meta: Meta<FilledButtonComponent> = {
  title: 'Components/FilledButton',
  component: FilledButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [MatButtonModule, MatIconModule],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Text label displayed in the button',
    },
    matIcon: {
      control: 'text',
      description: 'Name of the Material icon (e.g., "home", "check")',
    },
    iconFontSet: {
      control: 'radio',
      options: ['material-icons', 'material-icons-outlined'],
      description: 'Font set for the material icon',
    },
    imageSrc: {
      control: 'text',
      description: 'Optional image URL (used if no matIcon)',
    },
    imagePosition: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Position of the icon/image relative to the label',
    },
    fontWeight: {
      control: { type: 'number', min: 100, max: 900, step: 100 },
      description: 'Font weight of the label text',
    },
    type: {
      control: 'radio',
      options: ['button', 'submit', 'reset'],
      description: 'Native HTML button type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Emits when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<FilledButtonComponent>;

export const Default: Story = {
  args: {
    label: 'Default Button',
    imagePosition: 'left',
    fontWeight: 500,
    disabled: false,
    type: 'button',
  },
};

export const LeftIcon: Story = {
  args: {
    label: 'Default Button',
    matIcon: 'home',
    iconFontSet: 'material-icons',
    imagePosition: 'left',
    fontWeight: 500,
    disabled: false,
    type: 'button',
  },
};

export const RightIcon: Story = {
  args: {
    label: 'Right Icon',
    matIcon: 'arrow_forward',
    imagePosition: 'right',
  },
};

export const WithImage: Story = {
  args: {
    label: 'Image Button',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    matIcon: '',
    imagePosition: 'left',
    fontWeight: 500,
  },
};

export const IconOnly: Story = {
  args: {
    label: '',
    matIcon: 'star',
    iconFontSet: 'material-icons-outlined',
  },
};

export const OutlineIconOnly: Story = {
  args: {
    label: '',
    matIcon: 'home',
    iconFontSet: 'material-icons-outlined',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

export const FontWeight: Story = {
  args: {
    fontWeight: 800,
    label: 'Font',
  },
};
