import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  UserAccount,
  UserSettings,
  Task,
  Session,
  DistractionRule,
  Achievement,
  SyncPayload,
} from '@/types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_DISTRACTION_RULES,
  INITIAL_ACHIEVEMENTS,
  generateDemoData,
} from '@/constants';

export interface UserRecord {
  user: UserAccount;
  settings: UserSettings;
  tasks: Task[];
  sessions: Session[];
  distractionRules: DistractionRule[];
  achievements: Achievement[];
}

interface DatabaseSchema {
  users: Record<string, UserRecord>; // keyed by userId
  emailToId: Record<string, string>; // keyed by lowercased email
}

const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'focus_sprout_db.json');

// In-memory cache
let memoryDb: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb!;
    }
  } catch (err) {
    console.error('Error reading database file, initializing empty database:', err);
  }

  // Initial Seed with default guest user
  const guestUser: UserAccount = {
    id: 'guest_user_default',
    email: 'gardener@focussprout.app',
    name: 'Sprout Gardener',
    sproutName: 'Bonsai',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  const demo = generateDemoData();

  memoryDb = {
    users: {
      [guestUser.id]: {
        user: guestUser,
        settings: { ...DEFAULT_SETTINGS },
        tasks: demo.tasks,
        sessions: demo.sessions,
        distractionRules: [...DEFAULT_DISTRACTION_RULES],
        achievements: [...INITIAL_ACHIEVEMENTS],
      },
    },
    emailToId: {
      [guestUser.email.toLowerCase()]: guestUser.id,
    },
  };

  persistDb();
  return memoryDb;
}

