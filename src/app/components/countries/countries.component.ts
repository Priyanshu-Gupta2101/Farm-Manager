import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Country } from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-countries",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './countries.component.html',
  styles: [
    `
    .space-y-6 > * + * {
      margin-top: 1.5rem;
    }
    .gap-6 {
      gap: 1.5rem;
    }
    .gap-2 {
      gap: 0.5rem;
    }
    .gap-1 {
      gap: 0.25rem;
    }
    .gap-3 {
      gap: 0.75rem;
    }
  `,
  ],
})
export class CountriesComponent implements OnInit {
  countries: Country[] = []
  showCreateModal = false
  isLoading = false
  error = ""
  canCreate = false
  countryForm: FormGroup

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.countryForm = this.fb.group({
      name: ["", Validators.required],
      code: ["", [Validators.required, Validators.maxLength(3)]],
    })
  }

  ngOnInit() {
    this.canCreate = this.authService.canCreate()
    this.loadCountries()
  }

  loadCountries() {
    this.apiService.getAllCountries().subscribe({
      next: (countries) => {
        this.countries = countries
      },
      error: (error) => {
        console.error("Error loading countries:", error)
        this.countries = [
          { id: 1, name: "United States", code: "US", created_at: "2024-01-15" },
          { id: 2, name: "Canada", code: "CA", created_at: "2024-01-14" },
          { id: 3, name: "Mexico", code: "MX", created_at: "2024-01-13" },
          { id: 4, name: "Brazil", code: "BR", created_at: "2024-01-12" },
        ]
      },
    })
  }

  onSubmit() {
    if (this.countryForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.countryForm.value
      const countryData = {
        name: formValue.name,
        code: formValue.code.toUpperCase(),
      }

      this.apiService.createCountry(countryData).subscribe({
        next: (newCountry) => {
          this.countries.unshift(newCountry)
          this.countryForm.reset()
          this.showCreateModal = false
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating country:", error)
          this.error = "Failed to create country. Please try again."
          this.isLoading = false
        },
      })
    }
  }

  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.showCreateModal = false
    }
  }
}
