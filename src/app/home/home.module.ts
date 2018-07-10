import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  MatSelectModule,
  MatInputModule,
  MatTabsModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatCardModule,
  MatProgressBarModule
} from '@angular/material';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SatPopoverModule } from '@ncstate/sat-popover';

import { SharedModule } from '../shared/shared.module';
import { DashService } from '../core';
import {
  HomeResolver,
  HomeComponent,
  DashDetailedComponent,
  DashSummaryComponent,
  FabButtonComponent,
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
    MatCardModule,
    MatProgressBarModule,
    ChartsModule,
    SatPopoverModule,
  ],
  declarations: [
    HomeComponent,
    DashDetailedComponent,
    DashSummaryComponent,
    FabButtonComponent
  ],
  providers: [
    HomeResolver,
    DashService
  ],
})
export class HomeModule { }
