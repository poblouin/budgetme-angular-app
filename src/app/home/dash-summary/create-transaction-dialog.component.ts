import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { ISubscription } from 'rxjs/Subscription';

import { TransactionCategory } from '../../core/models/transaction-category';
import {
    TransactionService,
    TransactionCategoryService,
    BudgetMeToastrService
} from '../../core';

@Component({
    selector: 'create-transaction-dialog',
    templateUrl: 'create-transaction-dialog.component.html',
})
export class CreateTransactionDialogComponent implements OnInit, OnDestroy {
    private transactionCategoriesSub: ISubscription;
    private selectedTransactionCategory: TransactionCategory;

    public transactionForm: FormGroup;
    public transactionCategories: Array<TransactionCategory>;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<CreateTransactionDialogComponent>,
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private transactionCategoryService: TransactionCategoryService,
        private budgetMeToastrService: BudgetMeToastrService,
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.transactionCategoriesSub = this.transactionCategoryService.transactionCategories.subscribe(
            tcs => {
                const arr = new Array<TransactionCategory>();
                tcs.forEach((val: Array<TransactionCategory>, key: string) => arr.push(...val));
                this.transactionCategories = arr;
            }
        );
    }

    ngOnDestroy(): void {
        this.transactionCategoriesSub.unsubscribe();
    }

    saveTransaction(): void {
        const saveTransaction = this.prepareSaveTransaction();
        this.transactionService.createTransaction(saveTransaction, this.data.periodStart, this.data.periodEnd).subscribe(
            data => {
                this.dialogRef.close();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    private createForm(): void {
        this.transactionForm = this.fb.group({
            amount: 0,
            date: '',
            description: '',
            transactionCategory: undefined,
        });
    }

    private prepareSaveTransaction(): any {
        const formModel = this.transactionForm.value;

        const saveTransactionCategory = {
            amount: formModel.amount,
            date: formModel.date,
            description: formModel.description,
            transaction_category: formModel.transactionCategory,
        };
        return saveTransactionCategory;
    }

}
