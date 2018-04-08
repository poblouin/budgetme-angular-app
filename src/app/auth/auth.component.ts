import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../shared';
import { BudgetMeToastrService } from '../core/services/toastr.service';

@Component({
  selector: 'auth-page',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
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
    private budgetMeToastrService: BudgetMeToastrService
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
        data => this.router.navigateByUrl('/home'),
        err => {
          this.isSubmitting = false;
          this.budgetMeToastrService.showError(err);
        }
        );
    } else {
      this.userService
        .register(credentials)
        .subscribe(
        data => this.router.navigateByUrl('/home'),
        err => {
          this.isSubmitting = false;
          this.budgetMeToastrService.showError(err);
        }
        );
    }
  }

}
