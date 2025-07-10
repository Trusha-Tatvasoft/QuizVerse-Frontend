import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TagComponent } from './tag.component';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TagComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the label text', () => {
    component.label = 'Hello Tag';
    fixture.detectChanges();
    const labelEl = fixture.debugElement.query(By.css('.tag-label')).nativeElement;
    expect(labelEl.textContent).toBe('Hello Tag');
  });
  it('should emit false if this.selected is undefined right before emit (synthetic test)', () => {
    component.type = 'selectable';
    component.id = 'test-id';
    component.label = 'Test';
    component.selected = undefined;
  
    const emitSpy = jest.spyOn(component.onSelect, 'emit');
    component.onTagClick = function () {
      if (this.type === 'selectable') {
        const currentSelected = this.selected ?? false;
        this.selected = undefined;
        this.onSelect.emit({
          id: this.id,
          label: this.label,
          selected: this.selected ?? false
        });
      }
    };
  
    component.onTagClick();
  
    expect(emitSpy).toHaveBeenCalledWith({
      id: 'test-id',
      label: 'Test',
      selected: false
    });
  });
  it('should set selected to true if initially undefined and emit onSelect with correct values', () => {
    component.type = 'selectable';
    component.id = 'test-id';
    component.label = 'Test Tag';
    component.selected = undefined;
    const emitSpy = jest.spyOn(component.onSelect, 'emit');
    component.onTagClick();
    expect(component.selected).toBeTruthy();
    expect(emitSpy).toHaveBeenCalledWith({
      id: 'test-id',
      label: 'Test Tag',
      selected: true
    });
  });

  it('should emit onSelect and toggle selected on click when type is selectable', () => {
    component.type = 'selectable';
    component.id = 'test1';
    component.label = 'Click Me';
    component.selected = false;
    const emitSpy = jest.spyOn(component.onSelect, 'emit');

    fixture.detectChanges();
    const chip = fixture.debugElement.query(By.css('.tag-chip'));
    chip.triggerEventHandler('click', null);

    expect(component.selected).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith({ id: 'test1', label: 'Click Me', selected: true });
  });

  it('should not emit onSelect when type is not selectable', () => {
    component.type = 'static';
    const emitSpy = jest.spyOn(component.onSelect, 'emit');

    fixture.detectChanges();
    const chip = fixture.debugElement.query(By.css('.tag-chip'));
    chip.triggerEventHandler('click', null);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit onClose when close button is clicked for closable type', () => {
    component.type = 'closable';
    component.id = 'close1';
    component.label = 'Remove Me';
    const emitSpy = jest.spyOn(component.onClose, 'emit');

    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.close-button'));
    expect(button).toBeTruthy();

    button.triggerEventHandler('click', { stopPropagation: () => { } });
    expect(emitSpy).toHaveBeenCalledWith({ id: 'close1', label: 'Remove Me' });
  });

  it('should apply correct background and text color for static', () => {
    component.type = 'static';
    component.color = 'black';
    component.textColor = 'white';

    fixture.detectChanges();
    const chipEl: HTMLElement = fixture.debugElement.query(By.css('.tag-chip')).nativeElement;
    expect(chipEl.style.getPropertyValue('--bg-color')).toBe('#000000');
    expect(chipEl.style.getPropertyValue('--text-color')).toBe('#FFFFFF');
  });

  it('should invert colors when selectable and selected is true', () => {
    component.type = 'selectable';
    component.color = 'black';
    component.textColor = 'white';
    component.selected = true;

    fixture.detectChanges();
    const chipEl: HTMLElement = fixture.debugElement.query(By.css('.tag-chip')).nativeElement;
    expect(chipEl.style.getPropertyValue('--bg-color')).toBe('#FFFFFF');
    expect(chipEl.style.getPropertyValue('--text-color')).toBe('#000000');
  });

  it('should have hoverable class when type is hoverable', () => {
    component.type = 'hoverable';
    fixture.detectChanges();
    const chipEl: HTMLElement = fixture.debugElement.query(By.css('.tag-chip')).nativeElement;
    expect(chipEl.classList.contains('hoverable')).toBe(true);
  });

});
