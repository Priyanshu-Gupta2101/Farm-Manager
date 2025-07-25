import type { Routes } from "@angular/router"
import { inject } from "@angular/core"
import type { CanActivateFn } from "@angular/router"
import { Router } from "@angular/router"
import { AuthService } from "./services/auth.service"
import { LoginComponent } from "./components/login/login.component"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { CountriesComponent } from "./components/countries/countries.component"
import { FarmersComponent } from "./components/farmers/farmers.component"
import { FarmsComponent } from "./components/farms/farms.component"
import { SchedulesComponent } from "./components/schedules/schedules.component"

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.currentUser) {
    return true
  } else {
    router.navigate(["/login"])
    return false
  }
}

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.currentUser) {
    router.navigate(["/dashboard"])
    return false
  }
  return true
}

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () => LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: "dashboard",
    loadComponent: () => DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        redirectTo: "countries",
        pathMatch: "full",
      },
      {
        path: "countries",
        loadComponent: () => CountriesComponent,
      },
      {
        path: "farmers",
        loadComponent: () => FarmersComponent,
      },
      {
        path: "farms",
        loadComponent: () => FarmsComponent,
      },
      {
        path: "schedules",
        loadComponent: () => SchedulesComponent,
      },
    ],
  },
  {
    path: "**",
    redirectTo: "/login",
  },
]
