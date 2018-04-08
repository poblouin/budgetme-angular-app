import { Injectable } from '@angular/core';

import { UserService } from './user.service';


@Injectable()
export class JwtService {

    getAccessToken(): String {
        return window.localStorage['jwtAccessToken'];
    }

    getRefreshToken(): String {
        return window.localStorage['jwtRefreshToken'];
    }

    saveToken(token_obj: any) {
        if ('access' in token_obj) {
            window.localStorage['jwtAccessToken'] = token_obj.access;
        }
        if ('refresh' in token_obj) {
            window.localStorage['jwtRefreshToken'] = token_obj.refresh;
        }
    }

    destroyToken() {
        window.localStorage.removeItem('jwtAccessToken');
        window.localStorage.removeItem('jwtRefreshToken');
    }

}
