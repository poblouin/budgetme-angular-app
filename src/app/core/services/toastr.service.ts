import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class BudgetMeToastrService {
    constructor(
        private toastrService: ToastrService
    ) { }

    showSuccess(msg: string, title?: string): void {
        if (!title) {
            title = 'Success';
        }
        this.toastrService.success(msg, title);
    }

    showError(errors: string, title?: string): void {
        if (!title) {
            title = 'Oh no!';
        }
        this.toastrService.error(errors, title);
    }
}
