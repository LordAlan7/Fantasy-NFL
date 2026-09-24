import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonButtons,
  IonButton,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  albumsOutline,
  cloudOfflineOutline,
  giftOutline,
  closeOutline,
  swapVerticalOutline,
} from 'ionicons/icons';

import { ColeccionService } from '../services/coleccion.service';
import {
  CartaColeccion,
  RAREZAS,
  getPlayerImage,
  hasPlayerImage,
  initialsOf,
  puntosOf,
  rarityOf,
} from '../models/player.model';

type Orden = 'recientes' | 'rareza' | 'nombre' | 'puntos';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonButtons,
    IonButton,
  ],
})
export class Tab2Page implements OnInit {
  private coleccionSvc = inject(ColeccionService);
  private router = inject(Router);

  readonly cargando = this.coleccionSvc.cargando;
  readonly sinConexion = this.coleccionSvc.sinConexion;
  readonly totalCartas = this.coleccionSvc.totalCartas;
  readonly totalUnicas = this.coleccionSvc.totalUnicas;
  readonly totalRepetidas = this.coleccionSvc.totalRepetidas;
  readonly totalJugadores = this.coleccionSvc.totalJugadores;
  readonly progreso = this.coleccionSvc.progreso;
  readonly porRareza = this.coleccionSvc.porRareza;
  readonly jugadoresPorRareza = this.coleccionSvc.jugadoresPorRareza;

  readonly rarezas = RAREZAS;
  /** null = ver todas. */
  readonly filtroRareza = signal<string | null>(null);
  readonly orden = signal<Orden>('recientes');
  readonly cartaAbierta = signal<CartaColeccion | null>(null);
  /** Falso hasta que termina el primer intento de carga. Evita que el mensaje
   *  de "colección vacía" parpadee mientras todavía no sabemos si hay cartas. */
  readonly yaCargo = signal(false);

  /** La colección ya filtrada y ordenada, lista para pintar. */
  readonly cartas = computed(() => {
    const filtro = this.filtroRareza();
    const lista = filtro
      ? this.coleccionSvc.coleccion().filter(c => c.rareza === filtro)
      : [...this.coleccionSvc.coleccion()];

    switch (this.orden()) {
      case 'rareza':
        // De más rara a más común: lo interesante primero.
        return [...lista].sort(
          (a, b) => rarityOf(b.rareza).orden - rarityOf(a.rareza).orden
        );
      case 'nombre':
        return [...lista].sort((a, b) =>
          a.player_name.localeCompare(b.player_name, 'es')
        );
      case 'puntos':
        return [...lista].sort((a, b) => puntosOf(b) - puntosOf(a));
      default:
        // El servicio ya las entrega por fecha, más reciente primero.
        return lista;
    }
  });

  /** true cuando el usuario no tiene ninguna carta todavía. */
  readonly vacia = computed(() => this.coleccionSvc.coleccion().length === 0);

  /** true cuando hay cartas pero el filtro activo no deja ver ninguna. */
  readonly filtroVacio = computed(
    () => !this.vacia() && this.cartas().length === 0
  );

  constructor() {
    addIcons({
      albumsOutline,
      cloudOfflineOutline,
      giftOutline,
      closeOutline,
      swapVerticalOutline,
    });
  }

  async ngOnInit() {
    // Primero el caché, para que la pantalla no arranque vacía,
    // y en paralelo se pide al servidor lo actualizado.
    await this.coleccionSvc.cargarCache();
    await this.coleccionSvc.refrescar();
    this.yaCargo.set(true);
  }

  /** Pull to refresh. */
  async recargar(event: any) {
    await this.coleccionSvc.refrescar();
    event.target.complete();
  }

  filtrar(rareza: string | null) {
    this.filtroRareza.set(this.filtroRareza() === rareza ? null : rareza);
  }

  cambiarOrden() {
    const ciclo: Orden[] = ['recientes', 'rareza', 'puntos', 'nombre'];
    const i = ciclo.indexOf(this.orden());
    this.orden.set(ciclo[(i + 1) % ciclo.length]);
  }

  etiquetaOrden(): string {
    switch (this.orden()) {
      case 'rareza': return 'Rareza';
      case 'nombre': return 'Nombre';
      case 'puntos': return 'Puntos';
      default:       return 'Recientes';
    }
  }

  irASobres() {
    this.router.navigate(['/tabs/tab3']);
  }

  abrirDetalle(carta: CartaColeccion) {
    this.cartaAbierta.set(carta);
  }

  cerrarDetalle() {
    this.cartaAbierta.set(null);
  }

  /** Cuántos jugadores de esa rareza existen, para el "x de y". */
  metaDe(rareza: string): number {
    return this.jugadoresPorRareza()[rareza] ?? 0;
  }

  // --- helpers de plantilla ---

  rareza = rarityOf;
  hasImage = hasPlayerImage;
  getImage = getPlayerImage;
  iniciales = initialsOf;
  puntos = puntosOf;

  onImgError(event: Event) {
    (event.target as HTMLElement).style.display = 'none';
  }
}
