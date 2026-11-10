import { create } from 'zustand';
import {
  TimerMode,
  TimerStatus,
  Task,
  TaskPriority,
  Session,
  DistractionRule,
  Achievement,
  UserSettings,
  AmbientSound,
  AmbientSoundId,
  DayProductivity,
  HourlyProductivity,
  SproutStage,
} from '@/types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_DISTRACTION_RULES,
  INITIAL_ACHIEVEMENTS,
  DEFAULT_TRACKS,
  SPROUT_STAGES,
  generateDemoData,
} from '@/constants';
import { apiService, getStoredToken, setStoredToken } from '@/services/apiService';
import { soundService } from '@/services/soundService';

interface UserState {
  id: string;
  email: string;
  name: string;
  sproutName: string;
}

interface AppStoreState {
  // Auth & Sync
  user: UserState | null;
  token: string | null;
  isLoggedIn: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (params: { email: string; password?: string; name?: string; sproutName?: string }) => Promise<boolean>;
  logout: () => void;
  syncWithBackend: () => Promise<void>;

  // Settings
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  completeOnboarding: () => Promise<void>;

  // Timer
  status: TimerStatus;
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  cycleCount: number;
  targetEndTime: number | null;
  sessionStartedAt: string | null;
  distractionShieldActive: boolean;
  showCelebrationModal: boolean;
  lastCompletedSession: Session | null;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: (earlyQuit?: boolean) => void;
  skipSession: () => void;
  setMode: (mode: TimerMode) => void;
  toggleDistractionShield: () => void;
  closeCelebrationModal: () => void;

  // Tasks
  tasks: Task[];
  selectedTaskId: string | null;
  addTask: (data: { title: string; description?: string; category: string; priority: TaskPriority; estimatedPomodoros: number; dueDate?: string }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
  getSelectedTask: () => Task | null;

  // Sessions
  sessions: Session[];
  addSession: (data: Omit<Session, 'id'>) => Promise<Session>;
  updateSessionNotes: (id: string, notes: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  clearSessions: () => Promise<void>;

  // Distraction Rules
  rules: DistractionRule[];
  toggleRule: (id: string) => Promise<void>;
  addCustomRule: (name: string, website?: string) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;

  // Ambient Sounds
  tracks: AmbientSound[];
  masterVolume: number;
  isMasterPlaying: boolean;
  toggleTrack: (id: AmbientSoundId) => void;
  setTrackVolume: (id: AmbientSoundId, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  stopAllTracks: () => void;

  // Achievements
  achievements: Achievement[];
  checkAchievements: () => Achievement[];

  // Data helpers
  seedDemoData: () => Promise<void>;
  exportDataJson: () => string;
  importDataJson: (json: string) => Promise<boolean>;

  // Analytics Selectors
  getTodayProductivity: () => DayProductivity;
  getWeeklyProductivity: () => DayProductivity[];
  getHourlyProductivity: () => HourlyProductivity[];
  getStreakStats: () => {
    currentStreak: number;
    longestStreak: number;
    totalFocusMinutes: number;
    totalSessions: number;
    completionRate: number;
    hasFocusedToday: boolean;
  };
  getCategoryBreakdown: () => { category: string; minutes: number; percentage: number; color: string }[];
  getSproutStage: () => {
    currentStage: SproutStage;
    nextStage: SproutStage | null;
    completedSessions: number;
    progressToNext: number;
    sessionsToNext: number;
  };
}

let timerInterval: any = null;

// Initial localStorage cache loader
function loadLocalState() {
  if (typeof window === 'undefined') {
    const demo = generateDemoData();
    return {
      settings: DEFAULT_SETTINGS,
      tasks: demo.tasks,
      sessions: demo.sessions,
      rules: DEFAULT_DISTRACTION_RULES,
      achievements: INITIAL_ACHIEVEMENTS,
    };
  }

  try {
    const raw = localStorage.getItem('focus_sprout_web_state_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        tasks: parsed.tasks || [],
        sessions: parsed.sessions || [],
        rules: parsed.rules || DEFAULT_DISTRACTION_RULES,
        achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
      };
    }
  } catch (e) {}

  const demo = generateDemoData();
  return {
    settings: DEFAULT_SETTINGS,
    tasks: demo.tasks,
    sessions: demo.sessions,
    rules: DEFAULT_DISTRACTION_RULES,
    achievements: INITIAL_ACHIEVEMENTS,
  };
}

function saveLocalState(state: Partial<AppStoreState>) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      settings: state.settings,
      tasks: state.tasks,
      sessions: state.sessions,
      rules: state.rules,
      achievements: state.achievements,
    };
    localStorage.setItem('focus_sprout_web_state_v1', JSON.stringify(payload));
  } catch (e) {}
}

