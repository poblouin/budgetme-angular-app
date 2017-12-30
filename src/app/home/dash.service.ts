import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Constant } from '../shared/constants';
import { Period } from './types';
import { BudgetPeriod } from 'app/home/models/budget-period';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DashService {

    private _budgetPeriodSubject = new BehaviorSubject<BudgetPeriod>(new BudgetPeriod(Constant.DEFAULT_PERIOD));
    private _selectedPeriodSubject = new BehaviorSubject<Period>(Constant.DEFAULT_PERIOD);

    public budgetPeriod = this._budgetPeriodSubject.asObservable();
    public selectedPeriod = this._selectedPeriodSubject.asObservable().distinctUntilChanged();

    getBudgetPeriod(): BudgetPeriod {
        return this._budgetPeriodSubject.value;
    }

    setBudgetPeriod(period: Period): Observable<BudgetPeriod> {
        const bp = new BudgetPeriod(period);
        this._budgetPeriodSubject.next(bp);
        return Observable.of(bp);
    }

    getSelectedPeriod(): Period {
        return this._selectedPeriodSubject.value;
    }

    setSelectedPeriod(newPeriod: Period): void {
        this._selectedPeriodSubject.next(newPeriod);
    }

}
