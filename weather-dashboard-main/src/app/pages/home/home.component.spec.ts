import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { testData } from 'src/testing/test-data';
import { WeatherService } from 'src/app/services/weather/weather.service';
import { Router } from '@angular/router';
import { LocalService } from 'src/app/services/local/local.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let mockWeatherService = {
    getWeatherInfo: jasmine.createSpy('getData').and.returnValue(testData),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: WeatherService, useValue: mockWeatherService },
        { provide: Router, useValue: mockRouter },
      ]
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('If there is no favourites in local storage then favourite locations should be empty', () => {
    component.ngOnInit();
    expect(component.favouriteLocations).toEqual([]);
  });

  it('updateSearchQuery() should update the searchQuery', () => {
    component.weatherForm.value.city = 'London';
    component.updateSearchQuery();
    expect(component.formSubmitted).toBe(true);
    expect(component.searchResults).toContain({ country: 'GB', name: 'London', lat: '51.50853', lng: '-0.12574' });
  })

  it('updateSearchQuery() should not have any search results if search does not bring up anything', () => {
    component.weatherForm.value.city = 'frrvevrfvrt';
    component.updateSearchQuery();
    expect(component.formSubmitted).toBe(true);
    expect(component.searchResults).toEqual([]);
  })
});
