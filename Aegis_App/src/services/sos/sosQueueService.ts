import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinate } from '../../types/disaster';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export interface QueuedSosAlert {
  id: string;
  reason: string;
  location: Coordinate;
  fullName: string;
  phoneNumber: string;
  bloodGroup: string;
  medicalConditions: string;
  timestamp: string;
  status: 'QUEUED' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

const SOS_QUEUE_STORAGE_KEY = '@aegis_offline_sos_queue';

/**
 * Offline SOS Queue & Auto-Flush Service
 * 
 * Ensures life-saving distress signals are NEVER lost even during 
 * catastrophic cellular network blackouts. Signals are stored locally in
 * AsyncStorage and automatically flushed to Supabase/Backend the instant
 * connection returns.
 */
export class SosQueueService {
  private static isFlushing = false;

  /**
   * Retrieves all currently queued SOS alerts from local storage.
   */
  public static async getQueue(): Promise<QueuedSosAlert[]> {
    try {
      const raw = await AsyncStorage.getItem(SOS_QUEUE_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[SosQueueService] Failed reading queue:', err);
      return [];
    }
  }

  /**
   * Enqueues an emergency alert into local storage.
   */
  public static async enqueueAlert(alert: Omit<QueuedSosAlert, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<QueuedSosAlert> {
    const queue = await this.getQueue();
    const newAlert: QueuedSosAlert = {
      ...alert,
      id: `sos-local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: 'QUEUED',
      retryCount: 0,
    };

    queue.push(newAlert);
    await AsyncStorage.setItem(SOS_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    console.log(`[SosQueueService] Alert ${newAlert.id} enqueued locally (Total in queue: ${queue.length})`);

    // Immediately attempt flushing if connection happens to be present
    this.flushQueue().catch(() => {});

    return newAlert;
  }

  /**
   * Flushes all queued alerts to Supabase or Live FastAPI Backend.
   */
  public static async flushQueue(): Promise<{ synced: number; remaining: number }> {
    if (this.isFlushing) return { synced: 0, remaining: 0 };
    this.isFlushing = true;

    try {
      const queue = await this.getQueue();
      const pendingAlerts = queue.filter(a => a.status === 'QUEUED');

      if (pendingAlerts.length === 0) {
        this.isFlushing = false;
        return { synced: 0, remaining: 0 };
      }

      console.log(`[SosQueueService] Attempting to flush ${pendingAlerts.length} queued alert(s)...`);
      let syncedCount = 0;
      const updatedQueue: QueuedSosAlert[] = [];

      for (const alert of queue) {
        if (alert.status !== 'QUEUED') {
          updatedQueue.push(alert);
          continue;
        }

        let success = false;

        // Strategy 1: Try Direct Supabase Insert
        if (isSupabaseConfigured()) {
          try {
            const { error } = await supabase.from('sos_alerts').insert([
              {
                user_id: alert.id,
                user_name: alert.fullName,
                user_phone: alert.phoneNumber,
                emergency_type: alert.reason,
                status: 'Pending',
                notes: `[OFFLINE QUEUE FLUSHED] Blood: ${alert.bloodGroup} | Conditions: ${alert.medicalConditions}`,
                created_at: alert.timestamp,
              }
            ]);
            if (!error) {
              success = true;
            }
          } catch (supaErr) {
            console.warn('[SosQueueService] Supabase flush attempt failed:', supaErr);
          }
        }

        // Strategy 2: Try FastAPI Backend (/api/sos)
        if (!success) {
          try {
            const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://aegis-backend-nmdj.onrender.com').replace(/\/$/, '');
            const res = await fetch(`${baseUrl}/api/sos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: alert.id,
                user_name: alert.fullName,
                user_phone: alert.phoneNumber,
                latitude: alert.location.latitude,
                longitude: alert.location.longitude,
                emergency_type: alert.reason,
                notes: `[OFFLINE SYNC] ${alert.medicalConditions}`,
              }),
            });
            if (res.ok) {
              success = true;
            }
          } catch (apiErr) {
            // Still offline or unreachable
          }
        }

        if (success) {
          syncedCount++;
          updatedQueue.push({ ...alert, status: 'SYNCED' });
          console.log(`[SosQueueService] Successfully flushed alert ${alert.id}`);
        } else {
          updatedQueue.push({ ...alert, retryCount: alert.retryCount + 1 });
        }
      }

      // Retain only un-synced or recently synced items (last 10) to avoid memory bloat
      const prunedQueue = updatedQueue.filter(a => a.status === 'QUEUED' || updatedQueue.indexOf(a) >= updatedQueue.length - 10);
      await AsyncStorage.setItem(SOS_QUEUE_STORAGE_KEY, JSON.stringify(prunedQueue));

      return {
        synced: syncedCount,
        remaining: prunedQueue.filter(a => a.status === 'QUEUED').length,
      };
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Clears all synced records from storage
   */
  public static async clearSynced(): Promise<void> {
    const queue = await this.getQueue();
    const remaining = queue.filter(a => a.status === 'QUEUED');
    await AsyncStorage.setItem(SOS_QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  }
}
