import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';

import { throwError as observableThrowError, empty as observableEmpty,  Observable } from 'rxjs';
import { shareReplay, map, switchMap, catchError } from 'rxjs/operators';

import { JwtService } from './services/jwt.service';
import { UserService } from './services/user.service';
import { ApiService } from './services/api.service';
import { BudgetMeToastrService } from '../core/services/toastr.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private jwtService: JwtService,
        private userService: UserService,
        private apiService: ApiService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        request = this.setHeaders(request);

        return next.handle(request).pipe(catchError(error => {

            if (error.status === 401 && !request.url.includes('refresh')) {
                return this.refreshToken().pipe(
                    switchMap(() => {
                        request = this.setHeaders(request);
                        return next.handle(request);
                    }),
                    catchError(() => {
                        this.logout();
                        return observableEmpty();
                    }),);
            }

            return observableThrowError(error);
        }));
    }

    private setHeaders(request) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const accessToken = this.jwtService.getAccessToken();
        if (accessToken) {
            headers['Authorization'] = `Token ${accessToken}`;
        }
        return request.clone({setHeaders: headers});
    }

    private refreshToken(): Observable<any> {
        return this.apiService.post('/token/refresh', { refresh: this.jwtService.getRefreshToken() }).pipe(
            map(data => this.jwtService.saveToken(data)),
            shareReplay(),);
    }

    private logout() {
        this.userService.removeUser();
        this.router.navigateByUrl('/home');
        window.location.reload();
    }

}
