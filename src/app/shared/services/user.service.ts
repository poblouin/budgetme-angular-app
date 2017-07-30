import { Injectable, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';


@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>(new User());
  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);

  public currentUser = this.currentUserSubject.asObservable().distinctUntilChanged();
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor (
    private apiService: ApiService,
    private http: Http,
    private jwtService: JwtService
  ) {}

  populate() {
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
        .subscribe(
          data => this.setUser(data.user),
          err => this.removeUser()
        );
    } else {
      this.removeUser();
    }
  }

  login(credentials): Observable<User> {
    return this.apiService.get('/user')
    .map(
      data => {
        this.setUser(data.user);
        return data;
      }
    );
  }

  register(credentials): Observable<User> {
    return this.apiService.post('/users', {user: credentials})
      .map(
        data => {
          this.setUser(data.user);
          this.obtainToken(credentials);
          return data;
        }
      );
  }

  obtainToken(credentials): Observable<any> {
    return this.apiService.post('/token-auth', {credentials})
      .map(
        data => {
          this.jwtService.saveToken(data.token);
          return data;
        }
      );
  }

  update(user): Observable<User> {
    return this.apiService
    .put('/user', { user })
    .map(data => {
      this.currentUserSubject.next(data.user);
      return data.user;
    });
  }

  setUser(user: User) {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  removeUser() {
    this.jwtService.destroyToken();
    this.currentUserSubject.next(new User());
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

}
