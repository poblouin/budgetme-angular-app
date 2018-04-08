import { Pipe, PipeTransform } from '@angular/core';

import { Budget } from '../../core/models/budget';

@Pipe({
    name: 'activeBudget',
})
export class ActiveBudgetPipe implements PipeTransform {

    transform(budgets: Budget[]): Budget[] {
        if (budgets) {
            return budgets.filter(b => {
                return b.isActive();
            });
        }
    }

}
