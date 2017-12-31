import { NgModule } from '@angular/core';
import {
    BudgetService,
    ErrorService,
    TransactionCategoryService,
    TransactionService
} from './index';


@NgModule({
    imports: [

    ],
    providers: [
        BudgetService,
        ErrorService,
        TransactionCategoryService,
        TransactionService
    ],
    declarations: [

    ]
})
export class CoreModule { }
