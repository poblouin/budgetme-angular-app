import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
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
  TransactionDialogComponent
} from './index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule
  ],
  declarations: [
    ShowAuthedDirective,
    NotFoundComponent,
    BudgetHeadingComponent,
    TransactionDialogComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
    ShowAuthedDirective,
    NotFoundComponent,
    BudgetHeadingComponent,
    TransactionDialogComponent
  ],
  entryComponents: [
    TransactionDialogComponent
  ]
})
export class SharedModule { }
