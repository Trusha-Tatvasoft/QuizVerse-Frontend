import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/layout/landing-page/landing-page.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { MasterLayoutComponent } from './pages/layout/master-layout/master-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'Admin',
    component: MasterLayoutComponent,
    children: [{ path: 'user-management', component: UserManagementComponent }],
  },
];
