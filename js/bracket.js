(function(){
  const id=()=>Math.random().toString(36).slice(2,10)+'-'+Date.now().toString(36);
  function shuffle(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function makeMatch(round,bracket,p1,p2,number){return{id:id(),round,bracket,p1:p1||null,p2:p2||null,winner:null,loser:null,status:'pending',number,createdAt:new Date().toISOString()};}
  function create(players){if(players.length<2||players.length>12)throw new Error('Add between 2 and 12 players before starting.');const shuffled=shuffle(players);const matches=[];let n=1;for(let i=0;i<shuffled.length;i+=2)matches.push(makeMatch('Winners Round 1','winners',shuffled[i],shuffled[i+1]||null,n++));return{matches,ready:matches.filter(m=>m.p1&&m.p2).length};}
  function findNext(data,bracket,round){return data.matches.filter(m=>m.bracket===bracket&&m.round===round).length;}
  function advance(data,match,winner,loser){
    match.winner=winner;match.loser=loser;match.status='complete';match.completedAt=new Date().toISOString();
    if(match.bracket==='winners'){
      if(loser){loser.losses=(loser.losses||0)+1;const lround='Losers Round '+(Math.max(1,...data.matches.filter(m=>m.bracket==='losers').map(m=>Number((m.round.match(/\d+/)||[1])[0])))+1);let lm=data.matches.find(m=>m.bracket==='losers'&&m.round===lround&&(!m.p1||!m.p2));if(!lm){lm=makeMatch(lround,'losers',null,null,1+data.matches.filter(m=>m.bracket==='losers').length);data.matches.push(lm);}if(!lm.p1)lm.p1=loser;else if(!lm.p2)lm.p2=loser;}
      let next=data.matches.find(m=>m.bracket==='winners'&&m.round==='Winners Round 2'&&(!m.p1||!m.p2));if(!next){next=makeMatch('Winners Round 2','winners',null,null,1+data.matches.filter(m=>m.bracket==='winners'&&m.round==='Winners Round 2').length);data.matches.push(next);}if(!next.p1)next.p1=winner;else if(!next.p2)next.p2=winner;
    }else if(match.bracket==='losers'){
      if(loser){loser.losses=(loser.losses||0)+1;if((loser.losses||0)>=2){loser.eliminated=true;}}
      let next=data.matches.find(m=>m.bracket==='losers'&&m.round==='Losers Final'&&(!m.p1||!m.p2));if(!next){next=makeMatch('Losers Final','losers',null,null,1+data.matches.filter(m=>m.bracket==='losers'&&m.round==='Losers Final').length);data.matches.push(next);}if(!next.p1)next.p1=winner;else if(!next.p2)next.p2=winner;
    }
    const active=data.players.filter(p=>!p.eliminated);if(active.length===1){data.champion=active[0].name;data.status='Complete';}else data.status='In progress';
  }
  function record(data,matchId,winnerId){const m=data.matches.find(x=>x.id===matchId);if(!m||m.status==='complete')throw new Error('That match is not available to score.');if(!m.p1||!m.p2)throw new Error('Both players must be assigned before recording a result.');const winner=[m.p1,m.p2].find(p=>p.id===winnerId);if(!winner)throw new Error('The selected winner is not in this match.');const loser=winner.id===m.p1.id?m.p2:m.p1;advance(data,m,winner,loser);return data;}
  window.PoolBracket={create,record,makeMatch};
})();
