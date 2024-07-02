import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  private error = false;

  constructor(private http: HttpClient, private router: Router) {}

  saveData(key: string, value: string) {
    if (this.getLocalData('email') !== '') {
      const token = this.getLocalData('token');
      const headers = new HttpHeaders().set('token', token!);
      let options = { headers: headers };
      this.http
        .post(
          'http://localhost:3000/api/locations',
          {
            name: key,
            description: value,
            user_email: this.getLocalData('email'),
          },
          options
        )
        .subscribe(
          (response: any) => {},
          (error: any) => {}
        );
    }
  }

  getData(): Observable<string> {
    const check = this.getLocalData('email') || '';

    if (check !== '') {
      const email = this.getLocalData('email');
      const token = this.getLocalData('token');
      const params = new HttpParams().set('user_email', email!);
      const headers = new HttpHeaders().set('token', token!);
      let options = { headers: headers, params: params };

      return this.http.get('http://localhost:3000/api/locations', options).pipe(
        map((response) => JSON.stringify(response)),
        catchError((error) => {
          console.error(error);
          return of('');
        })
      );
    } else {
      return of('');
    }
  }

  deleteData(name: string) {
    const check = this.getLocalData('email') || '';

    if (check !== '') {
      const email = this.getLocalData('email');
      const token = this.getLocalData('token');
      let params = new HttpParams().set('user_email', email!);
      params = params.append('name', name);
      const headers = new HttpHeaders().set('token', token!);
      let options = { headers: headers, params: params };

      this.http
        .delete('http://localhost:3000/api/locations', options)
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
