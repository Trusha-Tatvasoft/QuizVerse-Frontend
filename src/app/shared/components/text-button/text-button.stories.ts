import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextButtonComponent } from './text-button.component';

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
      description: 'Configuration object for the filled button',
    },
    onClick: {
      action: 'clicked',
      description: 'Emits when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<TextButtonComponent>;

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

export const RightIcon: Story = {
  args: {
    textButtonConfig: {
      label: 'Next',
      matIcon: 'arrow_forward',
      imagePosition: 'right',
    },
  },
};

export const WithImage: Story = {
  args: {
    textButtonConfig: {
      label: 'GitHub',
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    },
  },
};

export const IconOnly: Story = {
  args: {
    textButtonConfig: {
      label: '',
      matIcon: 'star',
      iconFontSet: 'material-icons',
    },
  },
};

export const OutlineIconOnly: Story = {
  args: {
    textButtonConfig: {
      label: '',
      matIcon: 'home',
      iconFontSet: 'material-icons-outlined',
    },
  },
};

export const Disabled: Story = {
  args: {
    textButtonConfig: {
      label: 'Disabled',
      isDisabled: true,
    },
  },
};

export const FontWeight: Story = {
  args: {
    textButtonConfig: {
      label: 'Bold Button',
      fontWeight: 800,
    },
  },
};
