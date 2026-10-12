import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Copy, Check, ChevronDown, ChevronUp, ScrollText } from 'lucide-react';
import { TurnLog } from '../types';
import { formatTurnResponse } from '../engine/gameEngine';

interface TurnHistoryViewProps {
  logs: TurnLog[];
  onCommandSubmit: (cmd: string) => void;
  isGameOver: boolean;
}

export const TurnHistoryView: React.FC<TurnHistoryViewProps> = ({
  logs,
  onCommandSubmit,
  isGameOver,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGameOver) return;
    onCommandSubmit(inputVal.trim());
    setInputVal('');
  };

  const handleCopyAll = () => {
    const fullText = logs
      .slice()
      .reverse()
      .map((l) => formatTurnResponse(l))
      .join('\n\n========================================\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-xl overflow-hidden font-mono backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/90 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span>DUNGEON LOG & CHAT ENGINE TRANSCRIPT</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
            {logs.length} Turn{logs.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition text-[11px] cursor-pointer"
            title="Copy entire turn log as formatted text"
          >
            {copiedAll ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied Transcript</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Full Transcript</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col">
          {/* Scrollable Transcript Box */}
          <div
            ref={scrollRef}
            className="max-h-72 sm:max-h-80 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-950/70 text-xs text-zinc-300"
          >
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.turn}
                className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1.5 text-[11px]">
                  <span className="font-bold text-amber-400">TURN {log.turn}</span>
                  <span className="italic text-zinc-400">Action: {log.actionTaken}</span>
                </div>

                {/* Exact Formatted Markdown Block */}
                <pre className="text-[11px] sm:text-xs text-zinc-200 whitespace-pre font-mono leading-tight bg-zinc-950 p-2.5 rounded border border-zinc-800/80 overflow-x-auto">
                  {formatTurnResponse(log)}
                </pre>
              </div>
            ))}
          </div>

          {/* Interactive Command Prompt Line */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-2.5 bg-zinc-950 border-t border-zinc-800 text-xs"
          >
            <span className="text-amber-400 font-bold pl-2 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> &gt;
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isGameOver}
              placeholder={
                isGameOver
                  ? 'Game Over - Press Restart'
                  : 'Enter command (e.g. 1, 2, 3, 4, 5, forward, left, right, attack, open, fireball, heal)...'
              }
              className="flex-1 bg-transparent border-0 outline-none text-zinc-100 placeholder-zinc-500 font-mono text-xs focus:ring-0"
            />
            <button
              type="submit"
              disabled={isGameOver || !inputVal.trim()}
              className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
