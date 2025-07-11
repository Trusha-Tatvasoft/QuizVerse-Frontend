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
    filledButtonConfig: {
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
    filledButtonConfig: {
      label: 'Home',
      matIcon: 'home',
      iconFontSet: 'material-icons',
      imagePosition: 'left',
    },
  },
};

export const RightIcon: Story = {
  args: {
    filledButtonConfig: {
      label: 'Next',
      matIcon: 'arrow_forward',
      imagePosition: 'right',
    },
  },
};

export const WithImage: Story = {
  args: {
    filledButtonConfig: {
      label: 'GitHub',
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    },
  },
};

export const IconOnly: Story = {
  args: {
    filledButtonConfig: {
      label: '',
      matIcon: 'star',
      iconFontSet: 'material-icons',
    },
  },
};

export const OutlineIconOnly: Story = {
  args: {
    filledButtonConfig: {
      label: '',
      matIcon: 'home',
      iconFontSet: 'material-icons-outlined',
    },
  },
};

export const Disabled: Story = {
  args: {
    filledButtonConfig: {
      label: 'Disabled',
      isDisabled: true,
    },
  },
};

export const FontWeight: Story = {
  args: {
    filledButtonConfig: {
      label: 'Bold Button',
      fontWeight: 800,
    },
  },
};
