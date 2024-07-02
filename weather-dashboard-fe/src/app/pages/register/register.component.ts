import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  message: string;
  error: boolean;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.message = '';
    this.error = false;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.http
        .post('http://localhost:3000/api/register', this.registerForm.value)
        .subscribe(
          (response: any) => {
            this.message = response.message;
          },
          (error: any) => {
            this.error = true;
            this.message = error.error.message || 'An error occurred';
          }
        );
    }
    if (!this.error) {
      this.router.navigate(['/']);
    }
  }
}
