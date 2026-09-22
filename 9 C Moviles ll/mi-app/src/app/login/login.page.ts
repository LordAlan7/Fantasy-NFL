import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, ToastController, IonList, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular';
import axios from 'axios';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ],
})
export class LoginPage {
  user = {
    email: '',
    password: ''
  };

  private apiUrl = 'http://localhost/apis/login.php';

  constructor(
    private toastController: ToastController,
    private router: Router,
    private storage: StorageService
  ) {}

  async login(): Promise<void> {
    try {
      const response = await axios.post(this.apiUrl, this.user);
      if (response.data.success) {
        await this.storage.set('isLoggedIn', true);
        await this.storage.set('user_id', response.data.user_id);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user_id', String(response.data.user_id));

        await this.presentToast('Login exitoso');
        this.router.navigateByUrl('/tabs/tab1');
      } else {
        await this.presentToast('Error: ' + response.data.message);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        await this.presentToast(error.response.data.message);
      } else {
        await this.presentToast('Error de conexión con el servidor de la BD');
      }
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}