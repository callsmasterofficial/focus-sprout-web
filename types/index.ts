export type TimerMode = 'focus' | 'short_break' | 'long_break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  mode: TimerMode;
  taskId?: string;
  taskTitle?: string;
  category?: string;
  plannedDurationSec: number;
  actualDurationSec: number;
  startedAt: string;
  completedAt: string;
  completed: boolean;
  notes?: string;
  distractionShieldActive: boolean;
}

export interface DistractionRule {
  id: string;
  name: string;
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'gaming' | 'custom';
  icon: string;
  enabled: boolean;
  website?: string;
}

export interface SproutStage {
  level: number;
  name: string;
  title: string;
  requiredSessions: number;
  description: string;
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'emerald';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export type AmbientSoundId =
  | 'rain'
  | 'forest'
  | 'ocean'
  | 'whitenoise'
  | 'campfire'
  | 'cafe'
  | 'stream'
  | 'birds';

export interface AmbientSound {
  id: AmbientSoundId;
  name: string;
  description: string;
  icon: string;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
}

export interface UserSettings {
  focusDurationMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  tickingSound: boolean;
  tickingVolume: number;
  completionSound: 'bell' | 'chime' | 'nature' | 'gentle' | 'none';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  theme: 'light' | 'dark' | 'system';
  distractionShieldEnabled: boolean;
  emergencyExitDelaySec: number; // 0, 5, 10
  notificationsEnabled: boolean;
  dailyReminderTime: string; // e.g. "09:00"
  guestMode: boolean;
  userName: string;
  sproutName: string;
  hasCompletedOnboarding: boolean;
}

export interface DayProductivity {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue...
  totalFocusMinutes: number;
  completedSessions: number;
  breakMinutes: number;
  goalMinutes: number;
  completionRate: number; // 0 - 100
}

export interface HourlyProductivity {
  hour: number; // 0 to 23
  label: string; // "9 AM"
  focusMinutes: number;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  sproutName: string;
  passwordHash?: string;
  createdAt: string;
  lastSyncedAt?: string;
}

export interface SyncPayload {
  settings?: UserSettings;
  tasks?: Task[];
  sessions?: Session[];
  distractionRules?: DistractionRule[];
  achievements?: Achievement[];
  clientTimestamp?: string;
}

export interface SyncResponse {
  success: boolean;
  syncedAt: string;
  settings: UserSettings;
  tasks: Task[];
  sessions: Session[];
  distractionRules: DistractionRule[];
  achievements: Achievement[];
  user?: {
    id: string;
    email: string;
    name: string;
    sproutName: string;
  };
}

