'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Vehicle, VehicleDocument, VehicleLoan, UserProfile } from './types';
import type { Language } from './i18n';
import { DEFAULT_VEHICLES } from './defaultData';
import { defaultTrackingUnit } from './maintenance';

// ── Admin emails — always get Pro access for free ────────────────────
const ADMIN_EMAILS = [
  'parkerdebry@gmail.com',
  'debry.parker1@gmail.com',
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

// ─────────────────────────────────────────────
// MIGRATION
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
    licensePlate: v.licensePlate ?? '',
    mileage:      v.mileage      ?? 0,
    engineHours:  v.engineHours  ?? 0,
    weeklyMiles:  v.weeklyMiles  ?? 0,
    trackingUnit: v.trackingUnit ?? defaultTrackingUnit(emoji),
    vin:          v.vin          ?? '',
    photo:        v.photo        ?? null,
    recalls:      v.recalls      ?? 0,
    nickname:     v.nickname     ?? '',
    smartcarId:   v.smartcarId   ?? null,
    lastServiceMi:   v.lastServiceMi   ?? {},
    lastServiceDate: v.lastServiceDate ?? {},
    serviceLog:      v.serviceLog      ?? [],
    documents:       v.documents       ?? [],
    loans:           v.loans           ?? [],
  };
}

