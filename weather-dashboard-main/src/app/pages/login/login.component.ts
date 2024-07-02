import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalService } from 'src/app/services/local/local.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  message: string;
  error: boolean;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.message = '';
    this.error = false;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.http
        .post('http://localhost:3000/api/login', this.loginForm.value)
        .subscribe(
          (response: any) => {
            this.message = response.message;
            localStorage.setItem('email', this.loginForm.value.email);
            localStorage.setItem('token', response.token);
          },
          (error: any) => {
            this.error = true;
            this.message = error.error.message || 'An error occurred';
          }
        );
    }
    if (!this.error) {
      localStorage.setItem('loggedIn', 'true');
      this.router.navigateByUrl('/');
    }
  }
}
