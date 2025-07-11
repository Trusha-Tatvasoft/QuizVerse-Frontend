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
    it('should create', () => {
        component.tagConfig = { ...defaultConfig };
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should render label text', () => {
        component.tagConfig = { ...defaultConfig, label: 'Hello Tag' };
        fixture.detectChanges();
        const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;
        expect(tagEl.textContent).toContain('Hello Tag');
    });
    it('should emit onSelect and update isSelected on click when type is selectable', () => {
        const emitSpy = jest.spyOn(component.onSelect, 'emit');
        component.tagConfig = {
            ...defaultConfig,
            type: 'selectable',
            isSelected: false,
            label: 'Selectable Tag',
            id: 'sel-1',
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
    it('should not emit onSelect if already selected', () => {
        const emitSpy = jest.spyOn(component.onSelect, 'emit');
        component.tagConfig = {
            ...defaultConfig,
            type: 'selectable',
            isSelected: true
        };

        fixture.detectChanges();

        const tagEl = fixture.debugElement.query(By.css('.tag'));
        tagEl.triggerEventHandler('click', null);

        expect(emitSpy).not.toHaveBeenCalled();
    });
    it('should emit onClose when close icon is clicked', () => {
        const closeSpy = jest.spyOn(component.onClose, 'emit');
        component.tagConfig = {
            id: 'closable-1',
            label: 'Close Me',
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
    it('should apply static class and not closable class when type is static', () => {
        component.tagConfig = {
            ...defaultConfig,
            type: 'static'
        };
        fixture.detectChanges();

        const tagEl = fixture.debugElement.query(By.css('.tag')).nativeElement;

        expect(tagEl.classList).toContain('static');
        expect(tagEl.classList).toContain('notClosable');
    });
});