function persistDb(): void {
  if (!memoryDb) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryDb, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

export const db = {
  getUserByEmail(email: string): UserRecord | null {
    const data = ensureDbFile();
    const userId = data.emailToId[email.toLowerCase().trim()];
    if (!userId) return null;
    return data.users[userId] || null;
  },

  getUserById(userId: string): UserRecord | null {
    const data = ensureDbFile();
    return data.users[userId] || null;
  },

  async createUser(params: {
    email: string;
    password?: string;
    name?: string;
    sproutName?: string;
    initialPayload?: SyncPayload;
  }): Promise<UserRecord> {
    const data = ensureDbFile();
    const cleanEmail = params.email.toLowerCase().trim();

    if (data.emailToId[cleanEmail]) {
      throw new Error('User with this email already exists.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = params.password
      ? await bcrypt.hash(params.password, 10)
      : undefined;

    const user: UserAccount = {
      id: userId,
      email: cleanEmail,
      name: params.name?.trim() || 'Sprout Gardener',
      sproutName: params.sproutName?.trim() || 'Bonsai',
      passwordHash,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    const initialSettings = params.initialPayload?.settings
      ? { ...DEFAULT_SETTINGS, ...params.initialPayload.settings, userName: user.name, sproutName: user.sproutName }
      : { ...DEFAULT_SETTINGS, userName: user.name, sproutName: user.sproutName };

    const initialTasks = params.initialPayload?.tasks || [];
    const initialSessions = params.initialPayload?.sessions || [];
    const initialRules = params.initialPayload?.distractionRules || [...DEFAULT_DISTRACTION_RULES];
    const initialAchievements = params.initialPayload?.achievements || [...INITIAL_ACHIEVEMENTS];

    const record: UserRecord = {
      user,
      settings: initialSettings,
      tasks: initialTasks.length > 0 ? initialTasks : generateDemoData().tasks,
      sessions: initialSessions.length > 0 ? initialSessions : generateDemoData().sessions,
      distractionRules: initialRules,
      achievements: initialAchievements,
    };

    data.users[userId] = record;
    data.emailToId[cleanEmail] = userId;

    persistDb();
    return record;
  },

  async verifyPassword(plainPassword: string, passwordHash?: string): Promise<boolean> {
    if (!passwordHash) return false;
    return bcrypt.compare(plainPassword, passwordHash);
  },

  getUserData(userId: string): UserRecord {
    const data = ensureDbFile();
    let record = data.users[userId];
    if (!record) {
      // Fallback to guest user
      record = data.users['guest_user_default'];
    }
    return record;
  },

  syncUserData(userId: string, payload: SyncPayload): UserRecord {
    const data = ensureDbFile();
    let record = data.users[userId];

    if (!record) {
      // Create record on the fly for guest or client ID
      const user: UserAccount = {
        id: userId,
        email: `${userId}@focussprout.local`,
        name: payload.settings?.userName || 'Sprout Gardener',
        sproutName: payload.settings?.sproutName || 'Bonsai',
        createdAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };
      record = {
        user,
        settings: { ...DEFAULT_SETTINGS, ...payload.settings },
        tasks: payload.tasks || [],
        sessions: payload.sessions || [],
        distractionRules: payload.distractionRules || [...DEFAULT_DISTRACTION_RULES],
        achievements: payload.achievements || [...INITIAL_ACHIEVEMENTS],
      };
      data.users[userId] = record;
    } else {
      // Merge Settings
      if (payload.settings) {
        record.settings = { ...record.settings, ...payload.settings };
        if (payload.settings.userName) record.user.name = payload.settings.userName;
        if (payload.settings.sproutName) record.user.sproutName = payload.settings.sproutName;
      }

      // Merge Tasks: Upsert incoming tasks
      if (payload.tasks && Array.isArray(payload.tasks)) {
        const taskMap = new Map<string, Task>();
        record.tasks.forEach((t) => taskMap.set(t.id, t));
        payload.tasks.forEach((t) => taskMap.set(t.id, t));
        record.tasks = Array.from(taskMap.values());
      }

      // Merge Sessions: Union by session id
      if (payload.sessions && Array.isArray(payload.sessions)) {
        const sessionMap = new Map<string, Session>();
        record.sessions.forEach((s) => sessionMap.set(s.id, s));
        payload.sessions.forEach((s) => sessionMap.set(s.id, s));
        record.sessions = Array.from(sessionMap.values()).sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
      }

      // Merge Distraction Rules
      if (payload.distractionRules && Array.isArray(payload.distractionRules)) {
        const ruleMap = new Map<string, DistractionRule>();
        record.distractionRules.forEach((r) => ruleMap.set(r.id, r));
        payload.distractionRules.forEach((r) => ruleMap.set(r.id, r));
        record.distractionRules = Array.from(ruleMap.values());
      }

      // Merge Achievements (keep highest progress)
      if (payload.achievements && Array.isArray(payload.achievements)) {
        record.achievements = record.achievements.map((existing) => {
          const incoming = payload.achievements?.find((a) => a.id === existing.id);
          if (!incoming) return existing;
          const isUnlocked = existing.unlocked || incoming.unlocked;
          const progress = Math.max(existing.progress, incoming.progress);
          return {
            ...existing,
            ...incoming,
            progress,
            unlocked: isUnlocked,
            unlockedAt: existing.unlockedAt || incoming.unlockedAt,
          };
        });
      }

      record.user.lastSyncedAt = new Date().toISOString();
    }

    persistDb();
    return record;
  },

  seedUserDemoData(userId: string): UserRecord {
    const data = ensureDbFile();
    let record = data.users[userId];
    if (!record) {
      record = this.getUserData(userId);
    }

    const demo = generateDemoData();
    record.tasks = demo.tasks;
    record.sessions = demo.sessions;
    record.distractionRules = [...DEFAULT_DISTRACTION_RULES];
    record.achievements = [...INITIAL_ACHIEVEMENTS];
    record.user.lastSyncedAt = new Date().toISOString();

    persistDb();
    return record;
  },

  clearUserData(userId: string): UserRecord {
    const data = ensureDbFile();
    const record = data.users[userId];
    if (record) {
      record.tasks = [];
      record.sessions = [];
      record.settings = { ...DEFAULT_SETTINGS };
      record.distractionRules = [...DEFAULT_DISTRACTION_RULES];
      record.achievements = [...INITIAL_ACHIEVEMENTS];
      record.user.lastSyncedAt = new Date().toISOString();
      persistDb();
      return record;
    }
    return this.getUserData(userId);
  },
};

