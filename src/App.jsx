/* ==========================================================================
   GRAVITY PULSE 2026 - MAIN APPLICATION ENGINE ORCHESTRATOR
   ========================================================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PHASES, TURN_ACTIONS, ENTITY_TYPES, PLAYER_COLORS, MAP_SIZES, MOVEMENT_STYLES, GAME_LENGTHS } from './engine/types.js';
import { GameRules } from './engine/rules.js';
import { executeMove, previewTrajectory } from './engine/movementResolver.js';
import { executeGravity, executePulse, executeLocalizedGravity, executeBlackHoleSuction } from './engine/gravityPulse.js';
import { getAIPlacement, getAITurnDecision } from './engine/aiDecision.js';
import { saveGameSession, loadGameSession, clearGameSession } from './engine/storage.js';
import { soundEngine } from './audio/soundEngine.js';

// Layout & Components
import { Navbar } from './components/layout/Navbar.jsx';
import { ResponsiveShell } from './components/layout/ResponsiveShell.jsx';
import { BoardContainer } from './components/board/BoardContainer.jsx';
import { GridCells } from './components/board/GridCells.jsx';
import { BlackHoleOverlay } from './components/board/BlackHoleOverlay.jsx';
import { TrajectoryLines } from './components/board/TrajectoryLines.jsx';
import { EntityLayer } from './components/board/EntityLayer.jsx';
import { ExplosionLayer } from './components/board/ExplosionLayer.jsx';
import { ActionDashboard } from './components/controls/ActionDashboard.jsx';
import { PhaseBanner } from './components/controls/PhaseBanner.jsx';
import { Scoreboard } from './components/status/Scoreboard.jsx';
import { GameLog } from './components/status/GameLog.jsx';
import { GameSetupModal } from './components/modals/GameSetupModal.jsx';
import { RulesModal } from './components/modals/RulesModal.jsx';
import { GameOverModal } from './components/modals/GameOverModal.jsx';

export default function App() {
  // Rules & Configuration
  const [rules, setRules] = useState(new GameRules());
  const [rulesConfig, setRulesConfig] = useState({
    mapSize: MAP_SIZES.REGIONS_4X4,
    movementStyle: MOVEMENT_STYLES.REGIONAL_LOCKED,
    hazardsEnabled: true,
    gameLength: GAME_LENGTHS.STANDARD_5,
    playerCount: 4,
    aiCount: 3
  });

  // Game State
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [board, setBoard] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [logs, setLogs] = useState([]);
  const [historyStack, setHistoryStack] = useState([]); // For casual Undo Move
  const [explosions, setExplosions] = useState([]);
  const [respawnQueue, setRespawnQueue] = useState([]);

  // UI Selection State
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [trajectory, setTrajectory] = useState([]);

  // Modals
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [hasLoadedPrompt, setHasLoadedPrompt] = useState(false);

  const aiTimeoutRef = useRef(null);

  /* Initialize Players & Start New Game */
  const initGame = useCallback((config = rulesConfig) => {
    clearTimeout(aiTimeoutRef.current);
    const newRules = new GameRules(config);
    setRules(newRules);
    setRulesConfig(config);

    const newPlayers = Array.from({ length: config.playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      isHuman: i < (config.playerCount - config.aiCount),
      score: 0,
      deaths: 0,
      isSupercharged: false,
      usedActions: {
        [TURN_ACTIONS.MOVE_1]: false,
        [TURN_ACTIONS.MOVE_2]: false,
        [TURN_ACTIONS.MOVE_3]: false,
        [TURN_ACTIONS.GRAVITY]: false,
        [TURN_ACTIONS.PULSE]: false
      }
    }));

    setPlayers(newPlayers);
    setBoard([]);
    setActivePlayerIdx(0);
    setCurrentRound(1);
    setPhase(PHASES.SETUP);
    setLogs([`🚀 Welcome to Gravity Pulse 2026! Setup phase initiated (${config.mapSize.label}).`]);
    setHistoryStack([]);
    setExplosions([]);
    setRespawnQueue([]);
    setSelectedAction(null);
    setSelectedDirection(null);
    setTrajectory([]);
    setIsGameOverOpen(false);
    clearGameSession();
  }, [rulesConfig]);

  /* Check LocalStorage on Mount */
  useEffect(() => {
    if (!hasLoadedPrompt) {
      setHasLoadedPrompt(true);
      const saved = loadGameSession();
      if (saved && saved.players && saved.board) {
        if (window.confirm("Found an auto-saved game session! Resume previous match?")) {
          setBoard(saved.board);
          setPlayers(saved.players);
          setActivePlayerIdx(saved.activePlayerIndex || 0);
          setCurrentRound(saved.currentRound || 1);
          setPhase(saved.phase || PHASES.PLAYING);
          setLogs(saved.logs || ["Restored saved game session!"]);
          if (saved.rulesConfig) {
            setRulesConfig(saved.rulesConfig);
            setRules(new GameRules(saved.rulesConfig));
          }
          return;
        } else {
          clearGameSession();
        }
      }
      initGame(rulesConfig);
    }
  }, [hasLoadedPrompt, initGame, rulesConfig]);

  /* Auto-save whenever board or turn changes during playing */
  useEffect(() => {
    if (phase === PHASES.PLAYING && board.length > 0) {
      saveGameSession({
        board,
        players,
        activePlayerIndex: activePlayerIdx,
        currentRound,
        phase,
        rulesConfig,
        logs
      });
    }
  }, [board, players, activePlayerIdx, currentRound, phase, rulesConfig, logs]);

  const activePlayer = players[activePlayerIdx] || players[0];

  /* Add explosion effect helper */
  const triggerExplosion = (x, y) => {
    const id = `exp_${Date.now()}_${Math.random()}`;
    setExplosions(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== id));
    }, 400);
  };

  /* Advance Turn or Trigger Round End Phases */
  const advanceTurn = useCallback((nextBoard, nextPlayers, newRespawns = []) => {
    // If any pieces were destroyed, increment deaths
    let updatedPlayers = nextPlayers.map(p => ({ ...p }));
    if (newRespawns.length > 0) {
      newRespawns.forEach(pid => {
        const pObj = updatedPlayers.find(p => p.id === pid);
        if (pObj) {
          pObj.deaths = (pObj.deaths || 0) + 1;
          pObj.isSupercharged = false;
        }
      });
    }

    // Check if we need to enter Respawn phase first
    if (newRespawns.length > 0) {
      setBoard(nextBoard);
      setPlayers(updatedPlayers);
      setRespawnQueue(newRespawns);
      setPhase(PHASES.RESPAWN);
      return;
    }

    let nextIdx = activePlayerIdx + 1;
    let nextRound = currentRound;
    let updatedBoard = [...nextBoard];
    let roundLogs = [];

    // If full round completed (all players took a turn)
    if (nextIdx >= updatedPlayers.length) {
      nextIdx = 0;
      roundLogs.push(`--- End of Round ${currentRound} ---`);

      // 1. Turn 4 Localized Gravity Phase
      const locRes = executeLocalizedGravity(updatedBoard, rules);
      updatedBoard = locRes.finalBoard;
      if (locRes.respawnQueue.length > 0) newRespawns.push(...locRes.respawnQueue);

      // 2. Turn 4 Black Hole Suction Phase
      const bhRes = executeBlackHoleSuction(updatedBoard, rules);
      updatedBoard = bhRes.finalBoard;
      if (bhRes.respawnQueue.length > 0) newRespawns.push(...bhRes.respawnQueue);

      // 3. Spawn Asteroids / Energy for next round
      const hazards = rules.spawnHazards(updatedBoard, rules.getBoardSize());
      updatedBoard = [...updatedBoard, ...hazards];
      if (hazards.length > 0) {
        roundLogs.push(`☄️ Space hazards spawned in outer sector.`);
      }

      // Award +1 Survival Point to players who survived the round
      const survivingIds = new Set(updatedBoard.filter(e => e.type === ENTITY_TYPES.CUBE).map(c => c.playerId));
      let survivorCount = 0;
      updatedPlayers.forEach(p => {
        if (survivingIds.has(p.id)) {
          p.score = (p.score || 0) + 1;
          survivorCount++;
        }
      });
      if (survivorCount > 0) {
        roundLogs.push(`🛡️ +1 Survival Point awarded to ${survivorCount} surviving player(s)!`);
      }

      nextRound += 1;

      // Check Match End Condition
      if (nextRound > rules.gameLength.rounds) {
        setBoard(updatedBoard);
        setPlayers(updatedPlayers);
        setPhase(PHASES.GAME_OVER);
        setIsGameOverOpen(true);
        clearGameSession();
        return;
      }
    }

    // Check and rest actions if active player used all 5 cards
    const targetPlayer = updatedPlayers[nextIdx];
    if (targetPlayer && rules.checkAndResetActions(targetPlayer)) {
      roundLogs.push(`Player ${targetPlayer.id} rested and recharged all action cards.`);
    }

    setBoard(updatedBoard);
    setPlayers(updatedPlayers);
    setActivePlayerIdx(nextIdx);
    setCurrentRound(nextRound);
    setSelectedAction(null);
    setSelectedDirection(null);
    setTrajectory([]);
    if (roundLogs.length > 0) {
      setLogs(prev => [...prev, ...roundLogs]);
    }

    if (newRespawns.length > 0) {
      setRespawnQueue(newRespawns);
      setPhase(PHASES.RESPAWN);
    }
  }, [activePlayerIdx, currentRound, rules]);

  /* Handle Cell Tap (For Setup & Respawn placement) */
  const handleCellClick = (x, y) => {
    if (phase === PHASES.SETUP) {
      if (board.some(e => e.x === x && e.y === y)) return;
      const newCube = {
        id: `cube_p${activePlayer.id}`,
        type: ENTITY_TYPES.CUBE,
        playerId: activePlayer.id,
        x,
        y,
        isSupercharged: false
      };
      const nextBoard = [...board, newCube];
      triggerExplosion(x, y);
      soundEngine.playSupercharge();

      if (activePlayerIdx + 1 >= players.length) {
        // Setup done! Transition to Playing
        setBoard(nextBoard);
        setActivePlayerIdx(0);
        setPhase(PHASES.PLAYING);
        setLogs(prev => [...prev, `All players deployed! Turn 1 initiated.`]);
      } else {
        setBoard(nextBoard);
        setActivePlayerIdx(activePlayerIdx + 1);
      }
    } else if (phase === PHASES.RESPAWN) {
      if (respawnQueue.length === 0) return;
      if (board.some(e => e.x === x && e.y === y)) return;

      const pid = respawnQueue[0];
      const newCube = {
        id: `cube_p${pid}`,
        type: ENTITY_TYPES.CUBE,
        playerId: pid,
        x,
        y,
        isSupercharged: false
      };
      const nextBoard = [...board, newCube];
      const remainingQueue = respawnQueue.slice(1);
      triggerExplosion(x, y);
      soundEngine.playSupercharge();

      setBoard(nextBoard);
      setRespawnQueue(remainingQueue);

      if (remainingQueue.length === 0) {
        setPhase(PHASES.PLAYING);
        setLogs(prev => [...prev, `All destroyed pieces re-deployed!`]);
      }
    }
  };

  /* AI Setup and Respawn Auto-Placement Loop */
  useEffect(() => {
    if (phase === PHASES.SETUP && activePlayer && !activePlayer.isHuman) {
      aiTimeoutRef.current = setTimeout(() => {
        const pos = getAIPlacement(board, activePlayer.id, rules);
        handleCellClick(pos.x, pos.y);
      }, 400);
    } else if (phase === PHASES.RESPAWN && respawnQueue.length > 0) {
      const pid = respawnQueue[0];
      const pObj = players.find(p => p.id === pid);
      if (pObj && !pObj.isHuman) {
        aiTimeoutRef.current = setTimeout(() => {
          const pos = getAIPlacement(board, pid, rules);
          handleCellClick(pos.x, pos.y);
        }, 400);
      }
    }
    return () => clearTimeout(aiTimeoutRef.current);
  }, [phase, activePlayerIdx, respawnQueue, board, players, rules]);

  /* AI Playing Turn Auto-Decision Loop */
  useEffect(() => {
    if (phase === PHASES.PLAYING && activePlayer && !activePlayer.isHuman) {
      aiTimeoutRef.current = setTimeout(() => {
        const decision = getAITurnDecision(board, activePlayer.id, rules);
        const legalActs = rules.getLegalActions(activePlayer);
        const actObj = legalActs.find(a => a.id === decision.actionId) || legalActs[0];
        handleExecuteAction(actObj, decision.direction);
      }, 600);
    }
    return () => clearTimeout(aiTimeoutRef.current);
  }, [phase, activePlayerIdx, board, players, rules]);

  /* Handle Action Selection & Trajectory Preview */
  const handleSelectAction = (action) => {
    setSelectedAction(action);
    if (action.special) {
      setSelectedDirection(null);
      setTrajectory([]);
    } else {
      // Default to Regional direction or Up
      const myPiece = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer.id);
      if (myPiece) {
        const path = previewTrajectory(board, activePlayer.id, action.id, selectedDirection || { x: 1, y: 0 }, rules);
        setTrajectory(path);
      }
    }
  };

  const handleSelectDirection = (dir) => {
    setSelectedDirection(dir);
    if (selectedAction && !selectedAction.special) {
      const path = previewTrajectory(board, activePlayer.id, selectedAction.id, dir, rules);
      setTrajectory(path);
    }
  };

  /* Execute Action (with Undo State Protection) */
  const handleExecuteAction = (action, direction) => {
    if (!action || !activePlayer) return;

    // Record state for casual Undo Protection!
    if (activePlayer.isHuman) {
      setHistoryStack(prev => [...prev.slice(-4), {
        board: board.map(e => ({ ...e })),
        players: players.map(p => ({ ...p, usedActions: { ...p.usedActions } })),
        activePlayerIdx,
        currentRound,
        logs: [...logs]
      }]);
    }

    let result = { sequence: [board], finalBoard: board, respawnQueue: [], logs: [] };

    if (action.id === TURN_ACTIONS.GRAVITY) {
      result = executeGravity(board, activePlayer.id, rules);
    } else if (action.id === TURN_ACTIONS.PULSE) {
      result = executePulse(board, activePlayer.id, rules);
    } else {
      result = executeMove(board, activePlayer.id, action.id, direction || { x: 1, y: 0 }, rules);
    }

    // Mark action as used
    const nextPlayers = players.map(p => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          usedActions: { ...p.usedActions, [action.id]: true }
        };
      }
      return p;
    });

    // Award Elimination Bonus (+1 point per opponent destroyed during this action)
    if (result.respawnQueue.length > 0) {
      const opponentsDestroyed = result.respawnQueue.filter(pid => pid !== activePlayer.id);
      if (opponentsDestroyed.length > 0) {
        const pObj = nextPlayers.find(p => p.id === activePlayer.id);
        if (pObj) {
          pObj.score = (pObj.score || 0) + opponentsDestroyed.length;
          result.logs.push(`🎯 Player ${activePlayer.id} eliminated ${opponentsDestroyed.length} opponent(s)! (+${opponentsDestroyed.length} Elimination Point${opponentsDestroyed.length > 1 ? 's' : ''})`);
        }
      }
    }

    setLogs(prev => [...prev, ...result.logs]);

    // Animate sequence frames if any
    if (result.sequence.length > 1) {
      let stepIdx = 0;
      const animInterval = setInterval(() => {
        stepIdx++;
        if (stepIdx < result.sequence.length) {
          setBoard(result.sequence[stepIdx]);
        } else {
          clearInterval(animInterval);
          advanceTurn(result.finalBoard, nextPlayers, result.respawnQueue);
        }
      }, 160);
    } else {
      advanceTurn(result.finalBoard, nextPlayers, result.respawnQueue);
    }
  };

  /* Undo Last Move */
  const handleUndoMove = () => {
    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setBoard(lastState.board);
    setPlayers(lastState.players);
    setActivePlayerIdx(lastState.activePlayerIdx);
    setCurrentRound(lastState.currentRound);
    setLogs(prev => [...prev, `↩️ Player ${activePlayer.id} rewound time (Undo Move triggered).`]);
    setHistoryStack(prev => prev.slice(0, -1));
    setSelectedAction(null);
    setSelectedDirection(null);
    setTrajectory([]);
    soundEngine.playClick();
  };

  /* Handle Modal Apply Setup */
  const handleApplySetup = (newConfig) => {
    setIsSetupOpen(false);
    initGame(newConfig);
  };

  // Build Left and Right Panel structures for ResponsiveShell
  const leftPanelContent = (
    <>
      <PhaseBanner
        phase={phase}
        currentRound={currentRound}
        maxRounds={rulesConfig.gameLength.rounds}
        activePlayer={activePlayer}
      />
      <ActionDashboard
        activePlayer={activePlayer}
        rulesConfig={rulesConfig}
        legalActions={rules.getLegalActions(activePlayer || { usedActions: {} })}
        selectedAction={selectedAction}
        selectedDirection={selectedDirection}
        phase={phase}
        canUndo={historyStack.length > 0 && activePlayer?.isHuman}
        onSelectAction={handleSelectAction}
        onSelectDirection={handleSelectDirection}
        onExecuteAction={handleExecuteAction}
        onUndoMove={handleUndoMove}
      />
    </>
  );

  const centerBoardContent = (
    <BoardContainer size={rules.getBoardSize()}>
      <GridCells
        boardSize={rules.getBoardSize()}
        phase={phase}
        onCellClick={handleCellClick}
        previewTrajectory={trajectory}
      />
      <BlackHoleOverlay boardSize={rules.getBoardSize()} />
      <TrajectoryLines
        boardSize={rules.getBoardSize()}
        startPos={board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer?.id)}
        trajectory={trajectory}
      />
      <EntityLayer
        board={board}
        boardSize={rules.getBoardSize()}
        activePlayerId={activePlayer?.id}
      />
      <ExplosionLayer
        explosions={explosions}
        boardSize={rules.getBoardSize()}
      />
    </BoardContainer>
  );

  const rightPanelContent = (
    <>
      <Scoreboard players={players} activePlayerId={activePlayer?.id} />
      <GameLog logs={logs} />
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar
        rulesConfig={rulesConfig}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onResetGame={() => {
          if (window.confirm("Start a new game with current customization?")) {
            initGame(rulesConfig);
          }
        }}
      />

      <ResponsiveShell
        leftPanel={leftPanelContent}
        centerBoard={centerBoardContent}
        rightPanel={rightPanelContent}
      />

      {/* Modals */}
      <GameSetupModal
        isOpen={isSetupOpen}
        initialConfig={rulesConfig}
        onClose={() => setIsSetupOpen(false)}
        onApplySetup={handleApplySetup}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        players={players}
        onRematch={() => initGame(rulesConfig)}
        onOpenSetup={() => { setIsGameOverOpen(false); setIsSetupOpen(true); }}
      />
    </div>
  );
}
