import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TabInput, TabView } from '../../interfaces/tab-component.interface';

/**
 * TabComponent
 * ------------
 * Reusable, standalone common tab component using Angular Material.
 * Supports dynamic tab labels, optional icons, and safe HTML content.
 * Emits `tabChanged` on index change for parent components to handle.
 */

@Component({
  selector: 'app-common-tab',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, NgIf, NgFor],
  templateUrl: './tab-component.component.html',
  styleUrls: ['./tab-component.component.scss'],
})
export class TabComponent {
  /** Input Decorators **/
  @Input() set tabs(value: TabInput[] | undefined) {
    this._tabs = (value ?? []).map((tab) => ({
      label: tab.label,
      icon: tab.icon,
      safeContent: tab.content ? this.sanitizer.bypassSecurityTrustHtml(tab.content) : undefined,
    }));
  } /** Dynamic tabs input: array of label, icon, and HTML content. Defaults to empty array if undefined. */
  @Input() selectedIndex: number = 0; /** Initially selected tab index */

  /** Emits the new selected index when the tab changes */
  @Output() tabChanged = new EventEmitter<number>();

  /** Backing field for tabs */
  private _tabs: TabView[] = [];

  /** DomSanitizer to safely inject HTML into tabs */
  constructor(private readonly sanitizer: DomSanitizer) {}

  /** Getter for processed tabs with safe HTML content for rendering in the template. */
  get tabs(): TabView[] {
    return this._tabs;
  }

  /** Emits `tabChanged` with the selected tab index when user switches tabs */
  onTabChange(index: number) {
    this.tabChanged.emit(index);
  }
}
