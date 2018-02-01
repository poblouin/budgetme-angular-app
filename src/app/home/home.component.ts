import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

import { UserService } from '../shared';
import { Budget } from '../core/models/budget';
import { BudgetService, TransactionCategoryService } from '../core/index';

@Component({
  selector: 'home-page',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  private isAuthenticated: boolean;
  private userSub: ISubscription;
  private budgetSub: ISubscription;

  public budgets: Array<Budget>;

  constructor(
    private router: Router,
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionCategoryService: TransactionCategoryService
  ) { }

  ngOnInit() {
    this.userSub = this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
        if (this.isAuthenticated) {
          this.budgetService.getBudgets().subscribe().unsubscribe();
          this.transactionCategoryService.getTransactionCategories();
        }
      }
    );
    this.budgetSub = this.budgetService.budgets
      .subscribe(
        budgets => this.budgets = budgets
      );
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.budgetSub.unsubscribe();
  }

}
