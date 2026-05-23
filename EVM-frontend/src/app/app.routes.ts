import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/layout/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./views/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./views/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./views/pages/projects/projects.component').then(
            (m) => m.ProjectsComponent
          ),
      },
      {
        path: 'projects/:id/activities',
        loadComponent: () =>
          import('./views/pages/activities/activities.component').then(
            (m) => m.ActivitiesComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
