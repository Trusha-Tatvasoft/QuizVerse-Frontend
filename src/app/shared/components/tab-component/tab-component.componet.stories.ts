import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { importProvidersFrom } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TabComponent } from './tab-component.component';
import { TabInput } from '../../interfaces/tab-component.interface';

/**
 * Storybook configuration for TabComponent.
 * Documents and visually tests tab structures with HTML content, icons, and dynamic variations.
 */
const meta: Meta<TabComponent> = {
  title: 'Components/CommonTab',
  component: TabComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(MatTabsModule, MatIconModule)],
    }),
  ],

  /**
   * argTypes for controlling and documenting dynamic inputs in Storybook.
   */
  argTypes: {
    selectedIndex: {
      control: { type: 'number', min: 0 },
      description: 'Index of the initially selected tab',
    },
  },
};

export default meta;
type Story = StoryObj<TabComponent>;

/**
 * TabComponent Story: SimpleContentTabs
 * Demonstrates basic tabs with HTML content and optional icons.
 */
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
      } as TabInput,
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
      } as TabInput,
    ],
  },
};

/**
 * TabComponent Story: DashboardContentTabs
 * Demonstrates tabs used in dashboards with analytics and activity sections.
 */
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
      } as TabInput,
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
      } as TabInput,
    ],
  },
};

/**
 * TabComponent Story: FormContentTabs
 * Demonstrates forms within tab structures for login and registration flows.
 */
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
      } as TabInput,
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
      } as TabInput,
    ],
  },
};

/**
 * TabComponent Story: NoIcons
 * Demonstrates tabs without using icons to keep the UI clean.
 */
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
      } as TabInput,
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
      } as TabInput,
    ],
  },
};
