import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonNote, IonButton, IonSearchbar,
  IonBadge, IonIcon,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, cloudDoneOutline } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { firstValueFrom } from 'rxjs';

interface Jugador {
  id: number;
  player_name: string;
  team: string;
  conference: string;
  division: string;
  position: string;
  puntos: number;
}

// Claves de almacenamiento en Preferences
const KEY_ROSTER    = 'tab3_roster';
const KEY_JUGADORES = 'tab3_jugadores';
const KEY_TOTAL     = 'tab3_total_puntos';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonNote, IonButton, IonSearchbar,
    IonBadge, IonIcon,
  ],
})
export class Tab3Page implements OnInit {

  // Ruta a tu API online local
  private api = 'http://localhost/apis/my_equipo.php';

  roster: Jugador[] = [];
  jugadores: Jugador[] = [];
  jugadoresFiltrados: Jugador[] = [];
  totalPuntos = 0;

  desdeCache = false;

  mensaje = '';
  mensajeTipo = 'ok';
  private msgTimer: any;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    addIcons({ cloudOfflineOutline, cloudDoneOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  private get userId(): number {
    return Number(localStorage.getItem('user_id') || 0);
  }

  async cargar(): Promise<void> {
    this.desdeCache = false;

    if (!this.userId) {
      this.mostrarMensaje('No se encontró el usuario. Inicia sesión de nuevo.', 'error');
      return;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${this.api}?user_id=${this.userId}`)
      );

      this.roster      = data.roster;
      this.jugadores   = data.jugadores;
      this.totalPuntos = data.total_puntos;
      this.filtrarLista('');

      // Persistir en Preferences para uso sin conexión
      await this.storage.set<Jugador[]>(KEY_ROSTER,    this.roster);
      await this.storage.set<Jugador[]>(KEY_JUGADORES, this.jugadores);
      await this.storage.set<number>  (KEY_TOTAL,      this.totalPuntos);

    } catch (err) {
      console.warn('API no disponible, cargando equipo desde caché...', err);
      await this.cargarDesdeCache();
    }
  }

  private async cargarDesdeCache(): Promise<void> {
    const rosterCached    = await this.storage.get<Jugador[]>(KEY_ROSTER);
    const jugadoresCached = await this.storage.get<Jugador[]>(KEY_JUGADORES);
    const totalCached     = await this.storage.get<number>(KEY_TOTAL);

    if (rosterCached !== null || jugadoresCached !== null) {
      this.roster      = rosterCached    ?? [];
      this.jugadores   = jugadoresCached ?? [];
      this.totalPuntos = totalCached     ?? 0;
      this.filtrarLista('');
      this.desdeCache = true;
    } else {
      this.mostrarMensaje('Sin conexión y sin datos en caché.', 'error');
    }
  }

  filtrar(ev: any): void {
    const texto = (ev?.detail?.value ?? '').toLowerCase().trim();
    this.filtrarLista(texto);
  }

  private filtrarLista(texto: string): void {
    this.jugadoresFiltrados = this.jugadores.filter(j =>
      !texto || j.player_name.toLowerCase().includes(texto)
             || j.team.toLowerCase().includes(texto));
  }

  estaEnEquipo(id: number): boolean {
    return this.roster.some(j => j.id === id);
  }

  agregar(playerId: number): void {
    this.http.post<any>(this.api, {
      user_id: this.userId,
      player_id: playerId,
    }).subscribe({
      next: async (data) => {
        this.mostrarMensaje(data.success, 'ok');
        // Agregar jugador al roster local y persistir
        const jugador = this.jugadores.find(j => j.id === playerId);
        if (jugador) {
          this.roster = [...this.roster, jugador];
          this.totalPuntos += jugador.puntos;
          await this.storage.set<Jugador[]>(KEY_ROSTER, this.roster);
          await this.storage.set<number>(KEY_TOTAL, this.totalPuntos);
        }
        this.desdeCache = false;
      },
      error: (err) => this.mostrarMensaje(err.error?.error || 'Error al agregar', 'error'),
    });
  }

  quitar(playerId: number, nombre: string): void {
    if (!confirm(`¿Quitar a ${nombre} de tu equipo?`)) return;

    this.http.delete<any>(`${this.api}?user_id=${this.userId}&player_id=${playerId}`).subscribe({
      next: async (data) => {
        this.mostrarMensaje(data.success, 'ok');
        // Quitar jugador del roster local y persistir
        const jugador = this.roster.find(j => j.id === playerId);
        this.roster = this.roster.filter(j => j.id !== playerId);
        if (jugador) {
          this.totalPuntos -= jugador.puntos;
        }
        await this.storage.set<Jugador[]>(KEY_ROSTER, this.roster);
        await this.storage.set<number>(KEY_TOTAL, this.totalPuntos);
        this.desdeCache = false;
      },
      error: (err) => this.mostrarMensaje(err.error?.error || 'Error al quitar', 'error'),
    });
  }

  private mostrarMensaje(texto: string, tipo: 'ok' | 'error'): void {
    this.mensaje = texto;
    this.mensajeTipo = tipo;
    clearTimeout(this.msgTimer);
    this.msgTimer = setTimeout(() => { this.mensaje = ''; }, 3500);
  }
}