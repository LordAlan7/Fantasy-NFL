import { Injectable, computed, inject, signal } from '@angular/core';
import axios from 'axios';
import { StorageService } from './storage.service';
import {
  CartaColeccion,
  Player,
  RAREZAS,
  ResultadoSobre,
  rarityOf,
} from '../models/player.model';

/** Cambia esto si tu carpeta de APIs vive en otra URL. */
const API_BASE = 'http://localhost/apis';
const CACHE_KEY = 'mi_coleccion_cache';

/**
 * Estado único de la colección del usuario.
 *
 * Tab3 (abrir sobres) y Tab2 (mi colección) comparten esta instancia, así que
 * una carta ganada aparece en la colección al instante, sin recargar nada.
 * La colección se cachea en disco para que tab2 tenga algo que mostrar
 * aunque el servidor no responda.
 */
@Injectable({ providedIn: 'root' })
export class ColeccionService {
  private storage = inject(StorageService);

  /** Cartas distintas que posee el usuario. */
  readonly coleccion = signal<CartaColeccion[]>([]);
  readonly cargando = signal(false);
  /** true cuando lo que se muestra viene del caché y no del servidor. */
  readonly sinConexion = signal(false);
  /** Cuántos jugadores existen en total, para medir el progreso. */
  readonly totalJugadores = signal(25);
  /** Cuántos jugadores existen de cada rareza. Lo manda el servidor. */
  readonly jugadoresPorRareza = signal<Record<string, number>>({});

  /** Total de cartas contando repetidas. */
  readonly totalCartas = computed(() =>
    this.coleccion().reduce((sum, c) => sum + c.cantidad, 0)
  );

  /** Jugadores distintos conseguidos. */
  readonly totalUnicas = computed(() => this.coleccion().length);

  /** Cuántas cartas repetidas tiene en total. */
  readonly totalRepetidas = computed(() =>
    this.coleccion().reduce((sum, c) => sum + (c.cantidad - 1), 0)
  );

  /** Conteo por rareza, para las barras de progreso de la colección. */
  readonly porRareza = computed(() => {
    const base: Record<string, number> = {};
    for (const r of RAREZAS) base[r] = 0;
    for (const c of this.coleccion()) {
      const key = rarityOf(c.rareza).label;
      base[key] = (base[key] ?? 0) + 1;
    }
    return base;
  });

  /** Avance de la colección, de 0 a 1. */
  readonly progreso = computed(() => {
    const meta = this.totalJugadores();
    return meta > 0 ? this.totalUnicas() / meta : 0;
  });

  private get userId(): number {
    return Number(localStorage.getItem('user_id') || 0);
  }

  /** Carga el caché en memoria. Rápido, para pintar algo de inmediato. */
  async cargarCache(): Promise<void> {
    const cache = await this.storage.get<CartaColeccion[]>(this.cacheKey());
    if (cache?.length && this.coleccion().length === 0) {
      this.coleccion.set(cache);
      this.sinConexion.set(true);
    }
  }

  /** Trae la colección del servidor. Si falla, deja lo que haya en caché. */
  async refrescar(): Promise<void> {
    if (!this.userId) return;
    this.cargando.set(true);
    try {
      const res = await axios.get(`${API_BASE}/mi_coleccion.php`, {
        params: { user_id: this.userId },
      });
      if (res.data?.success) {
        const cartas: CartaColeccion[] = (res.data.coleccion ?? []).map(
          (c: any) => ({ ...c, cantidad: Number(c.cantidad) || 1 })
        );
        this.coleccion.set(cartas);
        if (res.data.total_jugadores) {
          this.totalJugadores.set(Number(res.data.total_jugadores));
        }
        if (res.data.por_rareza) {
          this.jugadoresPorRareza.set(res.data.por_rareza);
        }
        this.sinConexion.set(false);
        await this.storage.set(this.cacheKey(), cartas);
      }
    } catch {
      this.sinConexion.set(true);
      await this.cargarCache();
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Abre un sobre. Devuelve el jugador y si era nuevo o repetido.
   * Lanza Error con un mensaje legible si algo falla, para que tab3
   * lo muestre tal cual al usuario.
   */
  async abrirSobre(): Promise<ResultadoSobre> {
    if (!this.userId) {
      throw new Error('Inicia sesión para abrir sobres.');
    }
    let data: any;
    try {
      const res = await axios.post(`${API_BASE}/open_pack.php`, {
        user_id: this.userId,
      });
      data = res.data;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message ?? 'Sin conexión con el servidor.'
      );
    }
    if (!data?.success || !data.player) {
      throw new Error(data?.message ?? 'No se pudo abrir el sobre.');
    }

    const player: Player = data.player;
    // El API dice si la carta ya estaba en la colección. Si por lo que sea
    // no lo mandara, lo deducimos de lo que ya tenemos en memoria.
    const esNueva =
      data.es_nueva !== undefined
        ? !!data.es_nueva
        : !this.coleccion().some(c => c.id === player.id);
    const cantidad = Number(data.cantidad) || 1;

    this.aplicarCarta(player, cantidad);
    return { player, esNueva, cantidad };
  }

  /** Mete la carta en el estado local sin esperar otra llamada al servidor. */
  private aplicarCarta(player: Player, cantidad: number) {
    const actual = this.coleccion();
    const idx = actual.findIndex(c => c.id === player.id);
    let siguiente: CartaColeccion[];

    if (idx >= 0) {
      siguiente = [...actual];
      siguiente[idx] = { ...siguiente[idx], cantidad };
    } else {
      // Las nuevas van al frente: la colección se ordena por más reciente.
      siguiente = [{ ...player, cantidad }, ...actual];
    }

    this.coleccion.set(siguiente);
    void this.storage.set(this.cacheKey(), siguiente);
  }

  /** El caché es por usuario, para no mezclar colecciones en un mismo device. */
  private cacheKey(): string {
    return `${CACHE_KEY}_${this.userId}`;
  }
}
