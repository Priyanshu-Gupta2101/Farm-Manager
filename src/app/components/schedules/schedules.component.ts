import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type {
  Schedule,
  CreateScheduleRequest,
  Farm,
  Farmer,
  BillOfMaterials,
  FertilizerPrices,
} from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"

@Component({
  selector: "app-schedules",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './schedules.component.html',
  styles: [
    `
      .space-y-6 > * + * { margin-top: 1.5rem; }
      .space-y-3 > * + * { margin-top: 0.75rem; }
      .space-x-8 > * + * { margin-left: 2rem; }
      .gap-6 { gap: 1.5rem; }
      .gap-4 { gap: 1rem; }
      .gap-3 { gap: 0.75rem; }
      .gap-2 { gap: 0.5rem; }
    `,
  ],
})
export class SchedulesComponent implements OnInit {
  todaySchedules: Schedule[] = []
  tomorrowSchedules: Schedule[] = []
  farms: Farm[] = []
  farmers: Farmer[] = []

  activeTab = "today"
  showCreateModal = false
  showBillModal = false
  isLoading = false
  billLoading = false
  error = ""
  billError = ""
  canCreate = false

  scheduleForm: FormGroup
  billForm: FormGroup
  billResult: BillOfMaterials | null = null

  fertilizerTypes = [
    "NPK",
    "Urea",
    "DAP",
    "Compost",
    "Zinc Sulphate",
    "Biofertilizer",
    "Ammonium Sulphate",
    "Potash",
    "Vermicompost",
    "Calcium Nitrate",
  ]

  fertilizerUnits: { [key: string]: string } = {
    NPK: "kg",
    Urea: "kg",
    DAP: "kg",
    Compost: "kg",
    "Zinc Sulphate": "kg",
    Biofertilizer: "ltr",
    "Ammonium Sulphate": "kg",
    Potash: "kg",
    Vermicompost: "kg",
    "Calcium Nitrate": "kg",
  }

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.scheduleForm = this.fb.group({
      farm_id: ["", Validators.required],
      days_after_sowing: ["", [Validators.required, Validators.min(0)]],
      fertilizer: ["", Validators.required],
      quantity: ["", [Validators.required, Validators.min(0.01)]],
      quantity_unit: ["", Validators.required],
    })

    const billFormConfig: any = {
      farmer_id: ["", Validators.required],
    }

    this.fertilizerTypes.forEach((fertilizer) => {
      billFormConfig[`price_${fertilizer}`] = ["", [Validators.min(0)]]
    })

    this.billForm = this.fb.group(billFormConfig)
  }

  ngOnInit() {
    this.canCreate = this.authService.canCreate()
    this.loadSchedules()
    this.loadFarms()
    this.loadFarmers()
  }

  loadSchedules() {
    // Load today's schedules
    this.apiService.getSchedulesToday().subscribe({
      next: (response) => {
        if (response.success) {
          this.todaySchedules = response.data
        }
      },
      error: (error) => {
        console.error("Error loading today's schedules:", error)
        this.todaySchedules = []
      },
    })

    // Load tomorrow's schedules
    this.apiService.getSchedulesTomorrow().subscribe({
      next: (response) => {
        if (response.success) {
          this.tomorrowSchedules = response.data
          
        }
      },
      error: (error) => {
        console.error("Error loading tomorrow's schedules:", error)
        this.tomorrowSchedules = []
      },
    })
  }

  loadFarms() {
    this.apiService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms
      },
      error: (error) => {
        console.error("Error loading farms:", error)
        this.farms = []
      },
    })
  }

  loadFarmers() {
    this.apiService.getAllFarmers().subscribe({
      next: (farmers) => {
        this.farmers = farmers
      },
      error: (error) => {
        console.error("Error loading farmers:", error)
        this.farmers = []
      },
    })
  }

  getFilteredSchedules(): Schedule[] {
    let schedules: Schedule[] = []

    switch (this.activeTab) {
      case "today":
        schedules = this.todaySchedules
        break
      case "tomorrow":
        schedules = this.tomorrowSchedules
        break
    }

    return schedules
  }

  onCreateSubmit() {
    if (this.scheduleForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.scheduleForm.value
      const scheduleData: CreateScheduleRequest = {
        farm_id: Number(formValue.farm_id),
        days_after_sowing: Number(formValue.days_after_sowing),
        fertilizer: formValue.fertilizer,
        quantity: Number(formValue.quantity),
        quantity_unit: formValue.quantity_unit,
      }

      this.apiService.createSchedule(scheduleData).subscribe({
        next: (response) => {
          if (response.data && response.success) {
            this.scheduleForm.reset()
            this.showCreateModal = false
            this.loadSchedules()
          }
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating schedule:", error)
          this.error = error.error?.message || "Failed to create schedule. Please try again."
          this.isLoading = false
        },
      })
    }
  }

  onBillSubmit() {
    if (this.billForm.valid) {
      this.billLoading = true
      this.billError = ""

      const formValue = this.billForm.value
      const farmerId = Number(formValue.farmer_id)

      const fertilizerPrices: FertilizerPrices = {}
      this.fertilizerTypes.forEach((fertilizer) => {
        const price = formValue[`price_${fertilizer}`]
        if (price && price > 0) {
          const unit = this.fertilizerUnits[fertilizer] || "kg"
          fertilizerPrices[`${fertilizer}_${unit}`] = Number(price)
        }
      })

      this.apiService.calculateBillOfMaterials(farmerId, fertilizerPrices).subscribe({
        next: (response) => {
          if (response.success) {
            this.billResult = response.data
          }
          this.billLoading = false
        },
        error: (error) => {
          console.error("Error calculating bill:", error)
          this.billError = error.error?.message || "Failed to calculate bill. Please try again."
          this.billLoading = false
        },
      })
    }
  }

  getBillBreakdown() {
    if (!this.billResult) return []

    return Object.entries(this.billResult.fertilizers).map(([fertilizer, details]) => ({
      fertilizer,
      total_cost: details.total_cost,
      total_quantity: details.total_quantity,
      unit: details.unit,
      unit_price: details.price_per_unit,
      farms: details.farms,
    }))
  }

  isToday(date: string): boolean {
    console.log(date)
    const today = new Date().toISOString().split("T")[0]
    return date.split("T")[0] === today
  }

  isTomorrow(date: string): boolean {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.split("T")[0] === tomorrow.toISOString().split("T")[0]
  }

  closeCreateModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.showCreateModal = false
    }
  }

  closeBillModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.showBillModal = false
      this.billResult = null
    }
  }

  openDetails(scheduleId: number | undefined) {
    if (scheduleId != undefined) this.router.navigate(['/dashboard/schedules' , scheduleId])
  }
}
