import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterOutlet } from "@angular/router"
import type { User } from "../../interfaces/models"
import { AuthService } from "../../services/auth.service"
import { CreateUserModalComponent } from "../create-user-modal/create-user-modal.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterOutlet, CreateUserModalComponent],
  templateUrl: './dashboard.component.html',
  styles: [
    `
      .space-y-2 > * + * {
        margin-top: 0.5rem;
      }
      .gap-8 {
        gap: 2rem;
      }
      .gap-4 {
        gap: 1rem;
      }
      .gap-3 {
        gap: 0.75rem;
      }
      .gap-2 {
        gap: 0.5rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  user: User | null = null
  showCreateUser = false
  currentRoute = ""

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Subscribe to user changes
    this.authService.user$.subscribe((user) => {
      this.user = user
      if (!user) {
        this.router.navigate(["/login"])
      }
    })

    // Track current route
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url.split("/").pop() || ""
    })
  }

  get canCreateUser(): boolean {
    return this.user?.role === "admin" || this.user?.role === "super_user"
  }

  get canCreate(): boolean {
    return this.user?.role === "admin" || this.user?.role === "super_user"
  }

  navigateTo(route: string): void {
    this.router.navigate(["/dashboard", route])
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.includes(`/dashboard/${route}`)
  }

  toggleCreateUser(): void {
    this.showCreateUser = !this.showCreateUser
  }

  onCreateUserModalClose(): void {
    this.showCreateUser = false
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  getRoleBadgeColor(role: string): string {
    switch (role) {
      case "super-user":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "user":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }
}
