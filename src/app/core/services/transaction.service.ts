import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from './error.service';

@Injectable()
export class TransactionService {
    private API_PATH = '/transaction';

    constructor(
        private apiService: ApiService,
        private errorService: ErrorService
    ) { }

}
