/**
 * Modelo compartido de jugadores y rarezas.
 *
 * Vive aparte porque tanto "Abrir Sobres" (tab3) como "Mi Colección" (tab2)
 * necesitan pintar la misma carta con los mismos colores e imágenes.
 */

export interface Player {
  id: number;
  player_name: string;
  team: string;
  conference?: string;
  division?: string;
  position: string;
  puntos_semana: number | string | null;
  rareza: string;
  estado?: string;
}

/** Una carta tal como vive en la colección del usuario. */
export interface CartaColeccion extends Player {
  cantidad: number;
}

/** Respuesta de open_pack.php */
export interface ResultadoSobre {
  player: Player;
  esNueva: boolean;
  cantidad: number;
}

export interface RarityConfig {
  /** Nombre visible, sin emoji: el color ya comunica la rareza. */
  label: string;
  cssClass: string;
  /** Color base, usado para bordes, brillos y partículas. */
  color: string;
  /** Orden de menor a mayor rareza, para ordenar la colección. */
  orden: number;
  /** Probabilidad de salir en un sobre (debe coincidir con open_pack.php). */
  probabilidad: number;
}

export const RARITY_CONFIG: Record<string, RarityConfig> = {
  'Común':      { label: 'Común',      cssClass: 'rarity-common',    color: '#a0aec0', orden: 0, probabilidad: 60 },
  'Rara':       { label: 'Rara',       cssClass: 'rarity-rare',      color: '#4299e1', orden: 1, probabilidad: 25 },
  'Épica':      { label: 'Épica',      cssClass: 'rarity-epic',      color: '#9b59b6', orden: 2, probabilidad: 10 },
  'Legendaria': { label: 'Legendaria', cssClass: 'rarity-legendary', color: '#f6c90e', orden: 3, probabilidad: 5  },
};

export const RAREZAS: string[] = ['Común', 'Rara', 'Épica', 'Legendaria'];

export function rarityOf(rareza: string | undefined): RarityConfig {
  return RARITY_CONFIG[rareza ?? ''] ?? RARITY_CONFIG['Común'];
}

/**
 * Los archivos de assets/images/players no siguen un patrón único
 * (unos son .PNG y otros .jpg), así que el mapa es explícito.
 */
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

export function hasPlayerImage(name: string): boolean {
  return name in PLAYER_IMAGE_MAP;
}

export function getPlayerImage(name: string): string {
  return 'assets/images/players/' + PLAYER_IMAGE_MAP[name];
}

/** Iniciales para el placeholder cuando no hay foto: "Josh Allen" -> "JA". */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

/** puntos_semana llega como string desde MySQL (DECIMAL). */
export function puntosOf(p: Player): number {
  const n = Number(p.puntos_semana);
  return isNaN(n) ? 0 : n;
}
