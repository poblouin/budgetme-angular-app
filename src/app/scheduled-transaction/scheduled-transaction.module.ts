import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatDialogModule
} from '@angular/material';

import { AuthGuard } from 'app/shared';
import { ScheduledTransactionComponent } from 'app/scheduled-transaction/scheduled-transaction.component';
import { ScheduledTransactionDialogComponent } from './scheduled-transaction-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { MatSelectModule } from '@angular/material';

const scheduledTransactionRouting: ModuleWithProviders = RouterModule.forChild([
    {
        path: 'scheduled-transaction',
        component: ScheduledTransactionComponent,
        canActivate: [AuthGuard]
    }
]);


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatSortModule,
        MatSelectModule,
        MatInputModule,
        MatDialogModule,
        scheduledTransactionRouting,
        SharedModule
    ],
    declarations: [
        ScheduledTransactionComponent,
        ScheduledTransactionDialogComponent
    ],
    entryComponents: [
        ScheduledTransactionDialogComponent
    ]
})
export class ScheduledTransactionModule { }
