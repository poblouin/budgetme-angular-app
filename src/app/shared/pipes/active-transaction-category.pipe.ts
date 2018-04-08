import { Pipe, PipeTransform } from '@angular/core';

import { TransactionCategory } from 'app/core/models/transaction-category';

@Pipe({
    name: 'activeTransactionCategory',
})
export class ActiveTransactionCategoryPipe implements PipeTransform {

    transform(transactionCategories: TransactionCategory[]): TransactionCategory[] {
        if (transactionCategories) {
            return transactionCategories.filter(tc => {
                return tc.budget.isActive();
            });
        }
    }

}
