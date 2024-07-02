import { TestBed } from '@angular/core/testing';
import { LocationComponent } from './location.component';
import { RouterTestingModule } from "@angular/router/testing";
import { DirectionPipe } from 'src/app/pipes/direction.pipe';
import { testData } from 'src/testing/test-data';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LocalService } from 'src/app/services/local/local.service';

const mockActivatedRoute = {
  queryParams: of({ 'weatherInfo': JSON.stringify(testData) })
};

describe('LocationComponent with queryParams', () => {
  let component: LocationComponent;
  let injectedService: LocalService;
  let mockLocalService = {
    getData: jasmine.createSpy('getData').and.returnValue(null),
    saveData: jasmine.createSpy('saveData')
  };
  jasmine.clock().install();
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocationComponent, DirectionPipe],
      imports: [
        RouterTestingModule
      ],
      providers: [
        LocationComponent,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LocalService, useValue: mockLocalService }
      ]
    });
    component = TestBed.inject(LocationComponent);
    injectedService = TestBed.inject(LocalService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have weatherInfo after construction', () => {
    expect(component.weatherInfo).toEqual({});
  })

  it('should initialize weatherInfo when queryParams are available', () => {
    component.ngOnInit();
    expect(component.weatherInfo).toEqual(testData);
  });

  it('should add location to favorites if not exceeding limit', () => {
    component.weatherInfo = testData;
    component.favourite();
    expect(injectedService.getData).toHaveBeenCalledWith('favourites');
    expect(injectedService.saveData).toHaveBeenCalledWith('favourites', JSON.stringify([{ lat: component.weatherInfo.coord.lat, lon: component.weatherInfo.coord.lon }]));
    expect(component.toastMessage).toBe('Location added to favourites');
  });

  it('should toggle the toast message and show it for 2 seconds', () => {
    component.toggleToast('Test message');
    expect(component.toastMessage).toBe('Test message');
    expect(component.showToast).toBe(true);
    jasmine.clock().tick(2001);
    expect(component.showToast).toBe(false);
  });
});

describe('LocationComponent with queryParams', () => {
  let component: LocationComponent;
  let injectedService: LocalService;
  let mockLocalService = {
    getData: jasmine.createSpy('getData').and.returnValue('[{}, {}, {}]'),
    saveData: jasmine.createSpy('saveData')
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocationComponent, DirectionPipe],
      imports: [
        RouterTestingModule
      ],
      providers: [
        LocationComponent,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LocalService, useValue: mockLocalService }
      ]
    });
    component = TestBed.inject(LocationComponent);
    injectedService = TestBed.inject(LocalService);
  });

  it('should show maximum favorites reached message', () => {
    spyOn(component, 'toggleToast');
    component.favourite();
    expect(injectedService.getData).toHaveBeenCalledWith('favourites');
    expect(component.toggleToast).toHaveBeenCalledWith('Maximum favourites reached');
  });
});

describe('LocationComponent without queryParams', () => {
  let component: LocationComponent;
  const mockParams = {};
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocationComponent, DirectionPipe],
      imports: [
        RouterTestingModule
      ],
      providers: [
        LocationComponent,
        { provide: ActivatedRoute, useValue: mockParams },
      ]
    });
    component = TestBed.inject(LocationComponent);
  });

  it('should not change weatherInfo when queryParams are unavailable', () => {
    component.ngOnInit();
    expect(component.weatherInfo).toEqual({});
  });
});
