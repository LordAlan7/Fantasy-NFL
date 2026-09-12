import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonNote, IonButton, IonSearchbar,
} from '@ionic/angular';

interface Jugador {
  id: number;
  player_name: string;
  team: string;
  conference: string;
  division: string;
  position: string;
  puntos: number;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonNote, IonButton, IonSearchbar,
  ],
})
export class Tab3Page implements OnInit {

  // ⚠️ AJUSTA: la URL donde vive tu mi_equipo.php
  private api = 'http://localhost/api/my_equipo.php';

  roster: Jugador[] = [];
  jugadores: Jugador[] = [];
  jugadoresFiltrados: Jugador[] = [];
  totalPuntos = 0;

  mensaje = '';
  mensajeTipo = 'ok';
  private msgTimer: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargar();
  }

  // ⚠️ AJUSTA: según dónde guardes el id tras el login
  private get userId(): number {
    return Number(localStorage.getItem('user_id') || 0);
  }

  // ---------- Carga ----------
  cargar(): void {
    if (!this.userId) {
      this.mostrarMensaje('No se encontró el usuario. Inicia sesión de nuevo.', 'error');
      return;
    }
    this.http.get<any>(`${this.api}?user_id=${this.userId}`).subscribe({
      next: (data) => {
        this.roster = data.roster;
        this.jugadores = data.jugadores;
        this.totalPuntos = data.total_puntos;
        this.filtrarLista('');
      },
      error: () => this.mostrarMensaje('Error de conexión con el servidor', 'error'),
    });
  }

  // ---------- Búsqueda ----------
  filtrar(ev: any): void {
    const texto = (ev?.detail?.value ?? '').toLowerCase().trim();
    this.filtrarLista(texto);
  }

  private filtrarLista(texto: string): void {
    this.jugadoresFiltrados = this.jugadores.filter(j =>
      !texto || j.player_name.toLowerCase().includes(texto)
             || j.team.toLowerCase().includes(texto));
  }

  // ---------- Acciones ----------
  estaEnEquipo(id: number): boolean {
    return this.roster.some(j => j.id === id);
  }

  agregar(playerId: number): void {
    this.http.post<any>(this.api, {
      user_id: this.userId,
      player_id: playerId,
    }).subscribe({
      next: (data) => {
        this.mostrarMensaje(data.success, 'ok');
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(err.error?.error || 'Error al agregar', 'error'),
    });
  }

  quitar(playerId: number, nombre: string): void {
    if (!confirm(`¿Quitar a ${nombre} de tu equipo?`)) return;

    this.http.delete<any>(`${this.api}?user_id=${this.userId}&player_id=${playerId}`).subscribe({
      next: (data) => {
        this.mostrarMensaje(data.success, 'ok');
        this.cargar();
      },
      error: (err) => this.mostrarMensaje(err.error?.error || 'Error al quitar', 'error'),
    });
  }

  // ---------- Mensajes ----------
  private mostrarMensaje(texto: string, tipo: 'ok' | 'error'): void {
    this.mensaje = texto;
    this.mensajeTipo = tipo;
    clearTimeout(this.msgTimer);
    this.msgTimer = setTimeout(() => { this.mensaje = ''; }, 3500);
  }
}