const initial = loadLocalState();

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Auth
  user: null,
  token: getStoredToken(),
  isLoggedIn: Boolean(getStoredToken()),
  isSyncing: false,
  lastSyncedAt: null,

  login: async (email, password) => {
    try {
      set({ isSyncing: true });
      const res = await apiService.login({ email, password });
      set({
        user: res.user,
        token: res.token,
        isLoggedIn: true,
        settings: res.data?.settings || get().settings,
        tasks: res.data?.tasks || get().tasks,
        sessions: res.data?.sessions || get().sessions,
        rules: res.data?.distractionRules || get().rules,
        achievements: res.data?.achievements || get().achievements,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      });
      saveLocalState(get());
      return true;
    } catch (err) {
      set({ isSyncing: false });
      throw err;
    }
  },

  register: async (params) => {
    try {
      set({ isSyncing: true });
      const currentPayload = {
        settings: get().settings,
        tasks: get().tasks,
        sessions: get().sessions,
        distractionRules: get().rules,
        achievements: get().achievements,
      };

      const res = await apiService.register({
        ...params,
        initialPayload: currentPayload,
      });

      set({
        user: res.user,
        token: res.token,
        isLoggedIn: true,
        settings: res.data?.settings || get().settings,
        tasks: res.data?.tasks || get().tasks,
        sessions: res.data?.sessions || get().sessions,
        rules: res.data?.distractionRules || get().rules,
        achievements: res.data?.achievements || get().achievements,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      });
      saveLocalState(get());
      return true;
    } catch (err) {
      set({ isSyncing: false });
      throw err;
    }
  },

  logout: () => {
    apiService.logout();
    set({ user: null, token: null, isLoggedIn: false });
  },

  syncWithBackend: async () => {
    try {
      set({ isSyncing: true });
      const payload = {
        settings: get().settings,
        tasks: get().tasks,
        sessions: get().sessions,
        distractionRules: get().rules,
        achievements: get().achievements,
      };

      const res = await apiService.sync(payload);
      if (res.success) {
        set({
          settings: res.settings || get().settings,
          tasks: res.tasks || get().tasks,
          sessions: res.sessions || get().sessions,
          rules: res.distractionRules || get().rules,
          achievements: res.achievements || get().achievements,
          user: res.user || get().user,
          lastSyncedAt: res.syncedAt,
          isSyncing: false,
        });
        saveLocalState(get());
      }
    } catch (err) {
      set({ isSyncing: false });
    }
  },

  // Settings
  settings: initial.settings,
  updateSettings: async (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    saveLocalState(get());
    get().syncWithBackend();
  },

  completeOnboarding: async () => {
    const updated = { ...get().settings, hasCompletedOnboarding: true };
    set({ settings: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  // Timer
  status: 'idle',
  mode: 'focus',
  remainingSeconds: 25 * 60,
  totalSeconds: 25 * 60,
  cycleCount: 0,
  targetEndTime: null,
  sessionStartedAt: null,
  distractionShieldActive: true,
  showCelebrationModal: false,
  lastCompletedSession: null,

  startTimer: () => {
    const { mode, status, remainingSeconds } = get();
    const settings = get().settings;

    let durationSec = remainingSeconds;
    if (status === 'idle' || status === 'completed') {
      if (mode === 'focus') durationSec = settings.focusDurationMin * 60;
      else if (mode === 'short_break') durationSec = settings.shortBreakMin * 60;
      else durationSec = settings.longBreakMin * 60;
    }

    const now = Date.now();
    const targetEndTime = now + durationSec * 1000;
    const sessionStartedAt = get().sessionStartedAt || new Date().toISOString();

    set({
      status: 'running',
      remainingSeconds: durationSec,
      totalSeconds: durationSec,
      targetEndTime,
      sessionStartedAt,
    });

    startIntervalLoop();
  },

  pauseTimer: () => {
    const { status } = get();
    if (status !== 'running') return;
    clearIntervalLoop();
    set({ status: 'paused', targetEndTime: null });
  },

  resumeTimer: () => {
    const { status, remainingSeconds } = get();
    if (status !== 'paused') return;
    const now = Date.now();
    const targetEndTime = now + remainingSeconds * 1000;
    set({ status: 'running', targetEndTime });
    startIntervalLoop();
  },

  resetTimer: (earlyQuit = false) => {
    clearIntervalLoop();
    const { mode, status, sessionStartedAt, totalSeconds, remainingSeconds } = get();

    if (earlyQuit || (status === 'running' || status === 'paused')) {
      const elapsed = Math.max(0, totalSeconds - remainingSeconds);
      if (elapsed > 45 && sessionStartedAt && mode === 'focus') {
        const selectedTask = get().getSelectedTask();
        get().addSession({
          mode,
          taskId: selectedTask?.id,
          taskTitle: selectedTask?.title,
          category: selectedTask?.category || 'General',
          plannedDurationSec: totalSeconds,
          actualDurationSec: elapsed,
          startedAt: sessionStartedAt,
          completedAt: new Date().toISOString(),
          completed: false, // abandoned
          notes: 'Session ended early',
          distractionShieldActive: get().distractionShieldActive,
        });
      }
    }

    const settings = get().settings;
    let defaultSec = settings.focusDurationMin * 60;
    if (mode === 'short_break') defaultSec = settings.shortBreakMin * 60;
    if (mode === 'long_break') defaultSec = settings.longBreakMin * 60;

    set({
      status: 'idle',
      remainingSeconds: defaultSec,
      totalSeconds: defaultSec,
      targetEndTime: null,
      sessionStartedAt: null,
    });
  },

  skipSession: () => {
    clearIntervalLoop();
    const { mode, cycleCount } = get();
    const settings = get().settings;

    if (mode === 'focus') {
      const nextCycle = cycleCount + 1;
      const isLongBreak = nextCycle >= settings.sessionsBeforeLongBreak;
      const nextMode: TimerMode = isLongBreak ? 'long_break' : 'short_break';
      const nextDuration = (isLongBreak ? settings.longBreakMin : settings.shortBreakMin) * 60;

      set({
        mode: nextMode,
        status: 'idle',
        remainingSeconds: nextDuration,
        totalSeconds: nextDuration,
        cycleCount: isLongBreak ? 0 : nextCycle,
        targetEndTime: null,
        sessionStartedAt: null,
      });
    } else {
      const nextDuration = settings.focusDurationMin * 60;
      set({
        mode: 'focus',
        status: 'idle',
        remainingSeconds: nextDuration,
        totalSeconds: nextDuration,
        targetEndTime: null,
        sessionStartedAt: null,
      });
    }
  },

  setMode: (newMode) => {
    if (get().status === 'running') {
      get().resetTimer();
    }
    const settings = get().settings;
    let durationSec = settings.focusDurationMin * 60;
    if (newMode === 'short_break') durationSec = settings.shortBreakMin * 60;
    if (newMode === 'long_break') durationSec = settings.longBreakMin * 60;

    set({
      mode: newMode,
      status: 'idle',
      remainingSeconds: durationSec,
      totalSeconds: durationSec,
      targetEndTime: null,
      sessionStartedAt: null,
    });
  },

  toggleDistractionShield: () => {
    set({ distractionShieldActive: !get().distractionShieldActive });
  },

  closeCelebrationModal: () => {
    set({ showCelebrationModal: false });
  },

  // Tasks
  tasks: initial.tasks,
  selectedTaskId: null,

  addTask: async (data) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim(),
      description: data.description?.trim(),
      category: data.category || 'Work',
      priority: data.priority || 'medium',
      estimatedPomodoros: Math.max(1, data.estimatedPomodoros || 1),
      completedPomodoros: 0,
      completed: false,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
    };

    const newTasks = [newTask, ...get().tasks];
    set({ tasks: newTasks });
    saveLocalState(get());
    get().syncWithBackend();
    return newTask;
  },

  updateTask: async (id, updates) => {
    const updatedTasks = get().tasks.map((task) => {
      if (task.id === id) {
        return { ...task, ...updates };
      }
      return task;
    });
    set({ tasks: updatedTasks });
    saveLocalState(get());
    get().syncWithBackend();
  },

  deleteTask: async (id) => {
    const updatedTasks = get().tasks.filter((t) => t.id !== id);
    const selectedTaskId = get().selectedTaskId === id ? null : get().selectedTaskId;
    set({ tasks: updatedTasks, selectedTaskId });
    saveLocalState(get());
    get().syncWithBackend();
  },

  toggleTaskCompleted: async (id) => {
    const updatedTasks = get().tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });
    set({ tasks: updatedTasks });
    saveLocalState(get());
    get().syncWithBackend();
  },

  selectTask: (id) => {
    set({ selectedTaskId: id });
  },

  getSelectedTask: () => {
    const { tasks, selectedTaskId } = get();
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  },

  // Sessions
  sessions: initial.sessions,

  addSession: async (data) => {
    const newSession: Session = {
      ...data,
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const newSessions = [newSession, ...get().sessions];
    set({ sessions: newSessions });
    saveLocalState(get());
    get().checkAchievements();
    get().syncWithBackend();
    return newSession;
  },

  updateSessionNotes: async (id, notes) => {
    const updated = get().sessions.map((s) => (s.id === id ? { ...s, notes } : s));
    set({ sessions: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  deleteSession: async (id) => {
    const updated = get().sessions.filter((s) => s.id !== id);
    set({ sessions: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  clearSessions: async () => {
    set({ sessions: [] });
    saveLocalState(get());
    get().syncWithBackend();
  },

  // Distraction Rules
  rules: initial.rules,

  toggleRule: async (id) => {
    const updated = get().rules.map((rule) => {
      if (rule.id === id) {
        return { ...rule, enabled: !rule.enabled };
      }
      return rule;
    });
    set({ rules: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  addCustomRule: async (name, website) => {
    const newRule: DistractionRule = {
      id: `rule_${Date.now()}`,
      name: name.trim(),
      category: 'custom',
      icon: 'Shield',
      enabled: true,
      website: website?.trim(),
    };
    const updated = [newRule, ...get().rules];
    set({ rules: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  deleteRule: async (id) => {
    const updated = get().rules.filter((r) => r.id !== id);
    set({ rules: updated });
    saveLocalState(get());
    get().syncWithBackend();
  },

  // Ambient Sounds
  tracks: DEFAULT_TRACKS,
  masterVolume: 0.8,
  isMasterPlaying: false,

  toggleTrack: (id) => {
    const { tracks, masterVolume } = get();
    const updated = tracks.map((track) => {
      if (track.id === id) {
        const nextPlaying = !track.isPlaying;
        if (nextPlaying) {
          soundService.startAmbientSound(track.id, track.volume * masterVolume);
        } else {
          soundService.stopAmbientSound(track.id);
        }
        return { ...track, isPlaying: nextPlaying };
      }
      return track;
    });

    const anyPlaying = updated.some((t) => t.isPlaying);
    set({ tracks: updated, isMasterPlaying: anyPlaying });
  },

  setTrackVolume: (id, volume) => {
    const { tracks, masterVolume } = get();
    const updated = tracks.map((track) => {
      if (track.id === id) {
        if (track.isPlaying) {
          soundService.updateAmbientVolume(track.id, volume * masterVolume);
        }
        return { ...track, volume };
      }
      return track;
    });
    set({ tracks: updated });
  },

  setMasterVolume: (masterVolume) => {
    const { tracks } = get();
    tracks.forEach((t) => {
      if (t.isPlaying) {
        soundService.updateAmbientVolume(t.id, t.volume * masterVolume);
      }
    });
    set({ masterVolume });
  },

  stopAllTracks: () => {
    soundService.stopAllAmbientSounds();
    const updated = get().tracks.map((t) => ({ ...t, isPlaying: false }));
    set({ tracks: updated, isMasterPlaying: false });
  },

  // Achievements
  achievements: initial.achievements,

  checkAchievements: () => {
    const streakStats = get().getStreakStats();
    const tasks = get().tasks;
    const completedTasksCount = tasks.filter((t) => t.completed).length;
    const newlyUnlocked: Achievement[] = [];

    const updated = get().achievements.map((ach) => {
      let progress = ach.progress;
      let shouldUnlock = ach.unlocked;

      if (ach.id === 'first_step') {
        progress = Math.min(1, streakStats.totalSessions);
      } else if (ach.id === 'sprout_grower') {
        progress = Math.min(5, streakStats.totalSessions);
      } else if (ach.id === 'deep_diver') {
        const has50MinSession = get().sessions.some((s) => s.mode === 'focus' && s.actualDurationSec >= 3000);
        progress = has50MinSession ? 1 : 0;
      } else if (ach.id === 'daily_champion') {
        progress = streakStats.hasFocusedToday ? 1 : 0;
      } else if (ach.id === 'streak_3') {
        progress = Math.min(3, streakStats.currentStreak);
      } else if (ach.id === 'streak_7') {
        progress = Math.min(7, streakStats.currentStreak);
      } else if (ach.id === 'ten_hours') {
        progress = Math.min(600, streakStats.totalFocusMinutes);
      } else if (ach.id === 'task_slayer') {
        progress = Math.min(10, completedTasksCount);
      }

      if (!ach.unlocked && progress >= ach.maxProgress) {
        shouldUnlock = true;
        newlyUnlocked.push({
          ...ach,
          progress,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        });
      }

      return {
        ...ach,
        progress,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock && !ach.unlocked ? new Date().toISOString() : ach.unlockedAt,
      };
    });

    set({ achievements: updated });
    saveLocalState(get());
    return newlyUnlocked;
  },

  // Helpers
  seedDemoData: async () => {
    const demo = generateDemoData();
    set({
      tasks: demo.tasks,
      sessions: demo.sessions,
      rules: DEFAULT_DISTRACTION_RULES,
      achievements: INITIAL_ACHIEVEMENTS,
    });
    saveLocalState(get());
    await apiService.seedDemo();
  },

  exportDataJson: () => {
    const backup = {
      appName: 'FocusSprout',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: get().user,
      data: {
        settings: get().settings,
        tasks: get().tasks,
        sessions: get().sessions,
        distractionRules: get().rules,
        achievements: get().achievements,
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  importDataJson: async (json) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.data) return false;
      const { settings, tasks, sessions, distractionRules, achievements } = parsed.data;
      if (settings) set({ settings });
      if (tasks) set({ tasks });
      if (sessions) set({ sessions });
      if (distractionRules) set({ rules: distractionRules });
      if (achievements) set({ achievements });
      saveLocalState(get());
      await apiService.importBackup(parsed);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Selectors
  getTodayProductivity: () => {
    if (typeof window === 'undefined') {
      return {
        date: '2026-11-06',
        dayOfWeek: 'Fri',
        totalFocusMinutes: 75,
        completedSessions: 3,
        breakMinutes: 10,
        goalMinutes: get().settings.dailyGoalMinutes,
        completionRate: 100,
      };
    }

    const sessions = get().sessions;
    const todayStr = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(
      (s) => s.startedAt.startsWith(todayStr) && s.mode === 'focus'
    );
    const totalSeconds = todaySessions.reduce((acc, s) => acc + s.actualDurationSec, 0);
    const totalFocusMinutes = Math.round(totalSeconds / 60);

    const breakSessions = sessions.filter(
      (s) => s.startedAt.startsWith(todayStr) && s.mode !== 'focus'
    );
    const breakMinutes = Math.round(
      breakSessions.reduce((acc, s) => acc + s.actualDurationSec, 0) / 60
    );

    const completedCount = todaySessions.filter((s) => s.completed).length;
    const completionRate =
      todaySessions.length > 0 ? Math.round((completedCount / todaySessions.length) * 100) : 100;

    return {
      date: todayStr,
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
      totalFocusMinutes,
      completedSessions: completedCount,
      breakMinutes,
      goalMinutes: get().settings.dailyGoalMinutes,
      completionRate,
    };
  },

  getWeeklyProductivity: () => {
    if (typeof window === 'undefined') {
      return [];
    }

    const sessions = get().sessions;
    const days: DayProductivity[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daySessions = sessions.filter(
        (s) => s.startedAt.startsWith(dateStr) && s.mode === 'focus'
      );
      const focusMinutes = Math.round(
        daySessions.reduce((acc, s) => acc + s.actualDurationSec, 0) / 60
      );
      const breakMinutes = Math.round(
        sessions
          .filter((s) => s.startedAt.startsWith(dateStr) && s.mode !== 'focus')
          .reduce((acc, s) => acc + s.actualDurationSec, 0) / 60
      );
      const completedCount = daySessions.filter((s) => s.completed).length;
      const completionRate =
        daySessions.length > 0 ? Math.round((completedCount / daySessions.length) * 100) : 100;

      days.push({
        date: dateStr,
        dayOfWeek,
        totalFocusMinutes: focusMinutes,
        completedSessions: completedCount,
        breakMinutes,
        goalMinutes: get().settings.dailyGoalMinutes,
        completionRate,
      });
    }

    return days;
  },

  getHourlyProductivity: () => {
    const sessions = get().sessions.filter((s) => s.mode === 'focus');
    const hours: HourlyProductivity[] = [];

    for (let h = 6; h <= 23; h++) {
      const label = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
      let minutes = 0;

      sessions.forEach((s) => {
        try {
          const sessDate = new Date(s.startedAt);
          if (sessDate.getHours() === h) {
            minutes += Math.round(s.actualDurationSec / 60);
          }
        } catch (e) {}
      });

      hours.push({ hour: h, label, focusMinutes: minutes });
    }

    return hours;
  },

  getStreakStats: () => {
    if (typeof window === 'undefined') {
      return {
        currentStreak: 3,
        longestStreak: 5,
        totalFocusMinutes: 450,
        totalSessions: 18,
        completionRate: 95,
        hasFocusedToday: true,
      };
    }

    const sessions = get().sessions.filter((s) => s.mode === 'focus' && s.completed);
    const todayStr = new Date().toISOString().split('T')[0];

    const totalFocusMinutes = Math.round(
      sessions.reduce((acc, s) => acc + s.actualDurationSec, 0) / 60
    );
    const allSessions = get().sessions.filter((s) => s.mode === 'focus');
    const completionRate =
      allSessions.length > 0 ? Math.round((sessions.length / allSessions.length) * 100) : 100;

    const daysSet = new Set<string>();
    sessions.forEach((s) => {
      const d = s.startedAt.split('T')[0];
      if (d) daysSet.add(d);
    });

    const hasFocusedToday = daysSet.has(todayStr);

    let currentStreak = 0;
    const checkDate = new Date();
    if (!hasFocusedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (daysSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    if (hasFocusedToday && currentStreak === 0) {
      currentStreak = 1;
    }

    const sortedDays = Array.from(daysSet).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevTime: number | null = null;

    sortedDays.forEach((dayStr) => {
      const time = new Date(dayStr).getTime();
      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((time - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) tempStreak++;
        else tempStreak = 1;
      }
      prevTime = time;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    });

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalFocusMinutes,
      totalSessions: sessions.length,
      completionRate,
      hasFocusedToday,
    };
  },

  getCategoryBreakdown: () => {
    const sessions = get().sessions.filter((s) => s.mode === 'focus');
    const map: Record<string, number> = {};
    let totalMinutes = 0;

    const colors: Record<string, string> = {
      Work: '#2D6A4F',
      Study: '#40916C',
      Health: '#52B788',
      Personal: '#74C69D',
      Project: '#2A9D8F',
      Coding: '#1E4D2B',
      General: '#8338EC',
    };

    sessions.forEach((s) => {
      const cat = s.category || 'General';
      const mins = Math.round(s.actualDurationSec / 60);
      map[cat] = (map[cat] || 0) + mins;
      totalMinutes += mins;
    });

    if (totalMinutes === 0) {
      return [{ category: 'Work', minutes: 0, percentage: 100, color: '#40916C' }];
    }

    return Object.entries(map).map(([category, minutes]) => ({
      category,
      minutes,
      percentage: Math.round((minutes / totalMinutes) * 100),
      color: colors[category] || '#52B788',
    }));
  },

  getSproutStage: () => {
    const completedSessions = get().sessions.filter((s) => s.mode === 'focus' && s.completed).length;

    let currentStage = SPROUT_STAGES[0];
    let nextStage: SproutStage | null = SPROUT_STAGES[1];

    for (let i = 0; i < SPROUT_STAGES.length; i++) {
      if (completedSessions >= SPROUT_STAGES[i].requiredSessions) {
        currentStage = SPROUT_STAGES[i];
        nextStage = SPROUT_STAGES[i + 1] || null;
      }
    }

    if (!nextStage) {
      return {
        currentStage,
        nextStage: null,
        completedSessions,
        progressToNext: 1.0,
        sessionsToNext: 0,
      };
    }

    const currentReq = currentStage.requiredSessions;
    const nextReq = nextStage.requiredSessions;
    const progress = Math.min(
      1.0,
      Math.max(0, (completedSessions - currentReq) / (nextReq - currentReq))
    );

    return {
      currentStage,
      nextStage,
      completedSessions,
      progressToNext: progress,
      sessionsToNext: Math.max(0, nextReq - completedSessions),
    };
  },
}));

function onTimerFinished() {
  clearIntervalLoop();
  const state = useAppStore.getState();
  const { mode, totalSeconds, sessionStartedAt, cycleCount, settings } = state;
  const selectedTask = state.getSelectedTask();

  // Play chime
  if (settings.soundEnabled) {
    soundService.playCompletionSound(settings.completionSound);
  }

  // Record session
  const startedAt = sessionStartedAt || new Date(Date.now() - totalSeconds * 1000).toISOString();
  const completedAt = new Date().toISOString();

  state.addSession({
    mode,
    taskId: selectedTask?.id,
    taskTitle: selectedTask?.title,
    category: selectedTask?.category || 'General',
    plannedDurationSec: totalSeconds,
    actualDurationSec: totalSeconds,
    startedAt,
    completedAt,
    completed: true,
    distractionShieldActive: state.distractionShieldActive,
  });

  // If focus session, increment task's completed Pomodoros
  if (mode === 'focus' && selectedTask) {
    const nextCount = selectedTask.completedPomodoros + 1;
    state.updateTask(selectedTask.id, {
      completedPomodoros: nextCount,
      completed: nextCount >= selectedTask.estimatedPomodoros ? true : selectedTask.completed,
    });
  }

  // Next mode
  let nextMode: TimerMode = 'short_break';
  let nextCycle = cycleCount;
  let nextDuration = settings.shortBreakMin * 60;

  if (mode === 'focus') {
    nextCycle = cycleCount + 1;
    if (nextCycle >= settings.sessionsBeforeLongBreak) {
      nextMode = 'long_break';
      nextDuration = settings.longBreakMin * 60;
      nextCycle = 0;
    } else {
      nextMode = 'short_break';
      nextDuration = settings.shortBreakMin * 60;
    }
  } else {
    nextMode = 'focus';
    nextDuration = settings.focusDurationMin * 60;
  }

  const autoStart = mode === 'focus' ? settings.autoStartBreaks : settings.autoStartFocus;

  if (autoStart) {
    const now = Date.now();
    const targetEndTime = now + nextDuration * 1000;
    useAppStore.setState({
      status: 'running',
      mode: nextMode,
      remainingSeconds: nextDuration,
      totalSeconds: nextDuration,
      cycleCount: nextCycle,
      targetEndTime,
      sessionStartedAt: new Date().toISOString(),
      showCelebrationModal: mode === 'focus',
    });
    startIntervalLoop();
  } else {
    useAppStore.setState({
      status: 'completed',
      mode: nextMode,
      remainingSeconds: nextDuration,
      totalSeconds: nextDuration,
      cycleCount: nextCycle,
      targetEndTime: null,
      sessionStartedAt: null,
      showCelebrationModal: mode === 'focus',
    });
  }
}

function startIntervalLoop() {
  clearIntervalLoop();
  timerInterval = setInterval(() => {
    const state = useAppStore.getState();
    if (state.status !== 'running' || !state.targetEndTime) return;

    const remaining = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));

    if (state.settings.tickingSound && state.mode === 'focus') {
      soundService.playTickSound(state.settings.tickingVolume);
    }

    if (remaining <= 0) {
      useAppStore.setState({ remainingSeconds: 0 });
      onTimerFinished();
    } else {
      useAppStore.setState({ remainingSeconds: remaining });
    }
  }, 1000);
}

function clearIntervalLoop() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
