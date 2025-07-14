import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TagComponent, TagInputConfig } from './tag.component';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  const defaultConfig: TagInputConfig = {
    id: 'tag-1',
    label: 'Test Tag',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightGreen',
    textColor: 'black'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    component.tagConfig = { ...defaultConfig };
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the tag label', () => {
    component.tagConfig = { ...defaultConfig, label: 'Hello Tag' };
    fixture.detectChanges();
    const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;
    expect(tagEl.textContent).toContain('Hello Tag');
  });

  it('should emit tagSelected and toggle isSelected on click when type is selectable', () => {
    const emitSpy = jest.spyOn(component.tagSelected, 'emit');
    component.tagConfig = {
      ...defaultConfig,
      type: 'selectable',
      isSelected: false,
      id: 'sel-1',
      label: 'Selectable Tag'
    };
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.tag'));
    tagEl.triggerEventHandler('click', null);

    expect(component.tagConfig.isSelected).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith({
      id: 'sel-1',
      label: 'Selectable Tag',
      isSelected: true,
    });
  });

  it('should emit tagClosed when already selected and clicked again', () => {
    const closeSpy = jest.spyOn(component.tagClosed, 'emit');
    component.tagConfig = {
      ...defaultConfig,
      type: 'selectable',
      isSelected: true,
      id: 'sel-1',
      label: 'Closeable Tag'
    };
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.tag'));
    tagEl.triggerEventHandler('click', null);

    expect(closeSpy).toHaveBeenCalledWith({
      id: 'sel-1',
      label: 'Closeable Tag',
    });
  });

  it('should emit tagClosed when close icon is clicked', () => {
    const closeSpy = jest.spyOn(component.tagClosed, 'emit');
    component.tagConfig = {
      id: 'closable-1',
      label: 'Close Me',
      hasBorder: false,
      type: 'selectable',
      isSelected: true,
      backgroundColor: 'green',
      textColor: 'white',
    };
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(By.css('.tag-close'));
    expect(closeBtn).not.toBeNull();

    closeBtn!.triggerEventHandler('click', {
      stopPropagation: () => { }
    });

    expect(closeSpy).toHaveBeenCalledWith({
      id: 'closable-1',
      label: 'Close Me'
    });
  });

  it('should apply correct classes when selected', () => {
    component.tagConfig = {
      ...defaultConfig,
      type: 'selectable',
      isSelected: true
    };
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;
    expect(tagEl.classList).toContain('selected');
    expect(tagEl.classList).toContain('closable');
    expect(tagEl.classList).toContain('bg-black');
    expect(tagEl.classList).toContain('text-light-green');
  });

  it('should apply static and not-closable classes when type is static', () => {
    component.tagConfig = {
      ...defaultConfig,
      type: 'static'
    };
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;
    expect(tagEl.classList).toContain('static');
    expect(tagEl.classList).toContain('not-closable');
  });

  it('should apply bordered class when isBorder is true', () => {
    component.tagConfig = {
      ...defaultConfig,
      hasBorder: true
    };
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;
    expect(tagEl.classList).toContain('bordered');
  });

  it('should not apply bordered class when isBorder is false', () => {
    component.tagConfig = {
      ...defaultConfig,
      hasBorder: false
    };
    fixture.detectChanges();

    const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;
    expect(tagEl.classList).not.toContain('bordered');
  });
});
