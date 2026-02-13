'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AnimalAvatar from '@/components/game/AnimalAvatar';
import { useRoomStore } from '@/stores/roomStore';
import { useGameStore } from '@/stores/gameStore';
import { Player } from '@/types';

export default function RoomLobby() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const roomCode = useRoomStore((s) => s.roomCode);
  const isHost = useRoomStore((s) => s.isHost);
  const players = useRoomStore((s) => s.players);
  const myPlayerId = useRoomStore((s) => s.myPlayerId);
  const gameStarted = useRoomStore((s) => s.gameStarted);
  const selectedGameId = useRoomStore((s) => s.selectedGameId);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);

  const setPlayers = useGameStore((s) => s.setPlayers);
  const setMode = useGameStore((s) => s.setMode);

  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Set share URL on client side only
  useEffect(() => {
    setShareUrl(`${window.location.origin}/join/${code}`);
  }, [code]);

  // If the user lands on this page without having joined (e.g. page refresh),
  // redirect them to the join flow so they can pick a name/animal first.
  useEffect(() => {
    if (!roomCode && code) {
      router.replace(`/join/${code}`);
    }
  }, [roomCode, code, router]);

  // Redirect when game starts
  useEffect(() => {
    if (gameStarted && selectedGameId) {
      router.push(`/games/${selectedGameId}`);
    }
  }, [gameStarted, selectedGameId, router]);

  // Clean up on unmount when navigating away (back button to home)
  useEffect(() => {
    return () => {
      // Intentionally not calling leaveRoom here; cleanup happens via
      // explicit navigation or the leaveRoom action.
    };
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Fallback: silently fail on older browsers
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback: silently fail on older browsers
    }
  };

  const handleStartGame = () => {
    // Sync players to gameStore and navigate to game selection
    setMode('multi');
    setPlayers(players);
    router.push('/games');
  };

  const handleLeave = () => {
    leaveRoom();
    router.push('/');
  };

  const canStart = players.length >= 2;

  // While redirecting to join flow, show nothing
  if (!roomCode) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 gap-4 bg-gradient-to-b from-cream to-coffee-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={handleLeave}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">대기실</h2>
      </div>

      {/* Room Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="text-center">
          <p className="text-sm font-bold text-coffee-400 mb-1">방 코드</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-[40px] font-black text-coffee-500 tracking-[0.15em] font-display">
              {code}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyCode}
              className="py-2 px-3.5 rounded-[12px] border-none bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white text-xs font-bold shadow-clay-primary cursor-pointer font-display"
            >
              {codeCopied ? '복사됨!' : '복사'}
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Share Link & QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="flex flex-col items-center gap-4">
          <p className="text-sm font-bold text-coffee-400">친구를 초대하세요!</p>

          {/* QR Code */}
          {shareUrl && (
            <div className="bg-white rounded-[16px] p-4 shadow-clay-inset">
              <QRCodeSVG
                value={shareUrl}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#3E2723"
                level="M"
              />
            </div>
          )}

          {/* Share Link */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 py-2.5 px-3 rounded-[12px] bg-coffee-50 text-coffee-600 text-xs font-bold truncate">
              {shareUrl}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyLink}
              className="py-2.5 px-3.5 rounded-[12px] border-none bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white text-xs font-bold shadow-clay-primary cursor-pointer whitespace-nowrap font-display"
            >
              {linkCopied ? '복사됨!' : '링크 복사'}
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Player List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-coffee-400">
              참가자 ({players.length}명)
            </p>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-lg"
            >
              ☕
            </motion.div>
          </div>

          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {players.map((player: Player, index: number) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`
                    flex items-center gap-3 py-3 px-4 rounded-[16px]
                    bg-gradient-to-br from-white to-coffee-50 shadow-clay
                    ${player.id === myPlayerId ? 'ring-2 ring-coffee-500/30' : ''}
                  `}
                >
                  <AnimalAvatar animal={player.animal} size="sm" />
                  <span className="flex-1 text-[15px] font-bold text-coffee-800">
                    {player.name}
                    {player.id === myPlayerId && (
                      <span className="text-xs text-coffee-400 ml-1.5">(나)</span>
                    )}
                  </span>
                  {player.isHost && (
                    <span className="text-lg" title="방장">
                      👑
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length === 0 && (
              <div className="text-center py-6 text-coffee-400 text-sm font-bold">
                참가자를 기다리고 있어요...
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="pb-2"
      >
        {isHost ? (
          <Button
            variant="primary"
            onClick={handleStartGame}
            disabled={!canStart}
          >
            {canStart ? '게임 시작!' : `최소 2명 필요 (현재 ${players.length}명)`}
          </Button>
        ) : (
          <div className="text-center py-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[15px] font-bold text-coffee-500"
            >
              방장이 게임을 고르고 있어요...
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
