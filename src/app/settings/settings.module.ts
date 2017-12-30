import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../shared';
import { SettingsComponent } from './settings.component';

const settingsRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  }
]);

@NgModule({
  imports: [
    SharedModule,
    settingsRouting
  ],

  declarations: [
    SettingsComponent
  ]

})
export class SettingsModule {}
