/* ==========================================================================
   GRAVITY PULSE 2026 - LOCALSTORAGE AUTO-SAVE & RESUME STORAGE
   ========================================================================== */

const STORAGE_KEY = 'gravity_pulse_session_2026';

export function saveGameSession(state) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const serialized = JSON.stringify({
      board: state.board,
      players: state.players,
      activePlayerIndex: state.activePlayerIndex,
      currentRound: state.currentRound,
      phase: state.phase,
      rulesConfig: {
        mapSize: state.rulesConfig.mapSize,
        movementStyle: state.rulesConfig.movementStyle,
        hazardsEnabled: state.rulesConfig.hazardsEnabled,
        gameLength: state.rulesConfig.gameLength,
        playerCount: state.rulesConfig.playerCount,
        aiCount: state.rulesConfig.aiCount
      },
      logs: state.logs ? state.logs.slice(-20) : [],
      timestamp: Date.now()
    });
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.warn("Failed to auto-save game session:", e);
  }
}

export function loadGameSession() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire saves older than 7 days
    if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
      clearGameSession();
      return null;
    }
    return data;
  } catch (e) {
    console.warn("Failed to load saved game session:", e);
    return null;
  }
}

export function clearGameSession() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}
