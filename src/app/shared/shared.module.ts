import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  MatSelectModule,
  MatInputModule,
  MatDialogModule
} from '@angular/material';

import {
  NotFoundComponent,
  ShowAuthedDirective,
  BudgetHeadingComponent,
  TransactionDialogComponent,
  ConfirmDialogComponent,
  ActiveTransactionCategoryPipe,
  ActiveBudgetPipe
} from './index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule
  ],
  declarations: [
    ShowAuthedDirective,
    NotFoundComponent,
    BudgetHeadingComponent,
    TransactionDialogComponent,
    ConfirmDialogComponent,
    ActiveTransactionCategoryPipe,
    ActiveBudgetPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
    ShowAuthedDirective,
    NotFoundComponent,
    BudgetHeadingComponent,
    TransactionDialogComponent,
    ConfirmDialogComponent,
    ActiveTransactionCategoryPipe,
    ActiveBudgetPipe
  ],
  entryComponents: [
    TransactionDialogComponent,
    ConfirmDialogComponent
  ]
})
export class SharedModule { }
