import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
} from '@ionic/angular';
import axios from 'axios';

interface Player {
  id: number;
  player_name: string;
  team: string;
  conference: string;
  division: string;
  position: string;
  puntos_semana: number | null;
  rareza: string;
  estado: string;
}

// Map player names to their image filenames as they appear in assets/images/players
const PLAYER_IMAGE_MAP: Record<string, string> = {
  'Josh Allen': 'Josh Allen.jpg',
  'Drake Maye': 'Drake Maye.PNG',
  'Geno Smith': 'Geno Smith.jpg',
  'Malik Willis': 'Malik Willis.PNG',
  'Lamar Jackson': 'Lamar Jackson.jpg',
  'Joe Burrow': 'Joe Burrow.PNG',
  'Deshaun Watson': 'Deshaun Watson.PNG',
  'Aaron Rodgers': 'Aaron Rodgers.PNG',
  'C.J. Stroud': 'C.J. Stroud.PNG',
  'Daniel Jones': 'Daniel Jones.PNG',
  'Trevor Lawrence': 'Trevor Lawrence.PNG',
  'Cam Ward': 'Cam Ward.jpg',
  'Bo Nix': 'Bo Nix.PNG',
  'Patrick Mahomes': 'Patrick Mahomes.PNG',
  'Kirk Cousins': 'Kirk Cousins.PNG',
  'Justin Herbert': 'Justin Herbert.PNG',
  'Dak Prescott': 'Dak Prescott.PNG',
  'Jaxson Dart': 'Jaxson Dart.PNG',
  'Jalen Hurts': 'Jalen Hurts.PNG',
  'Jayden Daniels': 'Jayden Daniels.PNG',
  'Caleb Williams': 'Caleb Williams.PNG',
  'Jared Goff': 'Jared Goff.PNG',
  'Jordan Love': 'Jordan Love.PNG',
  'Kyler Murray': 'Kyler Murray.PNG',
  'Tua Tagovailoa': 'Tua Tagovailoa.PNG',
};

const RARITY_CONFIG: Record<string, { label: string; cssClass: string }> = {
  'Común':     { label: '⚪ Común',     cssClass: 'rarity-common' },
  'Rara':      { label: '🔵 Rara',      cssClass: 'rarity-rare' },
  'Épica':     { label: '🟣 Épica',     cssClass: 'rarity-epic' },
  'Legendaria':{ label: '🟡 Legendaria',cssClass: 'rarity-legendary' },
};

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
  ],
})
export class Tab3Page implements OnInit {
  private api = 'http://localhost/apis/open_pack.php';
  private coleccionApi = 'http://localhost/apis/mi_coleccion.php';

  estado: 'idle' | 'opening' | 'result' = 'idle';
  jugadorObtenido: Player | null = null;
  rarityClass = '';
  rarityLabel = '';
  shaking = false;
  totalCartas = 0;
  mensajeError = '';
  particles = Array(20).fill(0);

  private get userId(): number {
    return Number(localStorage.getItem('user_id') || 0);
  }

  constructor() {}

  ngOnInit() {
    this.cargarTotalCartas();
  }

  private async cargarTotalCartas() {
    try {
      const res = await axios.get(`${this.coleccionApi}?user_id=${this.userId}`);
      if (res.data && res.data.total !== undefined) {
        this.totalCartas = res.data.total;
      }
    } catch {
      // silently fail
    }
  }

  async abrirSobre() {
    if (!this.userId) {
      this.mostrarError('Inicia sesión para abrir sobres.');
      return;
    }
    if (this.estado !== 'idle') return;

    // Brief shake animation before opening
    this.shaking = true;
    await this.sleep(400);
    this.shaking = false;

    this.estado = 'opening';

    try {
      const response = await axios.post(this.api, { user_id: this.userId });
      const data = response.data;

      if (data.success && data.player) {
        const player: Player = data.player;
        const cfg = RARITY_CONFIG[player.rareza] || RARITY_CONFIG['Común'];
        this.rarityClass = cfg.cssClass;
        this.rarityLabel = cfg.label;

        // Wait for opening animation to finish
        await this.sleep(1800);

        this.jugadorObtenido = player;
        this.estado = 'result';
        this.totalCartas++;
      } else {
        this.estado = 'idle';
        this.mostrarError(data.message || 'Error al abrir el sobre.');
      }
    } catch (err: any) {
      this.estado = 'idle';
      const msg = err?.response?.data?.message || 'Sin conexión con el servidor.';
      this.mostrarError(msg);
      console.error('open_pack error:', err);
    }
  }

  resetear() {
    this.estado = 'idle';
    this.jugadorObtenido = null;
    this.rarityClass = '';
    this.rarityLabel = '';
  }

  hasImage(name: string): boolean {
    return name in PLAYER_IMAGE_MAP;
  }

  getPlayerImage(name: string): string {
    return `assets/images/players/${PLAYER_IMAGE_MAP[name]}`;
  }

  onImgError(event: any) {
    event.target.style.display = 'none';
    event.target.nextElementSibling?.classList.remove('hidden');
  }

  particleStyle(index: number): string {
    const angle = (index / this.particles.length) * 360;
    const dist = 80 + Math.random() * 60;
    const delay = (index * 50);
    const size = 4 + Math.random() * 6;
    return `
      --angle: ${angle}deg;
      --dist: ${dist}px;
      --delay: ${delay}ms;
      width: ${size}px;
      height: ${size}px;
    `;
  }

  private mostrarError(msg: string) {
    this.mensajeError = msg;
    setTimeout(() => { this.mensajeError = ''; }, 3500);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}