import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  MatSelectModule,
  MatInputModule,
  MatTabsModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { SharedModule } from '../shared/shared.module';
import { DashService } from '../core';
import {
  HomeResolver,
  HomeComponent,
  DashDetailedComponent,
  DashSummaryComponent,
} from './index';

const homeRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'home',
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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ChartsModule
  ],
  declarations: [
    HomeComponent,
    DashDetailedComponent,
    DashSummaryComponent
  ],
  providers: [
    HomeResolver,
    DashService
  ],
})
export class HomeModule { }
