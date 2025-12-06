
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  aiMemory?: UserMemory; // New: AI's long term memory of the user
}

export interface UserMemory {
  summary: string; // Summary of user style/life
  preferences: string[];
  lastBriefingDate?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'work' | 'ideas' | 'study' | 'other'; // Added 'study'
  color?: string;
  isPinned?: boolean;
  createdAt: number;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: 'personal' | 'work' | 'ideas' | 'study' | 'other'; // Added category to reminders for Scenes
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export type View = 'dashboard' | 'notes' | 'reminders' | 'assistant';

export type SceneType = 'all' | 'work' | 'personal' | 'study';

export enum ToolName {
  CREATE_NOTE = 'create_note',
  CREATE_REMINDER = 'create_reminder',
  GET_NOTES = 'get_notes',
  GET_REMINDERS = 'get_reminders',
  UPDATE_MEMORY = 'update_memory', // New: Update user persona
  ORGANIZE_NOTES = 'organize_notes' // New: Clean up noise
}
