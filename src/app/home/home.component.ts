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
  private budgetSub: ISubscription;

  public budgets: Array<Budget>;

  constructor(
    private router: Router,
    private budgetService: BudgetService,
    private transactionCategoryService: TransactionCategoryService
  ) { }

  ngOnInit() {
    this.budgetSub = this.budgetService.budgets
      .subscribe(
        budgets => this.budgets = budgets
      );
  }

  ngOnDestroy(): void {
    this.budgetSub.unsubscribe();
  }

}
