import { useState, useEffect, useCallback } from 'react';

/**
 * useNotification — toast state with auto-dismiss.
 *
 * @param {number} durationMs - Auto-dismiss timeout in ms (default 4000).
 * @returns {[toast, notify]} tuple:
 *   - toast: { message, type } | null
 *   - notify(message, type = 'ok'): shows a toast. Pass null to dismiss.
 */
export function useNotification(durationMs = 4000) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'ok') => {
    if (message == null) { setToast(null); return; }
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), durationMs);
    return () => clearTimeout(t);
  }, [toast, durationMs]);

  return [toast, notify];
}
