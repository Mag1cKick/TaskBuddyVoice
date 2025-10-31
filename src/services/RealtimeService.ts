/**
 * Realtime Service
 * 
 * Handles real-time subscriptions for live updates.
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { IRealtimeService, Task } from './types';

export class RealtimeService implements IRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(private supabase: SupabaseClient) {}

  /**
   * Subscribe to task changes for a specific user
   */
  subscribeToTasks(userId: string, callback: (task: Task) => void): () => void {
    const channelName = `tasks:${userId}`;

    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.supabase.removeChannel(this.channels.get(channelName)!);
      this.channels.delete(channelName);
    }

    // Create new channel
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Handle different event types
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as Task);
          } else if (payload.eventType === 'DELETE') {
            // For DELETE events, we might want to handle differently
            // For now, we'll just pass the old record
            callback(payload.old as Task);
          }
        }
      )
      .subscribe();

    // Store the channel
    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      if (this.channels.has(channelName)) {
        this.supabase.removeChannel(this.channels.get(channelName)!);
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

