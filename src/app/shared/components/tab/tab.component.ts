import {
  Component,
  Input,
  Output,
  EventEmitter,
  Type,
  ContentChildren,
  QueryList,
  TemplateRef,
  AfterContentInit,
  Directive,
  ChangeDetectorRef,
  AfterContentChecked,
  Inject,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { LazyTab } from '../../interfaces/tab-component.interface';

/**
 * Directive for projecting content into specific tabs.
 * The directive associates template content with a specific tab ID.
 */
@Directive({
  selector: '[tabContent]',
})
export class TabContentDirective {
  @Input('tabContent') tabId!: string;
  templateRef = inject(TemplateRef<any>);
}

/**
 * Reusable tab component that supports:
 * - Lazy-loaded component tabs (dynamic)
 * - Static content projection (via ng-template)
 */
@Component({
  selector: 'app-common-tab',
  imports: [CommonModule, MatTabsModule, MatIconModule, TabContentDirective],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
})
export class TabComponent implements AfterContentInit, AfterContentChecked {
  @Input() tabs: LazyTab[] = []; // Array of tab definitions
  @Input() selectedIndex = 0; // Currently selected tab index
  @Input() templates?: { [key: string]: TemplateRef<any> }; // Optional templates input specifically for Storybook compatibility.

  @Output() tabChanged = new EventEmitter<number>(); // Event emitted when the active tab changes

  loadedComponents = new Map<string, Type<any>>(); // Map of lazy-loaded components by tab ID
  templateMap = new Map<string, TemplateRef<any>>(); // Map of content templates by tab ID (for static content)
  templatesInitialized = false; // Flag to track if templates have been initialized

  @ContentChildren(TabContentDirective) tabContentDirectives!: QueryList<TabContentDirective>; // Query list of all projected tab content directives

  cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef for manual change detection

  /**
   * Loads the initial tab component if it's a lazy-loaded tab
   */
  async ngAfterContentInit() {
    const initialTab = this.tabs[this.selectedIndex];
    if (initialTab?.loadChildren && !this.loadedComponents.has(initialTab.id)) {
      const component = await initialTab.loadChildren();
      this.loadedComponents.set(initialTab.id, component);
    }
  }

  /**
   * Sets up content templates for static tabs
   */
  ngAfterContentChecked() {
    if (this.tabContentDirectives?.length) {
      this.tabContentDirectives.forEach((directive) => {
        if (directive.tabId && !this.templateMap.has(directive.tabId)) {
          this.templateMap.set(directive.tabId, directive.templateRef);
        }
      });

      if (!this.templatesInitialized) {
        this.templatesInitialized = true;
        this.cdr.detectChanges();
      }
    }
  }

  /**
   * Handles tab change events
   * @param event The tab change event containing the new index
   */
  async onTabChange(event: any) {
    this.selectedIndex = event.index;
    this.tabChanged.emit(event.index);

    const tab = this.tabs[event.index];
    if (tab?.loadChildren && !this.loadedComponents.has(tab.id)) {
      const component = await tab.loadChildren();
      this.loadedComponents.set(tab.id, component);
    }
  }

  /**
   * Gets a loaded component for a tab
   * @param tabId The ID of the tab
   * @returns The component class or null if not loaded
   */
  getLoadedComponent(tabId: string): Type<any> | null {
    return this.loadedComponents.get(tabId) ?? null;
  }

  /**
   * Gets a content template for a tab
   * Prioritizes templates passed via @Input() for Storybook compatibility
   * @param tabId The ID of the tab
   * @returns The template reference or null if not found
   */
  getTemplate(tabId: string): TemplateRef<any> | null {
    if (this.templates?.[tabId]) {
      return this.templates[tabId];
    }
    return this.templateMap.get(tabId) ?? null;
  }
}
