import { watchTournament, defaultTournament } from "./data.js";
import { playerName, openMatches } from "./engine.js";
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
watchTournament(data=>{
 data=data||defaultTournament();
 const pending=openMatches(data), current=pending[0];
 $("tv-status").textContent=data.status==="in-progress"?"● LIVE TOURNAMENT BOARD":"TOURNAMENT BOARD";
 $("tv-match-title").textContent=current?`Round ${current.round||1} · Match`:(data.status==="complete"?"Tournament complete":"Waiting for the first match");
 $("tv-player-a").textContent=current?playerName(data,current.playerA):"—";
 $("tv-player-b").textContent=current?playerName(data,current.playerB):"—";
 $("tv-next").textContent=current?`${pending.length} pending match${pending.length===1?"":"es"}`:"Waiting for admin to start";
 $("tv-champion").textContent=data.championId?playerName(data,data.championId):"—";
 const matches=[...(data.matches||[])].sort((a,b)=>(a.status==="pending"?-1:1)-(b.status==="pending"?-1:1)||(a.round||0)-(b.round||0)).slice(0,14);
 $("tv-match-list").innerHTML=matches.length?matches.map(m=>`<article class="tv-match ${current&&current.id===m.id?"active":""}"><div class="tv-match-head"><span>ROUND ${m.round||1}</span><span>${m.status==="pending"?"UP NEXT":"COMPLETED"}</span></div><strong>${esc(playerName(data,m.playerA))} vs ${esc(playerName(data,m.playerB))}</strong><div class="match-state">${m.status==="completed"?`Winner: ${esc(playerName(data,m.winnerId))}`:"Awaiting result"}</div></article>`).join(""):'<div class="empty-state">Matches will appear when the tournament starts.</div>';
},err=>{$("tv-status").textContent=`Connection error: ${err.message}`;});
