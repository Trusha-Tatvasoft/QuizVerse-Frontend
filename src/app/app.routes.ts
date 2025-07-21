import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/layout/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '**',
    component: LandingPageComponent,
  },
];
