import { NgModule } from '@angular/core';
import {
    BudgetService,
    BudgetMeToastrService,
    TransactionCategoryService,
    TransactionService,
    DashService
} from './index';


@NgModule({
    imports: [
    ],
    providers: [
        BudgetService,
        BudgetMeToastrService,
        TransactionCategoryService,
        TransactionService,
        DashService
    ],
    declarations: [

    ]
})
export class CoreModule { }
