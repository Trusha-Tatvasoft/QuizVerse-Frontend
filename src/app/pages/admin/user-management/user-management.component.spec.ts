import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './user-management.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserListingComponent } from './components/user-table/user-listing.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { MatSelectModule } from '@angular/material/select';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { By } from '@angular/platform-browser';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserManagementComponent,
        ReactiveFormsModule, // for FormControl testing
        UserListingComponent,
        PageHeaderComponent,
        SearchInputComponent,
        MatSelectModule,
        OutlineButtonComponent,
        FilledButtonComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize configs correctly', () => {
    expect(component.userConfig).toBeDefined();
    expect(component.searchInputConfig).toBeDefined();
    expect(component.addUserButtonConfig).toBeDefined();
    expect(component.exportButtonConfig).toBeDefined();
  });

  it('should have default selectedRole and selectedStatus as empty strings', () => {
    expect(component.selectedRole).toBe('');
    expect(component.selectedStatus).toBe('');
  });

  it('should initialize searchControl with null value', () => {
    expect(component.searchControl.value).toBeNull();
  });

  it('should render page header component', () => {
    const pageHeaderEl = fixture.debugElement.query(By.directive(PageHeaderComponent));
    expect(pageHeaderEl).toBeTruthy();
  });

  it('should render user table component', () => {
    const userTableEl = fixture.debugElement.query(By.directive(UserListingComponent));
    expect(userTableEl).toBeTruthy();
  });

  it('should render search input component', () => {
    const searchInputEl = fixture.debugElement.query(By.directive(SearchInputComponent));
    expect(searchInputEl).toBeTruthy();
  });

  it('should render outline and filled button components', () => {
    const outlineButtonEl = fixture.debugElement.query(By.directive(OutlineButtonComponent));
    const filledButtonEl = fixture.debugElement.query(By.directive(FilledButtonComponent));
    expect(outlineButtonEl).toBeTruthy();
    expect(filledButtonEl).toBeTruthy();
  });
});
