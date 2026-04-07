'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Vehicle, TrackingUnit } from './types';
import { DEFAULT_VEHICLES } from './defaultData';
import { defaultTrackingUnit } from './maintenance';

// ─────────────────────────────────────────────
// MIGRATION — ensures old saved vehicles have all required fields
// ─────────────────────────────────────────────
function migrateVehicle(v: Partial<Vehicle> & { id: number }): Vehicle {
  const emoji = (v.emoji ?? '🚗') as Vehicle['emoji'];
  return {
    id:           v.id,
    emoji,
    year:         v.year         ?? '',
    make:         v.make         ?? '',
    model:        v.model        ?? '',
    trim:         v.trim         ?? '',
    mileage:      v.mileage      ?? 0,
    engineHours:  v.engineHours  ?? 0,
    weeklyMiles:  v.weeklyMiles  ?? 0,
    trackingUnit: v.trackingUnit ?? defaultTrackingUnit(emoji),
    vin:          v.vin          ?? '',
    photo:        v.photo        ?? null,
    recalls:      v.recalls      ?? 0,
    smartcarId:   v.smartcarId   ?? null,
    lastServiceMi:   v.lastServiceMi   ?? {},
    lastServiceDate: v.lastServiceDate ?? {},
    serviceLog:      v.serviceLog      ?? [],
  };
}

// ─────────────────────────────────────────────
// STORE INTERFACE
// ─────────────────────────────────────────────
interface PitStopStore {
  vehicles:    Vehicle[];
  nextId:      number;
  theme:       'dark' | 'light' | 'auto';
  accent:      string;

  // Vehicle CRUD
  addVehicle:    (v: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: number, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: number) => void;

  // Service log
  logService: (vehicleId: number, entry: Omit<Vehicle['serviceLog'][0], 'id'>) => void;

  // Settings
  setTheme:  (t: 'dark' | 'light' | 'auto') => void;
  setAccent: (color: string) => void;
}

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────
export const useStore = create<PitStopStore>()(
  persist(
    (set, get) => ({
      vehicles: DEFAULT_VEHICLES,
      nextId:   3,
      theme:    'auto',
      accent:   '#E8832A',

      addVehicle: (v) => {
        const id = get().nextId;
        set(state => ({
          vehicles: [...state.vehicles, { ...v, id }],
          nextId:   state.nextId + 1,
        }));
      },

      updateVehicle: (id, patch) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === id ? { ...v, ...patch } : v
          ),
        }));
      },

      removeVehicle: (id) => {
        set(state => ({
          vehicles: state.vehicles.filter(v => v.id !== id),
        }));
      },

      logService: (vehicleId, entry) => {
        set(state => ({
          vehicles: state.vehicles.map(v => {
            if (v.id !== vehicleId) return v;

            const { serviceKey, value } = entry as typeof entry & { serviceKey?: string };
            const newLastMi   = { ...v.lastServiceMi };
            const newLastDate = { ...v.lastServiceDate };
            if (serviceKey) {
              newLastMi[serviceKey]   = entry.mileage;
              newLastDate[serviceKey] = entry.date;
            }

            // Update odometer
            const isHours = v.trackingUnit === 'hours';
            const newMileage     = !isHours && entry.mileage > v.mileage ? entry.mileage : v.mileage;
            const newEngineHours =  isHours && entry.mileage > v.engineHours ? entry.mileage : v.engineHours;

            return {
              ...v,
              mileage:         newMileage,
              engineHours:     newEngineHours,
              lastServiceMi:   newLastMi,
              lastServiceDate: newLastDate,
              serviceLog: [...v.serviceLog, { ...entry, id: Date.now() }],
            };
          }),
        }));
      },

      setTheme:  (t) => set({ theme: t }),
      setAccent: (c) => set({ accent: c }),
    }),
    {
      name: 'ps_vehicles',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      // Migrate loaded data to ensure all fields exist
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.vehicles = state.vehicles.map(v => migrateVehicle(v as Partial<Vehicle> & { id: number }));
        }
      },
    }
  )
);

// ─────────────────────────────────────────────
// SELECTORS (convenience hooks)
// ─────────────────────────────────────────────
export const useVehicles   = () => useStore(s => s.vehicles);
export const useVehicle    = (id: number) => useStore(s => s.vehicles.find(v => v.id === id));
export const useTheme      = () => useStore(s => s.theme);
export const useAccent     = () => useStore(s => s.accent);
