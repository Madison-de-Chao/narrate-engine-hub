import { useState, useEffect } from 'react';

const GUEST_MODE_KEY = 'guestMode';

export interface GuestData {
  isGuest: boolean;
  guestId?: string;
}

export const useGuestMode = () => {
  const [guestData, setGuestData] = useState<GuestData>(() => {
    const stored = localStorage.getItem(GUEST_MODE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isGuest: false };
      }
    }
    return { isGuest: false };
  });

  useEffect(() => {
    localStorage.setItem(GUEST_MODE_KEY, JSON.stringify(guestData));
  }, [guestData]);

  const enableGuestMode = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newGuestData = { isGuest: true, guestId };
    setGuestData(newGuestData);
    localStorage.setItem(GUEST_MODE_KEY, JSON.stringify(newGuestData));
  };

  const disableGuestMode = () => {
    setGuestData({ isGuest: false });
    localStorage.removeItem(GUEST_MODE_KEY);
  };

  return {
    isGuest: guestData.isGuest,
    guestId: guestData.guestId,
    enableGuestMode,
    disableGuestMode,
  };
};
