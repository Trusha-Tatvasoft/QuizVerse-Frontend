// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TabComponent } from './tab.component';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Component, ContentChildren, QueryList, TemplateRef, ViewChild, Type } from '@angular/core';
import { TabContentDirective } from './tab.component';
import { LazyTab } from '../../interfaces/tab-component.interface';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

// Mock component for lazy loading tests
@Component({ template: '' })
class MockLazyComponent {}

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTabsModule, MatIconModule, TabComponent, TabContentDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test: Component should be created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test: Should render tabs with correct labels and IDs
  it('should render tabs with labels and IDs', () => {
    component.tabs = [
      { id: 'tab1', label: 'First Tab' },
      { id: 'tab2', label: 'Second Tab' },
    ];
    fixture.detectChanges();

    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab__content'));
    expect(tabLabels.length).toBe(2);
    expect(tabLabels[0].nativeElement.textContent).toContain('First Tab');
    expect(tabLabels[1].nativeElement.textContent).toContain('Second Tab');
  });

  // Test: Should render icons when provided
  it('should render icons when provided', () => {
    component.tabs = [
      { id: 'tab1', label: 'Tab A', icon: 'home' },
      { id: 'tab2', label: 'Tab B', icon: 'settings' },
    ];
    fixture.detectChanges();

    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    expect(icons.length).toBe(2);
    expect(icons[0].nativeElement.textContent).toBe('home');
    expect(icons[1].nativeElement.textContent).toBe('settings');
  });

  // Test: Should emit tabChanged event with correct index
  it('should emit tabChanged event when tab changes', fakeAsync(() => {
    component.tabs = [
      { id: 'tab1', label: 'First' },
      { id: 'tab2', label: 'Second' },
    ];
    fixture.detectChanges();

    let emittedIndex: number | undefined;
    component.tabChanged.subscribe((index) => {
      emittedIndex = index;
    });

    const tabGroup = fixture.debugElement.query(By.css('mat-tab-group'));
    tabGroup.triggerEventHandler('selectedTabChange', { index: 1 });
    tick();

    expect(emittedIndex).toBe(1);
  }));

  // Test: Should respect selectedIndex input
  it('should respect selectedIndex input', () => {
    component.tabs = [
      { id: 'tab1', label: 'First' },
      { id: 'tab2', label: 'Second' },
    ];
    component.selectedIndex = 1;
    fixture.detectChanges();

    const tabGroup = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
    expect(tabGroup.selectedIndex).toBe(1);
  });

  // Test: Should handle empty tabs array
  it('should handle empty tabs array', () => {
    component.tabs = [];
    fixture.detectChanges();

    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab'));
    expect(tabLabels.length).toBe(0);
  });

  // Test: Should map templates to tab IDs correctly using TabContentDirective
  it('should map templates to tab IDs correctly using TabContentDirective', () => {
    @Component({
      template: `
        <app-common-tab [tabs]="tabs">
          <ng-template tabContent="tab1">Content 1</ng-template>
          <ng-template tabContent="tab2">Content 2</ng-template>
        </app-common-tab>
      `,
      imports: [TabComponent, TabContentDirective],
    })
    class TestHostComponent {
      tabs = [
        { id: 'tab1', label: 'First', icon: 'home' },
        { id: 'tab2', label: 'Second', icon: 'settings' },
      ];
      @ViewChild(TabComponent) tabComponent!: TabComponent;
    }

    const hostFixture = TestBed.createComponent(TestHostComponent);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    expect(hostComponent.tabComponent.getTemplate('tab1')).toBeTruthy();
    expect(hostComponent.tabComponent.getTemplate('tab2')).toBeTruthy();
    expect(hostComponent.tabComponent.getTemplate('nonexistent')).toBeNull();
  });

  // Test: Should handle undefined tab templates
  it('should handle undefined tab templates', () => {
    component.tabs = [
      { id: 'tab1', label: 'First' },
      { id: 'tab2', label: 'Second' },
    ];
    fixture.detectChanges();

    expect(component.getTemplate('tab1')).toBeNull();
    expect(component.getTemplate('tab2')).toBeNull();
  });

  // Test: Should update template map when tabs change
  it('should update template map when tabs change', fakeAsync(() => {
    @Component({
      template: `
        <app-common-tab [tabs]="tabs">
          <ng-template tabContent="tabA">Content A</ng-template>
          <ng-template tabContent="tabB">Content B</ng-template>
        </app-common-tab>
      `,
      imports: [TabComponent, TabContentDirective],
    })
    class DynamicHostComponent {
      tabs = [
        { id: 'tabA', label: 'First' },
        { id: 'tabB', label: 'Second' },
      ];
      @ViewChild(TabComponent) tabComponent!: TabComponent;
    }

    const hostFixture = TestBed.createComponent(DynamicHostComponent);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    tick();

    expect(hostComponent.tabComponent.getTemplate('tabA')).toBeTruthy();
    expect(hostComponent.tabComponent.getTemplate('tabB')).toBeTruthy();

    hostComponent.tabs = [
      { id: 'tabX', label: 'New First' },
      { id: 'tabY', label: 'New Second' },
    ];
    hostFixture.detectChanges();
    tick();

    expect(hostComponent.tabComponent.getTemplate('tabX')).toBeNull();
    expect(hostComponent.tabComponent.getTemplate('tabY')).toBeNull();
  }));

  // Test: Should lazy load components when tab is selected
  it('should lazy load components when tab is selected', async () => {
    const lazyTab: LazyTab = {
      id: 'lazyTab',
      label: 'Lazy Tab',
      loadChildren: () => Promise.resolve(MockLazyComponent as Type<any>),
    };

    component.tabs = [lazyTab];
    fixture.detectChanges();

    expect(component.getLoadedComponent('lazyTab')).toBeNull();

    component.onTabChange({ index: 0 });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.getLoadedComponent('lazyTab')).toBe(MockLazyComponent);
  });

  // Test: Should not re-load already loaded components
  it('should not re-load already loaded components', async () => {
    const loadSpy = jest.fn(() => Promise.resolve(MockLazyComponent as Type<any>));
    const lazyTab: LazyTab = {
      id: 'lazyTab',
      label: 'Lazy Tab',
      loadChildren: loadSpy,
    };

    component.tabs = [lazyTab];
    fixture.detectChanges();

    component.onTabChange({ index: 0 });
    await fixture.whenStable();
    fixture.detectChanges();

    component.onTabChange({ index: 0 });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  // Test: Should initialize templates in AfterContentChecked
  it('should initialize templates in AfterContentChecked', fakeAsync(() => {
    @Component({
      template: `
        <app-common-tab [tabs]="tabs">
          <ng-template tabContent="tab1">Content 1</ng-template>
        </app-common-tab>
      `,
      imports: [TabComponent, TabContentDirective],
    })
    class TemplateHostComponent {
      tabs = [{ id: 'tab1', label: 'First' }];
      @ViewChild(TabComponent) tabComponent!: TabComponent;
    }

    const hostFixture = TestBed.createComponent(TemplateHostComponent);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    tick();

    expect(hostComponent.tabComponent.getTemplate('tab1')).toBeTruthy();
    expect(hostComponent.tabComponent.templatesInitialized).toBe(true);
  }));

  it('should handle mixed static and lazy tabs', async () => {
    @Component({
      template: `
        <app-common-tab [tabs]="tabs">
          <ng-template tabContent="staticTab">Static Content</ng-template>
        </app-common-tab>
      `,
      imports: [TabComponent, TabContentDirective],
    })
    class MixedHostComponent {
      tabs = [
        { id: 'staticTab', label: 'Static' },
        {
          id: 'lazyTab',
          label: 'Lazy',
          loadChildren: () => Promise.resolve(MockLazyComponent as Type<any>),
        },
      ];
      @ViewChild(TabComponent) tabComponent!: TabComponent;
    }

    const hostFixture = TestBed.createComponent(MixedHostComponent);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(hostComponent.tabComponent.getTemplate('staticTab')).toBeTruthy();
    expect(hostComponent.tabComponent.getLoadedComponent('staticTab')).toBeNull();

    expect(hostComponent.tabComponent.getTemplate('lazyTab')).toBeNull();
    expect(hostComponent.tabComponent.getLoadedComponent('lazyTab')).toBeNull();

    hostComponent.tabComponent.onTabChange({ index: 1 });
    await hostFixture.whenStable();
    hostFixture.detectChanges();

    expect(hostComponent.tabComponent.getLoadedComponent('lazyTab')).toBe(MockLazyComponent);
  });

  // Test lazy loading error handling
  it('should handle errors during lazy loading', async () => {
    const errorTab: LazyTab = {
      id: 'errorTab',
      label: 'Error Tab',
      loadChildren: () => Promise.reject(new Error('Load failed')),
    };

    component.tabs = [errorTab];
    fixture.detectChanges();

    await expect(component.onTabChange({ index: 0 })).rejects.toThrow('Load failed');
    expect(component.getLoadedComponent('errorTab')).toBeNull();
  });

  // Test dynamic tab content directives
  it('should handle dynamic tab content directives', fakeAsync(() => {
    @Component({
      template: `
        <app-common-tab [tabs]="tabs">
          @if (showContent) {
            <ng-template tabContent="dynamicTab">Dynamic</ng-template>
          }
        </app-common-tab>
      `,
      imports: [TabComponent, TabContentDirective, CommonModule],
    })
    class DynamicHost {
      tabs = [{ id: 'dynamicTab', label: 'Dynamic' }];
      showContent = false;
      @ViewChild(TabComponent) tabComponent!: TabComponent;
    }

    const hostFixture = TestBed.createComponent(DynamicHost);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    expect(hostComponent.tabComponent.getTemplate('dynamicTab')).toBeNull();

    hostComponent.showContent = true;
    hostFixture.detectChanges();
    tick();

    expect(hostComponent.tabComponent.getTemplate('dynamicTab')).toBeTruthy();
  }));

  it('should load component in ngAfterContentInit for lazy tab', async () => {
    const lazyTab: LazyTab = {
      id: 'lazyTabInit',
      label: 'Lazy Init Tab',
      loadChildren: () => Promise.resolve(MockLazyComponent as Type<any>),
    };
    component.tabs = [lazyTab];
    component.selectedIndex = 0;

    await component.ngAfterContentInit();

    expect(component.loadedComponents.has('lazyTabInit')).toBe(true);
    expect(component.getLoadedComponent('lazyTabInit')).toBe(MockLazyComponent);
  });

  it('should return template from templates input in getTemplate', () => {
    const fakeTemplate = {} as TemplateRef<any>;
    component.templates = {
      testTab: fakeTemplate,
    };

    const result = component.getTemplate('testTab');
    expect(result).toBe(fakeTemplate);

    const nullResult = component.getTemplate('nonExistentTab');
    expect(nullResult).toBeNull();
  });
});
