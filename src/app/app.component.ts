import { Component, OnInit } from '@angular/core';

import { UserService } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor (
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.populate();
    window.addEventListener('keydown', this.handleFirstTab);
  }

  handleFirstTab(e) {
    if (e.keyCode === 9) {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', this.handleFirstTab);
    }
  }

}
