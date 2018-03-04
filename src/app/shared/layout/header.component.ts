import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { User } from '../models';
import { UserService } from '../services';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @ViewChild('navbarToggler') private navbarToggler: ElementRef;
  public currentUser: User;

  constructor(
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  navBarTogglerIsVisible() {
    return this.navbarToggler.nativeElement.offsetParent !== null;
  }

  collapseNav() {
    if (this.navBarTogglerIsVisible()) {
      this.navbarToggler.nativeElement.click();
    }
  }

}
