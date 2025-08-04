import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Country, 
  Farmer, 
  Farm, 
  Schedule, 
  ApiResponse,
  BillOfMaterials, 
  CreateScheduleRequest,
  FertilizerPrices
} from '../interfaces/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Country endpoints
  getAllCountries(): Observable<Country[]> {
    return this.http.get<ApiResponse<Country[]>>(`${this.baseUrl}/countries`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  createCountry(country: Omit<Country, 'id'>): Observable<Country> {
    return this.http.post<ApiResponse<Country>>(`${this.baseUrl}/countries`, country, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Farmer endpoints
  getFarmersByCrop(crop: string): Observable<Farmer[]> {
    return this.http.get<ApiResponse<Farmer[]>>(`${this.baseUrl}/farmers/by-crop?crop=${crop}`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  getAllFarmers(): Observable<Farmer[]> {
    return this.http.get<ApiResponse<Farmer[]>>(`${this.baseUrl}/farmers`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  getFarmerById(id: string): Observable<Farmer> {
    return this.http.get<ApiResponse<Farmer>>(`${this.baseUrl}/farmers/${id}`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  getActiveFarmers(): Observable<Farmer[]> {
    return this.http.get<ApiResponse<Farmer[]>>(`${this.baseUrl}/farmers/active`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  createFarmer(farmer: Omit<Farmer, 'id' | 'country'>): Observable<Farmer> {
    return this.http.post<ApiResponse<Farmer>>(`${this.baseUrl}/farmers`, farmer, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Farm endpoints
  createFarm(farm: Omit<Farm, 'id' | 'farmer'>): Observable<Farm> {
    return this.http.post<ApiResponse<Farm>>(`${this.baseUrl}/farms`, farm, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  getAllFarms(): Observable<Farm[]> {
    return this.http.get<ApiResponse<Farm[]>>(`${this.baseUrl}/farms`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  getFarmById(id: string): Observable<Farm> {
    return this.http.get<ApiResponse<Farm>>(`${this.baseUrl}/farms/${id}`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  // Schedule endpoints
  createSchedule(schedule: CreateScheduleRequest): Observable<ApiResponse<Schedule>> {
    return this.http.post<ApiResponse<Schedule>>(`${this.baseUrl}/schedules`, schedule, {
      headers: this.getHeaders(),
    })
  }

  getScheduleById(id: string): Observable<Schedule> {
    return this.http.get<ApiResponse<Schedule>>(`${this.baseUrl}/schedules/${id}`, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  getSchedulesToday(): Observable<ApiResponse<Schedule[]>> {
    return this.http.get<ApiResponse<Schedule[]>>(`${this.baseUrl}/schedules/today`, {
      headers: this.getHeaders(),
    })
  }

  getSchedulesTomorrow(): Observable<ApiResponse<Schedule[]>> {
    return this.http.get<ApiResponse<Schedule[]>>(`${this.baseUrl}/schedules/tomorrow`, {
      headers: this.getHeaders(),
    })
  }

  calculateBillOfMaterials(
    farmerId: number,
    fertilizerPrices: FertilizerPrices,
  ): Observable<ApiResponse<BillOfMaterials>> {
    return this.http.post<ApiResponse<BillOfMaterials>>(
      `${this.baseUrl}/schedules/bill/${farmerId}`,
      { fertilizer_prices: fertilizerPrices },
      {
        headers: this.getHeaders(),
      },
    )
  }
}