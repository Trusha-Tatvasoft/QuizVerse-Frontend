import { Type } from '@angular/core';

/**
 * LazyTab
 * -------
 * Interface representing a single tab configuration for lazy loading.
 * - id: Unique id.
 * - label: Tab label.
 * - icon: Tab icon.
 * - loadChildren: Function returning a Promise of component Type for lazy loading.
 */
export interface LazyTab {
  id: string;
  label: string;
  icon?: string;
  loadChildren?: () => Promise<Type<any>>;
}
