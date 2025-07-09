import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OutlineButtonComponent } from './outline-button.component';

const meta: Meta<OutlineButtonComponent> = {
  title: 'Components/OutlineButton',
  component: OutlineButtonComponent,
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
type Story = StoryObj<OutlineButtonComponent>;

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
    label: 'Home',
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
    label: 'Next',
    matIcon: 'arrow_forward',
    iconFontSet: 'material-icons',
    imagePosition: 'right',
    fontWeight: 500,
    disabled: false,
    type: 'button',
  },
};

export const WithImage: Story = {
  args: {
    label: 'GitHub',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    matIcon: '',
    imagePosition: 'left',
    fontWeight: 500,
    disabled: false,
    type: 'button',
  },
};

export const IconOnly: Story = {
  args: {
    label: '',
    matIcon: 'star',
    iconFontSet: 'material-icons-outlined',
    imagePosition: 'left',
    fontWeight: 500,
    disabled: false,
    type: 'button',
  },
};

export const OutlineIconOnly: Story = {
  args: {
    label: '',
    matIcon: 'check_circle',
    iconFontSet: 'material-icons-outlined',
    imagePosition: 'left',
    fontWeight: 500,
    disabled: false,
    type: 'button',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    imagePosition: 'left',
    fontWeight: 500,
    type: 'button',
  },
};

export const FontWeight: Story = {
  args: {
    label: 'Bold Button',
    fontWeight: 800,
    imagePosition: 'left',
    disabled: false,
    type: 'button',
  },
};
