import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
    MatTableModule,
    MatSortModule
} from '@angular/material';

import { TransactionManagementComponent } from './transaction.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../shared';

const transactionRouting: ModuleWithProviders = RouterModule.forChild([
    {
        path: 'transaction',
        component: TransactionManagementComponent,
        canActivate: [AuthGuard]
    }
]);


@NgModule({
    declarations: [
        TransactionManagementComponent
    ],
    imports: [
        CommonModule,
        transactionRouting,
        SharedModule,
        MatTableModule,
        MatSortModule,
    ],
    providers: [

    ],
})
export class TransactionModule { }
