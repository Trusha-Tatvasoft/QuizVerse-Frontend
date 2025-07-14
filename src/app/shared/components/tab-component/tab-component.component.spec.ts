import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TabComponentComponent } from './tab-component.component';
import { By } from '@angular/platform-browser';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';

describe('TabComponentComponent', () => {
  let component: TabComponentComponent;
  let fixture: ComponentFixture<TabComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTabsModule, MatIconModule, TabComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabComponentComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the provided tabs with labels', fakeAsync(() => {
    component.tabs = [
      { label: 'Tab 1', content: '<span>Content 1</span>' },
      { label: 'Tab 2', content: '<span>Content 2</span>' },
    ];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab__content'));
    expect(tabLabels.length).toBe(2);
    expect(tabLabels[0].nativeElement.textContent).toContain('Tab 1');
    expect(tabLabels[1].nativeElement.textContent).toContain('Tab 2');
  }));

  it('should render icons when provided', () => {
    component.tabs = [
      { label: 'Tab A', icon: 'home', content: '<span>Content A</span>' },
      { label: 'Tab B', icon: 'person', content: '<span>Content B</span>' },
    ];
    fixture.detectChanges();

    const icons = fixture.debugElement.queryAll(By.directive(MatIcon));
    expect(icons.length).toBe(2);
    expect(icons[0].nativeElement.textContent).toContain('home');
    expect(icons[1].nativeElement.textContent).toContain('person');
  });

  it('should emit tabChanged when tab changes', fakeAsync(() => {
    component.tabs = [
      { label: 'Tab X', content: 'X' },
      { label: 'Tab Y', content: 'Y' },
    ];
    fixture.detectChanges();

    let emittedIndex: number | undefined;
    component.tabChanged.subscribe((index: number) => {
      emittedIndex = index;
    });

    const tabGroup = fixture.debugElement.query(By.directive(MatTabGroup));
    tabGroup.triggerEventHandler('selectedTabChange', { index: 1 });
    fixture.detectChanges();

    expect(emittedIndex).toBe(1);
  }));

  it('should use the selectedIndex input correctly', () => {
    component.tabs = [
      { label: 'First', content: 'Content 1' },
      { label: 'Second', content: 'Content 2' },
    ];
    component.selectedIndex = 1;
    fixture.detectChanges();

    const tabGroup = fixture.debugElement.query(By.directive(MatTabGroup)).componentInstance;
    expect(tabGroup.selectedIndex).toBe(1);
  });

  it('should handle empty tabs gracefully', () => {
    component.tabs = [];
    fixture.detectChanges();

    const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
    expect(tabLabels.length).toBe(0);
  });

  it('should handle undefined tabs input without crashing', () => {
    component.tabs = undefined!;
    fixture.detectChanges();

    const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
    expect(tabLabels.length).toBe(0);
  });

  it('should handle missing content without errors', fakeAsync(() => {
    component.tabs = [{ label: 'Tab No Content' }];
    fixture.detectChanges();

    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab__content'));
    expect(tabLabels.length).toBe(1);
    expect(tabLabels[0].nativeElement.textContent).toContain('Tab No Content');

    const contentDiv = fixture.debugElement.query(By.css('.p-4'));
    expect(contentDiv).toBeTruthy();
    expect(contentDiv.nativeElement.innerHTML).toBe('');
  }));

  it('should sanitize and display HTML content safely', () => {
    const unsafeContent = `<img src="x" onerror="alert('hack')">Safe Text`;
    component.tabs = [{ label: 'SafeTab', content: unsafeContent }];
    fixture.detectChanges();

    const tabGroup = fixture.debugElement.query(By.directive(MatTabGroup));
    expect(tabGroup).toBeTruthy();

    const contentDiv = fixture.debugElement.query(By.css('.p-4')).nativeElement;
    expect(contentDiv.innerHTML).toContain(`Safe Text`);
  });
});
