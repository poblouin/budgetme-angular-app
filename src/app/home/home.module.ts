import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { SharedModule } from '../shared';
import {
  HomeResolver,
  HomeComponent,
  DashHeadingComponent,
  DashDetailedComponent,
  DashSummaryComponent
} from './index';

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
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    ChartsModule
  ],
  declarations: [
    HomeComponent,
    DashHeadingComponent,
    DashDetailedComponent,
    DashSummaryComponent
  ],
  providers: [
    HomeResolver
  ]
})
export class HomeModule { }
