export interface User {
  id: string;
  name: string;
  email: string;
  synced_at: string | null;
  created_at: string;
}

export interface SyncResult {
  synced_count: number;
  synced_users: User[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
