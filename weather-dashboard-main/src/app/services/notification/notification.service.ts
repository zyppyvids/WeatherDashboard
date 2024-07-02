import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  saveData(key: string, value: string) {
    if (this.getLocalData('email') !== '') {
      const token = this.getLocalData('token');
      const headers = new HttpHeaders().set('token', token!);
      let options = { headers: headers };
      this.http
        .post(
          'http://localhost:3000/api/notifications',
          {
            location_name: key,
            description: value,
          },
          options
        )
        .subscribe(
          (response: any) => {},
          (error: any) => {}
        );
    }
  }

  getLocalData(key: string): string | null {
    return localStorage.getItem(key);
  }
}
