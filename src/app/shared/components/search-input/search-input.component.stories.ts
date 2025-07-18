import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SearchInputComponent } from './search-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/**
 * Storybook configuration for SearchInputComponent.
 * Defines visual and interactive states for different placeholder and border styles,
 * allowing isolated testing and documentation of the search input component.
 */
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

  /**
   * Shared render function to display the SearchInputComponent with dynamic args.
   * Includes live display of the current control value for visual verification.
   */
  render: (args) => {
    const control = new FormControl('');
    return {
      props: {
        ...args,
        control,

        search: (query: string) => {
          //Emitted when a search is triggered within the component.
        },
      },
      template: `
        <div style="padding: 10px 0; text-align: center;">
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

  /**
   * argTypes for controlling and documenting dynamic inputs in Storybook.
   */
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

// SearchInputComponent Story: Quizzes
export const Quizzes: Story = {
  args: {
    placeholder: 'Search quizzes...',
    borderClass: 'search-purple',
  },
};

//SearchInputComponent Story: Users
export const Users: Story = {
  args: {
    placeholder: 'Search users...',
  },
};

// SearchInputComponent Story: Reports
export const Reports: Story = {
  args: {
    placeholder: 'Search reports...',
    borderClass: 'search-black',
  },
};

//SearchInputComponent Story: Battles
export const Battles: Story = {
  args: {
    placeholder: 'Search battles...',
    borderClass: 'search-black',
  },
};

// SearchInputComponent Story: Questions
export const Questions: Story = {
  args: {
    placeholder: 'Search questions...',
    borderClass: 'search-black',
  },
};

// SearchInputComponent Story: Difficulties
export const Difficulties: Story = {
  args: {
    placeholder: 'Search difficulties...',
    borderClass: 'search-black',
  },
};
