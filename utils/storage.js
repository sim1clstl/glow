
const KEY='glowmatch_sets_v1';
export function loadSets(){ if(typeof window==='undefined') return null; try{ const raw=localStorage.getItem(KEY); if(!raw) return null; return JSON.parse(raw); }catch(e){console.error(e);return null;} }
export function saveSets(sets){ if(typeof window==='undefined') return; try{ localStorage.setItem(KEY, JSON.stringify(sets)); }catch(e){ console.error(e); } }
export function clearSets(){ if(typeof window==='undefined') return; localStorage.removeItem(KEY); }
