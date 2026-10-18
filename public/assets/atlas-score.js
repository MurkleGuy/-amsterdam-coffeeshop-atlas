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
 const observedMonths=new Map();
 for(const r of sample){const month=r.date.slice(0,7);observedMonths.set(month,(observedMonths.get(month)||0)+1);}
 const largestMonth=Math.max(0,...observedMonths.values());
 // At most half the eligible accounts may be from any single month; clustered reviews cannot earn a score.
 const spread=observedMonths.size>=3&&largestMonth<=sample.length*.5;
 const adequate=sample.length>=4&&counts.quality>=3&&counts.service>=2&&spread;
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
 return {score,reviewers:sample.length,measures,sample,record,latest:sample[0]?.date,spread,confidence:sample.length>=10?"Growing evidence":"Early evidence"};
}
function seating(shop){
 const s=assess(shop)?.record?.seating;
 return s&&age(s.date)>=-1&&age(s.date)<=store.reviewWindowDays?s:null;
}
function listTag(shop){
 const a=assess(shop),s=seating(shop);
 const source=window.ATLAS_INTEL?.ratings?.[shop.id];
 return (a?.score!=null?'<span class="atlasTag">Atlas ★ '+a.score.toFixed(1)+' · '+esc(a.confidence)+' ('+a.reviewers+')</span>':a?.reviewers?'<span class="atlasPendingTag">Atlas · '+a.reviewers+' recent report'+(a.reviewers===1?'':'s')+' · unscored</span>':source?'<span class="atlasPendingTag">Atlas · current quality unverified</span>':'<span class="atlasPendingTag">Atlas · needs review</span>')
 +(s&&(s.kind==="reported"||s.kind==="none"||s.kind==="listed")?'<span class="seatTag'+(s.kind==="none"?' noSeats':'')+'">↳ '+esc(s.label)+'</span>':'');
}
function detail(shop){
 const a=assess(shop),s=seating(shop);
 const seats=s?'<a class="atlasSeat" href="'+esc(s.url)+'" target="_blank" rel="noopener">◉ '+esc(s.label)+' · '+fmt(s.date)+' ↗</a>'
  :'<span class="atlasSeat atlasUnknown">Seating arrangements not recently verified</span>';
 if(a?.score==null){
  const ext=window.ATLAS_INTEL?.ratings?.[shop.id];
  const notes=a?.sample?.slice(0,3).map(r=>'<li>'+esc(r.note)+' <a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+fmt(r.date)+' ↗</a></li>').join('')||'';
  const reason=a?.reviewers?(a.spread===false&&a.reviewers>=4?'Review dates are too clustered for a trustworthy recommendation.':'We need more independent, dated reports describing both product quality and staff service.')
   :ext?'The available community average is historical. We have not established enough recent product and service evidence for our own score.'
   :'No individually matched community-rating source has been validated for this address.';
  const recentNote=a?.record?.reviewNote?'<details class="atlasMore"><summary>Review notes</summary><p>'+esc(a.record.reviewNote)+'</p></details>':'';
  // The separately linked community-rating card directly below is the source link; no duplicate button.
  const previews=notes?'<details class="atlasMore"><summary>Read '+a.reviewers+' dated reports</summary><ul>'+notes+'</ul><p>Individual remarks are not verified facts about current products or staff.</p></details>':'';
  return '<section class="atlasVerdict atlasPending" aria-label="Atlas Score"><div class="atlasScoreHead"><strong>Atlas Score</strong><span>Not enough recent evidence</span></div><p>'+reason+'</p>'+seats+recentNote+previews+'</section>';
 }
 const metrics=dims.map(k=>'<div><span>'+labels[k]+'</span><strong>'+(a.measures[k].count?a.measures[k].value.toFixed(1)+'/5':'Not verified')+'</strong></div>').join('');
 const reviews=a.sample.slice(0,4).map(r=>'<li>'+esc(r.note)+' <a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+fmt(r.date)+' ↗</a></li>').join('');
 return '<section class="atlasVerdict" aria-label="Atlas Score"><div class="atlasScoreHead"><div><small>ATLAS SCORE · PROVISIONAL</small><strong>★ '+a.score.toFixed(1)+' <small>/ 5</small></strong></div><span>'+a.reviewers+' independent recent reviewers<br>'+a.confidence+' · latest '+fmt(a.latest)+'</span></div>'
  +'<p>Our review-based estimate of the smoker experience — not a personal product test or a guarantee of current stock.</p>'+seats
  +'<details class="atlasMore"><summary>Why this score? · Review evidence</summary><div class="atlasBreakdown">'+metrics+'</div><ul>'+reviews+'</ul>'
  +'<p>Product 50%, service 25%, experience 15%, value 10%. Category scores interpret dated comments; reviewers did not supply these separate scores. Older reports lose weight and expire. Missing categories stay at a conservative midpoint. <a href="https://github.com/MurkleGuy/-amsterdam-coffeeshop-atlas#atlas-score-pilot" target="_blank" rel="noopener">Scoring policy ↗</a></p></details></section>';
}
window.AtlasScore={assess,seating,listTag,detail};
})();
