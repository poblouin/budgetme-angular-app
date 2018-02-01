import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { SettingsModule } from './settings/settings.module';
import { CoreModule } from 'app/core/core.module';
import { SharedModule } from './shared/shared.module';
import {
  ApiService,
  AuthGuard,
  HeaderComponent,
  JwtService,
  UserService,
  NotFoundComponent
} from './shared';

const rootRouting: ModuleWithProviders = RouterModule.forRoot([
  { path: '', redirectTo: '/dash', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
]);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),

    // BudgetMe Modules
    rootRouting,
    AuthModule,
    HomeModule,
    SharedModule,
    SettingsModule,
    CoreModule,
  ],

  providers: [
    ApiService,
    AuthGuard,
    JwtService,
    UserService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
