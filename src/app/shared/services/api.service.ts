import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../../environments/environment';
import { JwtService } from './jwt.service';


@Injectable()
export class ApiService {

  constructor(
    private http: Http,
    private jwtService: JwtService,
    private router: Router
  ) { }

  get(path: string, params?: URLSearchParams): Observable<any> {
    if (params === undefined) {
      params = new URLSearchParams()
    }
    return this.http.get(`${environment.api_url}${path}`, { headers: this.setHeaders(), search: params })
      .map((res: Response) => res.json())
      .publishLast()
      .refCount()
      .catch(this.formatErrors);
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(`${environment.api_url}${path}`, JSON.stringify(body), { headers: this.setHeaders() })
      .map((res: Response) => res.json())
      .publishLast()
      .refCount()
      .catch(this.formatErrors);
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(`${environment.api_url}${path}`, JSON.stringify(body), { headers: this.setHeaders(path !== '/refresh-token') })
      .map((res: Response) => res.json())
      .publishLast()
      .refCount()
      .catch(this.formatErrors);
  }

  delete(path): Observable<any> {
    return this.http.delete(`${environment.api_url}${path}`, { headers: this.setHeaders() })
      .map((res: Response) => res.json())
      .publishLast()
      .refCount()
      .catch(this.formatErrors);
  }

  private formatErrors(error: any): Observable<any> {
    error = error.json();
    let errStr = 'Unexpected error occured'
    try {
      errStr = error.error[0];
    } catch (TypeError) {
      errStr = error.errors[0];
    }
    return Observable.throw(errStr);
  }

  private setHeaders(isNotRefresh = true): Headers {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    let token = this.jwtService.getToken();
    if (this.jwtService.getToken() !== undefined && isNotRefresh) {
      if (this.jwtService.isTokenAlmostExpired()) {
        const obs = this.refreshToken(token)
          .subscribe(
            res => token = this.jwtService.getToken()
          );
      }
    }
    headers['Authorization'] = `Token ${token}`;
    return new Headers(headers);
  }

  private refreshToken(token: String): Observable<boolean> {
    return this.post('/refresh-token', { token: token })
      .map(
        data => {
          this.jwtService.saveToken(data.token);
          return true;
        }
      );
  }

}
