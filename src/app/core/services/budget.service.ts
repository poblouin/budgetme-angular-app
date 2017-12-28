import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiService } from '../../shared/services/api.service';
import { Budget } from '../models/budget';

@Injectable()
export class BudgetService {
    private budgetSubject = new BehaviorSubject<Array<Budget>>(new Array<Budget>());

    public budgets = this.budgetSubject.asObservable();

    constructor(
        private apiService: ApiService    
    ) { }

}
