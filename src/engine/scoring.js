/* ==========================================================================
   GRAVITY PULSE 2026 - SCORING UTILITIES
   ========================================================================== */

/**
 * Calculates the winning players based on their scores and deaths.
 * Winners are those with the highest score. In case of a tie in score,
 * the player with the fewest deaths wins. True ties can occur.
 *
 * @param {Array} players - Array of player objects { id, score, deaths, ... }
 * @returns {Array} - Array of winning player objects
 */
export function getWinners(players) {
  if (!players || players.length === 0) return [];

  // Sort players descending by score, then ascending by deaths
  const sorted = [...players].sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    
    const deathsA = a.deaths || 0;
    const deathsB = b.deaths || 0;
    return deathsA - deathsB;
  });

  const topScore = sorted[0]?.score || 0;
  const topDeaths = sorted[0]?.deaths || 0;

  // Filter out all players that match the top score and top deaths
  return sorted.filter(p => (p.score || 0) === topScore && (p.deaths || 0) === topDeaths);
}
