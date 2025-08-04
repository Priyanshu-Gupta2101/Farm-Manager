import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Farm, Farmer } from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"

@Component({
  selector: "app-farms",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './farms.component.html',
  styles: [
    `
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-1 { gap: 0.25rem; }
    .gap-3 { gap: 0.75rem; }
  `,
  ],
})
export class FarmsComponent implements OnInit {
  farms: Farm[] = []
  farmers: Farmer[] = []
  showCreateModal = false
  isLoading = false
  error = ""
  canCreate = false
  searchQuery = ""
  farmForm: FormGroup

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.farmForm = this.fb.group({
      area: ["", [Validators.required, Validators.min(1)]],
      village: ["", Validators.required],
      farmer_id: ["", Validators.required],
      crop_grown: ["", Validators.required],
      sowing_date: ["", Validators.required],
    })
  }

  ngOnInit() {
    this.canCreate = this.authService.canCreate()
    this.loadFarms()
    this.loadFarmers()
  }

  get filteredFarms(): Farm[] {
    if (!this.searchQuery) return this.farms

    const query = this.searchQuery.toLowerCase()
    return this.farms.filter(
      (farm) =>
        farm.village.toLowerCase().includes(query) ||
        (farm.farmer?.name || '').toLowerCase().includes(query) ||
        farm.crop_grown.toLowerCase().includes(query),
    )
  }

  loadFarms() {
    this.apiService.getAllFarms().subscribe({
      next: (farms: Farm[]) => {
        this.farms = farms
      },
      error: (error: any) => {
        console.error("Error loading farms:", error)
        this.farms = [
          {
            id: 1,
            village: "California, USA",
            area: 150,
            crop_grown: "Corn",
            farmer_id: 1,
            created_at: "2024-01-15",
            sowing_date: ""
          },
          {
            id: 2,
            village: "Texas, USA",
            area: 200,
            crop_grown: "Cotton",
            farmer_id: 1,
            created_at: "2024-01-14",
            sowing_date: ""
          },
        ]
      },
    })
  }

  loadFarmers() {
    this.apiService.getAllFarmers().subscribe({
      next: (farmers: Farmer[]) => {
        this.farmers = farmers
      },
      error: (error: any) => {
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

  onSubmit() {
    if (this.farmForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.farmForm.value
      const farmData = {
        ...formValue,
        area: Number(formValue.area),
      }

      this.apiService.createFarm(farmData).subscribe({
        next: (newFarm) => {
          this.farms.unshift(newFarm)
          this.farmForm.reset()
          this.showCreateModal = false
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating farm:", error)
          this.error = "Failed to create farm. Please try again."
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

  openDetails(farmId: number) {
    this.router.navigate(['/dashboard/farms' , farmId])
  }
}
