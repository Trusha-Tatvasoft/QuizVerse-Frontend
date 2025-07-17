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
  selector: 'storybook-tab-content-1',
  template: `<div class="p-4 bg-blue-50 rounded-lg">
    <h3 class="text-blue-600 font-bold">Dynamic Tab 1 Content</h3>
    <p class="text-blue-800">This content was loaded dynamically</p>
  </div>`,
})
class TabContent1Component {}

@Component({
  standalone: true,
  selector: 'storybook-tab-content-2',
  template: `<div class="p-4 bg-green-50 rounded-lg">
    <h3 class="text-green-600 font-bold">Dynamic Tab 2 Content</h3>
    <p class="text-green-800">This content was loaded dynamically</p>
  </div>`,
})
class TabContent2Component {}

/**
 * Storybook host wrapper for TabComponent
 * Provides static templates and dynamic tab injection for testing visuals in isolation.
 */
@Component({
  standalone: true,
  imports: [CommonModule, TabComponent, TabContentDirective, FilledButtonComponent],
  selector: 'storybook-tab-host',
  template: `
    <!-- Static templates -->
    <ng-template #static1>
      <div class="p-4 bg-yellow-50 rounded-lg">
        <h3 class="text-yellow-600 font-bold">Static Tab Content</h3>
        <p class="text-yellow-800">This static content is shown in Storybook.</p>
      </div>
    </ng-template>

    <ng-template #staticA>
      <div class="p-4 bg-purple-50 rounded-lg">
        <h3 class="text-purple-600 font-bold">Static Tab A</h3>
        <p class="text-purple-800">First static tab in Storybook</p>
      </div>
    </ng-template>

    <ng-template #staticB>
      <div class="p-4 bg-red-50 rounded-lg">
        <h3 class="text-red-600 font-bold">Static Tab B</h3>
        <p class="text-red-800">Second static tab in Storybook</p>
      </div>
    </ng-template>

    <ng-template #staticC>
      <div class="p-4 bg-indigo-50 rounded-lg">
        <h3 class="text-indigo-600 font-bold">Static Tab C</h3>
        <p class="text-indigo-800">Third static tab in Storybook</p>
      </div>
    </ng-template>

    <ng-template #filledButton>
      <div class="text-center text-gray-600 mt-8 italic text-lg max-w-xl mx-auto">
        <app-filled-button [filledButtonConfig]="playButton"></app-filled-button>
        <p class="mt-4">Button component rendered in static tab</p>
      </div>
    </ng-template>

    <!-- Tab component with explicit templates passed -->
    <app-common-tab
      [tabs]="tabs"
      [selectedIndex]="selectedIndex"
      [templates]="templateMap"
      (tabChanged)="tabChanged($event)"
    >
    </app-common-tab>
  `,
})
class StorybookTabHostComponent implements AfterViewInit {
  tabs: LazyTab[] = [];
  selectedIndex = 0;
  /**
   * Populated with references to ng-template blocks for static tabs
   * Allows the TabComponent to resolve templates by ID.
   */
  templateMap: { [key: string]: TemplateRef<any> } = {};

  @ViewChild('static1') static1Template!: TemplateRef<any>;
  @ViewChild('staticA') staticATemplate!: TemplateRef<any>;
  @ViewChild('staticB') staticBTemplate!: TemplateRef<any>;
  @ViewChild('staticC') staticCTemplate!: TemplateRef<any>;
  @ViewChild('filledButton') filledButtonTemplate!: TemplateRef<any>;

  ngAfterViewInit() {
    this.templateMap = {
      'static-1': this.static1Template,
      'static-a': this.staticATemplate,
      'static-b': this.staticBTemplate,
      'static-c': this.staticCTemplate,
      'filled-button': this.filledButtonTemplate,
    };
  }

  playButton: ButtonConfig = {
    label: 'Start Playing Now',
    matIcon: 'play_arrow',
    iconFontSet: 'material-icons',
    imagePosition: 'left',
    fontWeight: 500,
    variant: 'gradient',
  };

  tabChanged(index: number) {
    // console.log('Tab changed:', index);
  }
}

/**
 * Storybook metadata configuration
 */
const meta: Meta<StorybookTabHostComponent> = {
  title: 'Components/TabComponent',
  component: StorybookTabHostComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        TabComponent,
        TabContentDirective,
        TabContent1Component,
        TabContent2Component,
        FilledButtonComponent,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<StorybookTabHostComponent>;

/**
 * Base tab definitions used across stories
 * Combines dynamic and static tab examples for flexible configurations.
 */
const baseTabs: LazyTab[] = [
  {
    id: 'dynamic-1',
    label: 'Dynamic 1',
    icon: 'star',
    loadChildren: () => Promise.resolve(TabContent1Component as Type<any>),
  },
  {
    id: 'dynamic-2',
    label: 'Dynamic 2',
    icon: 'favorite',
    loadChildren: () => Promise.resolve(TabContent2Component as Type<any>),
  },
  {
    id: 'static-1',
    label: 'Static Content',
    icon: 'text_snippet',
  },
  {
    id: 'static-a',
    label: 'Static A',
    icon: 'looks_one',
  },
  {
    id: 'static-b',
    label: 'Static B',
    icon: 'looks_two',
  },
  {
    id: 'static-c',
    label: 'Static C',
    icon: 'looks_3',
  },
  {
    id: 'filled-button',
    label: 'Button Component Static',
    icon: 'play_arrow',
  },
];

/**
 * Individual Storybook stories for different tab configurations
 */
export const DynamicTabsOnly: Story = {
  args: {
    tabs: baseTabs.filter((t) => t.loadChildren),
    selectedIndex: 0,
  },
};

export const MixedTabs: Story = {
  args: {
    tabs: baseTabs.slice(0, 3),
    selectedIndex: 2,
  },
};

export const AllStaticTabs: Story = {
  args: {
    tabs: baseTabs.slice(3),
    selectedIndex: 0,
  },
};

export const ComplexTabs: Story = {
  args: {
    tabs: baseTabs,
    selectedIndex: 0,
  },
};
