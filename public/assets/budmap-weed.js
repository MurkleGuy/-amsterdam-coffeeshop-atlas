/* BudMap quality-specific EARLY RESEARCH, not a product test.
   Numeric quality values are editorial interpretations of public review text;
   original reviewers did not submit these subratings. Distinct reviewer
   handles are not verified as independent people. This is not the overall
   BudMap Score, nor a comprehensive Amsterdam weed-quality leaderboard. */
(function(){
'use strict';
const store=window.ATLAS_VERDICTS||{evidence:{},reviewWindowDays:540};
const ageDays=iso=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso)))return Infinity;
 return (Date.now()-Date.parse(iso+'T12:00:00Z'))/86400000;
};
const windowDays=Number(store.reviewWindowDays)||540,prior=2.5,baseline=3.5;
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const weight=days=>days<=90?1:days<=180?.8:days<=365?.6:.3;
function assess(shop){
 const raw=store.evidence?.[shop?.id]?.observations||[];
 const dated=raw.filter(r=>r&&typeof r.reviewer==='string'&&r.reviewer.trim()
  &&typeof r.url==='string'&&/^https:\/\//.test(r.url)
  &&Number.isFinite(r.quality)&&r.quality>=1&&r.quality<=5
  &&ageDays(r.date)>=-1&&ageDays(r.date)<=windowDays)
  .sort((a,b)=>b.date.localeCompare(a.date));
 // Quality-topic reports only: no service, price or seating-only commentary.
 const unique=new Map();
 for(const r of dated){
  const key=r.reviewer.trim().toLowerCase();
  if(!unique.has(key))unique.set(key,r);
 }
 const perMonth=new Map(),sample=[];
 for(const r of unique.values()){
  const month=r.date.slice(0,7),n=perMonth.get(month)||0;
  if(n>=5)continue; perMonth.set(month,n+1);sample.push(r);
 }
 const count=sample.length,months=perMonth.size;
 const concentrated=Math.max(0,...perMonth.values())>.6*count;
 const eligible=count>=3&&months>=2&&!concentrated;
 let weighted=0,total=0;
 for(const r of sample){const w=weight(ageDays(r.date));weighted+=r.quality*w;total+=w;}
 const score=eligible?2*(baseline*prior+weighted)/(prior+total):null;
 return {score,count,months,latest:sample[0]?.date||null,sample,eligible};
}
function coverage(shops){
 const out={rated:0,awaiting:0,withReports:0};
 for(const shop of shops){const a=assess(shop);if(a.score==null)out.awaiting++;else out.rated++;if(a.count)out.withReports++;}
 return out;
}
function listTag(shop){
 const a=assess(shop);
 if(a.score!=null)return '<span class="atlasTag weedQualityTag">✿ Weed '+a.score.toFixed(1)+'/10 · Early estimate · '+a.count+' reports</span>';
 if(a.count)return '<span class="atlasPendingTag">✿ Weed not rated · '+a.count+' dated '+(a.count===1?'report':'reports')+'</span>';
 return '<span class="atlasPendingTag">✿ Weed quality · Not rated</span>';
}
function detail(shop){
 const a=assess(shop);
 if(a.score==null)return '<section class="atlasVerdict atlasPending" aria-label="Weed quality evidence"><div class="atlasScoreHead"><strong>Weed Quality</strong><span class="atlasAwait">Not rated yet</span></div>'
  +'<p class="atlasBrief">'+(a.count
   ?a.count+' dated, quality-specific '+(a.count===1?'account':'accounts')+' on file, but insufficient spread across dates for an early estimate.'
   :'Not enough dated, quality-specific accounts on file to rate flower or hash here.')
  +'</p><p class="atlasUnknown">The overall customer rating does not establish weed quality. No quality number has been guessed.</p></section>';
 const links=a.sample.slice(0,3).map(r=>'<li><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Dated quality report · '+esc(r.date)+' ↗</a></li>').join('');
 return '<section class="atlasVerdict" aria-label="Early weed-quality evidence">'
  +'<div class="atlasScoreHead"><div><small>WEED QUALITY · EARLY ESTIMATE</small><strong>✿ '+a.score.toFixed(1)+' <small>/ 10</small></strong></div><span>'+a.count+' dated accounts · '+a.months+' months</span></div>'
  +'<p class="atlasBrief">Early indication from dated comments specifically about flower and hash. These category numbers are interpretations of written reviews, not original subratings entered by customers.</p>'
  +'<p class="atlasUnknown">Only individually linked comments about product quality are considered. At least three review handles across two months are required, without one month supplying more than 60%. Newer reports receive greater weight, and small samples are moderated towards 7/10. This is a limited selected sample, not a verified city-wide ranking or product test. Stock varies by batch.</p>'
  +(links?'<details class="atlasMore"><summary>Inspect dated report evidence</summary><ul>'+links+'</ul></details>':'')+'</section>';
}
window.BudMapWeed={assess,coverage,listTag,detail};
})();
