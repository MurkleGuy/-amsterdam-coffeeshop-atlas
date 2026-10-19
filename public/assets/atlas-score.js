/* Atlas Score pilot — independently dated reviews; no copied Google data.
   Source mentions are editorially coded by topic, never misrepresented as reviewer-submitted subscores. */
(function(){
"use strict";
const store=window.ATLAS_VERDICTS||{evidence:{},reviewWindowDays:540};
const dims=["quality","service","experience","value"];
const codedDimensions=[...dims,"location"];
// All numbers below are editorial interpretations, not customer-entered sub-ratings.
// A standalone category requires comments from multiple distinct accounts over time.
const categorySpecs=[
 {key:"quality",label:"Weed quality",minimum:3,description:"Flower and hash reports, not laboratory product tests."},
 {key:"service",label:"Service",minimum:3,description:"Staff attitude and helpfulness."},
 {key:"value",label:"Value",minimum:2,description:"Firsthand opinions on price relative to quality."},
 {key:"location",label:"Location",minimum:2,description:"Visitor opinions on convenience, not a claim about accessibility."},
 {key:"experience",label:"Chill factor",minimum:3,description:"Atmosphere and comfort comments; seating and entertainment are verified separately."}
];
const weights={quality:.5,service:.25,experience:.15,value:.1};
const labels={quality:"Flower & hash",service:"Staff & service",experience:"Shop atmosphere",value:"Value"};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=day=>new Date(day+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
const age=day=>{const d=Date.parse(String(day)+"T12:00:00Z");return Number.isFinite(d)?(Date.now()-d)/86400000:Infinity;};
/* A transparent fallback for addresses with a source-matched community average.
   It is not a review of cannabis quality, service, price or seating. */
function sourceEstimate(shop,detail){
 const r=window.ATLAS_INTEL?.ratings?.[shop.id];
 if(!r||r.excludeFromRanking||!["Greenmeister","Leafly","Weedmaps","Weeview"].includes(r.source)||!Number.isFinite(Number(r.rating))||Number(r.rating)<1||Number(r.rating)>5||!Number.isInteger(Number(r.reviews))||Number(r.reviews)<1){
  return {...(detail||{reviewers:0,sample:[],record:null,latest:null}),score:null,kind:"unrated",confidence:"No reliable source-matched average"};
 }
 const count=Number(r.reviews),raw=Number(r.rating);
 const prior=12,baseline=3.5;
 const score=(raw*count+baseline*prior)/(count+prior);
 return {...(detail||{reviewers:0,sample:[],record:null,latest:null}),score,kind:"community",sourceRating:r,confidence:count<5?"Very limited":count<15?"Limited":"Historical community data"};
}
function assess(shop){
 const record=store.evidence?.[shop.id];if(!record)return sourceEstimate(shop,null);
 const dated=(record.observations||[]).filter(r=>r.reviewer&&r.url&&age(r.date)>=-1&&age(r.date)<=store.reviewWindowDays).sort((a,b)=>b.date.localeCompare(a.date));
 // A reviewer's latest dated comment governs each category; repeated posts do not count as extra people.
 const reviewers=new Map();
 for(const r of dated){
  const key=r.reviewer.trim().toLowerCase();
  if(!reviewers.has(key))reviewers.set(key,{...r});
  else {const old=reviewers.get(key);for(const k of codedDimensions)if(!Number.isFinite(old[k])&&Number.isFinite(r[k]))old[k]=r[k];}
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
 const result={score,reviewers:sample.length,measures,sample,record,latest:sample[0]?.date,spread,confidence:sample.length>=10?"Growing evidence":"Early evidence",kind:"editorial"};
 return score!=null?result:sourceEstimate(shop,result);
}
function categoryRatings(shop){
 const a=assess(shop),sample=a?.sample||[];
 return Object.fromEntries(categorySpecs.map(spec=>{
  const filtered=sample.filter(r=>Number.isFinite(r[spec.key])&&r[spec.key]>=1&&r[spec.key]<=5);
  const monthCounts=new Map();
  for(const r of filtered){const m=r.date.slice(0,7);monthCounts.set(m,(monthCounts.get(m)||0)+1);}
  const widest=Math.max(0,...monthCounts.values());
  const spread=monthCounts.size>=2&&widest<=filtered.length*.70;
  const adequate=filtered.length>=spec.minimum&&spread;
  let sum=0,total=0;
  for(const r of filtered){
   const days=age(r.date),weight=days<=90?1:days<=180?.8:days<=365?.6:.3;
   sum+=r[spec.key]*weight;total+=weight;
  }
  const value=adequate?(3.5*2.5+sum)/(2.5+total):null;
  return [spec.key,{value,count:filtered.length,eligible:adequate,label:spec.label,description:spec.description,minimum:spec.minimum,months:monthCounts.size}];
 }));
}
function categoryPanel(shop){
 const result=categoryRatings(shop);
 const eligible=categorySpecs.filter(x=>result[x.key].value!=null);
 const overview=eligible.length
  ?eligible.slice(0,2).map(x=>x.label+' '+result[x.key].value.toFixed(1)).join(' · ')
  :'Awaiting enough individual reports';
 const rows=categorySpecs.map(spec=>{
  const r=result[spec.key],num=r.value!=null;
  const figure=num?'★ '+r.value.toFixed(1)+'/5':r.count?'Insufficient evidence':'Not yet rated';
  const count=r.count?r.count+' report'+(r.count===1?'':'s'):'No dated category reports';
  return '<div class="atlasCategoryRow"><div><strong>'+esc(spec.label)+'</strong><small>'+esc(count)+'</small></div><div class="'+(num?'atlasCategoryNumber':'atlasCategoryMissing')+'">'+figure+'</div></div>';
 }).join('');
 return '<details class="atlasMore atlasCategories"><summary>Weed · Service · Value · Location · Chill <span class="atlasCatSummary">'+esc(overview)+'</span></summary>'
  +'<div class="atlasCategoryGrid">'+rows+'</div>'
  +'<p class="atlasCategoryExplanation">Provisional category numbers require 2–3 distinct dated user accounts across at least two different months without a concentrated review burst. The numbers are editorial interpretations of those reports — <strong>not</strong> ratings the reviewers personally entered. An empty category is not scored as 3.5. “Chill” currently measures reported atmosphere, not verified facilities. Open the review sources below to see the evidence.</p></details>';
}
function seating(shop){
 const s=assess(shop)?.record?.seating;
 return s&&age(s.date)>=-1&&age(s.date)<=store.reviewWindowDays?s:null;
}
function listTag(shop){
 const a=assess(shop),s=seating(shop);
 let tag;
 if(a?.kind==="editorial")tag='<span class="atlasTag">Atlas ★ '+a.score.toFixed(1)+' · Review-based ('+a.reviewers+')</span>';
 else if(a?.kind==="community")tag='<span class="atlasTag atlasEstimateTag">Atlas ★ '+a.score.toFixed(1)+' · Source estimate · '+esc(a.confidence)+'</span>';
 else tag='<span class="atlasPendingTag">Atlas · awaiting reliable ratings</span>';
 return tag+(s&&(s.kind==="reported"||s.kind==="none"||s.kind==="listed")?'<span class="seatTag'+(s.kind==="none"?' noSeats':'')+'">↳ '+esc(s.label)+'</span>':'');
}
function detail(shop){
 const a=assess(shop),s=seating(shop);
 const seats=s?'<a class="atlasSeat" href="'+esc(s.url)+'" target="_blank" rel="noopener">◉ '+esc(s.label)+' · '+fmt(s.date)+' ↗</a>':'';
 const unknownSeating=s?'':'<p class="atlasUnknown">Seating has not been recently verified.</p>';
 if(a?.kind==="community"){
  const r=a.sourceRating,count=Number(r.reviews),raw=Number(r.rating);
  const recent=a.sample?.length?'<p>'+a.sample.length+' dated reports are on file, but they do not meet the threshold for a detailed Atlas assessment.</p>':'';
  const notes=a.sample?.slice(0,3).map(z=>'<li>'+esc(z.note)+' <a href="'+esc(z.url)+'" target="_blank" rel="noopener">'+fmt(z.date)+' ↗</a></li>').join('')||'';
  const editorial=a.record?.reviewNote?'<p>'+esc(a.record.reviewNote)+'</p>':'';
  const ageNotice=r.sourceAgeNote?'<p class="atlasAgeNote">'+esc(r.sourceAgeNote)+'</p>':'';
  const auditLink=a.record?.reviewSource?'<p><a href="'+esc(a.record.reviewSource)+'" target="_blank" rel="noopener">Address research source ↗</a></p>':'';
  return '<section class="atlasVerdict atlasEstimated" aria-label="Atlas community estimate"><div class="atlasScoreHead"><div><small>ATLAS ESTIMATE · COMMUNITY DATA</small><strong>★ '+a.score.toFixed(1)+' <small>/ 5</small></strong></div><span>'+esc(a.confidence)+'</span></div>'
   +'<p class="atlasBrief">Source-adjusted community average — not a flower or service assessment.</p>'+seats+categoryPanel(shop)
   +'<details class="atlasMore"><summary>How was this estimated? · Sources</summary>'
   +'<p>'+esc(r.source)+' lists '+raw.toFixed(1)+'/5 from '+count+' historical reviews. Atlas adjusts small samples toward 3.5/5 using 12 prior reviews, to reduce the impact of just one or two ratings. Review ages and reviewer identities are not individually verified.</p>'+ageNotice
   +'<p>This historical overall estimate must not be used to infer category ratings. Any categories shown above come only from individually dated accounts; categories with insufficient observations remain unrated.</p>'
   +'<p><a href="'+esc(r.url)+'" target="_blank" rel="noopener">Read original source ↗</a></p>'+recent+editorial+auditLink+unknownSeating
   +(notes?'<ul>'+notes+'</ul>':'')+'</details></section>';
 }

 if(a?.score==null){
  const ext=window.ATLAS_INTEL?.ratings?.[shop.id];
  const notes=a?.sample?.slice(0,3).map(r=>'<li>'+esc(r.note)+' <a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+fmt(r.date)+' ↗</a></li>').join('')||'';
  const reason=a?.reviewers?(a.spread===false&&a.reviewers>=4?'Review dates are too clustered for a trustworthy recommendation.':'We need more independent, dated reports describing both product quality and staff service.')
   :ext?'The available rating is not an eligible shop-specific Greenmeister source average. We need branch-matched review evidence.'
   :'There is no eligible, sufficiently matched community star average for this address. See the source checks below.';
  const recentNote=a?.record?.reviewNote?'<p>'+esc(a.record.reviewNote)+'</p>':'';
  const sourceLink=a?.record?.reviewSource?'<p><a href="'+esc(a.record.reviewSource)+'" target="_blank" rel="noopener">Check researched source ↗</a></p>':'';
  // The separately linked community-rating card directly below is the source link; no duplicate button.
  const previews=notes?'<h4 class="atlasEvidenceLabel">Dated reports</h4><ul>'+notes+'</ul><p>Individual comments are not verified facts about current products or staff.</p>':'';
  const concise=a?.reviewers?a.reviewers+' dated report'+(a.reviewers===1?'':'s')+' · not enough to score':'Independent quality and service evidence still needed';
  return '<section class="atlasVerdict atlasPending" aria-label="Atlas Score"><div class="atlasScoreHead"><strong>Atlas Score</strong><span class="atlasAwait">Not yet rated</span></div>'
   +'<p class="atlasBrief">'+esc(concise)+'</p>'+seats+categoryPanel(shop)
   +'<details class="atlasMore"><summary>Why no Atlas score? · Sources</summary><p>'+reason+'</p>'+unknownSeating+recentNote+sourceLink+previews+'</details></section>';
 }
 const reviews=a.sample.slice(0,4).map(r=>'<li>'+esc(r.note)+' <a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+fmt(r.date)+' ↗</a></li>').join('');
 return '<section class="atlasVerdict" aria-label="Atlas Score"><div class="atlasScoreHead"><div><small>ATLAS SCORE · DATED REVIEWS</small><strong>★ '+a.score.toFixed(1)+' <small>/ 5</small></strong></div><span>'+a.reviewers+' independent recent reviewers<br>'+a.confidence+' · latest '+fmt(a.latest)+'</span></div>'
  +'<p class="atlasBrief">Review-based estimate, not a product test or guarantee of current stock.</p>'+seats+categoryPanel(shop)
  +'<details class="atlasMore"><summary>Why this score? · Review evidence</summary>'+unknownSeating+'<ul>'+reviews+'</ul>'
  +'<p>Overall Atlas Score weights: flower/hash 50%, service 25%, atmosphere 15%, value 10%. Missing overall-score dimensions use a neutral 3.5/5 statistical prior. Location has no weight in the existing overall score, and no category without enough individually dated reports receives a displayed rating. <a href="https://github.com/MurkleGuy/-amsterdam-coffeeshop-atlas#atlas-score-pilot" target="_blank" rel="noopener">Scoring policy ↗</a></p></details></section>';
}
window.AtlasScore={assess,seating,categoryRatings,listTag,detail};
})();
