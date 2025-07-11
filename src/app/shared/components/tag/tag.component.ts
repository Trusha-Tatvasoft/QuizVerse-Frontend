import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
export type TagColor =
  | 'black' | 'white' | 'lightYellow' | 'brown' | 'lightOrange'
  | 'lightRed' | 'red' | 'lightGrey' | 'grey'
  | 'lightGreen' | 'green' | 'lightPurple' | 'purple';

export type TagType = 'selectable' | 'static';
export interface TagInputConfig {
  id: string;
  label: string;
  type: TagType;
  isSelected: boolean;
  backgroundColor: TagColor;
  textColor: TagColor;
}
@Component({
  selector: 'app-tag',
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent {
  @Input() tagConfig: TagInputConfig = {
    id: '',
    label: '',
    type: 'static',
    isSelected: false,
    backgroundColor: 'black',
    textColor: 'white'
  };

  @Output() onSelect = new EventEmitter<{ id: string; label: string; isSelected: boolean }>();
  @Output() onClose = new EventEmitter<{ id: string; label: string }>();

  onTagClick(): void {
    if (this.tagConfig.type === 'selectable' && !this.tagConfig.isSelected) {
      this.tagConfig.isSelected = true;
      this.onSelect.emit({
        id: this.tagConfig.id,
        label: this.tagConfig.label,
        isSelected: true
      });
    }
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    if (this.tagConfig.type === 'selectable' && this.tagConfig.isSelected) {
      this.tagConfig.isSelected = false;
      this.onClose.emit({
        id: this.tagConfig.id,
        label: this.tagConfig.label
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
    classes.push(this.getBackgroundClass());
    classes.push(this.getTextClass());
    return classes;
  }

  private formatColor(color: TagColor): string {
    return color.replace(/[A-Z]/g, match => '-' + match.toLowerCase());
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
