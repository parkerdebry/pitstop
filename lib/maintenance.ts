import type {
  MaintenanceItem, Vehicle, MaintStatusResult,
  TrackingInfo, VehicleEmoji,
} from './types';

// ─────────────────────────────────────────────
// MAINTENANCE SCHEDULE
// ─────────────────────────────────────────────

export const MAINT: MaintenanceItem[] = [
  // ── All vehicles ─────────────────────────────────────────────────
  { key:'oil',       icon:'🛢', name:'Oil & Filter Change',    mi:5000,  types:'all' },
  { key:'airfilter', icon:'💨', name:'Air Filter',              mi:15000, types:'all' },
  { key:'brakes',    icon:'🔧', name:'Brake Inspection',        mi:20000, types:'all' },
  { key:'spark',     icon:'⚡', name:'Spark Plugs',             mi:30000, types:'all' },
  { key:'coolant',   icon:'💧', name:'Coolant Flush',           mi:40000, types:'all' },

  // ── Cars, SUVs, Vans ──────────────────────────────────────────────
  { key:'tires',     icon:'🔄', name:'Tire Rotation',           mi:7500,  types:['🚗','🚙','🚐'] },
  { key:'newtires',  icon:'🛞', name:'New Tires',               mi:50000, types:['🚗','🚙','🚐'] },
  { key:'cabin',     icon:'🌬', name:'Cabin Air Filter',        mi:15000, types:['🚗','🚙','🚐'] },
  { key:'tranny',    icon:'⚙',  name:'Transmission Fluid',     mi:30000, types:['🚗','🚙','🚐'] },

  // ── ATVs / Offroad ────────────────────────────────────────────────
  { key:'atvtires',  icon:'🛞', name:'New Tires',               mi:10000, types:['🚜'] },
  { key:'atvchain',  icon:'⛓', name:'Chain Clean & Lube',      mi:500,   types:['🚜'] },
  { key:'atvvalve',  icon:'🎚', name:'Valve Adjustment',        mi:15000, types:['🚜'] },
  { key:'atvbrkfld', icon:'🔵', name:'Brake Fluid Flush',       mi:12000, types:['🚜'] },

  // ── Street Motorcycles (miles) ────────────────────────────────────
  { key:'chain',     icon:'⛓', name:'Chain Clean & Lube',      mi:1000,  types:['🏍'] },
  { key:'chainrepl', icon:'🔗', name:'Chain Replacement',       mi:20000, types:['🏍'] },
  { key:'mctires',   icon:'🛞', name:'New Tires (Rear)',        mi:10000, types:['🏍'] },
  { key:'forkoil',   icon:'🍴', name:'Fork Oil',                mi:15000, types:['🏍'] },
  { key:'valve',     icon:'🎚', name:'Valve Adjustment',        mi:20000, types:['🏍'] },
  { key:'brakefld',  icon:'🔵', name:'Brake Fluid Flush',       mi:12000, types:['🏍'] },
  { key:'clutchcbl', icon:'🪝', name:'Clutch & Throttle Cable', mi:6000,  types:['🏍'] },

  // ── Dirt Bikes / Enduro (engine hours) ───────────────────────────
  { key:'dbchain',   icon:'⛓', name:'Chain Clean & Lube',      mi:5,     types:['🏁'] },
  { key:'dbchainrp', icon:'🔗', name:'Chain Replacement',       mi:100,   types:['🏁'] },
  { key:'dbtires',   icon:'🛞', name:'New Tires (Rear)',        mi:80,    types:['🏁'] },
  { key:'dbforkoil', icon:'🍴', name:'Fork Oil & Seals',        mi:40,    types:['🏁'] },
  { key:'dbvalve',   icon:'🎚', name:'Valve Clearance Check',   mi:30,    types:['🏁'] },
  { key:'dbbrkfld',  icon:'🔵', name:'Brake Fluid Flush',       mi:50,    types:['🏁'] },
  { key:'dbpiston',  icon:'🔩', name:'Piston / Top End',        mi:100,   types:['🏁'] },
  { key:'dbbottom',  icon:'⚙',  name:'Bottom End Rebuild',     mi:300,   types:['🏁'] },
  { key:'dbjets',    icon:'⛽', name:'Carburetor / Jetting',    mi:50,    types:['🏁'] },
  { key:'dbcoolant', icon:'💧', name:'Coolant (liquid-cooled)', mi:100,   types:['🏁'] },

  // ── Boats (engine hours) ─────────────────────────────────────────
  { key:'boatoil',   icon:'🛢', name:'Engine Oil',              mi:100,   types:['⛵'] },
  { key:'impeller',  icon:'🌀', name:'Impeller / Water Pump',   mi:250,   types:['⛵'] },
  { key:'zincs',     icon:'🔩', name:'Zinc Anodes',             mi:150,   types:['⛵'] },
  { key:'gearoil',   icon:'⚙',  name:'Lower Unit / Gear Oil',  mi:100,   types:['⛵'] },
  { key:'boatfuel',  icon:'⛽', name:'Fuel Filter',             mi:100,   types:['⛵'] },
  { key:'prop',      icon:'🌊', name:'Propeller Inspection',    mi:150,   types:['⛵'] },
  { key:'botpaint',  icon:'🎨', name:'Bottom Paint',            mi:500,   types:['⛵'] },
  { key:'winterize', icon:'❄️', name:'Winterization',           mi:1000,  types:['⛵'] },
];

