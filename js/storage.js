/* Local demo storage. Replace with Firebase/Supabase for multi-device sync before the live event. */
(function(){
  const KEY='christmasPoolChampionship2026_v1';
  const fresh=()=>({version:1,players:[],matches:[],rules:[],status:'Not started',champion:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  function normalize(data){const d={...fresh(),...(data||{})};d.players=Array.isArray(d.players)?d.players:[];d.matches=Array.isArray(d.matches)?d.matches:[];d.rules=Array.isArray(d.rules)?d.rules:[];return d;}
  function load(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch(e){return fresh();}}
  function save(data){data.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent('pool-data-updated',{detail:data}));return data;}
  window.PoolStore={key:KEY,load,save,reset(){return save(fresh());},export(){return JSON.stringify(load(),null,2);},import(raw){const data=normalize(raw);if(!data.players.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string'))throw new Error('Backup contains an invalid player list.');return save(data);}};
})();
