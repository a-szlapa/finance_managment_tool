// Domain types for Budget Forecast

export type EventKind = "income" | "expense";
export type Recurrence = "once" | "monthly" | "interval";

//type for a budget event
export interface BudgetEvent {
  id: string;
  name: string;
  amount: number; //keep as bigger than 0, subtractions handled by kind
  kind: EventKind; //dictates type of event, used to decide behavior of the amaunt from amaunt field
  recurrence: Recurrence;//dictates whether the event should repeat or not
  date?: string; // ISO yyyy-mm-dd

  // used for monthly cecurrence
  dayOfMonth?: number; // 1-31

  // used for interval cecurrence
  intervalDays?: number;

  startDate?: string;
  endDate?: string; // optional cap for recurring series

  // exceptions (skipped occurrences) for recurring events, used when a singular event is removed from a reoccuring list of events
  exceptions?: string[]; // ISO dates ofthe mentioned exceptions
  hypothetical?: boolean; //used for the "waht if" functionality
  notes?: string;
}

//type for the settings
export interface AppSettings {
  initialBalance: number;
  currency: string; // currency type such as PLN, EUR, USD, GBPandso on (will never use most likelly but whatever)
  initialBalanceDate: string; // ISO date the initial balance is anchored to
  savings: number;// a pool of money u dont want to spend but is technically avaliable
}

//this is kinda used as the memmory (?) i didnt want to hook it up to a database rn, might change it later
export interface AppState {
  events: BudgetEvent[];
  settings: AppSettings;
}

//most fields similar to the budget event
export interface Occurrence {
  eventId: string;
  date: string; // ISO yyyy-mm-dd
  name: string;
  amount: number; // signed: +income / -expense
  kind: EventKind;
  hypothetical?: boolean;
}
