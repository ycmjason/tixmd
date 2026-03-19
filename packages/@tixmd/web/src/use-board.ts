import { useCallback, useEffect, useState } from 'react';
import type { Ticket } from './types.ts';

type BoardState =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; tickets: Ticket[] };

export function useBoard(): BoardState & { refresh: () => void } {
  const [boardState, setBoardState] = useState<BoardState>({ state: 'loading' });

  const refresh = useCallback(() => {
    fetch('/api/tickets')
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<Ticket[]>;
      })
      .then(tickets => setBoardState({ state: 'ready', tickets }))
      .catch((err: unknown) =>
        setBoardState({
          state: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        }),
      );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...boardState, refresh };
}
