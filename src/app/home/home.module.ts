import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';

import { HomeResolver } from './home-resolver.service';
import { SharedModule } from '../shared';
import { HomeComponent, DashHeadingComponent } from './index';

const homeRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: HomeComponent,
    resolve: {
      isAuthenticated: HomeResolver
    }
  }
]);

@NgModule({
  imports: [
    homeRouting,
    SharedModule,
    MatSelectModule
  ],
  declarations: [
    HomeComponent,
    DashHeadingComponent
  ],
  providers: [
    HomeResolver
  ]
})
export class HomeModule {}
