export const calculateAverages = (p) => {
  // All 6 keys present — missing superchargesPerGame was the root cause of the crash
  if (!p) return { pdRatio: 0, winRate: 0, pointsPerRound: 0, killsPerGame: 0, superchargesPerGame: 0, kdRatio: 0 };

  const gamesPlayed  = p.total_games_played     || 0;
  const points       = p.total_cumulative_points || 0;
  const deaths       = p.total_cumulative_deaths || 0;
  const wins         = p.total_wins              || 0;
  const roundsPlayed = p.total_rounds_played     || 0;
  const kills        = p.players_destroyed       || 0;
  const supercharges = p.times_supercharged      || 0;

  // Points / Death — returns 0 when no deaths (always numeric); modal shows "Perfect" label separately
  const pdRatio = deaths > 0 ? (points / deaths) : 0;

  // Win Rate
  const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) : 0;

  // Points / Round
  const pointsPerRound = roundsPlayed > 0 ? (points / roundsPlayed) : 0;

  // Kills / Game
  const killsPerGame = gamesPlayed > 0 ? (kills / gamesPlayed) : 0;

  // Supercharges / Game
  const superchargesPerGame = gamesPlayed > 0 ? (supercharges / gamesPlayed) : 0;

  // True K/D Ratio
  const kdRatio = deaths > 0 ? (kills / deaths) : kills;

  return {
    pdRatio,
    winRate,
    pointsPerRound,
    killsPerGame,
    superchargesPerGame,
    kdRatio,
  };
};

// Number() guards ensure undefined/NaN/null never reach .toFixed() — belt-and-suspenders safety
export const formatPercent    = (val) => ((Number(val) || 0) * 100).toFixed(1) + '%';
export const formatDecimal    = (val) => (Number(val) || 0).toFixed(2);
export const formatDecimalOne = (val) => (Number(val) || 0).toFixed(1);
