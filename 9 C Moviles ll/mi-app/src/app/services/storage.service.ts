import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * StorageService — Wrapper genérico sobre @capacitor/preferences.
 * Permite guardar, leer y eliminar datos tipados de forma persistente
 * tanto en web (localStorage nativo) como en iOS/Android (nativo).
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Guarda un valor serializado en JSON bajo la clave indicada.
   */
  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  /**
   * Recupera y deserializa el valor almacenado bajo la clave.
   * Retorna `null` si la clave no existe o el valor es inválido.
   */
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Elimina la entrada almacenada bajo la clave indicada.
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Elimina TODAS las entradas almacenadas por la app.
   * Usar con cuidado — útil al hacer logout.
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
