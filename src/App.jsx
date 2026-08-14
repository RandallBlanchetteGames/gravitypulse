/* ==========================================================================
   GRAVITY PULSE 2026 - MAIN APPLICATION ENGINE ORCHESTRATOR
   ========================================================================== */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { PHASES, TURN_ACTIONS, ENTITY_TYPES, PLAYER_COLORS, MAP_SIZES, MOVEMENT_STYLES, GAME_LENGTHS } from './engine/types.js';
import { GameRules } from './engine/rules.js';
import { executeMove, previewTrajectory, previewWaveDisplacements } from './engine/movementResolver.js';
import { executeGravity, executePulse, executeLocalizedGravity, executeBlackHoleSuction } from './engine/gravityPulse.js';
import { executeOrbitalMovement } from './engine/orbitalMovement.js';
import { getAIPlacement, getAITurnDecision } from './engine/aiDecision.js';
import { saveGameSession, loadGameSession, clearGameSession } from './engine/storage.js';
import { soundEngine } from './audio/soundEngine.js';

// Layout & Components
import { Navbar } from './components/layout/Navbar.jsx';
import { ResponsiveShell } from './components/layout/ResponsiveShell.jsx';
import { BoardContainer } from './components/board/BoardContainer.jsx';
import { GridCells } from './components/board/GridCells.jsx';
import { RegionIndicatorLayer } from './components/board/RegionIndicatorLayer.jsx';
import { BlackHoleOverlay } from './components/board/BlackHoleOverlay.jsx';
import { TrajectoryLines } from './components/board/TrajectoryLines.jsx';
import { EntityLayer } from './components/board/EntityLayer.jsx';
import { ExplosionLayer } from './components/board/ExplosionLayer.jsx';
import { WaveAuraLayer } from './components/board/WaveAuraLayer.jsx';
import { ActionDashboard } from './components/controls/ActionDashboard.jsx';
import { PhaseBanner } from './components/controls/PhaseBanner.jsx';
import { Scoreboard } from './components/status/Scoreboard.jsx';
import { GameLog } from './components/status/GameLog.jsx';
import { GameSetupModal } from './components/modals/GameSetupModal.jsx';
import { RulesModal } from './components/modals/RulesModal.jsx';
import { GameOverModal } from './components/modals/GameOverModal.jsx';
import { AuthModal } from './components/modals/AuthModal.jsx';
import { PlayerProfileModal } from './components/modals/PlayerProfileModal.jsx';
import { LeaderboardModal } from './components/modals/LeaderboardModal.jsx';
import { api } from './api/client.js';

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
  const [turnInRound, setTurnInRound] = useState(1);
  const [logs, setLogs] = useState([]);
  const [historyStack, setHistoryStack] = useState([]); // For casual Undo Move
  const [explosions, setExplosions] = useState([]);
  const [respawnQueue, setRespawnQueue] = useState([]);

  // UI Selection State
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [waveAura, setWaveAura] = useState(null);

  // Modals & Auth State
  const [user, setUser] = useState(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [hasLoadedPrompt, setHasLoadedPrompt] = useState(false);

  const matchStatsRef = useRef({ 
    kills: 0, deaths: 0, asteroidsDestroyed: 0,
    kamikazes: 0, times_drifted_into_void: 0, times_crushed_by_asteroid: 0, 
    times_sucked_into_black_hole: 0, times_overloaded: 0, times_cube_crashed: 0, times_supercharged: 0
  });
  const aiTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('gp_token');
    const username = localStorage.getItem('gp_username');
    const userId = localStorage.getItem('gp_userId');
    const nickname = localStorage.getItem('gp_nickname');
    if (token && username && userId) {
      setUser({ id: userId, username, nickname });
    }
  }, []);

  const processStatsEvents = useCallback((events) => {
    if (rulesConfig.playerCount - rulesConfig.aiCount !== 1) return;
    const stats = matchStatsRef.current;
    events.forEach(ev => {
      if (ev.type.startsWith('DEATH_')) {
        if (ev.victimId === 1) {
          stats.deaths += 1;
          if (ev.type === 'DEATH_VOID') stats.times_drifted_into_void += 1;
          if (ev.type === 'DEATH_ASTEROID') stats.times_crushed_by_asteroid += 1;
          if (ev.type === 'DEATH_BLACKHOLE') stats.times_sucked_into_black_hole += 1;
          if (ev.type === 'DEATH_OVERLOAD') stats.times_overloaded += 1;
          if (ev.type === 'DEATH_CUBE_CRASH') {
            stats.times_cube_crashed += 1;
            if (ev.initiatorId === 1) stats.kamikazes += 1;
          }
        } else if (ev.initiatorId === 1) {
          stats.kills += 1;
        }
      } else if (ev.type === 'ASTEROID_DESTROYED') {
        if (ev.initiatorId === 1) stats.asteroidsDestroyed += 1;
      } else if (ev.type === 'SUPERCHARGE') {
        if (ev.victimId === 1) stats.times_supercharged += 1;
      }
    });
  }, [rulesConfig]);

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
    const initAsteroids = rules.spawnInitialAsteroids([], rules.getBoardSize(), 2);
    setBoard(initAsteroids);
    setActivePlayerIdx(0);
    setCurrentRound(1);
    setTurnInRound(1);
    setPhase(PHASES.SETUP);
    setLogs([`☄️ 2 initial asteroids deployed in outer space.`, `🚀 Welcome to Gravity Pulse 2026! Setup phase initiated (${config.mapSize.label}).`]);
    setHistoryStack([]);
    setExplosions([]);
    setRespawnQueue([]);
    setSelectedAction(null);
    setSelectedDirection(null);
    setIsGameOverOpen(false);
    clearGameSession();
    matchStatsRef.current = { 
      kills: 0, deaths: 0, asteroidsDestroyed: 0,
      kamikazes: 0, times_drifted_into_void: 0, times_crushed_by_asteroid: 0, 
      times_sucked_into_black_hole: 0, times_overloaded: 0, times_cube_crashed: 0, times_supercharged: 0
    };
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
          setTurnInRound(saved.turnInRound || 1);
          setPhase(saved.phase || PHASES.PLAYING);
          setLogs(saved.logs || ["Restored saved game session!"]);
          if (saved.rulesConfig) {
            setRulesConfig(saved.rulesConfig);
            setRules(new GameRules(saved.rulesConfig));
          }
          if (saved.matchStats) {
            matchStatsRef.current = saved.matchStats;
          }
          return;
        } else {
          clearGameSession();
        }
      }
      initGame(rulesConfig);
    }
  }, [hasLoadedPrompt, initGame, rulesConfig]);

  /* Initialize Web Audio API and start ambient space drone on first user interaction */
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.init();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  /* Handle Tab Visibility to Pause/Resume Audio */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        soundEngine.pauseBackground();
      } else {
        soundEngine.resumeBackground();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  /* Auto-save whenever board or turn changes during playing */
  useEffect(() => {
    if (phase === PHASES.PLAYING && board.length > 0) {
      saveGameSession({
        board,
        players,
        activePlayerIndex: activePlayerIdx,
        currentRound,
        turnInRound,
        phase,
        rulesConfig,
        logs,
        matchStats: matchStatsRef.current
      });
    }
  }, [board, players, activePlayerIdx, currentRound, turnInRound, phase, rulesConfig, logs]);

  const activePlayer = players[activePlayerIdx] || players[0];

  /* Add explosion effect helper & batch effect dispatcher */
  const triggerExplosion = (x, y, type = 'COLLISION', playerId = null) => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, x, y, type, playerId }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== id));
    }, 800);
  };

  const dispatchEffects = (effectsList = []) => {
    if (!effectsList || effectsList.length === 0) return;
    effectsList.forEach(eff => {
      triggerExplosion(eff.x, eff.y, eff.type);
    });
  };

  /* Advance Turn or Trigger Round End Phases (4-Turn Cadence) */
  const advanceTurn = useCallback((nextBoard, nextPlayers, newRespawns = []) => {
    // Sync player supercharged status with board entities and increment deaths
    let updatedPlayers = nextPlayers.map(p => {
      const isDestroyed = newRespawns.includes(p.id);
      const cube = nextBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === p.id);
      return {
        ...p,
        deaths: isDestroyed ? (p.deaths || 0) + 1 : (p.deaths || 0),
        isSupercharged: isDestroyed ? false : (cube ? !!cube.isSupercharged : false)
      };
    });

    let nextIdx = (activePlayerIdx + 1) % updatedPlayers.length;
    let nextRound = currentRound;
    let nextTurn = turnInRound;
    let updatedBoard = [...nextBoard];
    let roundLogs = [];

    const firstPlayerIdxForRound = (currentRound - 1) % updatedPlayers.length;

    // If all players have taken their turn for this step in the round
    if (nextIdx === firstPlayerIdxForRound) {
      nextTurn += 1;

      // Execute orbital rotation for massless Cosmic Energy Fields at the end of each Turn
      const orbRes = executeOrbitalMovement(updatedBoard, rules.getBoardSize(), roundLogs);
      updatedBoard = orbRes.finalBoard;
      if (orbRes.respawnQueue && orbRes.respawnQueue.length > 0) newRespawns.push(...orbRes.respawnQueue);
      if (orbRes.effects) dispatchEffects(orbRes.effects);

      if (nextTurn <= 4) {
        roundLogs.push(`--- Round ${currentRound} | Turn ${nextTurn} of 4 ---`);
      } else {
        // Turn 4 Completed: End of Round Climax!
        roundLogs.push(`--- End of Round ${currentRound}: Singularity Event ---`);

        // 1. Turn 4 Localized Gravity Phase
        const locRes = executeLocalizedGravity(updatedBoard, rules);
        updatedBoard = locRes.finalBoard;
        if (locRes.respawnQueue.length > 0) newRespawns.push(...locRes.respawnQueue);
        if (locRes.effects) dispatchEffects(locRes.effects);
        if (locRes.statsEvents) processStatsEvents(locRes.statsEvents);

        // 2. Turn 4 Black Hole Suction Phase
        const bhRes = executeBlackHoleSuction(updatedBoard, rules);
        updatedBoard = bhRes.finalBoard;
        if (bhRes.respawnQueue.length > 0) newRespawns.push(...bhRes.respawnQueue);
        if (bhRes.effects) dispatchEffects(bhRes.effects);
        if (bhRes.statsEvents) processStatsEvents(bhRes.statsEvents);

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
        nextTurn = 1;

        // Reset & recharge action cards for all players at start of new round!
        updatedPlayers.forEach(p => rules.resetActions(p));
        roundLogs.push(`🔄 All action cards recharged for Round ${nextRound}!`);

        // Check Match End Condition
        if (nextRound > rules.gameLength.rounds) {
          setBoard(updatedBoard);
          setPlayers(updatedPlayers);
          setPhase(PHASES.GAME_OVER);
          setIsGameOverOpen(true);
          clearGameSession();
          
          if (rulesConfig.playerCount - rulesConfig.aiCount === 1 && user) {
            const humanPlayer = updatedPlayers.find(p => p.id === 1);
            const finalPoints = humanPlayer ? humanPlayer.score : 0;
            const stats = matchStatsRef.current;
            api.updateStats({
              rounds_played: rulesConfig.gameLength.rounds,
              win: finalPoints > 0,
              points: finalPoints,
              deaths: stats.deaths,
              players_destroyed: stats.kills,
              asteroids_destroyed: stats.asteroidsDestroyed,
              kamikazes: stats.kamikazes,
              times_drifted_into_void: stats.times_drifted_into_void,
              times_crushed_by_asteroid: stats.times_crushed_by_asteroid,
              times_sucked_into_black_hole: stats.times_sucked_into_black_hole,
              times_overloaded: stats.times_overloaded,
              times_cube_crashed: stats.times_cube_crashed,
              times_supercharged: stats.times_supercharged
            }).catch(err => console.error("Failed to submit stats:", err));
          }
          
          return;
        }

        // At the beginning of a new round, check if any players were destroyed during the round and need to respawn!
        const missingPlayerIds = updatedPlayers
          .filter(p => !updatedBoard.some(e => e.type === ENTITY_TYPES.CUBE && e.playerId === p.id))
          .map(p => p.id);

        if (missingPlayerIds.length > 0) {
          setBoard(updatedBoard);
          setPlayers(updatedPlayers);
          if (!rules.hazardsEnabled) {
            setBoard(board.filter(e => e.type !== ENTITY_TYPES.ASTEROID));
          }
          setSelectedAction(null);
          setSelectedDirection(null);
          setActivePlayerIdx((nextRound - 1) % updatedPlayers.length);
          setCurrentRound(nextRound);
          setTurnInRound(1);
          if (roundLogs.length > 0) {
            setLogs(prev => [...prev, ...roundLogs, `Destroyed pieces awaiting re-deployment for Round ${nextRound}!`]);
          }
          setRespawnQueue(missingPlayerIds);
          setPhase(PHASES.RESPAWN);
          return;
        }
        
        // If no one is missing, explicitly set the next player to be the first of the new round
        nextIdx = (nextRound - 1) % updatedPlayers.length;
      }
    }

    // Check and rest actions if active player used all 5 cards mid-round (fallback)
    const targetPlayer = updatedPlayers[nextIdx];
    if (targetPlayer && rules.checkAndResetActions(targetPlayer)) {
      roundLogs.push(`Player ${targetPlayer.id} rested and recharged all action cards.`);
    }

    // Final sync of supercharge state with final round-end board
    updatedPlayers = updatedPlayers.map(p => {
      const cube = updatedBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === p.id);
      return {
        ...p,
        isSupercharged: cube ? !!cube.isSupercharged : false
      };
    });

    setBoard(updatedBoard);
    setPlayers(updatedPlayers);
    setActivePlayerIdx(nextIdx);
    setCurrentRound(nextRound);
    setTurnInRound(nextTurn);
    setSelectedAction(null);
    setSelectedDirection(null);
    setExplosions([]);
    if (roundLogs.length > 0) {
      setLogs(prev => [...prev, ...roundLogs]);
    }
  }, [activePlayerIdx, currentRound, turnInRound, rules]);

  /* Handle Cell Tap (For Setup & Respawn placement) */
  const handleCellClickLogic = (x, y) => {
    if (phase === PHASES.SETUP) {
      const validation = rules.validateSpawnLocation(x, y, board);
      if (!validation.valid) return;

      const newCube = {
        id: `cube_p${activePlayer.id}`,
        type: ENTITY_TYPES.CUBE,
        playerId: activePlayer.id,
        x,
        y,
        isSupercharged: false
      };
      const nextBoard = [...board, newCube];
      triggerExplosion(x, y, 'SPAWN', activePlayer.id);
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
      const validation = rules.validateSpawnLocation(x, y, board);
      if (!validation.valid) return;

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
      triggerExplosion(x, y, 'SPAWN', pid);
      soundEngine.playSupercharge();

      setBoard(nextBoard);
      setRespawnQueue(remainingQueue);

      if (remainingQueue.length === 0) {
        setPhase(PHASES.PLAYING);
        setLogs(prev => [...prev, `All destroyed pieces re-deployed!`]);
      }
    }
  };

  const cellClickRef = useRef(handleCellClickLogic);
  useEffect(() => {
    cellClickRef.current = handleCellClickLogic;
  });
  const handleCellClick = useCallback((x, y) => {
    cellClickRef.current(x, y);
  }, []);

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
      const hasPiece = board.some(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer.id);
      if (!hasPiece) return;
      aiTimeoutRef.current = setTimeout(() => {
        const decision = getAITurnDecision(board, activePlayer, rules);
        const legalActs = rules.getLegalActions(activePlayer);
        const actObj = legalActs.find(a => a.id === decision.actionId) || legalActs[0];
        handleExecuteAction(actObj, decision.direction);
      }, 600);
    }
    return () => clearTimeout(aiTimeoutRef.current);
  }, [phase, activePlayerIdx, board, players, rules]);

  /* Auto-skip turn if active player is currently destroyed (awaiting round-end respawn) */
  useEffect(() => {
    if (phase === PHASES.PLAYING && activePlayer) {
      const hasPiece = board.some(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer.id);
      if (!hasPiece) {
        const skipTimer = setTimeout(() => {
          setLogs(prev => [...prev, `⏳ Player ${activePlayer.id} is destroyed (awaiting round-end respawn) - turn skipped.`]);
          advanceTurn(board, players, []);
        }, 500);
        return () => clearTimeout(skipTimer);
      }
    }
  }, [phase, activePlayerIdx, board, players, activePlayer, advanceTurn]);

  /* Auto-select Default Direction (Using Regional Orbit Logic) */
  useEffect(() => {
    if (phase === PHASES.PLAYING && activePlayer?.isHuman) {
      if (!selectedDirection) {
        const myCube = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer.id);
        if (myCube) {
          const dir = rules.getRegionalDirection(myCube.x, myCube.y);
          setSelectedDirection(dir);
        }
      }
    }
  }, [activePlayer, board, phase, rules, selectedDirection]);

  /* Handle Action Selection */
  const handleSelectAction = (action) => {
    setSelectedAction(action);
    if (action.special) {
      setSelectedDirection(null);
    }
  };

  const handleSelectDirection = (dir) => {
    setSelectedDirection(dir);
  };

  /* Execute Action (with Undo State Protection) */
  const handleExecuteAction = (action, direction) => {
    if (!action || !activePlayer) return;

    // Instantly clear the selection so the green preview boxes disappear during the animation
    setSelectedAction(null);
    setSelectedDirection(null);

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

    if (action.id === TURN_ACTIONS.GRAVITY || action.id === TURN_ACTIONS.PULSE) {
      const myCube = board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer.id);
      if (myCube) {
        setWaveAura({ pos: { x: myCube.x, y: myCube.y }, type: action.id === TURN_ACTIONS.GRAVITY ? 'PULL' : 'PUSH' });
        setTimeout(() => setWaveAura(null), 480);
      }
    }

    if (action.id === TURN_ACTIONS.GRAVITY) {
      result = executeGravity(board, activePlayer.id, rules);
    } else if (action.id === TURN_ACTIONS.PULSE) {
      result = executePulse(board, activePlayer.id, rules);
    } else {
      result = executeMove(board, activePlayer.id, action.id, direction || { x: 1, y: 0 }, rules);
    }

    if (result.effects) {
      dispatchEffects(result.effects);
    }
    if (result.statsEvents) {
      processStatsEvents(result.statsEvents);
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
    if (result.sequence.length > 0) {
      let stepIdx = 0;
      
      // Start the very first frame IMMEDIATELY
      setBoard(result.sequence[0]);
      setPlayers(prevPlayers => prevPlayers.map(p => {
        const cube = result.sequence[0].find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === p.id);
        return { ...p, isSupercharged: cube ? !!cube.isSupercharged : false };
      }));

      // Sequence through remaining frames every 160ms (matching the CSS transition exactly)
      const animInterval = setInterval(() => {
        stepIdx++;
        if (stepIdx < result.sequence.length) {
          const frameBoard = result.sequence[stepIdx];
          setBoard(frameBoard);
          setPlayers(prevPlayers => prevPlayers.map(p => {
            const cube = frameBoard.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === p.id);
            return { ...p, isSupercharged: cube ? !!cube.isSupercharged : false };
          }));
        } else {
          // Once the final frame is reached, we MUST WAIT an additional 160ms
          // for the final CSS movement transition to settle before changing the turn!
          clearInterval(animInterval);
          setTimeout(() => {
            advanceTurn(result.finalBoard, nextPlayers, result.respawnQueue);
          }, 160);
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
    soundEngine.playClick();
  };

  /* Handle Modal Apply Setup */
  const handleApplySetup = (newConfig) => {
    setIsSetupOpen(false);
    initGame(newConfig);
  };

  // Pre-calculate valid spawn coordinates for visual highlighting
  const validSpawnCells = useMemo(() => {
    const validSet = new Set();
    if (phase === PHASES.SETUP || phase === PHASES.RESPAWN) {
      const size = rules.getBoardSize();
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (rules.validateSpawnLocation(x, y, board).valid) {
            validSet.add(`${x},${y}`);
          }
        }
      }
    }
    return validSet;
  }, [board, phase, rules]);

  // Compute dynamic UI states on render
  let trajectory = [];
  let waveDisplacements = [];
  
  if (phase === PHASES.PLAYING && selectedAction && activePlayer) {
    if (selectedAction.special) {
      waveDisplacements = previewWaveDisplacements(board, activePlayer.id, selectedAction.id, rules);
    } else {
      trajectory = previewTrajectory(board, activePlayer.id, selectedAction.id, selectedDirection || { x: 1, y: 0 }, rules);
    }
  }

  // Build Left and Right Panel structures for ResponsiveShell
  const leftPanelContent = (
    <>
      <PhaseBanner
        phase={phase}
        currentRound={currentRound}
        maxRounds={rulesConfig.gameLength.rounds}
        activePlayer={activePlayer}
        turnInRound={turnInRound}
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
        validSpawnCells={validSpawnCells}
      />
      <RegionIndicatorLayer 
        rulesConfig={rulesConfig}
        rules={rules}
        boardSize={rules.getBoardSize()}
      />
      <BlackHoleOverlay boardSize={rules.getBoardSize()} />
      <TrajectoryLines
        boardSize={rules.getBoardSize()}
        startPos={board.find(e => e.type === ENTITY_TYPES.CUBE && e.playerId === activePlayer?.id)}
        trajectory={trajectory}
        waveDisplacements={waveDisplacements}
      />
      <EntityLayer
        board={board}
        boardSize={rules.getBoardSize()}
        activePlayerId={activePlayer?.id}
      />
      <WaveAuraLayer
        boardSize={rules.getBoardSize()}
        activePos={waveAura?.pos}
        waveType={waveAura?.type}
      />
      <ExplosionLayer
        explosions={explosions}
        boardSize={rules.getBoardSize()}
      />
    </BoardContainer>
  );

  const rightPanelContent = (
    <>
      <Scoreboard
        players={players}
        activePlayerId={activePlayer?.id}
        currentRound={currentRound}
        maxRounds={rulesConfig.gameLength.rounds}
        turnInRound={turnInRound}
      />
      <GameLog logs={logs} />
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar
        rulesConfig={rulesConfig}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        canUndo={historyStack.length > 0 && activePlayer?.isHuman}
        onUndoMove={handleUndoMove}
        user={user}
        onOpenAuth={(mode) => { setAuthMode(mode); setIsAuthOpen(true); }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onLogout={() => {
          localStorage.removeItem('gp_token');
          localStorage.removeItem('gp_username');
          localStorage.removeItem('gp_userId');
          setUser(null);
        }}
      />

      <ResponsiveShell
        leftPanel={leftPanelContent}
        centerHeader={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            marginBottom: '8px',
            padding: '0 4px'
          }}>
            {/* Player Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: activePlayer?.color.hex || '#fff',
                boxShadow: `0 0 8px ${activePlayer?.color.hex || '#fff'}`
              }} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                P{activePlayer?.id} {activePlayer?.isSupercharged && <Zap size={16} color="#00ff66" fill="#00ff66" />}
              </span>
            </div>

            {/* Game Settings Badge */}
            <div className="setup-badge" style={{
              display: 'flex',
              gap: '6px',
              background: 'var(--glass-bg)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-neon)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              boxShadow: 'var(--glass-shadow)'
            }}>
              <span style={{ color: 'var(--accent-cyan)' }}>{rulesConfig.mapSize.label.split(' ')[0]}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{rulesConfig.gameLength.label.split(' ')[0]}</span>
            </div>

            {/* Turn Status */}
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              background: activePlayer?.isHuman ? 'rgba(13, 16, 29, 0.85)' : 'rgba(148, 163, 184, 0.15)',
              color: activePlayer?.isHuman ? activePlayer.color.hex : 'var(--text-muted)',
              padding: '4px 8px',
              borderRadius: '12px',
              border: `1px solid ${activePlayer?.isHuman ? activePlayer.color.hex : 'rgba(255,255,255,0.1)'}`,
              boxShadow: activePlayer?.isHuman ? `0 0 10px ${activePlayer.color.hex}, inset 0 0 5px ${activePlayer.color.hex}` : 'none'
            }}>
              {activePlayer?.isHuman ? 'YOUR TURN' : 'AI OPPONENT'}
            </span>
          </div>
        }
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
      
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(userData, token) => {
          setUser(userData);
          localStorage.setItem('gp_token', token);
          localStorage.setItem('gp_userId', userData.id);
          localStorage.setItem('gp_username', userData.username);
          if (userData.nickname) {
            localStorage.setItem('gp_nickname', userData.nickname);
          } else {
            localStorage.removeItem('gp_nickname');
          }
          setIsAuthOpen(false);
        }}
      />

      <PlayerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updates) => {
          setUser(prev => ({ ...prev, ...updates }));
          if (updates.nickname) {
            localStorage.setItem('gp_nickname', updates.nickname);
          }
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
