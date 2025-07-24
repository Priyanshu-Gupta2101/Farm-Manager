import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators, ValidatorFn, ValidationErrors, AbstractControl } from "@angular/forms"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-create-user-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-user-modal.component.html',
  styles: [
    `
    .gap-4 { gap: 1rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-2 { gap: 0.5rem; }
  `,
  ],
})
export class CreateUserModalComponent {
  @Input() isOpen = false
  @Input() userRole: string = ""
  @Output() closeEvent = new EventEmitter<void>()

  userForm: FormGroup
  isLoading = false
  error = ""
  showPassword = false
  showConfirmPassword = false

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        role: ["", Validators.required],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      }
    )

    this.userForm.setValidators(this.passwordMatchValidator())
  }

  passwordMatchValidator(): ValidatorFn {
    let validatorFn = (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const password = form.get("password")
      const confirmPassword = form.get("confirmPassword")

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true })
        return { passwordMismatch: true }
      }

      if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors }
        delete errors['passwordMismatch']
        const hasOtherErrors = Object.keys(errors).length > 0
        confirmPassword.setErrors(hasOtherErrors ? errors : null)
      }

      return null
    }
    return validatorFn
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.userForm.value
      const userData = {
        email: formValue.email,
        role: formValue.role,
        password: formValue.password,
      }

      this.authService.createUser(userData).subscribe({
        next: () => {
          this.userForm.reset()
          this.close()
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating user:", error)
          this.error = "Failed to create user. Please try again."
          this.isLoading = false
        },
      })
    } else {
      if (this.userForm.hasError("passwordMismatch")) {
        this.error = "Passwords do not match"
      } else if (this.userForm.get("password")?.hasError("minlength")) {
        this.error = "Password must be at least 6 characters long"
      } else {
        this.error = "Please fill in all required fields"
      }
    }
  }

  close() {
    this.userForm.reset()
    this.error = ""
    this.showPassword = false
    this.showConfirmPassword = false
    this.closeEvent.emit()
  }

  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.close()
    }
  }
}
