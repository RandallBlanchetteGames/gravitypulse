export const calculateAverages = (p) => {
  if (!p) return { kdRatio: 0, winRate: 0, pointsPerRound: 0, killsPerGame: 0, killsPerDeath: 0 };

  const gamesPlayed = p.total_games_played || 0;
  const points = p.total_cumulative_points || 0;
  const deaths = p.total_cumulative_deaths || 0;
  const wins = p.total_wins || 0;
  const roundsPlayed = p.total_rounds_played || 0;
  const kills = p.players_destroyed || 0;
  const supercharges = p.times_supercharged || 0;

  // Points / Death (In profile modal, this was labeled as kdRatio or Points / Death)
  const pdRatio = deaths > 0 ? (points / deaths) : points;
  
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

export const formatPercent = (val) => (val * 100).toFixed(1) + '%';
export const formatDecimal = (val) => val.toFixed(2);
export const formatDecimalOne = (val) => val.toFixed(1);
