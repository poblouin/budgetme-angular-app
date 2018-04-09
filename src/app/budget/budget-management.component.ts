import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { Budget, BudgetFrequencyEnum } from '../core/models/budget';
import { BudgetService, BudgetMeToastrService, TransactionService } from '../core';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog.component';

@Component({
    selector: 'budget-management',
    templateUrl: './budget-management.component.html'
})
export class BudgetManagementComponent implements OnInit, OnDestroy {
    private budgetSub: ISubscription;

    public selectedBudget: Budget;
    public budgets: Array<Budget>;
    public budgetFrequenciesKeys: any[];
    public budgetFrequencies = BudgetFrequencyEnum;
    public budgetForm: FormGroup;

    constructor(
        private budgetService: BudgetService,
        private transactionService: TransactionService,
        private budgetMeToastrService: BudgetMeToastrService,
        private fb: FormBuilder,
        public dialog: MatDialog
    ) {
        this.budgetFrequenciesKeys = Object.keys(this.budgetFrequencies);
        this.createForm();
    }

    ngOnInit(): void {
        this.budgetSub = this.budgetService.budgets.subscribe(
            budgets => this.budgets = budgets
        );
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe();
    }

    onSubmit(): void {
        const saveBudget = this.prepareSaveBudget();
        if (!this.selectedBudget) {
            this.budgetService.createBudget(saveBudget).subscribe(
                budget => {
                    this.selectedBudget = budget;
                    this.revert();
                },
                err => this.budgetMeToastrService.showError(err)
            );
        } else {
            saveBudget.id = this.selectedBudget.id;
            this.budgetService.updateBudget(saveBudget).subscribe(
                budget => {
                    this.selectedBudget = budget;
                    this.transactionService.updateTransactionCacheOnBudgetChange(this.selectedBudget.name, saveBudget.name);
                    this.revert();
                },
                err => this.budgetMeToastrService.showError(err)
            );
        }
    }

    deleteBudget(): void {
        const matDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: 'auto',
            data: {
                content: `When deleting this budget, all the transaction categories
                          and transactions linked to it (if any), will be deleted as well.`
            },
            disableClose: true
        });

        matDialogRef.beforeClose().subscribe(confirm => {
            if (confirm) {
                this.budgetService.deleteBudget(this.selectedBudget).subscribe(
                    budget => {
                        this.transactionService.updateTransactionCacheOnBudgetChange(this.selectedBudget.name, undefined, true);
                        this.selectedBudget = undefined;
                        this.revert();
                    },
                    err => this.budgetMeToastrService.showError(err)
                );
            }
        });
    }

    revert(): void {
        const values = {
            frequency: '',
            name: '',
            amount: 0,
            startDate: undefined,
            endDate: undefined
        };
        if (this.selectedBudget) {
            values.amount = this.selectedBudget.amount;
            values.frequency = this.selectedBudget.budgetFrequency;
            values.name = this.selectedBudget.name;
            values.startDate = this.selectedBudget.startDate;
            values.endDate = this.selectedBudget.endDate;
        }
        this.budgetForm.reset(values);
    }

    private createForm(): void {
        this.budgetForm = this.fb.group({
            frequency: '',
            name: '',
            amount: [0, Validators.min(0)],
            startDate: undefined,
            endDate: undefined
        });
    }

    private prepareSaveBudget(): any {
        const formModel = this.budgetForm.value;

        const saveBudget = {
            name: formModel.name,
            amount: formModel.amount,
            budget_frequency: formModel.frequency,
            start_date: formModel.startDate ? formModel.startDate : null,
            end_date: formModel.endDate ? formModel.endDate : null
        };

        return saveBudget;
    }

}
