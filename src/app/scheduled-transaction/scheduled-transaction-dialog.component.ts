import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { SubscriptionLike as ISubscription } from 'rxjs';

import { TransactionCategory } from 'app/core/models/transaction-category';
import { ScheduledTransactionFrequencyEnum } from '../core/models/scheduled-transaction';
import { ScheduledTransactionService, TransactionCategoryService, BudgetMeToastrService } from 'app/core/services';


@Component({
    selector: 'scheduled-transaction-dialog',
    templateUrl: 'scheduled-transaction-dialog.component.html',
})
export class ScheduledTransactionDialogComponent implements OnInit, OnDestroy {
    private transactionCategoriesSub: ISubscription;

    public title: string;
    public isEdit: boolean;
    public transactionForm: FormGroup;
    public transactionCategories: Array<TransactionCategory>;
    public scheduledTransactionFrequencies = ScheduledTransactionFrequencyEnum;
    public scheduledTransactionFreqKeys: Array<string>;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<ScheduledTransactionDialogComponent>,
        private fb: FormBuilder,
        private scheduledTransactionService: ScheduledTransactionService,
        private transactionCategoryService: TransactionCategoryService,
        private budgetMeToastrService: BudgetMeToastrService,
    ) {
        this.isEdit = 'scheduledTransaction' in this.data;
        this.title = this.isEdit ? 'Update scheduled transaction' : 'Create new scheduled transaction';
        this.scheduledTransactionFreqKeys = Object.keys(this.scheduledTransactionFrequencies);
        this.createForm();
    }

    ngOnInit(): void {
        this.transactionCategoriesSub = this.transactionCategoryService.transactionCategories.subscribe(
            tcs => {
                const arr = new Array<TransactionCategory>();
                tcs.forEach((val: Array<TransactionCategory>, _) => arr.push(...val));
                this.transactionCategories = arr;
                this.createForm();
            }
        );
    }

    ngOnDestroy(): void {
        this.transactionCategoriesSub.unsubscribe();
    }

    saveScheduledTransaction(): void {
        const saveScheduledTransaction = this.prepareScheduledTransaction();
        this.scheduledTransactionService.createScheduledTransaction(saveScheduledTransaction).subscribe(
            _ => {
                this.dialogRef.close();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    updateScheduledTransaction(): void {
        const updateScheduledTransaction = this.prepareScheduledTransaction();
        this.scheduledTransactionService.updateScheduledTransaction(updateScheduledTransaction).subscribe(
                _ => {
                    this.dialogRef.close();
                },
                err => this.budgetMeToastrService.showError(err)
            );
    }

    deleteScheduledTransaction(): void {
        const deleteScheduledTransaction = this.prepareScheduledTransaction();
        this.scheduledTransactionService.deleteScheduledTransaction(deleteScheduledTransaction).subscribe(
            _ => {
                this.dialogRef.close();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    private createForm(): void {
        let formData;
        if (this.isEdit && this.transactionCategories) {
            const scheduledTransaction = this.data.scheduledTransaction;
            const transactionCategory = this.transactionCategories.find(tc => tc.id === scheduledTransaction.transactionCategory.id);
            formData = {
                amount: scheduledTransaction.amount,
                description: scheduledTransaction.description,
                frequency: scheduledTransaction.frequency,
                startDate: scheduledTransaction.startDate,
                endDate: scheduledTransaction.endtDate,
                transactionCategory: transactionCategory
            };
        } else {
            formData = {
                amount: 0,
                description: '',
                frequency: '',
                startDate: '',
                endDate: '',
                transactionCategory: undefined,
            };
        }
        this.transactionForm = this.fb.group(formData);
    }

    private prepareScheduledTransaction(): any {
        const formModel = this.transactionForm.value;
        const data = {
            amount: formModel.amount,
            description: formModel.description,
            frequency: formModel.frequency,
            start_date: formModel.startDate,
            end_date: formModel.endDate ? formModel.endDate : null,
            transaction_category: formModel.transactionCategory,
        };

        if (this.isEdit) {
            data['id'] = this.data.scheduledTransaction.id;
        }

        return data;
    }

}
