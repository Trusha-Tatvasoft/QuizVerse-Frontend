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

export const RightIcon: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Next',
      matIcon: 'arrow_forward',
      imagePosition: 'right',
    },
  },
};

export const WithImage: Story = {
  args: {
    outlineButtonConfig: {
      label: 'GitHub',
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    },
  },
};

export const IconOnly: Story = {
  args: {
    outlineButtonConfig: {
      label: '',
      matIcon: 'star',
      iconFontSet: 'material-icons',
    },
  },
};

export const OutlineIconOnly: Story = {
  args: {
    outlineButtonConfig: {
      label: '',
      matIcon: 'home',
      iconFontSet: 'material-icons-outlined',
    },
  },
};

export const Disabled: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Disabled',
      isDisabled: true,
    },
  },
};

export const FontWeight: Story = {
  args: {
    outlineButtonConfig: {
      label: 'Bold Button',
      fontWeight: 800,
    },
  },
};
