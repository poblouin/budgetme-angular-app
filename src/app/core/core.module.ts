import { NgModule } from '@angular/core';
import {
    BudgetService,
    BudgetMeToastrService,
    TransactionCategoryService,
    TransactionService,
    DashService,
    BudgetColorService
} from './index';

@NgModule({
    imports: [
    ],
    providers: [
        BudgetService,
        BudgetMeToastrService,
        TransactionCategoryService,
        TransactionService,
        DashService,
        BudgetColorService
    ],
    declarations: [

    ]
})
export class CoreModule { }
