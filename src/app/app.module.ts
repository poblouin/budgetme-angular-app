import { ModuleWithProviders, NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as Raven from 'raven-js';
import { ToastrModule } from 'ngx-toastr';

import { environment } from 'environments/environment';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { SettingsModule } from './settings/settings.module';
import { CoreModule } from 'app/core/core.module';
import { SharedModule } from './shared/shared.module';
import { BudgetModule } from './budget/budget.module';
import { TransactionCategoryModule } from './transaction-category/transaction-category.module';
import { TransactionModule } from './transaction/transaction.module';
import {
    ApiService,
    AuthGuard,
    HeaderComponent,
    JwtService,
    UserService,
    NotFoundComponent,
    JwtInterceptor
} from './shared';

Raven
    .config(environment.sentry_api_url)
    .install();

export class RavenErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        Raven.captureException(err);
    }
}

const rootRouting: ModuleWithProviders = RouterModule.forRoot([
    { path: '', redirectTo: '/home', pathMatch: 'full' },
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
        rootRouting,
        HttpClientModule,

        // BudgetMe Modules
        AuthModule,
        HomeModule,
        SharedModule,
        SettingsModule,
        CoreModule,
        BudgetModule,
        TransactionCategoryModule,
        TransactionModule
    ],

    providers: [
        ApiService,
        AuthGuard,
        JwtService,
        UserService,
        { provide: ErrorHandler, useClass: RavenErrorHandler },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
    ],

    bootstrap: [AppComponent]
})
export class AppModule { }
