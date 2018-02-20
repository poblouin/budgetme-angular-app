import { NgModule } from '@angular/core';
import {
    BudgetService,
    BudgetMeToastrService,
    TransactionCategoryService,
    TransactionService
} from './index';


@NgModule({
    imports: [

    ],
    providers: [
        BudgetService,
        BudgetMeToastrService,
        TransactionCategoryService,
        TransactionService
    ],
    declarations: [

    ]
})
export class CoreModule { }
