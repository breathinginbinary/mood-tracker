import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export const API_URL = 'http://localhost:5281';

export interface Factor {
  id: number;
  name: string;
  unit: string | null;
}

export interface FactorValue {
  factorId: number;
  name: string;
  unit: string | null;
  value: number;
}

export interface MoodEntry {
  id: number;
  timestamp: string;
  mood: number;
  notes: string | null;
  factors: FactorValue[];
}

export interface NewEntry {
  mood: number;
  timestamp?: string;
  notes?: string;
  factors?: { factorId: number; value: number }[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getFactors(): Observable<Factor[]> {
    return this.http.get<Factor[]>(`${API_URL}/factors`);
  }

  addFactor(name: string, unit?: string): Observable<Factor> {
    return this.http.post<Factor>(`${API_URL}/factors`, { name, unit });
  }

  updateFactor(id: number, name: string, unit?: string): Observable<Factor> {
    return this.http.put<Factor>(`${API_URL}/factors/${id}`, { name, unit });
  }

  deleteFactor(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/factors/${id}`);
  }

  getEntries():Observable<MoodEntry[]> {
    return this.http.get<MoodEntry[]>(`${API_URL}/entries`);
  }

  addEntry(entry: NewEntry): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${API_URL}/entries`, entry);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/entries/${id}`);
  }
}
