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
    filledButtonConfig: {
      control: 'object',
      description: 'Configuration object for the filled button',
    },
    buttonClicked: {
      action: 'clicked',
      description: 'Emits when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<FilledButtonComponent>;

/** Default button with basic config */
export const Default: Story = {
  args: {
    filledButtonConfig: {
      label: 'Default Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
    },
  },
};

/** Button with secondary variant */
export const SecondaryVariant: Story = {
  args: {
    filledButtonConfig: {
      label: 'Secondary Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
      variant: 'secondary',
    },
  },
};

/** Button with gardient background */
export const GradientVariant: Story = {
  args: {
    filledButtonConfig: {
      label: 'Gradient Button',
      imagePosition: 'left',
      fontWeight: 500,
      isDisabled: false,
      type: 'button',
      variant: 'gradient',
    },
  },
};

/** Button with icon on the left side */
export const LeftIcon: Story = {
  args: {
    filledButtonConfig: {
      label: 'Home',
      matIcon: 'home',
      iconFontSet: 'material-icons',
      imagePosition: 'left',
    },
  },
};

/** Button with icon on the right side */
export const RightIcon: Story = {
  args: {
    filledButtonConfig: {
      label: 'Next',
      matIcon: 'arrow_forward',
      imagePosition: 'right',
    },
  },
};

/** Button with an image instead of icon */
export const WithImage: Story = {
  args: {
    filledButtonConfig: {
      label: 'GitHub',
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    },
  },
};

/** Icon-only button (no label) */
export const IconOnly: Story = {
  args: {
    filledButtonConfig: {
      label: '',
      matIcon: 'star',
      iconFontSet: 'material-icons',
    },
  },
};

/** Icon-only button using outlined Material icon */
export const OutlineIconOnly: Story = {
  args: {
    filledButtonConfig: {
      label: '',
      matIcon: 'home',
      iconFontSet: 'material-icons-outlined',
    },
  },
};

/** Disabled button to demonstrate disabled state styles */
export const Disabled: Story = {
  args: {
    filledButtonConfig: {
      label: 'Disabled',
      isDisabled: true,
    },
  },
};

/** Button with heavier font weight (bold) */
export const FontWeight: Story = {
  args: {
    filledButtonConfig: {
      label: 'Bold Button',
      fontWeight: 800,
      type: 'submit',
    },
  },
};
