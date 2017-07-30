import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { SettingsModule } from './settings/settings.module';
import {
  ApiService,
  AuthGuard,
  HeaderComponent,
  JwtService,
  SharedModule,
  UserService
} from './shared';

const rootRouting: ModuleWithProviders = RouterModule.forRoot([], { useHash: true });

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],

  imports: [
    BrowserModule,
    AuthModule,
    HomeModule,
    rootRouting,
    SharedModule,
    SettingsModule
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
