import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ISubscription } from 'rxjs/Subscription';

import { Budget } from '../core/models/budget';
import { TransactionCategory } from '../core/models/transaction-category';
import {
    TransactionCategoryService,
    BudgetService,
    BudgetMeToastrService
} from '../core/services';

@Component({
    selector: 'transaction-category-management',
    templateUrl: './transaction-category-management.component.html'
})
export class TransactionCategoryManagementComponent implements OnInit, OnDestroy {
    private transactionCategorySub: ISubscription;
    private budgetSub: ISubscription;
    private oldBudgetName: string;

    public selectedTransactionCategory: TransactionCategory;
    public budgets: Array<Budget>;
    public transactionCategories: Array<TransactionCategory>;
    public transactionCategoryForm: FormGroup;

    constructor(
        private budgetService: BudgetService,
        private transactionCategoryService: TransactionCategoryService,
        private budgetMeToastrService: BudgetMeToastrService,
        private fb: FormBuilder,
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.budgetSub = this.budgetService.budgets.subscribe(
            budgets => this.budgets = budgets
        );
        this.transactionCategorySub = this.transactionCategoryService.transactionCategories.subscribe(
            tcs => {
                const arr = new Array<TransactionCategory>();
                tcs.forEach((val: Array<TransactionCategory>, key: string) => arr.push(...val));
                this.transactionCategories = arr;
            }
        );
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
        this.transactionCategorySub.unsubscribe();
    }

    onSubmit(): void {
        const saveTransactionCategory = this.prepareSaveTransactionCategory();
        if (!this.selectedTransactionCategory) {
            this.transactionCategoryService.createTransactionCategory(saveTransactionCategory).subscribe(
                tc => {
                    this.selectedTransactionCategory = tc;
                    this.revert();
                },
                err => this.budgetMeToastrService.showError(err)
            );
        } else {
            saveTransactionCategory.id = this.selectedTransactionCategory.id;
            this.transactionCategoryService.updateTransactionCategory(saveTransactionCategory, this.oldBudgetName).subscribe(
                tc => {
                    this.selectedTransactionCategory = tc;
                    this.revert();
                },
                err => this.budgetMeToastrService.showError(err)
            );
        }
    }

    deleteTransactionCategory(): void {
        this.transactionCategoryService.deleteTransactionCategory(this.selectedTransactionCategory).subscribe(
            budget => {
                this.selectedTransactionCategory = undefined;
                this.revert();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    revert(): void {
        const values = {
            name: '',
            budget: undefined
        };
        if (this.selectedTransactionCategory) {
            values.name = this.selectedTransactionCategory.name;
            values.budget = this.selectedTransactionCategory.budget.name;
        }
        this.transactionCategoryForm.reset(values);
        this.oldBudgetName = '';
    }

    onChangeBudget(budgetName: string): void {
        this.oldBudgetName = this.selectedTransactionCategory.budget.name;
    }

    private createForm(): void {
        this.transactionCategoryForm = this.fb.group({
            name: '',
            budget: undefined,
        });
    }

    private prepareSaveTransactionCategory(): any {
        const formModel = this.transactionCategoryForm.value;
        const budget = this.budgets.find(b => b.name === formModel.budget);

        const saveTransactionCategory = {
            name: formModel.name,
            budget: budget,
        };
        return saveTransactionCategory;
    }

}
