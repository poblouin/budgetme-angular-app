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
} from '../../core/services';

@Component({
    selector: 'transaction-dialog',
    templateUrl: 'transaction-dialog.component.html',
})
export class TransactionDialogComponent implements OnInit, OnDestroy {
    private transactionCategoriesSub: ISubscription;
    private selectedTransactionCategory: TransactionCategory;

    public title: string;
    public isEdit: boolean;
    public transactionForm: FormGroup;
    public transactionCategories: Array<TransactionCategory>;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<TransactionDialogComponent>,
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private transactionCategoryService: TransactionCategoryService,
        private budgetMeToastrService: BudgetMeToastrService,
    ) {
        this.isEdit = 'transaction' in this.data;
        this.title = this.isEdit ? 'Update transaction' : 'Create new transaction';
        this.createForm();
    }

    ngOnInit(): void {
        this.transactionCategoriesSub = this.transactionCategoryService.transactionCategories.subscribe(
            tcs => {
                const arr = new Array<TransactionCategory>();
                tcs.forEach((val: Array<TransactionCategory>, key: string) => arr.push(...val));
                this.transactionCategories = arr;
                this.createForm();
            }
        );
    }

    ngOnDestroy(): void {
        this.transactionCategoriesSub.unsubscribe();
    }

    saveTransaction(): void {
        const saveTransaction = this.prepareTransaction();
        this.transactionService.createTransaction(saveTransaction, this.data.periodStart, this.data.periodEnd).subscribe(
            data => {
                this.dialogRef.close();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    updateTransaction(): void {
        const updateTransaction = this.prepareTransaction();
        const oldTransaction = this.data.transaction;
        const oldTranBudgetName = oldTransaction.transactionCategory.budget.name;
        const oldTranCatName = oldTransaction.transactionCategory.name;
        const upTranBudgetName = updateTransaction.transaction_category.budget.name;
        const upTranCatName = updateTransaction.transaction_category.name;
        const oldBudgetName = oldTranBudgetName !== upTranBudgetName ? oldTranBudgetName : undefined;
        const oldCatName = oldTranCatName !== upTranCatName ? oldTranCatName : undefined;

        this.transactionService.updateTransaction(
            updateTransaction,
            this.data.periodStart,
            this.data.periodEnd,
            oldCatName,
            oldBudgetName)
            .subscribe(
                data => {
                    this.dialogRef.close();
                },
                err => this.budgetMeToastrService.showError(err)
            );
    }

    deleteTransaction(): void {
        const deleteTransaction = this.prepareTransaction();
        this.transactionService.deleteTransaction(deleteTransaction, this.data.periodStart, this.data.periodEnd).subscribe(
            data => {
                this.dialogRef.close();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    private createForm(): void {
        let formData;
        if (this.isEdit && this.transactionCategories) {
            const transaction = this.data.transaction;
            const transactionCategory = this.transactionCategories.find(tc => tc.id === transaction.transactionCategory.id);
            formData = {
                amount: transaction.amount,
                date: transaction.date,
                description: transaction.description,
                transactionCategory: transactionCategory
            };
        } else {
            formData = {
                amount: 0,
                date: '',
                description: '',
                transactionCategory: undefined,
            };
        }
        this.transactionForm = this.fb.group(formData);
    }

    private prepareTransaction(): any {
        const formModel = this.transactionForm.value;
        const data = {
            amount: formModel.amount,
            date: formModel.date,
            description: formModel.description,
            transaction_category: formModel.transactionCategory,
        };

        if (this.isEdit) {
            data['id'] = this.data.transaction.id;
        }

        return data;
    }

}
