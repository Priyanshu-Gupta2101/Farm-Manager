import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {
  title = "farm-management-system"
}
