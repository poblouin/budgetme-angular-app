import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { BudgetMeToastrService } from './toastr.service';
import { Transaction } from 'app/core/models/transaction';

@Injectable()
export class TransactionService {
    private API_PATH = '/transaction';
    private _transactionSubject = new BehaviorSubject<Map<string, Array<Transaction>>>(new Map());

    public readonly transactions = this._transactionSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private budgetMeToastrService: BudgetMeToastrService
    ) { }

    getTransactions(budgetNames: Array<string>, periodStart: string, periodEnd: string): void {
        const sources = [];

        budgetNames.forEach(budgetName => {
            const param = new URLSearchParams();
            param.set('budget_name', budgetName);
            param.set('from_date', periodStart);
            param.set('to_date', periodEnd);
            sources.push(this.apiService.get('/transaction', param));
        });
        if (sources.length === 0) { return; }

        Observable.forkJoin(...sources).subscribe(
            (res: any) => {
                const transactionFilterCat = new Map<string, Array<Transaction>>();
                for (let i = 0; i < res.length; i++) {
                    const transactions = res[i].transactions;
                    transactions.forEach(e => {
                        const transaction = new Transaction(e);
                        const key = this.createKey(
                            transaction.transactionCategory.budget.name,
                            transaction.transactionCategory.name,
                            periodStart,
                            periodEnd
                        );
                        const arr = transactionFilterCat.get(key);
                        if (arr !== undefined) {
                            arr.push(transaction);
                        } else {
                            transactionFilterCat.set(key, new Array(transaction));
                        }
                    });
                }
                this._transactionSubject.next(transactionFilterCat);
            }
        );
    }

    getTransactionsPerBudget(): Map<string, Array<Transaction>> {
        const newM = new Map<string, Array<Transaction>>();
        this._transactionSubject.value.forEach((transactions, key) => {
            const budgetName = this.getBudgetNameFromKey(key);
            const transactionsCopy = new Array(...transactions);
            const arr = newM.get(budgetName);
            if (arr !== undefined) {
                arr.push.apply(arr, transactionsCopy);
            } else {
                newM.set(budgetName, transactionsCopy);
            }
        });
        return newM;
    }

    createTransaction(newTransaction: Transaction, periodStart: string, periodEnd: string): Observable<Transaction> {
        return this.apiService.post(this.API_PATH, newTransaction).map(
            data => {
                const transaction = new Transaction(data.transaction);
                const budgetName = transaction.transactionCategory.budget.name;
                const tcName = transaction.transactionCategory.name;
                const key = this.createKey(budgetName, tcName, periodStart, periodEnd);
                this.addTransactionToCache(key, transaction);
                this._transactionSubject.next(this._transactionSubject.value);
                this.budgetMeToastrService.showSuccess('Transaction created');
                return transaction;
            }
        );
    }

    updateTransaction(
        updateTransaction: Transaction,
        periodStart: string,
        periodEnd: string,
        oldCategoryName: string,
        oldBudgetName: string): Observable<Transaction> {
        return this.apiService.put(`${this.API_PATH}/${updateTransaction.id}`, updateTransaction).map(
            data => {
                const transaction = new Transaction(data.transaction);
                const budgetName = transaction.transactionCategory.budget.name;
                const tcName = transaction.transactionCategory.name;
                const key = this.createKey(budgetName, tcName, periodStart, periodEnd);
                if (oldCategoryName || oldBudgetName) {
                    const budgetNameOldKey = oldBudgetName ? oldBudgetName : budgetName;
                    const catNameOldKey = oldCategoryName ? oldCategoryName : tcName;
                    const oldKey = this.createKey(budgetNameOldKey, catNameOldKey, periodStart, periodEnd);
                    this.deleteTransactionFromCache(oldKey, transaction.id);
                }
                this.addTransactionToCache(key, transaction);
                this._transactionSubject.next(this._transactionSubject.value);
                this.budgetMeToastrService.showSuccess('Transaction updated');
                return transaction;
            }
        );
    }

    deleteTransaction(deleteTransaction: any, periodStart: string, periodEnd: string): Observable<Transaction> {
        return this.apiService.delete(this.API_PATH + `/${deleteTransaction.id}`).map(
            data => {
                const budgetName = deleteTransaction.transaction_category.budget.name;
                const tcName = deleteTransaction.transaction_category.name;
                const key = this.createKey(budgetName, tcName, periodStart, periodEnd);
                this.deleteTransactionFromCache(key, deleteTransaction.id);
                this._transactionSubject.next(this._transactionSubject.value);
                this.budgetMeToastrService.showSuccess('Transaction deleted');
                return data;
            }
        );
    }

    private addTransactionToCache(key: string, transaction: Transaction): void {
        const map = this._transactionSubject.value;
        if (map.has(key)) {
            map.get(key).push(transaction);
        } else {
            map.set(key, new Array(transaction));
        }
    }

    private deleteTransactionFromCache(key: string, transactionId: number): void {
        const map = this._transactionSubject.value;
        const index = map.get(key).findIndex(t => t.id === transactionId);
        map.get(key).splice(index, 1);
    }

    private createKey(budgetName: string, catName: string, periodStart: string, periodEnd: string): string {
        return [budgetName, catName, periodStart, periodEnd].join('_');
    }

    private getBudgetNameFromKey(key: string): string {
        return key.split('_')[0];
    }

}
