import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OutlineButtonComponent } from './outline-button.component';

// Storybook metadata for OutlineButton component
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
    outlineButtonConfig: {
      control: 'object',
      description: 'Configuration object for the outline button',
    },
    buttonClicked: {
      action: 'clicked',
      description: 'Emits when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<OutlineButtonComponent>;

// Default button with standard configuration
export const Default: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Default Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
    },
  },
};

// Button with secondary variant
export const SecondaryVariant: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Secondary Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
      variant: 'secondary',
    },
  },
};

// Button with gradient variant
export const GradientVariant: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Gradient Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
      variant: 'gradient',
    },
  },
};

// Outline button with a left-aligned icon
export const LeftIcon: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Home',
      matIcon: 'home',
      iconFontSet: 'material-icons',
      imagePosition: 'left',
    },
  },
};

// Outline button with a right-aligned icon
export const RightIcon: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Next',
      matIcon: 'arrow_forward',
      imagePosition: 'right',
    },
  },
};

// Outline button showing a custom image instead of an icon
export const WithImage: Story = {
  args: {
    outlineButtonConfig: {
      label: 'GitHub',
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    },
  },
};

// Outline button with icon only (no label)
export const IconOnly: Story = {
  args: {
    outlineButtonConfig: {
      label: '',
      matIcon: 'star',
      iconFontSet: 'material-icons',
    },
  },
};

// Outline button with outlined icon only (no label)
export const OutlineIconOnly: Story = {
  args: {
    outlineButtonConfig: {
      label: '',
      matIcon: 'home',
      iconFontSet: 'material-icons-outlined',
    },
  },
};

// Disabled state of the outline button
export const Disabled: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Disabled',
      isDisabled: true,
    },
  },
};

// Outline button with bold text using custom font weight
export const FontWeight: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Bold Button',
      fontWeight: 800,
    },
  },
};
