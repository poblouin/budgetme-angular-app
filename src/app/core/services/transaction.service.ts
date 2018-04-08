import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import _ = require('lodash');

import { ApiService } from '../../shared/services/api.service';
import { BudgetMeToastrService } from './toastr.service';
import { Transaction } from 'app/core/models/transaction';
import { Budget } from '../models/budget';


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
            const params = new HttpParams({
                fromObject: {
                    'budget_name': budgetName,
                    'from_date': periodStart,
                    'to_date': periodEnd
                }
            });
            sources.push(this.apiService.get('/transaction', params));
        });
        if (sources.length === 0) { return; }

        Observable.forkJoin(sources).subscribe(
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
                if (!this.isOutsidePeriod(transaction.date, periodStart, periodEnd)) {
                    const key = this.createKey(budgetName, tcName, periodStart, periodEnd);
                    this.updateTransactionCache(key, transaction);
                    this._transactionSubject.next(this._transactionSubject.value);
                }
                this.budgetMeToastrService.showSuccess('Transaction created');
                return transaction;
            }
        );
    }

    updateTransaction(
        updateTransaction: Transaction,
        oldTransaction: Transaction,
        periodStart: string,
        periodEnd: string
    ): Observable<Transaction> {
        return this.apiService.put(`${this.API_PATH}/${updateTransaction.id}`, updateTransaction).map(
            data => {
                const transaction = new Transaction(data.transaction);
                const newTranBudgetName = transaction.transactionCategory.budget.name;
                const newTranCatName = transaction.transactionCategory.name;
                const key = this.createKey(newTranBudgetName, newTranCatName, periodStart, periodEnd);

                // Check old data to remove from cache if needed.
                const oldTranBudgetName = oldTransaction.transactionCategory.budget.name;
                const oldTranCatName = oldTransaction.transactionCategory.name;
                const oldTranDate = oldTransaction.date;
                const newTranDate = transaction.date;
                const oldBudgetName = oldTranBudgetName !== newTranBudgetName ? oldTranBudgetName : undefined;
                const oldCategoryName = oldTranCatName !== newTranCatName ? oldTranCatName : undefined;
                const oldDate = oldTranDate !== newTranDate ? oldTranDate : undefined;
                const dateIsOutsidePeriod = this.isOutsidePeriod(oldDate, periodStart, periodEnd);

                if (oldCategoryName || oldBudgetName || dateIsOutsidePeriod) {
                    const budgetNameOldKey = oldBudgetName ? oldBudgetName : newTranBudgetName;
                    const catNameOldKey = oldCategoryName ? oldCategoryName : newTranCatName;
                    const oldKey = this.createKey(budgetNameOldKey, catNameOldKey, periodStart, periodEnd);
                    this.deleteTransactionFromCache(oldKey, transaction.id);
                }
                if (!dateIsOutsidePeriod) {
                    this.updateTransactionCache(key, transaction);
                }
                this._transactionSubject.next(this._transactionSubject.value);
                this.budgetMeToastrService.showSuccess('Transaction updated');
                return transaction;
            }
        );
    }

    deleteTransaction(deleteTransaction: any, periodStart: string, periodEnd: string): Observable<Transaction> {
        return this.apiService.delete(this.API_PATH + `/${deleteTransaction.id}`).map(
            data => {
                if (!this.isOutsidePeriod(deleteTransaction.date, periodStart, periodEnd)) {
                    const budgetName = deleteTransaction.transaction_category.budget.name;
                    const tcName = deleteTransaction.transaction_category.name;
                    const key = this.createKey(budgetName, tcName, periodStart, periodEnd);
                    this.deleteTransactionFromCache(key, deleteTransaction.id);
                    this._transactionSubject.next(this._transactionSubject.value);
                }
                this.budgetMeToastrService.showSuccess('Transaction deleted');
                return data;
            }
        );
    }

    updateTransactionCacheOnBudgetChange(oldBudgetName: string, newBudgetName?: string, isDelete?: boolean) {
        const transactionsMap = this._transactionSubject.value;
        let foundKey;
        for (const key of Array.from(transactionsMap.keys())) {
            if (oldBudgetName === this.getBudgetNameFromKey(key)) {
                foundKey = key;
                break;
            }
        }
        if (foundKey && !isDelete) {
            const keyStrArr = foundKey.split('_');
            keyStrArr[0] = newBudgetName;
            const newKey = keyStrArr.join('_');
            const arr = _.cloneDeep(transactionsMap.get(foundKey));
            transactionsMap.delete(foundKey);
            transactionsMap.set(newKey, arr);
        } else {
            transactionsMap.delete(foundKey);
        }
    }

    updateTransactionCacheOnCategoryChange(oldCategoryName: string, oldBudgetName?: string, newCategoryName?: string, isDelete?: boolean) {
        const transactionsMap = this._transactionSubject.value;
        const foundKey = this.getKeyFromBudgetAndCategory(oldBudgetName, oldCategoryName);
        if (foundKey && !isDelete) {
            const keyStrArr = foundKey.split('_');
            keyStrArr[1] = newCategoryName;
            const newKey = keyStrArr.join('_');
            const arr = _.cloneDeep(transactionsMap.get(foundKey));
            transactionsMap.delete(foundKey);
            transactionsMap.set(newKey, arr);
        } else {
            transactionsMap.delete(foundKey);
        }
    }

    private updateTransactionCache(key: string, transaction: Transaction): void {
        const map = this._transactionSubject.value;
        if (map.has(key)) {
            const arr = map.get(key);
            const index = arr.findIndex(t => t.id === transaction.id);
            if (index >= 0) {
                arr[index] = transaction;
                map.set(key, arr);
            } else {
                map.get(key).push(transaction);
            }
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

    private getKeyFromBudgetAndCategory(budgetName: string, categoryName: string): string {
        const transactionsMap = this._transactionSubject.value;
        for (const key of Array.from(transactionsMap.keys())) {
            const splittedKey = key.split('_');
            if (key[0] === budgetName && key[1] === categoryName) {
                return splittedKey.join('_');
            }
        }
    }

    private isOutsidePeriod(date: string, periodStart: string, periodEnd: string): boolean {
        if (date === undefined) {
            return false;
        }
        return periodStart > date || date > periodEnd;
    }

}
