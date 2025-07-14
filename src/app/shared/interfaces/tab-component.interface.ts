import { SafeHtml } from '@angular/platform-browser';

/**
 * Represents the input structure for each tab in TabComponent.
 * Used when configuring tabs dynamically with optional icon and raw HTML string.
 */
export interface TabInput {
  label: string; // Display label for the tab
  icon?: string; // Optional Material icon name for the tab
  content?: string; // Raw HTML content as a string (unsafe by default)
}

/**
 * Represents the view structure for each tab after content sanitization.
 * Used internally for rendering safe HTML with Angular.
 */
export interface TabView {
  label: string; // Display label for the tab
  icon?: string; // Optional Material icon name for the tab
  safeContent?: SafeHtml; // Sanitized HTML content safe for rendering
}
