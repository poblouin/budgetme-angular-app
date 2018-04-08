import { Injectable } from '@angular/core';
import { HttpRequest, HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

import * as Raven from 'raven-js';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../../environments/environment';


@Injectable()
export class ApiService {

    constructor(private http: HttpClient) { }

    get(path: string, params?: HttpParams): Observable<any> {
        if (params === undefined) {
            params = new HttpParams();
        }
        return this.http.get(`${environment.api_url}${path}`, { params: params })
            .shareReplay()
            .catch(this.formatErrors);
    }

    put(path: string, body: Object = {}): Observable<any> {
        return this.http.put(`${environment.api_url}${path}`, JSON.stringify(body))
            .shareReplay()
            .catch(this.formatErrors);
    }

    post(path: string, body: Object = {}): Observable<any> {
        return this.http
        .post(`${environment.api_url}${path}`, JSON.stringify(body))
            .shareReplay()
            .catch(this.formatErrors);
    }

    delete(path): Observable<any> {
        return this.http.delete(`${environment.api_url}${path}`)
            .shareReplay()
            .catch(this.formatErrors);
    }

    private formatErrors(error: any): Observable<any> {
        // TODO: Quick dirty fix.

        // error = error.json();
        let errStr = error._body;
        // let errStr = 'Unexpected error occured';
        // try {
        //   errStr = error.error[0];
        // } catch (TypeError) {
        //   errStr = error.errors[0];
        // }
        Raven.captureException(errStr);
        return Observable.throw(errStr);
    }

}
