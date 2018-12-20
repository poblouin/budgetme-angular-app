import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { UserService } from '../shared';

@Injectable()
export class HomeResolver implements Resolve<boolean> {
    constructor(private router: Router, private userService: UserService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const obs = this.userService.isAuthenticated.pipe(take(1));
        obs.subscribe(
            isAuth => {
                if (!isAuth) {
                    this.router.navigate(['/login']);
                }
            }
        );
        return obs;
    }
}
