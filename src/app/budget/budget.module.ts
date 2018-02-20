import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';

import { AuthGuard } from '../shared';
import { BudgetService } from '../core';
import { BudgetManagementComponent } from './budget-management.component';

const budgetRouting: ModuleWithProviders = RouterModule.forChild([
    {
      path: 'budget',
      component: BudgetManagementComponent,
      canActivate: [AuthGuard]
    }
  ]);

@NgModule({
    declarations: [
        BudgetManagementComponent
    ],
    imports: [
        budgetRouting,
        CommonModule,
        MatSelectModule,
        ReactiveFormsModule
    ],
    exports: [],
    providers: [
        BudgetService
    ],
})
export class BudgetModule {}
