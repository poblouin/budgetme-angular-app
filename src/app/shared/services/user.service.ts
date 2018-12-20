
import { Injectable, } from '@angular/core';

import { map, mergeMap, distinctUntilChanged } from 'rxjs/operators';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';


@Injectable()
export class UserService {
    private currentUserSubject = new BehaviorSubject<User>(new User());
    private isAuthenticatedSubject = new ReplaySubject<boolean>(1);

    public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
    public isAuthenticated = this.isAuthenticatedSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private jwtService: JwtService
    ) { }

    getCurrentUser(): User {
        return this.currentUserSubject.value;
    }

    removeUser() {
        this.jwtService.destroyToken();
        this.currentUserSubject.next(new User());
        this.isAuthenticatedSubject.next(false);
    }

    populate() {
        if (this.jwtService.getAccessToken()) {
            this.apiService.get('/user').subscribe(
                data => this.setUser(data.user),
                err => this.removeUser()
            );
        } else {
            this.removeUser();
        }
    }

    login(credentials: Object): Observable<User> {
        return this.obtainToken(credentials).pipe(mergeMap(
            res => {
                return this.apiService.get('/user').pipe(map(
                    data => {
                        this.setUser(data.user);
                        return data;
                    },
                    err => this.removeUser()
                ));
            }
        ));
    }

    register(credentials: Object): Observable<User> {
        return this.apiService.post('/users', { user: credentials }).pipe(mergeMap(
            data => {
                this.setUser(data.user);
                return this.obtainToken(credentials).pipe(map(
                    hasToken => {
                        if (!hasToken) {
                            this.removeUser();
                            return {};
                        } else {
                            return data;
                        }
                    }
                ));
            }
        ));
    }

    update(user): Observable<User> {
        return this.apiService.put('/user', { user }).pipe(map(
            data => {
                this.currentUserSubject.next(data.user);
                return data.user;
            }
        ));
    }

    private setUser(user: User) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
    }

    private obtainToken(credentials: Object): Observable<Boolean> {
        return this.apiService.post('/token', credentials).pipe(map(
            data => {
                this.jwtService.saveToken(data);
                return true;
            },
            err => false
        ));
    }

}
