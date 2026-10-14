import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL, ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets factors', () => {
    let result: unknown;
    api.getFactors().subscribe((r) => (result = r));
    const req = http.expectOne(`${API_URL}/factors`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Sleep', unit: 'h' }]);
    expect(result).toEqual([{ id: 1, name: 'Sleep', unit: 'h' }]);
  });

  it('adds a factor', () => {
    api.addFactor('Sleep', 'h').subscribe();
    const req = http.expectOne(`${API_URL}/factors`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Sleep', unit: 'h' });
    req.flush({});
  });

  it('updates a factor', () => {
    api.updateFactor(3, 'Sleep', 'h').subscribe();
    const req = http.expectOne(`${API_URL}/factors/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Sleep', unit: 'h' });
    req.flush({});
  });

  it('deletes a factor', () => {
    api.deleteFactor(3).subscribe();
    const req = http.expectOne(`${API_URL}/factors/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('gets entries', () => {
    api.getEntries().subscribe();
    const req = http.expectOne(`${API_URL}/entries`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('adds an entry', () => {
    api.addEntry({ mood: 4, notes: 'ok' }).subscribe();
    const req = http.expectOne(`${API_URL}/entries`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mood: 4, notes: 'ok' });
    req.flush({ id: 1 });
  });

  it('deletes an entry', () => {
    api.deleteEntry(9).subscribe();
    const req = http.expectOne(`${API_URL}/entries/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
