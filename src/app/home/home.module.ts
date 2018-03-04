import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
