import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { User, UserService } from '../shared';

@Component({
  selector: 'settings-page',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  user: User = new User();
  settingsForm: FormGroup;
  errors: Object = {};
  isSubmitting = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      username: '',
      email: '',
      password: ''
    });
  }

  ngOnInit() {
    (<any>Object).assign(this.user, this.userService.getCurrentUser());
    this.settingsForm.patchValue(this.user);
  }

  logout() {
    this.userService.removeUser();
    this.router.navigateByUrl('/dash');
    window.location.reload();
  }

  submitForm() {
    this.isSubmitting = true;
    this.updateUser(this.settingsForm.value);
    this.userService
    .update(this.user)
    .subscribe(
      updatedUser => this.router.navigateByUrl('/dash'),
      err => {
        this.errors = err;
        this.isSubmitting = false;
      }
    );
  }

  updateUser(values: Object) {
    (<any>Object).assign(this.user, values);
  }

}
