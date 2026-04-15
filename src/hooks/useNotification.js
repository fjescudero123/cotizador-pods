import { useState, useEffect, useCallback } from 'react';

/**
 * useNotification — toast state with auto-dismiss.
 *
 * @param {number} durationMs - Auto-dismiss timeout in ms (default 4000).
 * @returns {[toast, notify, dismiss]} tuple:
 *   - toast: { message, type } | null
 *   - notify(message, type = 'success'): shows a toast.
 *   - dismiss(): clears the current toast manually.
 */
export function useNotification(durationMs = 4000) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), durationMs);
    return () => clearTimeout(t);
  }, [toast, durationMs]);

  return [toast, notify, dismiss];
}
