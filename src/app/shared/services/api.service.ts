import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { catchError, shareReplay } from 'rxjs/operators';
import { throwError as observableThrowError,  Observable } from 'rxjs';

import { environment } from '../../../environments/environment';


@Injectable()
export class ApiService {

    constructor(private http: HttpClient) { }

    get(path: string, params?: HttpParams): Observable<any> {
        if (params === undefined) {
            params = new HttpParams();
        }
        return this.http.get(`${environment.api_url}${path}`, { params: params }).pipe(
            shareReplay(),
            catchError(this.formatErrors), );
    }

    put(path: string, body: Object = {}): Observable<any> {
        return this.http.put(`${environment.api_url}${path}`, JSON.stringify(body)).pipe(
            shareReplay(),
            catchError(this.formatErrors), );
    }

    post(path: string, body: Object = {}): Observable<any> {
        return this.http
        .post(`${environment.api_url}${path}`, JSON.stringify(body)).pipe(
            shareReplay(),
            catchError(this.formatErrors), );
    }

    delete(path): Observable<any> {
        return this.http.delete(`${environment.api_url}${path}`).pipe(
            shareReplay(),
            catchError(this.formatErrors), );
    }

    private formatErrors(httpError: HttpErrorResponse): Observable<any> {
        const error = httpError.error;
        let errStr;
        if ('errors' in error) {
            errStr = JSON.stringify(error.errors);
        } else {
            errStr = JSON.stringify(error);
        }
        return observableThrowError(errStr);
    }

}
