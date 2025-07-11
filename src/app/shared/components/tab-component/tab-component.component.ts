import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-common-tab',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, NgIf, NgFor],
  templateUrl: './tab-component.component.html',
  styleUrls: ['./tab-component.component.scss'],
})
export class TabComponentComponent {
  @Input() set tabs(value: { label: string; icon?: string; content?: string }[] | undefined) {
    this._tabs = (value ?? []).map((tab) => ({
      ...tab,
      safeContent: tab.content ? this.sanitizer.bypassSecurityTrustHtml(tab.content) : undefined,
    }));
  }

  get tabs() {
    return this._tabs;
  }
  private _tabs: { label: string; icon?: string; safeContent?: SafeHtml }[] = [];

  @Input() selectedIndex: number = 0;
  @Output() tabChanged = new EventEmitter<number>();

  constructor(private readonly sanitizer: DomSanitizer) {}

  onTabChange(index: number) {
    this.tabChanged.emit(index);
  }
}
