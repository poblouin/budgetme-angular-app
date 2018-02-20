import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Budget, BudgetFrequencyEnum } from '../core/models/budget';
import { BudgetService, BudgetMeToastrService } from '../core';
import { ISubscription } from 'rxjs/Subscription';

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
        private budgetMeToastrService: BudgetMeToastrService,
        private fb: FormBuilder,
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
                    this.revert();
                },
                err => {
                    this.budgetMeToastrService.showError(err);
                    // TODO: Remove this when PUT implemented in backend.
                    this.revert();
                }
            );
        }
    }

    deleteBudget(): void {
        this.budgetService.deleteBudget(this.selectedBudget).subscribe(
            budget => {
                this.selectedBudget = undefined;
                this.revert();
            },
            err => this.budgetMeToastrService.showError(err)
        );
    }

    revert(): void {
        const values = {
            frequency: '',
            name: '',
            amount: 0,
        };
        if (this.selectedBudget) {
            values.amount = this.selectedBudget.amount;
            values.frequency = this.selectedBudget.budgetFrequency;
            values.name = this.selectedBudget.name;
        }
        this.budgetForm.reset(values);
    }

    private createForm(): void {
        this.budgetForm = this.fb.group({
            frequency: '',
            name: '',
            amount: [0, Validators.min(0)],
        });
    }

    private prepareSaveBudget(): any {
        const formModel = this.budgetForm.value;

        const saveBudget = {
            name: formModel.name,
            amount: formModel.amount,
            budget_frequency: formModel.frequency
        };
        return saveBudget;
    }

}
