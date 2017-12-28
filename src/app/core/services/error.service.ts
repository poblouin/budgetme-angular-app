import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorService {
    constructor(
        private toastrService: ToastrService
    ) {}

    showError(errors: string, title?: string): void {
        if (!title) {
            title = 'Oh no!';
        }
        this.toastrService.error(errors, title);
    }
}
