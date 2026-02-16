import { axios } from '@/lib/axios';

type AcquireLockResponse = {
  locked: boolean;
  takenOver?: boolean;
  lockedBy?: { id: string; name: string };
};

type HeartbeatResponse = {
  lockLost: boolean;
  lockedBy?: { id: string; name: string } | null;
};

type ReleaseLockResponse = {
  released: boolean;
};

type CheckLockResponse = {
  locked: boolean;
  ownLock?: boolean;
  lockedBy?: { id: string; name: string };
};

export const acquireLock = (resourceType: string, force = false): Promise<AcquireLockResponse> => {
  return axios.post(`/lock/acquire${force ? '?force=true' : ''}`, { resourceType });
};

export const sendHeartbeat = (resourceType: string): Promise<HeartbeatResponse> => {
  return axios.put('/lock/heartbeat', { resourceType });
};

export const releaseLock = (resourceType: string): Promise<ReleaseLockResponse> => {
  return axios.delete('/lock/release', { data: { resourceType } });
};

export const checkLockStatus = (resourceType: string): Promise<CheckLockResponse> => {
  return axios.get(`/lock/check?resourceType=${resourceType}`);
};