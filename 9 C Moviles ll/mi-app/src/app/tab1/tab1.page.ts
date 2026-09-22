import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonBadge,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, cloudDoneOutline } from 'ionicons/icons';
import axios from 'axios';
import { StorageService } from '../services/storage.service';

// Ajusta esta URL si tu carpeta del API tiene otro nombre o dominio
const API_URL = 'http://localhost/apis/users.php';
const STORAGE_KEY = 'tab1_usuarios';

interface Usuario {
  id: number;
  email: string;
  created_at: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
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
    IonButton,
    IonBadge,
    IonIcon,
  ],
})
export class Tab1Page implements OnInit {

  usuarios: Usuario[] = [];
  cargando = false;

  /** Indica si los datos se cargaron desde caché local (sin conexión al servidor) */
  desdeCache = false;

  // Modelo del formulario (sirve tanto para crear como para editar)
  formUsuario = {
    id: null as number | null,
    email: '',
    password: ''
  };

  editando = false;
  guardando = false;

  mensajeExito = '';
  mensajeError = '';

  constructor(private storage: StorageService) {
    addIcons({ cloudOfflineOutline, cloudDoneOutline });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  /** Carga usuarios desde el API; si falla, usa el caché de Preferences */
  async cargarUsuarios(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    this.desdeCache = false;

    try {
      const respuesta = await axios.get(API_URL);
      this.usuarios = respuesta.data.data;
      // Guardar copia local exitosa
      await this.storage.set<Usuario[]>(STORAGE_KEY, this.usuarios);
    } catch (error) {
      console.warn('API no disponible, cargando desde caché local...', error);

      const cached = await this.storage.get<Usuario[]>(STORAGE_KEY);
      if (cached && cached.length > 0) {
        this.usuarios = cached;
        this.desdeCache = true;
      } else {
        this.mensajeError = 'Sin conexión y sin datos en caché.';
        this.usuarios = [];
      }
    } finally {
      this.cargando = false;
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.editando = true;
    this.formUsuario = { id: usuario.id, email: usuario.email, password: '' };
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cancelarEdicion(form?: NgForm): void {
    this.editando = false;
    this.formUsuario = { id: null, email: '', password: '' };
    if (form) {
      form.resetForm();
    }
  }

  async guardarUsuario(form: NgForm): Promise<void> {
    if (form.invalid) {
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    try {
      if (this.editando && this.formUsuario.id) {
        // PATCH: solo mandamos email, y password solo si el usuario escribió una nueva
        const body: { email: string; password?: string } = { email: this.formUsuario.email };
        if (this.formUsuario.password) {
          body.password = this.formUsuario.password;
        }

        await axios.patch(`${API_URL}?id=${this.formUsuario.id}`, body);

        // Actualizar el usuario en la lista local y persistir
        this.usuarios = this.usuarios.map(u =>
          u.id === this.formUsuario.id ? { ...u, email: this.formUsuario.email } : u
        );
        await this.storage.set<Usuario[]>(STORAGE_KEY, this.usuarios);
        this.mensajeExito = 'Usuario actualizado correctamente.';
        this.desdeCache = false;
      } else {
        const res = await axios.post(API_URL, {
          email: this.formUsuario.email,
          password: this.formUsuario.password
        });

        // Agregar el nuevo usuario con el id devuelto por el servidor
        const nuevoUsuario: Usuario = {
          id: res.data?.id ?? Date.now(),
          email: this.formUsuario.email,
          created_at: new Date().toISOString(),
        };
        this.usuarios = [...this.usuarios, nuevoUsuario];
        await this.storage.set<Usuario[]>(STORAGE_KEY, this.usuarios);
        this.mensajeExito = 'Usuario creado correctamente.';
        this.desdeCache = false;
      }

      this.cancelarEdicion(form);

    } catch (error: any) {
      console.error('Error al guardar usuario', error);
      this.mensajeError = error?.response?.data?.message
        || 'Ocurrió un error al guardar el usuario.';
    } finally {
      this.guardando = false;
    }
  }

  async eliminarUsuario(usuario: Usuario): Promise<void> {
    const confirmado = window.confirm(`¿Seguro que deseas eliminar a ${usuario.email}?`);
    if (!confirmado) {
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    try {
      await axios.delete(`${API_URL}?id=${usuario.id}`);
    } catch (error: any) {
      // Si el API falla pero queremos eliminar del caché local de todas formas
      console.warn('No se pudo contactar el servidor, eliminando solo localmente.', error);
    }

    // Eliminar de la lista en memoria y persistir
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
    await this.storage.set<Usuario[]>(STORAGE_KEY, this.usuarios);
    this.mensajeExito = 'Usuario eliminado correctamente.';

    // Si estabas editando al usuario que borraste, cancelar la edición
    if (this.formUsuario.id === usuario.id) {
      this.cancelarEdicion();
    }
  }
}
