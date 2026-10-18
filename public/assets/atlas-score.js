/* Atlas Score pilot — independently dated reviews; no copied Google data.
   Source mentions are editorially coded by topic, never misrepresented as reviewer-submitted subscores. */
(function(){
"use strict";
const store=window.ATLAS_VERDICTS||{evidence:{},reviewWindowDays:540};
const dims=["quality","service","experience","value"];
const weights={quality:.5,service:.25,experience:.15,value:.1};
const labels={quality:"Flower & hash",service:"Staff & service",experience:"Shop atmosphere",value:"Value"};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=day=>new Date(day+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
const age=day=>{const d=Date.parse(String(day)+"T12:00:00Z");return Number.isFinite(d)?(Date.now()-d)/86400000:Infinity;};
function assess(shop){
 const record=store.evidence?.[shop.id];if(!record)return null;
 const dated=(record.observations||[]).filter(r=>r.reviewer&&r.url&&age(r.date)>=-1&&age(r.date)<=store.reviewWindowDays).sort((a,b)=>b.date.localeCompare(a.date));
 // A reviewer's latest dated comment governs each category; repeated posts do not count as extra people.
 const reviewers=new Map();
 for(const r of dated){
  const key=r.reviewer.trim().toLowerCase();
  if(!reviewers.has(key))reviewers.set(key,{...r});
  else {const old=reviewers.get(key);for(const k of dims)if(!Number.isFinite(old[k])&&Number.isFinite(r[k]))old[k]=r[k];}
 }
 const months=new Map(),sample=[];
 for(const r of reviewers.values()){
  const key=r.date.slice(0,7),count=months.get(key)||0;
  if(count>=5)continue;
  months.set(key,count+1);sample.push(r);
 }
 const counts=Object.fromEntries(dims.map(k=>[k,sample.filter(r=>Number.isFinite(r[k])&&r[k]>=1&&r[k]<=5).length]));
 const adequate=sample.length>=4&&counts.quality>=3&&counts.service>=2;
 const measures=Object.fromEntries(dims.map(k=>{
  let sum=0,total=0;
  for(const r of sample){
   if(!Number.isFinite(r[k])||r[k]<1||r[k]>5)continue;
   const d=age(r.date),w=d<=90?1:d<=180?.8:d<=365?.6:.3;
   sum+=r[k]*w;total+=w;
  }
  return [k,{count:counts[k],value:(3.5*2.5+sum)/(2.5+total)}];
 }));
 const score=adequate?dims.reduce((x,k)=>x+weights[k]*measures[k].value,0):null;
 return {score,reviewers:sample.length,measures,sample,record,latest:sample[0]?.date,confidence:sample.length>=10?"Growing evidence":"Early evidence"};
}
function seating(shop){
 const s=assess(shop)?.record?.seating;
 return s&&age(s.date)>=-1&&age(s.date)<=store.reviewWindowDays?s:null;
}
function listTag(shop){
 const a=assess(shop),s=seating(shop);
 return (a?.score!=null?'<span class="atlasTag">Atlas ★ '+a.score.toFixed(1)+' · '+esc(a.confidence)+' ('+a.reviewers+')</span>':'')
 +(s&&(s.kind==="reported"||s.kind==="none")?'<span class="seatTag'+(s.kind==="none"?' noSeats':'')+'">↳ '+esc(s.label)+'</span>':'');
}
function detail(shop){
 const a=assess(shop),s=seating(shop);
 const seats=s?'<a class="atlasSeat" href="'+esc(s.url)+'" target="_blank" rel="noopener">◉ '+esc(s.label)+' · '+fmt(s.date)+' ↗</a>'
  :'<span class="atlasSeat atlasUnknown">Seating arrangements not recently verified</span>';
 if(a?.score==null)return '<section class="atlasVerdict atlasPending" aria-label="Atlas Score"><div class="atlasScoreHead"><strong>Atlas Score</strong><span>Not yet assessed</span></div><p>We need enough recent, independent reports about product quality and service before giving this shop our own score.</p>'+seats+'</section>';
 const metrics=dims.map(k=>'<div><span>'+labels[k]+'</span><strong>'+(a.measures[k].count?a.measures[k].value.toFixed(1)+'/5':'Not verified')+'</strong></div>').join('');
 const reviews=a.sample.slice(0,4).map(r=>'<li>'+esc(r.note)+' <a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+fmt(r.date)+' ↗</a></li>').join('');
 return '<section class="atlasVerdict" aria-label="Atlas Score"><div class="atlasScoreHead"><div><small>ATLAS SCORE · PROVISIONAL</small><strong>★ '+a.score.toFixed(1)+' <small>/ 5</small></strong></div><span>'+a.reviewers+' independent recent reviewers<br>'+a.confidence+' · latest '+fmt(a.latest)+'</span></div>'
  +'<p>Our review-based estimate of the smoker experience — not a personal product test or a guarantee of current stock.</p>'+seats
  +'<details class="atlasMore"><summary>Why this score? · Review evidence</summary><div class="atlasBreakdown">'+metrics+'</div><ul>'+reviews+'</ul>'
  +'<p>Product 50%, service 25%, experience 15%, value 10%. Category scores interpret dated comments; reviewers did not supply these separate scores. Older reports lose weight and expire. Missing categories stay at a conservative midpoint. <a href="https://github.com/MurkleGuy/-amsterdam-coffeeshop-atlas#atlas-score-pilot" target="_blank" rel="noopener">Scoring policy ↗</a></p></details></section>';
}
window.AtlasScore={assess,seating,listTag,detail};
})();
