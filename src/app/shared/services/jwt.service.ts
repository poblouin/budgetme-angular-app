import { Injectable } from '@angular/core';

import * as jwt_decode from 'jwt-decode';

import { UserService } from './user.service';


@Injectable()
export class JwtService {

  getToken(): String {
    return window.localStorage['jwtToken'];
  }

  saveToken(token: String) {
    console.log('saving token')
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

  isTokenAlmostExpired() {
    if (this.getToken() !== undefined) {
      const token = window.localStorage['jwtToken'];
      const decoded = jwt_decode(token);
      const exp = decoded['exp'];
      const ms = Date.now();
      const seconds = Math.floor(ms / 1000);
      console.log(exp - seconds)
      return (exp - seconds) < 20;
    }
  }

}
