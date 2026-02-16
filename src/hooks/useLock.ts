import { useEffect, useRef, useState, useCallback } from 'react';
import {
  acquireLock as acquireLockAPI,
  sendHeartbeat,
  releaseLock as releaseLockAPI,
  checkLockStatus,
} from '@/features/lock/api';
import { axios } from '@/lib/axios';
import { useLockStore } from '@/stores/lock';
import storage from '@/utils/storage';

const HEARTBEAT_INTERVAL = 2000;
const POLL_INTERVAL = 1000;

type DialogType = 'contested' | 'lost';
type LockedByInfo = { id: string; name: string } | null;

export const useLock = (resourceType: string) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('contested');
  const [lockedByInfo, setLockedByInfo] = useState<LockedByInfo>(null);
  const [isLockLoading, setIsLockLoading] = useState(true);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLockRef = useRef(false);
  const { setReadOnly, setLockedBy, reset } = useLockStore();

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(async () => {
      try {
        const response = await sendHeartbeat(resourceType);
        if (response.lockLost) {
          stopHeartbeat();
          hasLockRef.current = false;
          setReadOnly(true);
          setLockedByInfo(response.lockedBy || null);
          setLockedBy(response.lockedBy || null);
          setDialogType('lost');
          setShowDialog(true);
          startPolling();
        }
      } catch (e) {
        console.error(e)
      }
    }, HEARTBEAT_INTERVAL);
  }, [resourceType, stopHeartbeat, setReadOnly, setLockedBy]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const response = await checkLockStatus(resourceType);
        if (!response.locked) {
          stopPolling();
          const acquired = await acquire(false);
          if (acquired) {
            setShowDialog(false);
          }
        } else {
          setLockedByInfo(response.lockedBy || null);
          setLockedBy(response.lockedBy || null);
        }
      } catch (e) {
        console.error(e)
      }
    }, POLL_INTERVAL);
  }, [resourceType, stopPolling, setLockedBy]);

  const acquire = useCallback(
    async (force = false) => {
      try {
        setIsLockLoading(true);
        const response = await acquireLockAPI(resourceType, force);

        if (response.locked) {
          hasLockRef.current = false;
          setLockedByInfo(response.lockedBy || null);
          setLockedBy(response.lockedBy || null);
          setReadOnly(true);
          setDialogType('contested');
          setShowDialog(true);
          startPolling();
          setIsLockLoading(false);
          return false;
        }

        hasLockRef.current = true;
        setReadOnly(false);
        setLockedBy(null);
        setLockedByInfo(null);
        setShowDialog(false);
        stopPolling();
        startHeartbeat();
        setIsLockLoading(false);
        return true;
      } catch {
        setIsLockLoading(false);
        return false;
      }
    },
    [resourceType, startHeartbeat, startPolling, stopPolling, setReadOnly, setLockedBy]
  );

  const release = useCallback(async () => {
    stopHeartbeat();
    stopPolling();
    hasLockRef.current = false;
    try {
      await releaseLockAPI(resourceType);
    } catch (e) {
      console.error(e)
    }
    reset();
  }, [resourceType, stopHeartbeat, stopPolling, reset]);

  const takeOver = useCallback(async () => {
    stopPolling();
    return acquire(true);
  }, [acquire, stopPolling]);

  const goReadOnly = useCallback(() => {
    setReadOnly(true);
    setShowDialog(false);
    startPolling();
  }, [setReadOnly, startPolling]);

  useEffect(() => {
    acquire();

    return () => {
      if (hasLockRef.current) {
        releaseLockAPI(resourceType).catch(() => { });
      }
      stopHeartbeat();
      stopPolling();
      reset();
    };
  }, [resourceType]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasLockRef.current) return;
      const baseURL = axios.defaults?.baseURL || '';
      const token = storage.getToken() || '';
      fetch(`${baseURL}/lock/release`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { auth_token: token } : {}),
        },
        body: JSON.stringify({ resourceType }),
        keepalive: true,
      }).catch(() => { });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [resourceType]);

  return {
    showDialog,
    dialogType,
    lockedByInfo,
    isLockLoading,
    takeOver,
    goReadOnly,
    setShowDialog,
  };
};