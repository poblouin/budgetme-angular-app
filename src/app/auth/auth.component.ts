import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../shared';

@Component({
  selector: 'auth-page',
  templateUrl: './auth.component.html',
  styleUrls: [
    './auth.component.css'
  ]
})
export class AuthComponent implements OnInit {
  authType: String = '';
  title: String = '';
  isSubmitting = false;
  authForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
  ) {
    this.authForm = this.fb.group({
      'email': ['', Validators.required],
      'password': ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.url.subscribe(data => {
      this.authType = data[data.length - 1].path;
      this.title = (this.authType === 'login') ? 'Sign in' : 'Sign up';
      if (this.authType === 'register') {
        this.authForm.addControl('username', new FormControl());
      }
    });
  }

  submitForm() {
    this.isSubmitting = true;

    const credentials = this.authForm.value;
    if (this.authType === 'login') {
      this.userService.login(credentials)
        .subscribe(
          data => this.router.navigateByUrl('/'),
          err => {
            this.isSubmitting = false;
            this.showError(err);
          }
        )
    } else {
      this.userService
        .register(credentials)
        .subscribe(
          data => this.router.navigateByUrl('/'),
          err => {
            this.isSubmitting = false;
            this.showError(err);
          }
        );
    }
  }

  private showError(err: any): void {
    this.toastrService.error(err, 'Oh no!');
  }

}
