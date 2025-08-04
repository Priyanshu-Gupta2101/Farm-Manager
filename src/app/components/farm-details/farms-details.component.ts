import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { Farm, Schedule } from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { ActivatedRoute, Router } from "@angular/router"
import { Location } from "@angular/common"

@Component({
  selector: "app-farm-details",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./farms-details.component.html",
  styles: [
    `
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-1 { gap: 0.25rem; }
    .gap-3 { gap: 0.75rem; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
  `,
  ],
})
export class FarmDetailsComponent implements OnInit {
  farmId: string | null = null
  farm: Farm | null = null
  showCreateModal = false
  isLoading = false
  error = ""
  canCreate = false
  searchQuery = ""
  scheduleForm: FormGroup

  fertilizerTypes = [
    "NPK",
    "Urea",
    "DAP",
    "Compost",
    "Vermicompost",
    "Potash",
    "Zinc Sulphate",
    "Biofertilizer",
    "Ammonium Sulphate",
    "Calcium Nitrate",
  ]

  quantityUnits = ["kg", "ton", "ltr", "gm"]

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.farmId = this.route.snapshot.paramMap.get("id")

    this.scheduleForm = this.fb.group({
      days_after_sowing: ["", [Validators.required, Validators.min(1)]],
      fertilizer: ["", Validators.required],
      quantity: ["", [Validators.required, Validators.min(0.1)]],
      quantity_unit: ["", Validators.required],
      farm_id: [this.farmId, Validators.required],
    })
  }

  ngOnInit() {
    this.canCreate = this.authService.canCreate()
    this.loadFarmById()
  }

  loadFarmById() {
    if (this.farmId) {
      this.isLoading = true
      this.apiService.getFarmById(this.farmId).subscribe({
        next: (farm) => {
          this.farm = farm
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error loading farm details:", error)
          this.error = "Failed to load farm details"
          this.farm = null
          this.isLoading = false
        },
      })
    }
  }

  get filteredSchedules(): Schedule[] {
    if (!this.farm?.schedule) return []

    if (!this.searchQuery.trim()) {
      return this.farm.schedule
    }

    return this.farm.schedule.filter(
      (schedule) =>
        schedule.fertilizer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        schedule.quantity_unit.toLowerCase().includes(this.searchQuery.toLowerCase()),
    )
  }

  onSubmit() {
    if (this.scheduleForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.scheduleForm.value

      this.apiService.createSchedule(formValue).subscribe({
        next: (response) => {
          if (this.farm && this.farm.schedule) {
            this.farm.schedule.push(response.data)
          }
          this.scheduleForm.reset()
          this.scheduleForm.patchValue({ farm_id: this.farmId ? Number.parseInt(this.farmId) : null })
          this.showCreateModal = false
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating schedule:", error)
          this.error = "Failed to create schedule. Please try again."
          this.isLoading = false
        },
      })
    }
  }

  goBack() {
    this.location.back()
  }

  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.showCreateModal = false
      this.error = ""
    }
  }

  calculateFarmAge(sowingDate: string): number {
    const sowing = new Date(sowingDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - sowing.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  formatDate(dateString?: string): string {
    const date = dateString ? new Date(dateString) : null;
    return date && !isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "N/A";
  }


  getScheduleStatus(dueDate: string | null): { status: string; class: string } {
    if (!dueDate) {
      return { status: "No due date", class: "bg-gray-100 text-gray-800 border-gray-200" }
    }

    const due = new Date(dueDate)
    const today = new Date()

    due.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: "Overdue", class: "bg-red-100 text-red-800 border-red-200" }
    } else if (diffDays === 0) {
      return { status: "Due Today", class: "bg-orange-100 text-orange-800 border-orange-200" }
    } else if (diffDays === 1) {
      return { status: "Due Tomorrow", class: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    } else {
      return { status: `Due in ${diffDays} days`, class: "bg-green-100 text-green-800 border-green-200" }
    }
  }

  openDetails(scheduleId: number | undefined) {
    if (scheduleId != undefined) this.router.navigate(['/dashboard/schedules' , scheduleId])
  }

  navigateToFarmer() {
    if (this.farm?.farmer?.id) {
      this.router.navigate(["/dashboard/farmers", this.farm.farmer.id])
    }
  }
}
