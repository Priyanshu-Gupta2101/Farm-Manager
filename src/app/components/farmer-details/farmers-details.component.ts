import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import type { Farmer, Farm, BillOfMaterials, FertilizerPrices } from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { ActivatedRoute } from "@angular/router"
import { Location } from '@angular/common';

@Component({
  selector: "app-farmers-details",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./farmers-details.component.html",
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
export class FarmerDetailsComponent implements OnInit {
  farmerId: string | null = null
  farmer: Farmer | null = null
  showCreateModal = false
  showBillModal = false
  billLoading = false
  isLoading = false
  billError = ""
  error = ""
  canCreate = false
  searchQuery = ""
  farmForm: FormGroup

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
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.farmerId = this.route.snapshot.paramMap.get("id")

    this.farmForm = this.fb.group({
      area: ["", [Validators.required, Validators.min(0.1)]],
      village: ["", Validators.required],
      farmer_id: [this.farmerId, Validators.required],
      crop_grown: ["", Validators.required],
      sowing_date: ["", Validators.required],
    })

    const billFormConfig: any = {
      farmer_id: [this.farmerId, Validators.required],
    }

    this.fertilizerTypes.forEach((fertilizer) => {
      billFormConfig[`price_${fertilizer}`] = ["", [Validators.min(0)]]
    })

    this.billForm = this.fb.group(billFormConfig)
  }

  ngOnInit() {
    this.canCreate = this.authService.canCreate()
    this.loadFarmerById()
  }

  loadFarmerById() {
    if (this.farmerId) {
      this.isLoading = true
      this.apiService.getFarmerById(this.farmerId).subscribe({
        next: (farmer) => {
          this.farmer = farmer
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error loading farmer's details:", error)
          this.error = "Failed to load farmer details"
          this.farmer = null
          this.isLoading = false
        },
      })
    }
  }

  get filteredFarms(): Farm[] {
    if (!this.farmer?.farms) return []

    if (!this.searchQuery.trim()) {
      return this.farmer.farms
    }

    return this.farmer.farms.filter(
      (farm) =>
        farm.village.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        farm.crop_grown.toLowerCase().includes(this.searchQuery.toLowerCase()),
    )
  }

  onSubmit() {
    if (this.farmForm.valid) {
      this.isLoading = true
      this.error = ""

      const formValue = this.farmForm.value

      this.apiService.createFarm(formValue).subscribe({
        next: (farm) => {
          if (this.farmer && this.farmer.farms) {
            this.farmer.farms?.push(farm)
          }
          this.farmForm.reset()
          this.farmForm.patchValue({ farmer_id: this.farmerId ? Number.parseInt(this.farmerId) : null })
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

  goBack() {
    this.location.back()
  }

  openDetails(farmId: number) {
    this.router.navigate(['/dashboard/farms' , farmId])
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  closeBillModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.showBillModal = false
      this.billResult = null
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
}
