import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
export type TagColor = 'black' | 'white' | 'lightYellow' | 'brown' | 'lightOrange' | 'lightRed' | 'red' | 'lightGrey' | 'grey' | 'lightGreen' | 'green' | 'lightPurple' | 'purple';
export type TagType = 'selectable' | 'closable' | 'static' | 'hoverable';
@Component({
  selector: 'app-tag',
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss'
})
export class TagComponent {
  private static readonly themeMap: Record<TagColor, string> = {
    black: '#000000',
    white: '#FFFFFF',
    lightYellow: '#FFF7CC',
    brown: '#8B4513',
    lightOrange: '#FFE5CC',
    lightRed: '#f8d7da',
    red: '#a94442',
    lightGrey: '#F1F2F4',
    grey: '#5B5E6D',
    lightGreen: '#DDFBE4',
    green: '#1BA94C',
    lightPurple: '#F3E8FF',
    purple: '#8B3DFF'
  };
  @Input() label: string = '';
  @Input() type: TagType = 'static';
  @Input() selected?: boolean;
  @Input() color: TagColor = 'black';
  @Input() textColor: TagColor = 'white';
  @Input() id: string = '';
  @Output() onSelect = new EventEmitter<{ id: string; label: string; selected: boolean }>();
  @Output() onClose = new EventEmitter<{ id: string; label: string }>();

  onTagClick(): void {
    if (this.type === 'selectable') {
      const currentSelected = this.selected ?? false;
      this.selected = !currentSelected;
      this.onSelect.emit({
        id: this.id,
        label: this.label,
        selected: this.selected ?? false
      });
    }
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    if (this.type === 'closable') {
      this.onClose.emit({
        id: this.id,
        label: this.label
      });
    }
  }

  get isClickable(): boolean {
    return this.type === 'selectable' || this.type === 'hoverable';
  }

  get isClosable(): boolean {
    return this.type === 'closable';
  }

  get isStatic(): boolean {
    return this.type === 'static';
  }

  get isHoverable(): boolean {
    return this.type === 'hoverable';
  }

  getBackgroundColor(): string {
    switch (this.type) {
      case 'selectable':
        return TagComponent.themeMap[this.selected ? this.textColor : this.color];
      case 'closable':
      case 'static':
      case 'hoverable':
        return TagComponent.themeMap[this.color];
    }
  }

  getTextColor(): string {
    switch (this.type) {
      case 'selectable':
        return TagComponent.themeMap[this.selected ? this.color : this.textColor];
      default:
        return TagComponent.themeMap[this.textColor];
    }
  }

  getBorderColor(): string {
    return TagComponent.themeMap[this.textColor];
  }

  get chipClasses(): string {
    const classes = ['tag-chip'];

    if (this.isClickable) {
      classes.push('clickable');
    }

    if (this.isStatic) {
      classes.push('static');
    }

    if (this.isHoverable) {
      classes.push('hoverable');
    }

    if ((this.selected ?? false) && this.type === 'selectable') {
      classes.push('selected');
    }
    return classes.join(' ');
  }
}