import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';

import { AuthGuard } from '../shared';
import { TransactionCategoryService } from '../core';
import { TransactionCategoryManagementComponent } from './transaction-category-management.component';

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
        MatSelectModule,
        ReactiveFormsModule
    ],
    exports: [],
    providers: [
        TransactionCategoryService
    ],
})
export class TransactionCategoryModule {}
