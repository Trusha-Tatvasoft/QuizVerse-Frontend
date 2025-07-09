import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SearchInputComponent } from './search-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const meta: Meta<SearchInputComponent> = {
  title: 'Components/SearchInput',
  component: SearchInputComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule),
      ],
    }),
  ],
  render: (args) => {
    const control = new FormControl('');
    return {
      props: {
        ...args,
        control,
        search: (query: string) => {
          console.log('Search emitted:', query);
        },
      },
      template: `
        <div style="padding: 10px 0px; text-align: center;">
          <app-search-input
            [placeholder]="placeholder"
            [control]="control"
            (search)="search($event)"
            [borderClass]="borderClass"
          ></app-search-input>
        </div>

        <div style="margin-top: 1rem;">
          <h4>Current Value:</h4>
          <pre>{{ control.value }}</pre>
        </div>
      `,
    };
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
      defaultValue: 'Search...',
    },
    borderClass: {
      control: 'text',
      description: 'CSS class for the border styling of the input',
      defaultValue: '',
    },
  },
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Quizzes: Story = {
  args: {
    placeholder: 'Search quizzes...',
    borderClass: 'search-purple',
  },
};

export const Users: Story = {
  args: {
    placeholder: 'Search users...',
    borderClass: 'search-purple',
  },
};

export const Reports: Story = {
  args: {
    placeholder: 'Search reports...',
    borderClass: 'search-black',
  },
};

export const Battles: Story = {
  args: {
    placeholder: 'Search battles...',
    borderClass: 'search-black',
  },
};

export const Questions: Story = {
  args: {
    placeholder: 'Search questions...',
    borderClass: 'search-black',
  },
};

export const Difficulties: Story = {
  args: {
    placeholder: 'Search difficulties...',
    borderClass: 'search-black',
  },
};