// Vehicle types that always use engine hours
export const ALWAYS_HOURS: VehicleEmoji[] = ['⛵', '🏁'];
// Types where user can choose
export const CAN_CHOOSE_UNIT: VehicleEmoji[] = ['🏍', '🚜'];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Returns the current odometer value and display unit for a vehicle. */
export function getTracking(v: Vehicle): TrackingInfo {
  const useHours = v.trackingUnit === 'hours';
  return {
    value:    useHours ? (v.engineHours ?? 0) : (v.mileage ?? 0),
    unit:     useHours ? 'hr' : 'mi',
    unitFull: useHours ? 'hours' : 'miles',
    useHours,
  };
}

/** Returns the default tracking unit for a vehicle based on its emoji type. */
export function defaultTrackingUnit(emoji: VehicleEmoji): 'miles' | 'hours' {
  return ALWAYS_HOURS.includes(emoji) ? 'hours' : 'miles';
}

/** Returns the maintenance items relevant to a given vehicle. */
export function getMaintForVehicle(v: Vehicle): MaintenanceItem[] {
  const emoji = v.emoji ?? '🚗';
  return MAINT.filter(item => {
    if (item.types === 'all') return true;
    return (item.types as VehicleEmoji[]).includes(emoji as VehicleEmoji);
  });
}

/** Returns the status and display text for a single maintenance item. */
export function getMaintStatus(v: Vehicle, item: MaintenanceItem): MaintStatusResult {
  const { value: current, unit, useHours } = getTracking(v);
  const lastVal   = v.lastServiceMi[item.key] ?? 0;
  const remaining = (lastVal + item.mi) - current;
  const weekly    = v.weeklyMiles ?? 0;

  let timeSuffix = '';
  if (!useHours && weekly > 0 && remaining > 0) {
    const weeks = Math.round(remaining / weekly);
    if (weeks <= 4) {
      timeSuffix = ` · ~${weeks} wk${weeks !== 1 ? 's' : ''}`;
    } else {
      const months = Math.round(weeks / 4.33);
      timeSuffix = ` · ~${months} mo${months !== 1 ? 's' : ''}`;
    }
  }

  const ul = ` ${unit}`;
  if (remaining <= 0) {
    return { status: 'overdue', text: `${Math.abs(remaining).toLocaleString()}${ul} overdue` };
  }
  if (remaining <= item.mi * 0.15) {
    return { status: 'soon', text: `Due in ${remaining.toLocaleString()}${ul}${timeSuffix}` };
  }
  return { status: 'ok', text: `Due in ${remaining.toLocaleString()}${ul}${timeSuffix}` };
}

/** Calculates overall health % (0–100) based on all applicable maintenance items. */
export function calcHealth(v: Vehicle): number {
  const items = getMaintForVehicle(v);
  if (!items.length) return 100;
  const { value: current } = getTracking(v);
  const scores = items.map(item => {
    const lastVal   = v.lastServiceMi[item.key] ?? 0;
    const remaining = (lastVal + item.mi) - current;
    return Math.max(0, Math.min(100, (remaining / item.mi) * 100));
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Counts maintenance items that are overdue or due soon. */
export function countDue(v: Vehicle): number {
  return getMaintForVehicle(v).filter(item => {
    const { status } = getMaintStatus(v, item);
    return status === 'overdue' || status === 'soon';
  }).length;
}

/** Human-readable vehicle type label for AI/display use. */
export const VEHICLE_TYPE_LABEL: Record<string, string> = {
  '🚗': 'car',
  '🚙': 'SUV/truck',
  '🏍': 'street motorcycle',
  '🏁': 'dirt bike',
  '🚐': 'van',
  '⛵': 'boat',
  '🚜': 'ATV',
};
