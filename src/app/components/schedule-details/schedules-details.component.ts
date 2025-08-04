import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import type { Schedule } from "../../interfaces/models"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { ActivatedRoute } from "@angular/router"
import { Location } from "@angular/common"

@Component({
  selector: "app-schedules-details",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./schedules-details.component.html",
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
export class ScheduleDetailsComponent implements OnInit {
  scheduleId: string | null = null
  schedule: Schedule | null = null
  isLoading = false
  error = ""
  canEdit = false

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) {
    this.scheduleId = this.route.snapshot.paramMap.get("id")
  }

  ngOnInit() {
    this.canEdit = this.authService.canCreate()
    this.loadScheduleById()
  }

  loadScheduleById() {
    if (this.scheduleId) {
      this.isLoading = true
      this.apiService.getScheduleById(this.scheduleId).subscribe({
        next: (schedule) => {
          this.schedule = schedule
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error loading schedule details:", error)
          this.error = "Failed to load schedule details"
          this.schedule = null
          this.isLoading = false
        },
      })
    }
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

  goBack() {
    this.location.back()
  }

  navigateToFarm() {
    if (this.schedule?.farm?.id) {
      this.router.navigate(["/dashboard/farms", this.schedule.farm.id])
    }
  }

  calculateDaysSinceSowing(sowingDate: string): number {
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

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
