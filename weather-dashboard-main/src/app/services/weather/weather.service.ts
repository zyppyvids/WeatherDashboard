import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherData } from 'src/app/models/weather-api-response.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) {}

  getWeatherInfo(lat: string, lng: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${environment.url}?lat=${lat}&lon=${lng}&appid=${environment.api_key}`);
  }
}
