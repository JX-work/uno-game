import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './GameBoard.module.css';
import Card from './Card.jsx';
import PlayerHand from './PlayerHand.jsx';
import PlayerInfo from './PlayerInfo.jsx';
import WildColorPicker from './WildColorPicker.jsx';
import DealAnimation from './DealAnimation.jsx';
import CardEffectOverlay from './CardEffectOverlay.jsx';
import UnoShout from './UnoShout.jsx';
import EmojiSticker from './EmojiSticker.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import YourTurnOverlay from './YourTurnOverlay.jsx';
import TurnCountdownRing from './TurnCountdownRing.jsx';
import { useLang } from '../i18n/index.jsx';
import { useGameStore } from '../store/gameStore.js';
import { COLOR_HEX } from '../game/deck.js';
import { canPlayCard } from '../game/rules.js';
import { sounds, resumeAudio } from '../utils/soundManager.js';

export default function GameBoard({ onSendEmoji, onRestartInvite, onAfterAction, onSendAction }) {
  const { t, lang, setLang } = useLang();
  const {
    players, discardPile, deck, currentPlayerIndex, direction,
    currentColor, pendingDrawCount, winner, phase, lastAction,
    unoCallable, unoCatchable, toast, localPlayerId, isMultiplayer,
    isHost, turnStartedAt,
    lastEffect, showUnoShout, isAnimating, pendingEmojiEvent,
    playCard, drawCard, callUno, catchUno, resolveWildColor,
    resetGame, restartGame, clearEmojiEvent, endByTimeout,
  } = useGameStore();

  const [isDealing, setIsDealing] = useState(true);
  const [unoAnim, setUnoAnim] = useState(false);
  const [deckAnim, setDeckAnim] = useState(false);
  const [flyingCardId, setFlyingCardId] = useState(null);
  const [effectDismissed, setEffectDismissed] = useState(true);
  const [stickerType, setStickerType] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [nonHostWildIndex, setNonHostWildIndex] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(null);
  const [emojiBubbles, setEmojiBubbles] = useState({});
  const [gameSecondsLeft, setGameSecondsLeft] = useState(null);
  const [yourTurnTrigger, setYourTurnTrigger] = useState(0);
  const [catchCountdown, setCatchCountdown] = useState(null);
  const prevLastEffect = useRef(null);
  const prevWinner = useRef(null);
  const prevIsMyTurn = useRef(false);
  const turnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const catchTimerRef = useRef(null);
  // Stable ref so timer closure always gets latest onSendAction
  const onSendActionRef = useRef(onSendAction);
  onSendActionRef.current = onSendAction;

  const EFFECT_TO_STICKER = { draw2: 'cryCat', wild4: 'shockCat', reverse: 'swapCats', skip: 'refuseDog', wild: 'rainbowCat' };

  const localIdx = players.findIndex(p => p.id === localPlayerId);
  const localPlayer = players[localIdx];
  const isMyTurn = currentPlayerIndex === localIdx && !isDealing && !isAnimating;
  const topCard = discardPile[discardPile.length - 1];

  // Derive UNO button visibility locally so it works correctly for both host and non-host.
  // Show when local player has exactly 2 cards and hasn't called UNO yet.
  const canCallUno = !isDealing && localPlayer?.hand.length === 2 && !localPlayer?.hasCalledUno;

  const otherPlayers = players
    .map((p, i) => ({ player: p, idx: i }))
    .filter(({ idx }) => idx !== localIdx);

  // First mount: play resume audio on first interaction
  useEffect(() => {
    const handler = () => { resumeAudio(); document.removeEventListener('click', handler); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Trigger "your turn" overlay when it becomes the local player's turn
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurn.current) {
      setYourTurnTrigger(c => c + 1);
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn]);

  // When a new effect arrives, show the overlay + emoji sticker
  useEffect(() => {
    if (lastEffect && lastEffect !== prevLastEffect.current) {
      prevLastEffect.current = lastEffect;
      setEffectDismissed(false);
      const st = EFFECT_TO_STICKER[lastEffect.type];
      if (st) setStickerType(st);
    }
  }, [lastEffect]);

  // Show jumpDog sticker on game over
  useEffect(() => {
    if (winner && winner !== prevWinner.current) {
      prevWinner.current = winner;
      setStickerType('jumpDog');
    }
  }, [winner]);

  // UNO button pop animation when button first becomes visible
  useEffect(() => {
    if (canCallUno) {
      setUnoAnim(true);
      const timer = setTimeout(() => setUnoAnim(false), 500);
      return () => clearTimeout(timer);
    }
  }, [canCallUno]);

  // 3-second catch countdown when unoCatchable window opens
  useEffect(() => {
    clearInterval(catchTimerRef.current);
    if (unoCatchable) {
      setCatchCountdown(3);
      catchTimerRef.current = setInterval(() => {
        setCatchCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(catchTimerRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCatchCountdown(null);
    }
    return () => clearInterval(catchTimerRef.current);
  }, [unoCatchable]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => useGameStore.getState().clearToast(), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Emoji bubble state management
  const showEmoji = useCallback((playerId, emojiKey) => {
    setEmojiBubbles(prev => ({ ...prev, [playerId]: emojiKey }));
    setTimeout(() => setEmojiBubbles(prev => {
      const next = { ...prev };
      delete next[playerId];
      return next;
    }), 2500);
  }, []);

  // Local player sends emoji — also broadcast in multiplayer
  const handleSendEmoji = useCallback((key) => {
    showEmoji(localPlayerId, key);
    onSendEmoji?.(localPlayerId, key);
  }, [localPlayerId, onSendEmoji, showEmoji]);

  // AI auto-sends emoji on card effects
  useEffect(() => {
    if (!lastEffect || isDealing) return;
    const sourcePlayer = players[lastEffect.sourceIdx];
    if (!sourcePlayer?.isAI) return;
    let key = null;
    if (lastEffect.type === 'wild4') key = 'laugh';
    else if (lastEffect.type === 'draw2') key = 'cheer';
    else if (lastEffect.type === 'skip') key = 'point';
    else if (Math.random() < 0.25) key = 'wow';
    if (key) setTimeout(() => showEmoji(sourcePlayer.id, key), 500);
  }, [lastEffect]);

  // AI taunts on win
  useEffect(() => {
    if (!winner || !isDealing) return;
    const winnerPlayer = players.find(p => p.id === winner.id || p.name === winner);
    if (winnerPlayer?.isAI) setTimeout(() => showEmoji(winnerPlayer.id, 'laugh'), 300);
  }, [winner]);

  // 30s turn timer — runs for local player in both single and multiplayer
  const TURN_TIMEOUT = 30;
  useEffect(() => {
    if (!isMyTurn || phase !== 'playing') {
      clearInterval(turnTimerRef.current);
      setTurnTimeLeft(null);
      return;
    }
    setTurnTimeLeft(TURN_TIMEOUT);
    turnTimerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(turnTimerRef.current);
          setDeckAnim(true);
          setTimeout(() => setDeckAnim(false), 400);
          const gs = useGameStore.getState();
          if (gs.isMultiplayer && !gs.isHost) {
            // Non-host: send draw action (safe fallback)
            onSendActionRef.current?.('draw_card', {});
          } else {
            // Host or single player: auto-play a random playable card, else draw
            const hand = gs.players.find(p => p.id === localPlayerId)?.hand || [];
            const top = gs.discardPile[gs.discardPile.length - 1];
            const playable = hand
              .map((c, i) => canPlayCard(c, top, gs.currentColor, gs.pendingDrawCount) ? i : -1)
              .filter(i => i >= 0);
            if (playable.length > 0) {
              const idx = playable[Math.floor(Math.random() * playable.length)];
              gs.playCard(localPlayerId, idx);
            } else {
              sounds.draw();
              gs.drawCard(localPlayerId);
            }
            onAfterAction?.();
          }
          return null;
        }
        if (prev <= 6) sounds.tick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(turnTimerRef.current);
  }, [isMyTurn, phase]);

  // 3-minute global game timer
  const GAME_TIMEOUT = 180;
  useEffect(() => {
    if (phase !== 'playing' || isDealing) {
      clearInterval(gameTimerRef.current);
      if (phase !== 'playing') setGameSecondsLeft(null);
      return;
    }
    setGameSecondsLeft(GAME_TIMEOUT);
    gameTimerRef.current = setInterval(() => {
      setGameSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current);
          endByTimeout();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(gameTimerRef.current);
  }, [phase, isDealing]);

  // Consume emoji events broadcast from multiplayer
  useEffect(() => {
    if (pendingEmojiEvent) {
      showEmoji(pendingEmojiEvent.playerId, pendingEmojiEvent.emojiKey);
      clearEmojiEvent();
    }
  }, [pendingEmojiEvent]);

  // Play card sound on lastAction change
  useEffect(() => {
    if (lastAction && !isDealing) {
      sounds.play();
      setTimeout(() => sounds.slap(), 280);
    }
  }, [lastAction]);

  function handlePlayCard(cardIndex) {
    resumeAudio();
    const card = localPlayer?.hand[cardIndex];
    if (!card) return;

    // Non-host in multiplayer: route through game_actions table
    if (isMultiplayer && !isHost) {
      if (card.type === 'wild' || card.type === 'wild4') {
        setNonHostWildIndex(cardIndex); // show local color picker first
      } else {
        onSendActionRef.current?.('play_card', { cardIndex, chosenColor: null });
      }
      return;
    }

    // Host or single player: run locally then sync
    setFlyingCardId(card.id);
    setTimeout(() => setFlyingCardId(null), 350);
    playCard(localPlayerId, cardIndex);
    console.log('[sync] 触发写入 (playCard), onAfterAction:', !!onAfterAction);
    onAfterAction?.();
  }

  function handleDrawCard() {
    resumeAudio();

    // Non-host in multiplayer: route through game_actions table
    if (isMultiplayer && !isHost) {
      onSendActionRef.current?.('draw_card', {});
      return;
    }

    setDeckAnim(true);
    setTimeout(() => setDeckAnim(false), 400);
    sounds.draw();
    drawCard(localPlayerId);
    console.log('[sync] 触发写入 (drawCard), onAfterAction:', !!onAfterAction);
    onAfterAction?.();
  }

  function renderOpponentSlot(slot, position) {
    if (!slot) return <div className={styles[`${position}Slot`]} />;
    const { player, idx } = slot;
    const active = currentPlayerIndex === idx && !isDealing;
    return (
      <div className={`${styles[`${position}Slot`]} ${active ? styles.activeSlot : ''}`}>
        <PlayerInfo
          player={player}
          isActive={active}
          position={position}
          emojiBubble={emojiBubbles[player.id]}
        />
        <PlayerHand
          player={player}
          isActive={active}
          currentColor={currentColor}
          topCard={topCard}
          pendingDrawCount={pendingDrawCount}
          compact
        />
      </div>
    );
  }

  const [topOpp, leftOpp, rightOpp] = [otherPlayers[0], otherPlayers[1], otherPlayers[2]];

  function getEffectDirection(targetIdx) {
    if (targetIdx === localIdx) return 'down';
    const relPos = otherPlayers.findIndex(o => o.idx === targetIdx);
    if (relPos === 0) return 'up';
    if (relPos === 1) return 'left';
    if (relPos === 2) return 'right';
    return 'up';
  }

  const colorIndicatorStyle = {
    background: COLOR_HEX[currentColor] || '#9B59B6',
    boxShadow: `0 0 20px ${COLOR_HEX[currentColor] || '#9B59B6'}`,
  };

  const targetName = lastEffect
    ? players[lastEffect.targetIdx]?.name
    : undefined;

  return (
    <div className={styles.board}>
      {/* Your turn overlay */}
      <YourTurnOverlay trigger={yourTurnTrigger} />

      {/* Deal animation overlay */}
      {isDealing && (
        <DealAnimation
          numPlayers={players.length}
          onComplete={() => setIsDealing(false)}
        />
      )}

      {/* Card effect overlay */}
      {lastEffect && !effectDismissed && (
        <CardEffectOverlay
          effect={lastEffect}
          targetName={targetName}
          targetDirection={getEffectDirection(lastEffect.targetIdx)}
          onDone={() => setEffectDismissed(true)}
        />
      )}

      {/* UNO shout overlay */}
      {showUnoShout && (
        <UnoShout
          playerName={showUnoShout.name}
          onDone={() => {}}
        />
      )}

      {/* Emoji sticker */}
      {stickerType && !isDealing && (
        <EmojiSticker type={stickerType} onDone={() => setStickerType(null)} />
      )}

      {/* In-game control buttons — includes lang toggle to fix top-right overlap */}
      <div className={styles.gameControls}>
        <button
          className={`${styles.controlBtn} ${lang === 'zh' ? styles.controlBtnActive : ''}`}
          onClick={() => setLang('zh')}
        >中</button>
        <button
          className={`${styles.controlBtn} ${lang === 'en' ? styles.controlBtnActive : ''}`}
          onClick={() => setLang('en')}
        >EN</button>
        {gameSecondsLeft !== null && (
          <span className={`${styles.gameTimer} ${gameSecondsLeft <= 30 ? styles.gameTimerUrgent : ''}`}>
            ⏱ {Math.floor(gameSecondsLeft / 60)}:{String(gameSecondsLeft % 60).padStart(2, '0')}
          </span>
        )}
        <button className={styles.controlBtn} onClick={() => setConfirmAction('restart')}>🔄 再来</button>
        <button className={styles.controlBtn} onClick={() => setConfirmAction('exit')}>🚪 退出</button>
      </div>

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          message={
            confirmAction === 'restart'
              ? (isMultiplayer ? '发送重新开始邀请给所有玩家？' : '确定要重新开始吗？')
              : '确定要退出当前游戏吗？'
          }
          subMessage={
            confirmAction === 'restart'
              ? (isMultiplayer ? '房主确认后所有玩家返回等待室' : '将保留当前玩家设置')
              : '游戏进度不会保存'
          }
          onConfirm={() => {
            resumeAudio();
            if (confirmAction === 'restart') {
              if (isMultiplayer) {
                onRestartInvite?.();
              } else {
                restartGame();
              }
            } else {
              resetGame();
            }
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Top opponent */}
      <div className={styles.topArea}>
        {renderOpponentSlot(topOpp, 'top')}
      </div>

      {/* Middle row */}
      <div className={styles.middleRow}>
        <div className={styles.leftArea}>
          {renderOpponentSlot(leftOpp, 'left')}
        </div>

        {/* Center table */}
        <div className={styles.centerTable}>
          {/* Direction indicator — animated SVG, mirrors on direction change */}
          <div
            className={styles.directionBadge}
            style={{ transform: direction === -1 ? 'scaleX(-1)' : 'none' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12A8 8 0 1 1 12 4"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M15 1.5L12 4L15 6.5"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.colorIndicator} style={colorIndicatorStyle} title={t(currentColor)} />

          {/* Deck */}
          <div
            className={`${styles.deckPile} ${isMyTurn ? styles.deckClickable : ''} ${deckAnim ? styles.deckAnim : ''}`}
            onClick={isMyTurn ? handleDrawCard : undefined}
            title={t('draw')}
          >
            <Card card={{ color: 'wild', type: 'number', value: 0 }} faceDown />
            <span className={styles.deckCount}>{deck.length}</span>
          </div>

          {/* Discard pile */}
          <div className={styles.discardPile}>
            {topCard && (
              <Card
                card={topCard}
                highlight={topCard?.id === lastAction}
                flying={topCard?.id === flyingCardId}
              />
            )}
          </div>

          {pendingDrawCount > 0 && (
            <div className={styles.pendingDraw}>+{pendingDrawCount}</div>
          )}
        </div>

        <div className={styles.rightArea}>
          {renderOpponentSlot(rightOpp, 'right')}
        </div>
      </div>

      {/* Local player bottom */}
      <div className={styles.bottomArea}>
        <div className={styles.localControls}>
          {canCallUno && (
            <button
              className={`${styles.unoBtn} ${unoAnim ? styles.unoPop : ''}`}
              onClick={() => {
                resumeAudio();
                if (isMultiplayer && !isHost) {
                  onSendActionRef.current?.('call_uno', {});
                } else {
                  callUno(localPlayerId);
                  onAfterAction?.();
                }
              }}
            >
              🐾 UNO!
            </button>
          )}
          {unoCatchable && unoCatchable !== localPlayerId && (
            <button
              className={`${styles.catchBtn} ${catchCountdown !== null && catchCountdown <= 1 ? styles.catchUrgent : ''}`}
              onClick={() => {
                resumeAudio();
                if (isMultiplayer && !isHost) {
                  onSendActionRef.current?.('catch_uno', { targetId: unoCatchable });
                } else {
                  catchUno(unoCatchable);
                  onAfterAction?.();
                }
                sounds.penalty();
                setStickerType('sadCat');
              }}
            >
              {t('catchUno')} 🫵{catchCountdown !== null ? ` ${catchCountdown}s` : ''}
            </button>
          )}
        </div>

        {localPlayer && (
          <PlayerInfo
            player={localPlayer}
            isActive={isMyTurn}
            position="bottom"
            emojiBubble={emojiBubbles[localPlayer.id]}
            onEmoji={handleSendEmoji}
            isLocal
          />
        )}

        {/* Turn status: countdown ring or waiting indicator */}
        {isMyTurn ? (
          <div className={styles.turnStatusRow}>
            {turnTimeLeft !== null && (
              <TurnCountdownRing timeLeft={turnTimeLeft} total={TURN_TIMEOUT} />
            )}
            <div className={styles.yourTurnBadge}>
              🐾 {t('yourTurn')}
            </div>
          </div>
        ) : phase === 'playing' && !isDealing ? (
          <div className={styles.waitingText}>
            ⏳ {players[currentPlayerIndex]?.name} {t('waitingFor')}
          </div>
        ) : null}

        {localPlayer && (
          <PlayerHand
            player={localPlayer}
            isActive={isMyTurn}
            currentColor={currentColor}
            topCard={topCard}
            pendingDrawCount={pendingDrawCount}
            onPlayCard={handlePlayCard}
          />
        )}
      </div>

      {/* Color picker — host/single player (store drives phase).
          Guard: only the player who played the wild card sees the picker.
          currentPlayerIndex still points to them when phase = 'colorPicker'. */}
      {phase === 'colorPicker' && players[currentPlayerIndex]?.id === localPlayerId && (
        <WildColorPicker onChoose={(c) => { sounds.wildColor(); resolveWildColor(c); onAfterAction?.(); }} />
      )}

      {/* Color picker — non-host: local only, sends play_card action with chosen color */}
      {nonHostWildIndex !== null && (
        <WildColorPicker onChoose={(c) => {
          sounds.wildColor();
          onSendActionRef.current?.('play_card', { cardIndex: nonHostWildIndex, chosenColor: c });
          setNonHostWildIndex(null);
        }} />
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
