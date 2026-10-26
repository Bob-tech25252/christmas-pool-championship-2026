import { auth } from "./firebase.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { watchTournament, saveTournament, defaultTournament } from "./data.js";
import { freshPlayer, prepareTournament, recordWinner, playerName, openMatches } from "./engine.js";

const $ = id => document.getElementById(id);
let data = defaultTournament(), signedInUser = null, busy = false;
const msg = (text, kind="") => { $("admin-message").textContent = text; $("admin-message").className = `notice ${kind}`; };
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function save(patch) { if (!signedInUser) throw new Error("Please sign in first."); await saveTournament({...data,...patch}); }
function render() {
  const players = data.players || [], pending = openMatches(data);
  $("player-count").textContent = `${players.length} / 12`;
  $("admin-players").innerHTML = players.length ? players.map((p,i)=>`<div class="admin-player-row"><span>${i+1}. ${esc(p.name)} ${p.eliminated?"(eliminated)":`— ${p.wins||0} W / ${p.losses||0} L`}</span><button class="remove-player" data-remove="${esc(p.id)}" ${data.status==="in-progress"?"disabled":""}>Remove</button></div>`).join("") : '<div class="help-text">No players added yet.</div>';
  $("match-select").innerHTML = pending.length ? pending.map(m=>`<option value="${esc(m.id)}">${esc(playerName(data,m.playerA))} vs ${esc(playerName(data,m.playerB))} · Round ${m.round||1}</option>`).join("") : '<option value="">No pending matches</option>';
  updateWinnerOptions();
  $("rules-text").value = (data.rules || []).join("\n");
  $("start-tournament").disabled = players.length < 2;
  $("add-player-form").querySelector("button").disabled = players.length >= 12 || data.status === "in-progress";
}
function updateWinnerOptions() {
  const m = (data.matches||[]).find(x=>x.id===$("match-select").value) || openMatches(data)[0];
  $("winner-select").innerHTML = m ? `<option value="">Select winner</option><option value="${esc(m.playerA)}">${esc(playerName(data,m.playerA))}</option><option value="${esc(m.playerB)}">${esc(playerName(data,m.playerB))}</option>` : '<option value="">No pending match</option>';
}
$("login-form").addEventListener("submit", async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$("admin-email").value.trim(),$("admin-password").value);msg("Signed in. Loading tournament controls…","success");}catch(err){msg(`Sign-in failed: ${err.message}`,"error");}});
$("sign-out").addEventListener("click",()=>signOut(auth).catch(err=>msg(err.message,"error")));
$("add-player-form").addEventListener("submit",async e=>{e.preventDefault();const name=$("player-name").value.trim();if(!name)return;if((data.players||[]).length>=12)return msg("The lineup is limited to 12 players.","error");if((data.players||[]).some(p=>p.name.toLowerCase()===name.toLowerCase()))return msg("That player name is already in the lineup.","error");try{await save({players:[...(data.players||[]),freshPlayer(name)]});$("player-name").value="";msg(`Added ${name}.`,"success");}catch(err){msg(err.message,"error");}});
$("admin-players").addEventListener("click",async e=>{const id=e.target.dataset.remove;if(!id)return;try{await save({players:data.players.filter(p=>p.id!==id)});msg("Player removed.","success");}catch(err){msg(err.message,"error");}});
$("start-tournament").addEventListener("click",async()=>{if(!confirm("Generate the tournament matches using the current player order? This resets match results."))return;try{const next=prepareTournament(data);await save(next);msg("Tournament matches generated. Check the public board and TV display.","success");}catch(err){msg(err.message,"error");}});
$("clear-tournament").addEventListener("click",async()=>{if(!confirm("Reset the tournament data? This removes all players, matches, and rules from the live board."))return;try{await save(defaultTournament());data=defaultTournament();msg("Tournament reset.","success");}catch(err){msg(err.message,"error");}});
$("match-select").addEventListener("change",updateWinnerOptions);
$("result-form").addEventListener("submit",async e=>{e.preventDefault();const id=$("match-select").value,winner=$("winner-select").value;if(!id||!winner)return msg("Select a match and its winner.","error");try{const next=recordWinner(data,id,winner);await save(next);msg(`Result saved: ${playerName(next,winner)} won.`,`success`);}catch(err){msg(err.message,"error");}});
$("rules-form").addEventListener("submit",async e=>{e.preventDefault();try{const rules=$("rules-text").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);await save({rules});msg("House rules saved.","success");}catch(err){msg(err.message,"error");}});
$("export-data").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="christmas-pool-championship-2026-backup.json";a.click();URL.revokeObjectURL(url);});
$("import-file").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.players)||!Array.isArray(parsed.matches))throw new Error("Backup must include players and matches arrays.");if(!confirm("Replace the live tournament with this backup?"))return;await save(parsed);msg("Backup restored.","success");}catch(err){msg(`Import failed: ${err.message}`,"error");}finally{e.target.value="";}});
onAuthStateChanged(auth,user=>{signedInUser=user;$("login-panel").hidden=!!user;$("admin-tools").hidden=!user;if(user){$("signed-in-label").textContent=`Signed in as ${user.email || "admin"}`;if(window.__tournamentUnsub)window.__tournamentUnsub();window.__tournamentUnsub=watchTournament(next=>{data=next||defaultTournament();render();},err=>msg(`Could not read tournament: ${err.message}`,"error"));msg("Signed in. Admin controls are available.","success");}else{if(window.__tournamentUnsub){window.__tournamentUnsub();window.__tournamentUnsub=null;}msg("Sign in with your Firebase admin account to manage the tournament.");}});
