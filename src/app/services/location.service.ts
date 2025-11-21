import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Location {
  _id: string;
  storeNumber: string;
  name: string;
  locationType: 'corporate' | 'franchise' | 'dealer_owned';
  storeFormat: 'full_service' | 'express' | 'fuel_only' | 'truck_stop' | 'mini_mart';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'temporarily_closed';
  hasFuelPumps: boolean;
  hasMiniMart: boolean;
  numberOfPumps?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/locations`;

  private locationsSignal = signal<Location[]>([]);
  readonly locations = this.locationsSignal.asReadonly();

  readonly activeLocations = computed(() =>
    this.locationsSignal().filter((l) => l.status === 'active')
  );

  async loadLocations() {
    const locations = await firstValueFrom(this.http.get<Location[]>(this.apiUrl));
    this.locationsSignal.set(locations);
    return locations;
  }

  async getLocation(id: string) {
    return firstValueFrom(this.http.get<Location>(`${this.apiUrl}/${id}`));
  }

  async createLocation(location: Partial<Location>) {
    const newLocation = await firstValueFrom(
      this.http.post<Location>(this.apiUrl, location)
    );
    this.locationsSignal.update((locations) => [...locations, newLocation]);
    return newLocation;
  }

  async updateLocation(id: string, updates: Partial<Location>) {
    const updated = await firstValueFrom(
      this.http.patch<Location>(`${this.apiUrl}/${id}`, updates)
    );
    this.locationsSignal.update((locations) =>
      locations.map((l) => (l._id === id ? updated : l))
    );
    return updated;
  }

  async deleteLocation(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    this.locationsSignal.update((locations) =>
      locations.filter((l) => l._id !== id)
    );
  }

  async getActiveLocations() {
    return firstValueFrom(this.http.get<Location[]>(`${this.apiUrl}/active`));
  }

  async searchLocations(query: string) {
    return firstValueFrom(
      this.http.get<Location[]>(`${this.apiUrl}/search`, { params: { q: query } })
    );
  }
}
