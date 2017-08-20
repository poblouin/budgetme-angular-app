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

  constructor(
    private apiService: ApiService,
    private http: Http,
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

  login(credentials: Object): Observable<User> {
    return this.obtainToken(credentials)
      .flatMap(
        res => {
          return this.apiService.get('/user')
            .map(
            data => {
              this.setUser(data.user);
              return data;
            },
            err => {
              this.removeUser();
            });
        }
        );
  }

  register(credentials: Object): Observable<User> {
    return this.apiService.post('/users', { user: credentials })
      .map(
        data => {
          this.setUser(data.user);
          this.obtainToken(credentials)
          return data;
        }
      );
  }

  update(user): Observable<User> {
    return this.apiService.put('/user', { user })
      .map(data => {
        this.currentUserSubject.next(data.user);
        return data.user;
      }
      );
  }

  private setUser(user: User) {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private obtainToken(credentials: Object): Observable<Boolean> {
    return this.apiService.post('/obtain-token', credentials)
      .map(
        data => {
          this.jwtService.saveToken(data.token);
          return true;
        }
      );
  }

}
