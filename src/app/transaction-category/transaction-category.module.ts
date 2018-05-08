import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatSelectModule, MatButtonModule } from '@angular/material';

import { AuthGuard } from '../shared';
import { TransactionCategoryService } from '../core';
import { TransactionCategoryManagementComponent } from './transaction-category-management.component';
import { SharedModule } from '../shared/shared.module';

const transactionCategoryRouting: ModuleWithProviders = RouterModule.forChild([
    {
      path: 'transaction-category',
      component: TransactionCategoryManagementComponent,
      canActivate: [AuthGuard]
    }
  ]);

@NgModule({
    declarations: [
        TransactionCategoryManagementComponent
    ],
    imports: [
        transactionCategoryRouting,
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonModule,
        SharedModule
    ],
    exports: [],
    providers: [
        TransactionCategoryService
    ],
})
export class TransactionCategoryModule {}
