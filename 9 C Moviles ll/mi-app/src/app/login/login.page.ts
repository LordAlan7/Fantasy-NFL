import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, ToastController } from '@ionic/angular';
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
    IonContent
  ],
})
export class LoginPage {
  user = {
    email: '',
    password: ''
  };

  private apiUrl = 'http://127.0.0.1/api/login.php';

  constructor(
    private toastController: ToastController,
    private router: Router,
    private storage: StorageService
  ) {}

  // Usamos Capacitor Preferences para guardar la sesión de forma persistente
  async login(): Promise<void> {
    try {
      if (this.user.email && this.user.password) {
        // Persistir sesión con Capacitor Preferences (sobrevive cierres de app)
        await this.storage.set('isLoggedIn', true);
        await this.storage.set('user_id', 1);
        // Mantener localStorage como fallback para AuthGuard síncrono en web
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user_id', '1');

        await this.presentToast('Login offline exitoso');
        this.router.navigateByUrl('/tabs/tab1');
      } else {
        await this.presentToast('Ingrese cualquier usuario y contraseña');
      }
    } catch (error: any) {
      await this.presentToast('Error al iniciar sesión local');
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