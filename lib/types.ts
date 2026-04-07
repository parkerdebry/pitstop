// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type TrackingUnit = 'miles' | 'hours';

export type VehicleEmoji =
  | '🚗' // Car
  | '🚙' // SUV / Truck
  | '🏍' // Street Motorcycle
  | '🏁' // Dirt Bike / Enduro
  | '🚐' // Van
  | '⛵' // Boat
  | '🚜'; // ATV / Offroad

export interface ServiceEntry {
  id:      number;
  service: string;
  date:    string; // ISO date YYYY-MM-DD
  mileage: number; // odometer OR engine hours value
  cost:    number;
  shop:    string;
  notes:   string;
}

export interface Vehicle {
  id:           number;
  emoji:        VehicleEmoji;
  year:         string;
  make:         string;
  model:        string;
  trim:         string;
  mileage:      number;
  engineHours:  number;
  weeklyMiles:  number;  // avg miles OR hours per week (for reminders)
  trackingUnit: TrackingUnit;
  vin:          string;
  photo:        string | null;
  recalls:      number;
  smartcarId:   string | null; // set after SmartCar OAuth
  lastServiceMi:   Record<string, number>;     // key → last odometer/hours reading
  lastServiceDate: Record<string, string | null>; // key → ISO date
  serviceLog:   ServiceEntry[];
}

export interface MaintenanceItem {
  key:   string;
  icon:  string;
  name:  string;
  mi:    number;  // interval in miles OR hours depending on trackingUnit
  types: VehicleEmoji[] | 'all';
}

export type MaintStatus = 'ok' | 'soon' | 'overdue';

export interface MaintStatusResult {
  status:  MaintStatus;
  text:    string;   // e.g. "Due in 2,300 mi · ~3 wks"
}

export interface TrackingInfo {
  value:    number;
  unit:     'mi' | 'hr';
  unitFull: 'miles' | 'hours';
  useHours: boolean;
}

// Stripe / billing
export type SubscriptionPlan   = 'free' | 'annual' | 'monthly';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing' | 'inactive';

export interface SubscriptionRecord {
  customerId:     string;
  subscriptionId: string;
  plan:           SubscriptionPlan;
  status:         SubscriptionStatus;
  periodEnd:      string; // ISO
}
