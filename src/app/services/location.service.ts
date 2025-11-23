import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  LocationStatistics
} from '../models/location.model';

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

  findAll(filters?: any): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl, { params: filters }).pipe(
      tap(locations => this.locationsSignal.set(locations))
    );
  }

  findOne(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateLocationDto): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, dto).pipe(
      tap(location => {
        this.locationsSignal.update(locations => [...locations, location]);
      })
    );
  }

  update(id: string, dto: UpdateLocationDto): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.locationsSignal.update(locations =>
          locations.map(l => l._id === id ? updated : l)
        );
      })
    );
  }

  activate(id: string): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(updated => {
        this.locationsSignal.update(locations =>
          locations.map(l => l._id === id ? updated : l)
        );
      })
    );
  }

  deactivate(id: string): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      tap(updated => {
        this.locationsSignal.update(locations =>
          locations.map(l => l._id === id ? updated : l)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.locationsSignal.update(locations => locations.filter(l => l._id !== id));
      })
    );
  }

  getStatistics(): Observable<LocationStatistics> {
    return this.http.get<LocationStatistics>(`${this.apiUrl}/statistics`);
  }
}
