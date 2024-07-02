import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalService } from 'src/app/services/local/local.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {
  weatherInfo: any = {};

  showToast = false;

  toastMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public localService: LocalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.route.queryParams) {
      this.route.queryParams.subscribe((params): any => {
        this.weatherInfo = JSON.parse(params['weatherInfo']);
      });
    }
  }

  back() {
    this.router.navigate(['']);
  }

  favourite() {
    this.localService.getData().subscribe((data) => {
      const existingFavourites = JSON.parse(data);
      if (existingFavourites && existingFavourites.length >= 3) {
        this.toggleToast('Maximum favourites reached');
      } else {
        this.localService.saveData(
          this.weatherInfo.name,
          JSON.stringify([
            {
              lat: this.weatherInfo.coord.lat,
              lon: this.weatherInfo.coord.lon,
            },
          ])
        );
        this.toggleToast('Location added to favourites');
      }
    });
  }

  notification() {
    this.notificationService.saveData(
      this.weatherInfo.name,
      'Severe weather notification'
    );
  }

  toggleToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }
}
