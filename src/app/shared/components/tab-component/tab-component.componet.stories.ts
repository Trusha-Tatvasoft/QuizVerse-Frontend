import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { importProvidersFrom } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TabComponentComponent } from './tab-component.component';

const meta: Meta<TabComponentComponent> = {
  title: 'Components/CommonTab',
  component: TabComponentComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(MatTabsModule, MatIconModule)],
    }),
  ],
  argTypes: {
    selectedIndex: {
      control: { type: 'number', min: 0 },
      description: 'Index of the initially selected tab',
    },
  },
};

export default meta;
type Story = StoryObj<TabComponentComponent>;

export const SimpleContentTabs: Story = {
  args: {
    selectedIndex: 0,
    tabs: [
      {
        label: 'Home',
        icon: 'home',
        content: `
          <div class="p-4">
            <h3 class="font-bold text-lg mb-2">Welcome!</h3>
            <p>This is simple HTML content in the Home tab.</p>
            <p class="mt-2 text-blue-600">You can use basic HTML tags and Tailwind classes.</p>
          </div>
        `,
      },
      {
        label: 'About',
        content: `
          <div class="p-4 bg-gray-50 rounded">
            <h3 class="font-bold mb-2">About Us</h3>
            <p>Company information goes here.</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Founded in 2020</li>
              <li>50+ Employees</li>
            </ul>
          </div>
        `,
      },
    ],
  },
};

export const DashboardContentTabs: Story = {
  args: {
    selectedIndex: 1,
    tabs: [
      {
        label: 'Stats',
        icon: 'analytics',
        content: `
          <div class="grid grid-cols-2 gap-4 p-4 ">
            <div class="bg-white p-4 rounded-lg shadow">
              <h4 class="font-medium text-gray-500">Users</h4>
              <p class="text-2xl font-bold">1,234</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <h4 class="font-medium text-gray-500">Revenue</h4>
              <p class="text-2xl font-bold">$12,345</p>
            </div>
          </div>
        `,
      },
      {
        label: 'Activity',
        icon: 'timeline',
        content: `
          <div class="p-4">
            <div class="h-40 bg-gray-100 rounded flex items-center justify-center">
              [Activity chart would render here]
            </div>
            <p class="mt-2 text-sm text-gray-600">Recent user activity</p>
          </div>
        `,
      },
    ],
  },
};

export const FormContentTabs: Story = {
  args: {
    tabs: [
      {
        label: 'Login',
        icon: 'login',
        content: `
          <div class="p-4 space-y-4 bg-gray-50 rounded">
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input type="email" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Password</label>
              <input type="password" class="w-full px-3 py-2 border rounded">
            </div>
            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Sign In
            </button>
          </div>
        `,
      },
      {
        label: 'Register',
        icon: 'person_add',
        content: `
          <div class="p-4 space-y-3 bg-gray-50 rounded">
            <p class="text-lg font-medium">Create Account</p>
            <div>
              <label class="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input type="email" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Password</label>
              <input type="password" class="w-full px-3 py-2 border rounded">
            </div>
            <button class="mt-2 px-4 py-2 bg-green-400 text-white rounded hover:bg-green-600 transition-colors">
              Register
            </button>
          </div>
        `,
      },
    ],
  },
};

export const NoIcons: Story = {
  args: {
    selectedIndex: 0,
    tabs: [
      {
        label: 'First Tab',
        content: `
          <div class="p-4 bg-blue-200 rounded-lg">
            <h3 class="font-bold text-lg mb-2">First Tab Content</h3>
            <p>This tab doesn't have an icon</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Simple content structure</li>
              <li>Pure HTML string</li>
              <li>No TemplateRef needed</li>
            </ul>
          </div>
        `,
      },
      {
        label: 'Second Tab',
        content: `
          <div class="p-4 bg-green-200 rounded-lg">
            <h3 class="font-bold text-lg mb-2">Second Tab Content</h3>
            <p>Another tab without icons</p>
            <div class="mt-3 p-2 bg-white rounded border">
              <p class="text-sm">Notice there are no icons in the tab labels</p>
            </div>
          </div>
        `,
      },
    ],
  },
};
