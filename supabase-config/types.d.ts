/**
 * TypeScript definitions for WeeGym Supabase Config
 * This file provides type hints for JavaScript users in IDEs that support JSDoc
 */

/**
 * Supabase configuration object
 */
export interface SupabaseConfig {
  /** Supabase project URL (e.g., https://xxxxx.supabase.co) */
  url: string;
  /** Supabase anonymous key */
  anonKey: string;
  /** Additional Supabase client options */
  options?: {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
    };
  };
}

/**
 * Workout data structure
 */
export interface WorkoutData {
  /** ISO date string */
  date: string;
  /** Workout name */
  name: string;
  /** Duration in seconds */
  duration: number;
  /** Array of exercise objects */
  exercises: Exercise[];
}

/**
 * Exercise data structure
 */
export interface Exercise {
  /** Exercise name */
  name: string;
  /** Number of sets */
  sets?: number;
  /** Number of reps */
  reps?: number;
  /** Weight in kg */
  weight?: number;
  /** Rest time in seconds */
  restTime?: number;
  /** Any additional data */
  [key: string]: any;
}

/**
 * Active Wellbeing session data structure
 */
export interface ActiveWellbeingSessionData {
  /** Machine name (e.g., "Rowing", "Bike") */
  machine: string;
  /** Mode (e.g., "Endurance", "Intervals") */
  mode: string;
  /** Session score */
  score: number;
  /** ISO date string */
  date: string;
}

/**
 * User settings data structure
 */
export interface UserSettings {
  /** Default rest time in seconds */
  defaultRestTime: number;
  /** Short rest time in seconds */
  shortRestTime: number;
  /** Long rest time in seconds */
  longRestTime: number;
}

/**
 * Database service interface
 */
export interface DatabaseService {
  // Workout operations
  saveWorkout(workoutData: WorkoutData): Promise<any>;
  getWorkouts(): Promise<any[]>;
  getWorkoutsByDateRange(startDate: string, endDate: string): Promise<any[]>;
  deleteWorkout(id: number): Promise<void>;

  // Active Wellbeing operations
  saveActiveWellbeingSession(
    sessionData: ActiveWellbeingSessionData,
  ): Promise<any>;
  getActiveWellbeingSessions(): Promise<any[]>;
  deleteActiveWellbeingSession(id: number): Promise<void>;

  // Settings operations
  getUserSettings(): Promise<any | null>;
  saveUserSettings(settings: UserSettings): Promise<any>;
}

/**
 * Auth service interface
 */
export interface AuthService {
  signUp(email: string, password: string, metadata?: object): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  getSession(): Promise<any | null>;
  getUser(): Promise<any | null>;
  onAuthStateChange(callback: (event: string, session: any) => void): {
    unsubscribe: () => void;
  };
  resetPassword(email: string): Promise<void>;
  updateUser(updates: object): Promise<any>;
  isAuthenticated(): Promise<boolean>;
}

// Configuration functions
export function validateConfig(config: SupabaseConfig): void;
export function loadConfigFromEnv(): SupabaseConfig;
export function createConfig(config?: SupabaseConfig | null): SupabaseConfig;
export function debugConfig(config: SupabaseConfig): void;

// Client functions
export function createSupabaseClient(
  config?: SupabaseConfig | null,
  debug?: boolean,
): any;
export function getSupabaseClient(
  config?: SupabaseConfig | null,
  debug?: boolean,
): any;
export function resetSupabaseClient(): void;
export function createSupabaseClientFromEnv(debug?: boolean): any;

// Service factory functions
export function createDatabaseService(supabaseClient: any): DatabaseService;
export function createAuthService(supabaseClient: any): AuthService;
