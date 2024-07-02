import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import cities from 'cities.json';
import { City } from 'src/app/models/city.model';
import { LocalService } from 'src/app/services/local/local.service';
import { WeatherService } from 'src/app/services/weather/weather.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateY(-100%)' }),
        animate(200),
      ]),
      transition('* => void', [
        animate(200, style({ transform: 'translateY(100%)' })),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  weatherForm!: FormGroup;
  searchResults: City[] = [];

  favouriteLocations: any = [];

  citiesArray: any = cities;

  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private weatherService: WeatherService,
    private http: HttpClient,
    public localService: LocalService
  ) {
    this.weatherForm = this.fb.group({
      city: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    if (this.weatherForm) {
      this.weatherForm.valueChanges.subscribe((value) => {
        if (value.city.length === 0) {
          this.searchResults = [];
          this.formSubmitted = false;
        }
      });
    }

    this.localService.getData().subscribe((data) => {
      console.log(data);
      const existingFavourites = JSON.parse(data);
      console.log(existingFavourites);

      if (existingFavourites) {
        existingFavourites.forEach((element: any) => {
          const data = JSON.parse(element.description);
          data.forEach((city: any) => {
            this.weatherService
              .getWeatherInfo(city.lat, city.lon)
              .subscribe((res) => {
                this.favouriteLocations.push(res);
              });
          });
        });
      }
    });
  }

  updateSearchQuery(ev?: any) {
    const searchedCity = this.weatherForm.value.city;
    this.filterSearchQuery(searchedCity);
    this.formSubmitted = true;
  }

  filterSearchQuery(searchedCity: any) {
    this.searchResults = this.citiesArray.filter((city: { name: string }) =>
      city.name.toLowerCase().includes(searchedCity.toLowerCase())
    );
  }

  getWeatherDetails(lat: string, lng: string) {
    this.weatherService.getWeatherInfo(lat, lng).subscribe((res) => {
      this.router.navigate(['location'], {
        queryParams: { weatherInfo: JSON.stringify(res) },
      });
    });
  }

  deleteFavourite(i: any) {
    if (i >= 0 && i < this.favouriteLocations.length) {
      let location_to_delete = this.favouriteLocations[i].name;
      this.favouriteLocations.splice(i, 1);
      
      this.localService.deleteData(location_to_delete);
    }
  }

  navigateTo(location_name: string) {
    if (location_name == 'logout') {
      this.http
        .post('http://localhost:3000/api/logout', localStorage.getItem('email'))
        .subscribe((response: any) => {
          localStorage.setItem('email', '');
          localStorage.setItem('loggedIn', 'false');
        });
    } else {
      this.router.navigate(['/' + location_name]);
    }
  }
}
