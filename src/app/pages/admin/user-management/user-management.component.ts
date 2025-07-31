import { Component } from '@angular/core';
import { UserListingComponent } from './components/user-table/user-listing.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  ADD_USER_BUTTON_CONFIG,
  EXPORT_BUTTON_CONFIG,
  SEARCH_INPUT_CONFIG,
  USER_HEADER_CONFIG,
} from './configs/user-management.config';
import { FormControl } from '@angular/forms';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { MatSelectModule } from '@angular/material/select';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';

@Component({
  selector: 'app-user-management',
  imports: [
    UserListingComponent,
    PageHeaderComponent,
    SearchInputComponent,
    MatSelectModule,
    OutlineButtonComponent,
    FilledButtonComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  userConfig = USER_HEADER_CONFIG;
  searchInputConfig = SEARCH_INPUT_CONFIG;
  searchControl = new FormControl<string | null>(null);
  selectedRole: string = '';
  selectedStatus: string = '';
  addUserButtonConfig = ADD_USER_BUTTON_CONFIG;
  exportButtonConfig = EXPORT_BUTTON_CONFIG;
}