// ─────────────────────────────────────────────
// LOAN AUTO-UPDATE — subtract payments that have passed
// ─────────────────────────────────────────────
function applyLoanPayments(loans: VehicleLoan[]): VehicleLoan[] {
  const today = new Date();
  return loans.map(loan => {
    const last      = new Date(loan.lastUpdated);
    let remaining   = loan.remainingBalance;
    let lastUpdated = loan.lastUpdated;

    // Walk month by month from lastUpdated to today
    const cursor = new Date(last);
    cursor.setDate(loan.paymentDay);
    if (cursor <= last) cursor.setMonth(cursor.getMonth() + 1);

    while (cursor <= today && remaining > 0) {
      remaining   = Math.max(0, remaining - loan.monthlyPayment);
      lastUpdated = cursor.toISOString().split('T')[0];
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { ...loan, remainingBalance: remaining, lastUpdated };
  });
}

// ─────────────────────────────────────────────
// STORE INTERFACE
// ─────────────────────────────────────────────
interface PitStopStore {
  vehicles:    Vehicle[];
  nextId:      number;
  theme:       'dark' | 'light' | 'auto';
  accent:      string;
  language:    Language;
  user:        UserProfile | null;
  tosAccepted: boolean;
  plan: 'free' | 'pro_monthly' | 'pro_annual';

  // Vehicle CRUD
  addVehicle:    (v: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: number, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: number) => void;

  // Service log
  logService: (vehicleId: number, entry: Omit<Vehicle['serviceLog'][0], 'id'>) => void;

  // Documents (insurance, registration)
  addDocument:    (vehicleId: number, doc: VehicleDocument) => void;
  updateDocument: (vehicleId: number, docId: string, patch: Partial<VehicleDocument>) => void;
  removeDocument: (vehicleId: number, docId: string) => void;

  // Loans
  addLoan:    (vehicleId: number, loan: VehicleLoan) => void;
  updateLoan: (vehicleId: number, loanId: string, patch: Partial<VehicleLoan>) => void;
  removeLoan: (vehicleId: number, loanId: string) => void;

  // Auth / user
  setUser:       (u: UserProfile | null) => void;
  acceptTos:     () => void;
  setPlan:       (p: 'free' | 'pro_monthly' | 'pro_annual') => void;
  setTheme:      (t: 'dark' | 'light' | 'auto') => void;
  setAccent:     (color: string) => void;
  setLanguage:   (l: Language) => void;
}

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────
export const useStore = create<PitStopStore>()(
  persist(
    (set, get) => ({
      vehicles:    DEFAULT_VEHICLES,
      nextId:      3,
      theme:       'auto',
      accent:      '#E8832A',
      language:    'en',
      user:        null,
      tosAccepted: false,
      plan: 'free',

      addVehicle: (v) => {
        const id = get().nextId;
        set(state => ({
          vehicles: [...state.vehicles, { ...v, id }],
          nextId:   state.nextId + 1,
        }));
      },

      updateVehicle: (id, patch) => {
        set(state => ({
          vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...patch } : v),
        }));
      },

      removeVehicle: (id) => {
        set(state => ({ vehicles: state.vehicles.filter(v => v.id !== id) }));
      },

      logService: (vehicleId, entry) => {
        set(state => ({
          vehicles: state.vehicles.map(v => {
            if (v.id !== vehicleId) return v;
            const e = entry as typeof entry & { serviceKey?: string };
            const newLastMi   = { ...v.lastServiceMi };
            const newLastDate = { ...v.lastServiceDate };
            if (e.serviceKey) {
              newLastMi[e.serviceKey]   = entry.mileage;
              newLastDate[e.serviceKey] = entry.date;
            }
            const isHours        = v.trackingUnit === 'hours';
            const newMileage     = !isHours && entry.mileage > v.mileage ? entry.mileage : v.mileage;
            const newEngineHours =  isHours && entry.mileage > v.engineHours ? entry.mileage : v.engineHours;
            return { ...v, mileage: newMileage, engineHours: newEngineHours, lastServiceMi: newLastMi, lastServiceDate: newLastDate, serviceLog: [...v.serviceLog, { ...entry, id: Date.now() }] };
          }),
        }));
      },

      addDocument: (vehicleId, doc) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === vehicleId ? { ...v, documents: [...(v.documents ?? []), doc] } : v
          ),
        }));
      },

      updateDocument: (vehicleId, docId, patch) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === vehicleId
              ? { ...v, documents: (v.documents ?? []).map(d => d.id === docId ? { ...d, ...patch } : d) }
              : v
          ),
        }));
      },

      removeDocument: (vehicleId, docId) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === vehicleId ? { ...v, documents: (v.documents ?? []).filter(d => d.id !== docId) } : v
          ),
        }));
      },

      addLoan: (vehicleId, loan) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === vehicleId ? { ...v, loans: [...(v.loans ?? []), loan] } : v
          ),
        }));
      },

      updateLoan: (vehicleId, loanId, patch) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === vehicleId
              ? { ...v, loans: (v.loans ?? []).map(l => l.id === loanId ? { ...l, ...patch } : l) }
              : v
          ),
        }));
      },

      removeLoan: (vehicleId, loanId) => {
        set(state => ({
          vehicles: state.vehicles.map(v =>
            v.id === vehicleId ? { ...v, loans: (v.loans ?? []).filter(l => l.id !== loanId) } : v
          ),
        }));
      },

      setUser:   (u) => set({ user: u, plan: u && isAdmin(u.email) ? 'pro_annual' : get().plan }),
      acceptTos: () => set({ tosAccepted: true }),
      setPlan:   (p) => set({ plan: p }),
      setTheme:    (t) => set({ theme: t }),
      setAccent:   (c) => set({ accent: c }),
      setLanguage: (l) => set({ language: l }),
    }),
    {
      name:    'ps_vehicles',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null, setItem: () => {}, removeItem: () => {},
        }
      ),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Migrate vehicles
        state.vehicles = state.vehicles.map(v => migrateVehicle(v as Partial<Vehicle> & { id: number }));
        // Apply any pending loan payments
        state.vehicles = state.vehicles.map(v => ({
          ...v,
          loans: applyLoanPayments(v.loans ?? []),
        }));
      },
    }
  )
);

// ── Selectors ─────────────────────────────────
export const useVehicles   = () => useStore(s => s.vehicles);
export const useVehicle    = (id: number) => useStore(s => s.vehicles.find(v => v.id === id));
export const useTheme      = () => useStore(s => s.theme);
export const useAccent     = () => useStore(s => s.accent);
export const useLanguage   = () => useStore(s => s.language);
export const useUser       = () => useStore(s => s.user);
export const useTosAccepted = () => useStore(s => s.tosAccepted);
