import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LocationComponent } from './pages/location/location.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { animation: 'HomeComponent' },
  },
  {
    path: 'location',
    component: LocationComponent,
    data: { animation: 'LocationComponent' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { animation: 'RegisterComponent' },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginComponent' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
