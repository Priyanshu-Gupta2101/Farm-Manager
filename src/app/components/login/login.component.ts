import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from "@angular/router"
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
  if (this.loginForm.valid) {
    this.isLoading = true;
    this.error = '';

    const { username, password } = this.loginForm.value;

    this.authService.login({ email: username, password }).subscribe({
      next: (response) => {
        console.log(response)
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Invalid username or password';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

}