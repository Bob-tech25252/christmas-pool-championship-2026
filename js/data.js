import { db, tournamentRefPath } from "./firebase.js";
import { doc, onSnapshot, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

export const tournamentRef = doc(db, ...tournamentRefPath);

export function watchTournament(callback, onError = () => {}) {
  return onSnapshot(tournamentRef, snapshot => {
    callback(snapshot.exists() ? snapshot.data() : null);
  }, onError);
}

export async function saveTournament(data) {
  await setDoc(tournamentRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function defaultTournament() {
  return {
    name: "Christmas Pool Championship 2026",
    status: "setup",
    format: "double-elimination",
    game: "8-ball",
    gamesPerMatch: 1,
    players: [],
    matches: [],
    rules: [],
    currentMatchId: null,
    championId: null,
    updatedAt: null
  };
}
