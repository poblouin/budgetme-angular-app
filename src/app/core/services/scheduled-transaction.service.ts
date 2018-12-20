import { Injectable, OnDestroy } from '@angular/core';

import {
    BehaviorSubject,
    SubscriptionLike as ISubscription,
    Observable
} from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { ScheduledTransaction } from 'app/core/models/scheduled-transaction';
import { TransactionCategory } from 'app/core/models/transaction-category';
import { ApiService } from 'app/shared/services/api.service';
import { TransactionCategoryService } from 'app/core/services/transaction-category.service';
import { BudgetMeToastrService } from 'app/core/services/toastr.service';

const API_PATH = '/scheduled-transaction';

@Injectable()
export class ScheduledTransactionService implements OnDestroy {
    private subscriptions = new Array<ISubscription>();
    private _scheduledTransactionSubject = new BehaviorSubject<Array<ScheduledTransaction>>(new Array());
    private transactionCategories: Array<TransactionCategory>;

    public readonly scheduledTransactions = this._scheduledTransactionSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private transactionCategoryService: TransactionCategoryService,
        private budgetMeToastrService: BudgetMeToastrService
    ) {
        this.subscriptions.push(this.transactionCategoryService.transactionCategories
            .pipe(
                filter(transactionCategories => transactionCategories.size > 0)
            )
            .subscribe(
                transactionCategories => {
                    const arr = new Array<TransactionCategory>();
                    transactionCategories.forEach((val: Array<TransactionCategory>, _) => arr.push(...val));
                    this.transactionCategories = arr;
                    this.subscriptions.push(this.getScheduledTransactions(true).subscribe());
                }
            ));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    getScheduledTransactions(isInit?: boolean): Observable<Array<ScheduledTransaction>> {
        if (isInit) {
            return this.apiService.get(API_PATH)
                .pipe(
                    map(
                        data => {
                            const arr = new Array<ScheduledTransaction>();
                            data.scheduled_transactions.forEach(element => {
                                const transactionCategory = this.transactionCategories.find(tc => tc.id === element.transaction_category.id);
                                arr.push(new ScheduledTransaction(element, transactionCategory));
                            });
                            this._scheduledTransactionSubject.next(arr);
                            return arr;
                        },
                        err => this.budgetMeToastrService.showError(err)
                    )
                )
        } else {
            return this.scheduledTransactions;
        }
    }

    createScheduledTransaction(saveScheduledTransaction: ScheduledTransaction): Observable<ScheduledTransaction> {
        return this.apiService.post(API_PATH, saveScheduledTransaction)
            .pipe(
                map(
                    data => {
                        const st = data.scheduled_transaction;
                        const transactionCategory = this.transactionCategories.find(tc => tc.id === st.id);
                        const scheduledTransaction = new ScheduledTransaction(st, transactionCategory);
                        const arr = this._scheduledTransactionSubject.value;
                        arr.push(scheduledTransaction);
                        this._scheduledTransactionSubject.next(arr);
                        this.budgetMeToastrService.showSuccess('Scheduled Transaction created');
                        return scheduledTransaction;
                    }
                )
            )
    }

    updateScheduledTransaction(updateScheduledTransaction: ScheduledTransaction): Observable<ScheduledTransaction> {
        return this.apiService.put(API_PATH + `/${updateScheduledTransaction.id}`, updateScheduledTransaction)
            .pipe(
                map(
                    data => {
                        const st = data.scheduled_transaction;
                        const transactionCategory = this.transactionCategories.find(tc => tc.id === st.id);
                        const scheduledTransaction = new ScheduledTransaction(st, transactionCategory);
                        const arr = this._scheduledTransactionSubject.value;
                        const index = arr.findIndex(b => b.id === updateScheduledTransaction.id);
                        arr[index] = scheduledTransaction;
                        this._scheduledTransactionSubject.next(arr);
                        this.budgetMeToastrService.showSuccess('Scheduled Transaction updated');
                        return scheduledTransaction;
                    }
                )
            )
    }

    deleteScheduledTransaction(deleteScheduledTransaction: ScheduledTransaction): Observable<ScheduledTransaction> {
        return this.apiService.delete(API_PATH + `/${deleteScheduledTransaction.id}`)
            .pipe(
                map(
                    data => {
                        const arr = this._scheduledTransactionSubject.value;
                        const index = arr.findIndex(b => b.id === deleteScheduledTransaction.id);
                        arr.splice(index, 1);
                        this._scheduledTransactionSubject.next(arr);
                        this.budgetMeToastrService.showSuccess('Scheduled Transaction deleted');
                        return data;
                    }
                )
            )
    }

}
