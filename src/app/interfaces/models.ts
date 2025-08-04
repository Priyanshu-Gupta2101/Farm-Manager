export interface Country {
  id: number
  name: string
  code: string
  created_at?: string
}

export interface Farmer {
  id: number
  name: string
  phone_number: string
  language: string
  country_id: number
  country?: Country
  created_at: string
  farms?: Farm[]
}

export interface Farm {
  id: number
  area: number
  village: string
  crop_grown: string
  sowing_date: string
  farmer_id: number
  farmer?: Farmer
  created_at: string
  schedule?: Schedule[]
}

export interface User {
  id: number
  email: string
  role: "user" | "admin" | "super_user"
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    access_token: string;
    user: User;
  };
  message: string;
  status_code: number;
  success: boolean;
  timestamp: string;
}

export interface CreateUserRequest {
  email: string
  password: string
  role: "user" | "admin" | "super_user"
}

export interface Schedule {
  id?: number
  days_after_sowing: number
  fertilizer: string
  quantity: number
  quantity_unit: string
  farm_id: number
  created_at?: string
  due_date?: string
  farm?: Farm
}

export interface CreateScheduleRequest {
  days_after_sowing: number
  fertilizer: string
  quantity: number
  quantity_unit: string
  farm_id: number
}

export interface BillOfMaterials {
  farmer_id: number
  fertilizers: {
    [fertilizer: string]: {
      farms: Array<{
        crop: string
        due_date: string
        farm_id: number
        quantity: number
      }>
      price_per_unit: number
      total_cost: number
      total_quantity: number
      unit: string
    }
  }
  total_cost: number
}

export interface FertilizerPrices {
  [fertilizer_with_unit: string]: number // NPK_kg: 35
}

export interface ApiResponse<T> {
  data: T
  message: string
  status_code: number
  success: boolean
  timestamp: string
}