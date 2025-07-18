import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component, Type, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent, TabContentDirective } from './tab.component';
import { LazyTab } from '../../interfaces/tab-component.interface';
import { FilledButtonComponent } from '../filled-button/filled-button.component';
import { ButtonConfig } from '../../interfaces/button-config.interface';

/**
 * Example dynamic components to simulate dynamic tab loading in Storybook.
 */
@Component({
  standalone: true,
  selector: 'app-user-profile-tab',
  template: `<div class="p-4 bg-blue-50 rounded-lg">
    <h3 class="text-blue-600 font-bold">User Profile</h3>
    <p class="text-blue-800">This section displays user profile details dynamically.</p>
  </div>`,
})
class UserProfileTabComponent {}

@Component({
  standalone: true,
  selector: 'app-settings-tab',
  template: `<div class="p-4 bg-green-50 rounded-lg">
    <h3 class="text-green-600 font-bold">Settings</h3>
    <p class="text-green-800">This section allows users to manage their settings dynamically.</p>
  </div>`,
})
class SettingsTabComponent {}

/**
 * Storybook host wrapper for TabComponent
 * Provides static templates and dynamic tab injection for testing visuals in isolation.
 */

@Component({
  standalone: true,
  selector: 'app-storybook-tab-host',
  imports: [CommonModule, TabComponent, TabContentDirective, FilledButtonComponent],
  template: `
    <!-- Static Tab: Welcome -->
    <ng-template #welcomeTab>
      <div class="p-4 bg-yellow-50 rounded-lg">
        <h3 class="text-yellow-600 font-bold text-lg">Welcome</h3>
        <p class="text-yellow-800">Welcome to the Storybook tab showcase with static content.</p>
      </div>
    </ng-template>

    <!-- Static Tab: Features -->
    <ng-template #featuresTab>
      <div class="p-4 bg-purple-50 rounded-lg">
        <h3 class="text-purple-600 font-bold text-lg">Features</h3>
        <p class="text-purple-800">
          This tab highlights the main features provided by the component.
        </p>
      </div>
    </ng-template>

    <!-- Static Tab: Usage -->
    <ng-template #usageTab>
      <div class="p-4 bg-red-50 rounded-lg">
        <h3 class="text-red-600 font-bold text-lg">Usage</h3>
        <p class="text-red-800">Guidelines on how to use the tabs effectively in your project.</p>
      </div>
    </ng-template>

    <!-- Static Tab: Examples -->
    <ng-template #examplesTab>
      <div class="p-4 bg-indigo-50 rounded-lg">
        <h3 class="text-indigo-600 font-bold text-lg">Examples</h3>
        <p class="text-indigo-800">
          Practical examples of tab content displayed using this structure.
        </p>
      </div>
    </ng-template>

    <!-- Static Tab: Call to Action Button -->
    <ng-template #ctaButtonTab>
      <div class="flex flex-col items-center justify-center p-8 bg-green-50 rounded-lg text-center">
        <app-filled-button [filledButtonConfig]="playButtonConfig"></app-filled-button>
        <p class="mt-4 text-green-800 text-base">
          Click the button above to start exploring features.
        </p>
      </div>
    </ng-template>

    <!-- Main Tab Component -->
    <app-common-tab
      [tabs]="tabs"
      [selectedIndex]="selectedIndex"
      [templates]="templateMap"
      (tabChanged)="onTabChanged($event)"
    >
    </app-common-tab>
  `,
})
export class StorybookTabHostComponent implements AfterViewInit {
  /**
   * Holds the list of tabs to display.
   */
  tabs: LazyTab[] = [
    { id: 'welcome-tab', label: 'Welcome' },
    { id: 'features-tab', label: 'Features' },
    { id: 'usage-tab', label: 'Usage' },
    { id: 'examples-tab', label: 'Examples' },
    { id: 'cta-button-tab', label: 'Get Started' },
  ];

  /** Default selected tab index */
  selectedIndex = 0;

  /**
   * Maps template IDs to their corresponding TemplateRef.
   */
  templateMap: { [key: string]: TemplateRef<any> } = {};

  /** ViewChild references to the templates above */
  @ViewChild('welcomeTab') welcomeTabRef!: TemplateRef<any>;
  @ViewChild('featuresTab') featuresTabRef!: TemplateRef<any>;
  @ViewChild('usageTab') usageTabRef!: TemplateRef<any>;
  @ViewChild('examplesTab') examplesTabRef!: TemplateRef<any>;
  @ViewChild('ctaButtonTab') ctaButtonTabRef!: TemplateRef<any>;

  /**
   * Button configuration for the call-to-action button inside the last tab.
   */
  playButtonConfig: ButtonConfig = {
    label: 'Start Now',
    matIcon: 'play_arrow',
    iconFontSet: 'material-icons',
    imagePosition: 'left',
    fontWeight: 600,
    variant: 'gradient',
  };

  ngAfterViewInit(): void {
    this.templateMap = {
      'welcome-tab': this.welcomeTabRef,
      'features-tab': this.featuresTabRef,
      'usage-tab': this.usageTabRef,
      'examples-tab': this.examplesTabRef,
      'cta-button-tab': this.ctaButtonTabRef,
    };
  }

  onTabChanged(index: number): void {
    // Logs the selected tab index when the user changes tabs.
  }
}

/**
 * Storybook metadata configuration for StorybookTabHostComponent
 */
const meta: Meta<StorybookTabHostComponent> = {
  title: 'Components/Tabs',
  component: StorybookTabHostComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        TabComponent,
        TabContentDirective,
        FilledButtonComponent,
        UserProfileTabComponent,
        SettingsTabComponent,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<StorybookTabHostComponent>;

/**
 * Base tab definitions used across stories
 * Includes dynamic and static tabs for flexible showcases.
 */
const baseTabs: LazyTab[] = [
  {
    id: 'dynamic-1',
    label: 'Dynamic: User Profile',
    icon: 'person',
    loadChildren: () => Promise.resolve(UserProfileTabComponent as Type<any>),
  },
  {
    id: 'dynamic-2',
    label: 'Dynamic: Settings',
    icon: 'settings',
    loadChildren: () => Promise.resolve(SettingsTabComponent as Type<any>),
  },
  {
    id: 'welcome-tab',
    label: 'Welcome',
    icon: 'home',
  },
  {
    id: 'features-tab',
    label: 'Features',
    icon: 'star',
  },
  {
    id: 'usage-tab',
    label: 'Usage',
    icon: 'build',
  },
  {
    id: 'examples-tab',
    label: 'Examples',
    icon: 'lightbulb',
  },
  {
    id: 'cta-button-tab',
    label: 'Get Started',
    icon: 'play_arrow',
  },
];

/**
 * Story: Dynamic Tabs Only
 */
export const DynamicTabsOnly: Story = {
  args: {
    tabs: baseTabs.filter((tab) => !!tab.loadChildren),
    selectedIndex: 0,
  },
};

/**
 * Story: Static Tabs Only
 */
export const AllStaticTabs: Story = {
  args: {
    tabs: baseTabs.filter((tab) => !tab.loadChildren),
    selectedIndex: 0,
  },
};

/**
 * Story: Mixed Tabs (First 3 Tabs)
 */
export const MixedTabs: Story = {
  args: {
    tabs: baseTabs.slice(0, 3),
    selectedIndex: 1,
  },
};

/**
 * Story: Complex Tabs (All Tabs)
 */
export const ComplexTabs: Story = {
  args: {
    tabs: baseTabs,
    selectedIndex: 0,
  },
};
