import { Type } from '@angular/core';

/**
 * LazyTab
 * -------
 * Interface representing a single tab configuration for lazy loading.
 * - id: Unique tab identifier.
 * - label: Display label for the tab.
 * - icon: Optional Material icon for the tab.
 * - loadChildren: Function returning a Promise resolving to the component Type for lazy loading.
 */
export interface LazyTab {
  id: string;
  label: string;
  icon?: string;
  loadChildren?: () => Promise<Type<any>>; // Dynamic import function for lazy loading
}
