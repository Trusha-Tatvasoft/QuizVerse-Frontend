import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputConfig } from '../../interfaces/tag-component.interface';
import { TagColor } from '../../../utils/types/tag-component.type';

@Component({
  selector: 'app-tag',
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent {
  @Input() tagConfig: TagInputConfig = {
    id: '',
    label: '',
    type: 'static',
    isSelected: false,
    hasBorder: false,
    backgroundColor: 'black',
    textColor: 'white',
  };
  @Output() tagSelected = new EventEmitter<{ id: string; label: string; isSelected: boolean }>();
  @Output() tagClosed = new EventEmitter<{ id: string; label: string }>();

  onTagClick(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.tagConfig.type !== 'selectable') {
      return;
    }
    this.tagConfig.isSelected = !this.tagConfig.isSelected;
    if (this.tagConfig.isSelected) {
      this.tagSelected.emit({
        id: this.tagConfig.id,
        label: this.tagConfig.label,
        isSelected: true,
      });
    } else {
      this.tagClosed.emit({
        id: this.tagConfig.id,
        label: this.tagConfig.label,
      });
    }
  }

  get isClickable(): boolean {
    return this.tagConfig.type === 'selectable' && !this.tagConfig.isSelected;
  }

  get isClosable(): boolean {
    return this.tagConfig.type === 'selectable' && this.tagConfig.isSelected;
  }

  get isStatic(): boolean {
    return this.tagConfig.type === 'static';
  }

  get chipClasses(): string[] {
    const classes = ['tag'];
    if (this.isClickable) classes.push('clickable');
    if (this.isClosable) classes.push('closable', 'selected');
    if (!this.isClosable) classes.push('not-closable');
    if (this.isStatic) classes.push('static');
    if (this.tagConfig.hasBorder) classes.push('bordered');
    classes.push(this.getBackgroundClass());
    classes.push(this.getTextClass());
    return classes;
  }

  private formatColor(color: TagColor): string {
    return color.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
  }

  private getBackgroundClass(): string {
    const color = this.tagConfig.isSelected
      ? this.formatColor(this.tagConfig.textColor)
      : this.formatColor(this.tagConfig.backgroundColor);
    return `bg-${color}`;
  }

  private getTextClass(): string {
    const color = this.tagConfig.isSelected
      ? this.formatColor(this.tagConfig.backgroundColor)
      : this.formatColor(this.tagConfig.textColor);
    return `text-${color}`;
  }
}
