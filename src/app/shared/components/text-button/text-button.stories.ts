import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextButtonComponent } from './text-button.component';

// Meta configuration for TextButtonComponent in Storybook
const meta: Meta<TextButtonComponent> = {
  title: 'Components/TextButton',
  component: TextButtonComponent,
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
    textButtonConfig: {
      control: 'object',
      description: 'Configuration object for the text button',
    },
    buttonClicked: {
      action: 'clicked',
      description: 'Emits when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<TextButtonComponent>;

// Default text button
export const Default: Story = {
  args: {
    textButtonConfig: {
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
    textButtonConfig: {
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
    textButtonConfig: {
      label: 'Gradient Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
      variant: 'gradient',
    },
  },
};

// Text button with left-positioned icon
export const LeftIcon: Story = {
  args: {
    textButtonConfig: {
      label: 'Home',
      matIcon: 'home',
      iconFontSet: 'material-icons',
      imagePosition: 'left',
    },
  },
};

// Text button with right-positioned icon
export const RightIcon: Story = {
  args: {
    textButtonConfig: {
      label: 'Next',
      matIcon: 'arrow_forward',
      imagePosition: 'right',
    },
  },
};

// Text button using an image instead of an icon
export const WithImage: Story = {
  args: {
    textButtonConfig: {
      label: 'GitHub',
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    },
  },
};

// Text button with only icon and no label
export const IconOnly: Story = {
  args: {
    textButtonConfig: {
      label: '',
      matIcon: 'star',
      iconFontSet: 'material-icons',
    },
  },
};

// Text button with only outlined icon
export const OutlineIconOnly: Story = {
  args: {
    textButtonConfig: {
      label: '',
      matIcon: 'home',
      iconFontSet: 'material-icons-outlined',
    },
  },
};

// Disabled state for text button
export const Disabled: Story = {
  args: {
    textButtonConfig: {
      label: 'Disabled',
      isDisabled: true,
    },
  },
};

// Text button with bold font weight
export const FontWeight: Story = {
  args: {
    textButtonConfig: {
      label: 'Bold Button',
      fontWeight: 800,
    },
  },
};
