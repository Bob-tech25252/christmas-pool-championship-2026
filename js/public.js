import { watchTournament, defaultTournament } from "./data.js";
import { playerName, openMatches } from "./engine.js";

let data = defaultTournament(), activeFilter = "all";
const $ = id => document.getElementById(id);
const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
function render() {
  const players = data.players || [], matches = data.matches || [];
  $("stat-players").textContent = players.length;
  $("stat-played").textContent = matches.filter(m => m.status === "completed").length;
  $("stat-status").textContent = ({setup:"Not started","in-progress":"In progress",complete:"Complete"})[data.status] || data.status || "Not started";
  $("stat-status-note").textContent = data.status === "in-progress" ? `${openMatches(data).length} pending match(es)` : data.status === "complete" ? "Tournament finished" : "Waiting for the lineup";
  $("stat-champion").textContent = data.championId ? playerName(data, data.championId) : "—";
  $("players-note").textContent = players.length ? `${players.length} competitor${players.length===1?"":"s"} registered` : "The lineup will appear here.";
  $("players-grid").innerHTML = players.length ? [...players].sort((a,b)=>(a.eliminated?1:0)-(b.eliminated?1:0)||(b.wins||0)-(a.wins||0)).map(p=>`<article class="player-card ${p.eliminated?"eliminated":""} ${p.id===data.championId?"champion":""}"><span class="player-avatar">${escapeHtml(p.name.slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(p.name)}</strong><small>${p.id===data.championId?"🏆 Champion":p.eliminated?"Eliminated":`${p.wins||0} W · ${p.losses||0} L`}</small></div></article>`).join("") : '<div class="empty-state">Players will appear here when the admin adds the lineup.</div>';
  const filtered = matches.filter(m => activeFilter==="all" || (activeFilter==="finals" && data.status==="complete" && m.status==="completed") || (activeFilter==="winners" && m.bracket==="winners") || (activeFilter==="losers" && m.bracket==="losers"));
  $("bracket-view").innerHTML = filtered.length ? [...filtered].sort((a,b)=>(a.status==="pending"?-1:1)-(b.status==="pending"?-1:1)||(a.round||0)-(b.round||0)).map(m=>`<article class="match-card ${m.status==="pending"?"current":""}"><div class="match-top"><span>MATCH · ROUND ${m.round||1}</span><span>${m.status==="pending"?"UP NEXT":m.bracket==="finals"?"FINAL":(m.bracket||"match").toUpperCase()}</span></div><div class="match-player ${m.winnerId===m.playerA?"winner":""}"><span>${escapeHtml(playerName(data,m.playerA))}</span><small>${m.winnerId===m.playerA?"WIN":""}</small></div><div class="match-player ${m.winnerId===m.playerB?"winner":""}"><span>${escapeHtml(playerName(data,m.playerB))}</span><small>${m.winnerId===m.playerB?"WIN":""}</small></div><div class="match-state">${m.status==="completed"?`Winner: ${escapeHtml(playerName(data,m.winnerId))}`:"Waiting for result"}</div></article>`).join("") : '<div class="empty-state">No matches in this view yet.</div>';
  const completed = matches.filter(m=>m.status==="completed").sort((a,b)=>(b.completedAt||0)-(a.completedAt||0)).slice(0,8);
  $("recent-results").innerHTML = completed.length ? completed.map(m=>`<div class="result-row"><span>${escapeHtml(playerName(data,m.playerA))} vs ${escapeHtml(playerName(data,m.playerB))}</span><strong>${escapeHtml(playerName(data,m.winnerId))} won</strong></div>`).join("") : '<div class="empty-state">No matches have been completed yet.</div>';
  const rules = data.rules || [];
  $("rules-list").innerHTML = rules.length ? rules.map((r,i)=>`<div class="rule-item">${i+1}. ${escapeHtml(r)}</div>`).join("") : '<div class="rule-empty">House rules have not been added yet.</div>';
}
document.querySelectorAll("[data-bracket]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-bracket]").forEach(b=>b.classList.remove("active"));btn.classList.add("active");activeFilter=btn.dataset.bracket;render();}));
watchTournament(next => { data = next || defaultTournament(); $("connection-status").textContent = "Connected to live tournament data. Updates appear automatically."; $("connection-status").className="notice success"; render(); }, err => { $("connection-status").textContent = `Could not load live data: ${err.message}. Check Firebase setup and Firestore rules.`; $("connection-status").className="notice error"; });
