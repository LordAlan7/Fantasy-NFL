import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { albumsOutline, sparklesOutline, layersOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import { ColeccionService } from '../services/coleccion.service';
import {
  Player,
  getPlayerImage,
  hasPlayerImage,
  initialsOf,
  puntosOf,
  rarityOf,
} from '../models/player.model';

/**
 * Fases de la apertura. El orden importa: el HTML las usa como clase
 * sobre un único contenedor para que cada paso se funda con el siguiente
 * en vez de aparecer de golpe.
 */
type Fase = 'idle' | 'cargando' | 'abriendo' | 'revelando' | 'listo';

/** Duraciones en ms. Cambiar aquí ajusta el ritmo de toda la animación. */
const T = {
  carga: 1100,     // el sobre se sacude y acumula luz
  destello: 620,   // estallido de luz del color de la rareza
  revelado: 780,   // la carta sube y se asienta
};

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon],
})
export class Tab3Page implements OnInit {
  private coleccion = inject(ColeccionService);
  private router = inject(Router);

  readonly fase = signal<Fase>('idle');
  readonly jugador = signal<Player | null>(null);
  readonly esNueva = signal(false);
  readonly cantidad = signal(1);
  readonly mensajeError = signal('');

  /** Total de cartas, leído del estado compartido con la colección. */
  readonly totalCartas = this.coleccion.totalCartas;
  readonly totalUnicas = this.coleccion.totalUnicas;
  readonly totalJugadores = this.coleccion.totalJugadores;

  /** Solo la cantidad: ángulo, distancia, tamaño y retraso de cada partícula
   *  viven en el SCSS (nth-child). Así no se recalculan en cada ciclo de
   *  detección de cambios, que es lo que antes las hacía temblar. */
  readonly particulas = Array.from({ length: 22 });

  readonly rareza = computed(() => rarityOf(this.jugador()?.rareza));

  /** true mientras corre la secuencia y no se puede volver a tocar. */
  readonly animando = computed(
    () => this.fase() === 'cargando' || this.fase() === 'abriendo' || this.fase() === 'revelando'
  );

  /** Se pone a true si el usuario toca para saltarse la animación en curso. */
  private saltado = false;

  constructor() {
    addIcons({ albumsOutline, sparklesOutline, layersOutline });
  }

  async ngOnInit() {
    await this.coleccion.cargarCache();
    void this.coleccion.refrescar();
  }

  /** Toque sobre la escena: abre un sobre, o salta la animación en curso. */
  onTap() {
    if (this.animando()) {
      this.saltado = true;
      return;
    }
    if (this.fase() === 'idle') void this.abrirSobre();
  }

  async abrirSobre() {
    if (this.fase() !== 'idle') return;

    this.mensajeError.set('');
    this.saltado = false;
    this.fase.set('cargando');
    this.vibrar(() => Haptics.impact({ style: ImpactStyle.Light }));

    // La petición sale al mismo tiempo que arranca la animación, no después.
    // Así la espera de red se esconde dentro de la carga del sobre en vez
    // de sumarse a ella.
    const peticion = this.coleccion.abrirSobre();

    let resultado;
    try {
      const [res] = await Promise.all([peticion, this.esperar(T.carga)]);
      resultado = res;
    } catch (err: any) {
      this.fase.set('idle');
      this.mostrarError(err?.message ?? 'No se pudo abrir el sobre.');
      return;
    }

    // La carta se fija ya, para que el destello salga del color correcto.
    this.jugador.set(resultado.player);
    this.esNueva.set(resultado.esNueva);
    this.cantidad.set(resultado.cantidad);

    this.fase.set('abriendo');
    this.vibrar(() => Haptics.impact({ style: ImpactStyle.Heavy }));
    await this.esperar(T.destello);

    this.fase.set('revelando');
    await this.esperar(T.revelado);

    this.fase.set('listo');
    this.vibrar(() =>
      resultado.esNueva
        ? Haptics.notification({ type: NotificationType.Success })
        : Haptics.impact({ style: ImpactStyle.Medium })
    );
  }

  /** Deja todo listo para otro sobre, sin cortes bruscos. */
  otroSobre() {
    this.fase.set('idle');
    // La carta se limpia después del fundido para que no desaparezca de golpe.
    setTimeout(() => {
      if (this.fase() === 'idle') this.jugador.set(null);
    }, 280);
  }

  irAColeccion() {
    this.router.navigate(['/tabs/tab2']);
  }

  // --- helpers de plantilla ---

  hasImage = hasPlayerImage;
  getImage = getPlayerImage;
  iniciales = initialsOf;
  puntos = puntosOf;

  /** Oculta la imagen rota y deja ver el placeholder de iniciales. */
  onImgError(event: Event) {
    (event.target as HTMLElement).style.display = 'none';
  }

  // --- internos ---

  /**
   * Espera ms, pero se corta antes si el usuario tocó para saltar.
   * A propósito con setTimeout y no con requestAnimationFrame: si la app
   * pasa a segundo plano, rAF deja de dispararse y la secuencia se quedaría
   * congelada a medias sin forma de salir.
   */
  private esperar(ms: number): Promise<void> {
    return new Promise(resolve => {
      const fin = setTimeout(() => {
        clearInterval(vigilante);
        resolve();
      }, ms);
      const vigilante = setInterval(() => {
        if (this.saltado) {
          clearTimeout(fin);
          clearInterval(vigilante);
          resolve();
        }
      }, 50);
    });
  }

  /** Las vibraciones no existen en navegador; que fallen en silencio. */
  private vibrar(accion: () => Promise<void>) {
    try {
      void accion().catch(() => {});
    } catch {
      /* plataforma sin haptics */
    }
  }

  private mostrarError(msg: string) {
    this.mensajeError.set(msg);
    setTimeout(() => this.mensajeError.set(''), 4000);
  }
}
