import { supabase } from './supabase';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  description: string;
  created_at: string;
  user_role: string;
}

export function logActivity(user: any, action: string, description: string) {
  if (!supabase || !user) return;

  // Non-blocking fire-and-forget background execution
  setTimeout(async () => {
    try {
      const { error } = await supabase.from('activity_logs').insert([{
        user_id: user.id || user.uid,
        user_name: user.nama || user.username || user.email || 'Anonymous',
        user_role: user.role || 'user',
        action,
        description
      }]);
      if (error) {
        console.warn('Activity log note:', error.message);
      }
    } catch (err: any) {
      console.warn('Activity log exception:', err);
    }
  }, 0);
}
