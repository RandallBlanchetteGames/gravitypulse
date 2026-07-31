import React from 'react';
import { MOVEMENT_STYLES } from '../../engine/types.js';

export function RegionIndicatorLayer({ rulesConfig, rules, boardSize }) {
  if (rulesConfig.movementStyle.id !== MOVEMENT_STYLES.REGIONAL_LOCKED.id) {
    return null;
  }

  const regionCount = rules.getRegionCount();
  const regions = [];

  for (let ry = 0; ry < regionCount; ry++) {
    for (let rx = 0; rx < regionCount; rx++) {
      const dir = rules.getRegionalDirection(rx, ry);
      const dirClass = `dust-flow-${dir.label.toLowerCase()}`;

      regions.push(
        <div
          key={`${rx}-${ry}`}
          className={`region-indicator ${dirClass}`}
          style={{
            gridColumn: `${rx * 3 + 1} / span 3`,
            gridRow: `${ry * 3 + 1} / span 3`,
          }}
        />
      );
    }
  }

  return (
    <div className="region-indicator-layer" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
      gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 5
    }}>
      {regions}
    </div>
  );
}
