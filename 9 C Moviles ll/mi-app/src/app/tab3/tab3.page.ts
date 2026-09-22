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
import { americanFootballOutline, cloudDoneOutline } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'tab3_jugadores_fantasy';

export interface Jugador {
  id: number;
  nombre: string;
  posicion: string;
  equipo: string;
  created_at: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
export class Tab3Page implements OnInit {
  jugadores: Jugador[] = [];
  cargando = false;

  formJugador = {
    id: null as number | null,
    nombre: '',
    posicion: '',
    equipo: ''
  };

  editando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private storage: StorageService) {
    addIcons({ americanFootballOutline, cloudDoneOutline });
  }

  ngOnInit(): void {
    this.cargarJugadores();
  }

  async cargarJugadores(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';

    try {
      const cached = await this.storage.get<Jugador[]>(STORAGE_KEY);
      this.jugadores = cached || [];
    } catch (error) {
      console.error('Error al cargar jugadores desde almacenamiento local', error);
      this.mensajeError = 'Error al cargar los datos guardados.';
      this.jugadores = [];
    } finally {
      this.cargando = false;
    }
  }

  editarJugador(jugador: Jugador): void {
    this.editando = true;
    this.formJugador = { 
        id: jugador.id, 
        nombre: jugador.nombre, 
        posicion: jugador.posicion, 
        equipo: jugador.equipo 
    };
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cancelarEdicion(form?: NgForm): void {
    this.editando = false;
    this.formJugador = { id: null, nombre: '', posicion: '', equipo: '' };
    if (form) {
      form.resetForm();
    }
  }

  async guardarJugador(form: NgForm): Promise<void> {
    if (form.invalid) {
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    try {
      if (this.editando && this.formJugador.id !== null) {
        this.jugadores = this.jugadores.map(j =>
          j.id === this.formJugador.id 
            ? { ...j, nombre: this.formJugador.nombre, posicion: this.formJugador.posicion, equipo: this.formJugador.equipo } 
            : j
        );
        await this.storage.set<Jugador[]>(STORAGE_KEY, this.jugadores);
        this.mensajeExito = 'Jugador actualizado correctamente.';
      } else {
        const nuevoJugador: Jugador = {
          id: Date.now(),
          nombre: this.formJugador.nombre,
          posicion: this.formJugador.posicion,
          equipo: this.formJugador.equipo,
          created_at: new Date().toISOString(),
        };
        this.jugadores = [...this.jugadores, nuevoJugador];
        await this.storage.set<Jugador[]>(STORAGE_KEY, this.jugadores);
        this.mensajeExito = 'Jugador creado correctamente.';
      }

      this.cancelarEdicion(form);
    } catch (error: any) {
      console.error('Error al guardar jugador', error);
      this.mensajeError = 'Ocurrió un error al guardar usando la persistencia local.';
    } finally {
      this.guardando = false;
    }
  }

  async eliminarJugador(jugador: Jugador): Promise<void> {
    const confirmado = window.confirm(`¿Seguro que deseas eliminar a ${jugador.nombre}?`);
    if (!confirmado) {
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    try {
      this.jugadores = this.jugadores.filter(j => j.id !== jugador.id);
      await this.storage.set<Jugador[]>(STORAGE_KEY, this.jugadores);
      this.mensajeExito = 'Jugador eliminado temporal y permanentemente con éxito.';

      if (this.formJugador.id === jugador.id) {
        this.cancelarEdicion();
      }
    } catch(e) {
      this.mensajeError = 'Ocurrió un error al intentar eliminar el jugador del almacenamiento local.';
    }
  }
}