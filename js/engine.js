// Simple loss-count pairing queue for a family starter tournament.
// This is intentionally transparent and should be reviewed before formal use.
export function makeId() {
  return (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}
export function freshPlayer(name) {
  return { id: makeId(), name: name.trim(), losses: 0, eliminated: false, wins: 0 };
}
export function openMatches(data) {
  return (data.matches || []).filter(m => m.status === "pending");
}
export function activePlayers(data) {
  return (data.players || []).filter(p => !p.eliminated);
}
export function prepareTournament(data) {
  const players = (data.players || []).map(p => ({ ...p, losses: 0, wins: 0, eliminated: false }));
  if (players.length < 2) throw new Error("Add at least 2 players first.");
  const matches = [];
  // First-round matchups use the entered order. Odd players receive a bye.
  for (let i = 0; i < players.length; i += 2) {
    if (i + 1 < players.length) {
      matches.push({ id: makeId(), round: 1, bracket: "winners", playerA: players[i].id, playerB: players[i+1].id, status: "pending", winnerId: null, loserId: null, createdAt: Date.now() });
    } else {
      players[i].wins += 1;
    }
  }
  return { ...data, players, matches, status: "in-progress", currentMatchId: matches[0]?.id || null, championId: null, startedAt: Date.now() };
}
export function recordWinner(data, matchId, winnerId) {
  const matches = [...(data.matches || [])].map(m => ({...m}));
  const players = [...(data.players || [])].map(p => ({...p}));
  const match = matches.find(m => m.id === matchId && m.status === "pending");
  if (!match) throw new Error("That match is no longer pending.");
  if (![match.playerA, match.playerB].includes(winnerId)) throw new Error("The selected winner is not in this match.");
  const loserId = winnerId === match.playerA ? match.playerB : match.playerA;
  const winner = players.find(p => p.id === winnerId);
  const loser = players.find(p => p.id === loserId);
  if (!winner || !loser) throw new Error("Player data is missing.");
  match.status = "completed"; match.winnerId = winnerId; match.loserId = loserId; match.completedAt = Date.now();
  winner.wins = (winner.wins || 0) + 1;
  loser.losses = (loser.losses || 0) + 1;
  if (loser.losses >= 2) loser.eliminated = true;

  // Create the next match from the lowest-loss active players who are not already pending.
  const pendingIds = new Set(matches.filter(m => m.status === "pending").flatMap(m => [m.playerA, m.playerB]));
  const available = players.filter(p => !p.eliminated && !pendingIds.has(p.id));
  available.sort((a,b) => (a.losses - b.losses) || (a.wins - b.wins) || a.name.localeCompare(b.name));
  // Pair same-loss players where possible. The two-loss limit eliminates players.
  const nextRound = Math.max(1, ...matches.map(m => m.round || 1)) + 1;
  while (available.length >= 2) {
    let firstIndex = 0;
    let secondIndex = available.findIndex((p, i) => i > 0 && p.losses === available[0].losses);
    if (secondIndex < 0) secondIndex = 1;
    const a = available.splice(secondIndex, 1)[0];
    const b = available.splice(firstIndex, 1)[0];
    matches.push({ id: makeId(), round: nextRound, bracket: b.losses === 0 && a.losses === 0 ? "winners" : "losers", playerA: b.id, playerB: a.id, status: "pending", winnerId: null, loserId: null, createdAt: Date.now() });
  }
  const remaining = players.filter(p => !p.eliminated);
  const pending = matches.filter(m => m.status === "pending");
  let status = "in-progress", championId = null;
  if (remaining.length === 1 && pending.length === 0) { status = "complete"; championId = remaining[0].id; }
  else if (pending.length === 0 && remaining.length >= 2) {
    // Odd unpaired competitor gets a bye to the next round, avoiding a stuck queue.
    const waiting = remaining.filter(p => !matches.some(m => m.status === "pending" && (m.playerA === p.id || m.playerB === p.id)));
    if (waiting.length === 1) waiting[0].wins = (waiting[0].wins || 0) + 1;
    const sorted = remaining.filter(p => !pendingIds.has(p.id)).sort((a,b)=>a.losses-b.losses);
    if (sorted.length >= 2) {
      const a = sorted[0], b = sorted.find(p => p.id !== a.id && p.losses === a.losses) || sorted[1];
      matches.push({ id: makeId(), round: nextRound, bracket: a.losses === 0 && b.losses === 0 ? "winners" : "losers", playerA: a.id, playerB: b.id, status: "pending", winnerId: null, loserId: null, createdAt: Date.now() });
    }
  }
  return { ...data, players, matches, status, championId, currentMatchId: matches.find(m => m.status === "pending")?.id || null };
}
export function playerName(data, id) { return (data.players || []).find(p => p.id === id)?.name || "TBD"; }
