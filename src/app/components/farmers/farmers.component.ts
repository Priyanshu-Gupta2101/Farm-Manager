import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Farmer, Country } from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"

@Component({
  selector: "app-farmers",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './farmers.component.html',
  styles: [
    `
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-1 { gap: 0.25rem; }
    .gap-3 { gap: 0.75rem; }
  `,
  ],
})
export class FarmersComponent implements OnInit {
  farmers: Farmer[] = []
  activeFarmers: Farmer[] = []
  
  activeTab = "active"
  countries: Country[] = []
  showCreateModal = false
  isLoading = false
  error = ""
  canCreate = false
  searchQuery = ""
  farmerForm: FormGroup

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.farmerForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      language: ["", Validators.required],
      phone: ["", Validators.required],
      country_id: ["", Validators.required],
    })
  }

  ngOnInit() {
    this.canCreate = this.authService.canCreate()
    this.loadFarmers()
    this.loadCountries()
  }

  get filteredFarmers(): Farmer[] {
    let farmers: Farmer[] = []

    switch (this.activeTab) {
        case "active":
          farmers = this.activeFarmers
          break
        case "all":
          farmers = this.farmers
          break
      }

    if (!this.searchQuery) return farmers

    const query = this.searchQuery.toLowerCase()
    return farmers.filter(
      (farmer) =>
        farmer.name.toLowerCase().includes(query) ||
        farmer.language.toLowerCase().includes(query) ||
        farmer.country?.name.toLowerCase().includes(query) 
    )
  }

  loadFarmers() {
    this.apiService.getActiveFarmers().subscribe({
      next: (farmers) => {
          this.activeFarmers = farmers
      },
      error: (error) => {
        console.error("Error loading today's schedules:", error)
        this.activeFarmers = []
      },
    })
    

    this.apiService.getAllFarmers().subscribe({
      next: (farmers) => {
        this.farmers = farmers
      },
      error: (error) => {
        console.error("Error loading farmers:", error)
        // Mock data fallback
        this.farmers = [
          {
            id: 1,
            name: "John Smith",
            language: "English",
            phone_number: "+1-555-0123",
            country_id: 1,
            created_at: "2024-01-15",
          },
          {
            id: 1,
            name: "Maria Garcia",
            language: "English",
            phone_number: "+1-555-0124",
            country_id: 3,
            created_at: "2024-01-14",
          },
        ]
      },
    })
  }

  loadCountries() {
    this.apiService.getAllCountries().subscribe({
      next: (countries) => {
        this.countries = countries
      },
      error: (error) => {
        console.error("Error loading countries:", error)
        // Mock data fallback
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
    if (this.farmerForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.farmerForm.value

      this.apiService.createFarmer(formValue).subscribe({
        next: (newFarmer) => {
          this.farmers.unshift(newFarmer)
          this.farmerForm.reset()
          this.showCreateModal = false
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating farmer:", error)
          this.error = "Failed to create farmer. Please try again."
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

  openDetails(farmerId: number) {
    this.router.navigate(['/dashboard/farmers' , farmerId])
  }
}
