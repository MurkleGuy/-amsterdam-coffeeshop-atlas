/* BudMap Score: equal-weight mean of confidence-adjusted independent 1–5 venue ratings.
   Sources are retained with URLs in shop-intel.js for verification. Do not insert
   platform ratings without the relevant licence, access and attribution rights.
   No individual visitor opinions are converted into numeric ratings here. */
(function(){
'use strict';
const intel=window.ATLAS_INTEL||{ratings:{},crossChecks:{}};
const primary=intel.ratings||{},additional=intel.crossChecks||{};
const escaped=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const valid=x=>x&&typeof x.source==='string'&&x.source.trim().length>0
  &&typeof x.url==='string'&&/^https:\/\//.test(x.url)
  &&Number.isFinite(Number(x.rating))&&Number(x.rating)>=1&&Number(x.rating)<=5
  &&Number.isInteger(Number(x.reviews))&&Number(x.reviews)>=1;
// Five pseudo-reviews at 7/10 reduce extreme scores from tiny samples.
// These are conservative statistical estimates, not additional real reviews.
const PRIOR_REVIEWS=5, PRIOR_SCORE=7;
function adjustedSiteScore(r){
 const count=Number(r.reviews),raw=Number(r.rating)*2;
 return (raw*count+PRIOR_SCORE*PRIOR_REVIEWS)/(count+PRIOR_REVIEWS);
}
function assess(shop){
 const id=String(shop?.id??'');
 const found=new Map();
 const extra=Array.isArray(intel.extraRatings?.[id])?intel.extraRatings[id]:[];
 for(const record of [primary[id],additional[id],...extra]){
  if(!valid(record))continue;
  const provider=record.source.trim().toLowerCase();
  if(!found.has(provider))found.set(provider,record);
 }
 const sources=[...found.values()];
 const sourceCount=sources.length;
 const sourceAverage=sourceCount?sources.reduce((sum,r)=>sum+Number(r.rating),0)/sourceCount:null;
 // Adjust each site independently, then average websites equally.
 // Do not pool all reviews: a large website must not overpower other websites.
 const displayScore=sourceCount?sources.reduce((sum,r)=>sum+adjustedSiteScore(r),0)/sourceCount:null;
 // Apply the same adjusted BudMap Score even when only one site is available.
 const score=displayScore;
 const lowSample=sources.some(r=>Number(r.reviews)<5);
 const older=sources.some(r=>r.evidenceEra==='legacy');
 const totalReviews=sources.reduce((sum,r)=>sum+Number(r.reviews),0);
 return {score,displayScore,sourceAverage,sourceCount,totalReviews,
  kind:sourceCount===0?'unrated':'rated',lowSample,older,sources,
  confidence:sourceCount===0?'Awaiting ratings':sourceCount===1?'1 website':sourceCount+' websites'};
}
const plural=(n,a,b)=>n===1?a:b;
function evidenceLabel(a){
 return a.sourceCount+' '+plural(a.sourceCount,'website','websites')
 + ' · '+a.totalReviews+' '+plural(a.totalReviews,'review','reviews');
}
function listTag(shop){
 const a=assess(shop);
 if(a.score==null)return '<span class="atlasPendingTag">BudMap · not yet rated</span>';
 return '<span class="atlasTag">★ BudMap '+a.score.toFixed(1)+'/10 · '+evidenceLabel(a)+'</span>';
}
function detail(shop){
 const a=assess(shop);
 if(a.score==null)return '<section class="atlasVerdict atlasPending" aria-label="BudMap rating"><div class="atlasScoreHead"><strong>BudMap Score</strong><span class="atlasAwait">Not rated yet</span></div><p class="atlasBrief">No suitable published venue rating has been matched to this address. No score has been invented.</p></section>';
 const sampleWarning=a.lowSample?' At least one website has fewer than five reviews.':'';
 const ageWarning=a.older?' Some reviews may refer to an earlier business or trading name.':'';
 return '<section class="atlasVerdict" aria-label="BudMap Score">'
  +'<div class="atlasScoreHead"><div><small>BUDMAP SCORE</small><strong>★ '+a.score.toFixed(1)+' <small>/ 10</small></strong></div><span>'+evidenceLabel(a)+'</span></div>'
  +'<p class="atlasBrief">Review-count-adjusted rating out of 10. Each published website average is adjusted towards 7/10 when based on fewer reviews. Available website ratings are then averaged equally.</p>'
  +'<p class="atlasUnknown">Review counts are reported by individual websites, and the same visitor may have reviewed on more than one. Five statistical prior reviews are used in the adjustment; they are not real customer reviews. Historic ratings do not guarantee current quality.'+escaped(sampleWarning+ageWarning)+'</p></section>';
}
function coverage(shops){
 const out={rated:0,unrated:0,singleSite:0,multiSite:0};
 for(const shop of shops){
  const a=assess(shop);
  if(a.score==null)out.unrated++;
  else{out.rated++;if(a.sourceCount===1)out.singleSite++;else out.multiSite++;}
 }
 return out;
}
window.BudMapScore={assess,listTag,detail,coverage};
})();
