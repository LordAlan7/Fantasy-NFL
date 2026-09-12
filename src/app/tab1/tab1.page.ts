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
  IonButton
} from '@ionic/angular';
import axios from 'axios';

// Ajusta esta URL si tu carpeta del API tiene otro nombre o dominio
const API_URL = 'http://localhost/api/users.php';

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
    IonButton
  ],
})
export class Tab1Page implements OnInit {

  usuarios: Usuario[] = [];
  cargando = false;

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

  constructor() {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  async cargarUsuarios(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';

    try {
      const respuesta = await axios.get(API_URL);
      this.usuarios = respuesta.data.data;
    } catch (error) {
      console.error('Error al cargar usuarios', error);
      this.mensajeError = 'No se pudieron cargar los usuarios.';
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
        // PATCH: solo mandamos email siempre, y password solo si el usuario escribió una nueva
        const body: { email: string; password?: string } = { email: this.formUsuario.email };
        if (this.formUsuario.password) {
          body.password = this.formUsuario.password;
        }

        await axios.patch(`${API_URL}?id=${this.formUsuario.id}`, body);
        this.mensajeExito = 'Usuario actualizado correctamente.';
      } else {
        await axios.post(API_URL, {
          email: this.formUsuario.email,
          password: this.formUsuario.password
        });
        this.mensajeExito = 'Usuario creado correctamente.';
      }

      this.cancelarEdicion(form);
      await this.cargarUsuarios();

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
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
      this.mensajeExito = 'Usuario eliminado correctamente.';

      // Si estabas editando justo al usuario que borraste, cancelamos la edición
      if (this.formUsuario.id === usuario.id) {
        this.cancelarEdicion();
      }
    } catch (error: any) {
      console.error('Error al eliminar usuario', error);
      this.mensajeError = error?.response?.data?.message
        || 'No se pudo eliminar el usuario.';
    }
  }
}
