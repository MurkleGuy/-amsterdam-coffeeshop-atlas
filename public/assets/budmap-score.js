/* BudMap Score: equal-weight mean of independently published 1–5 venue ratings.
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
 // A genuine BudMap Score needs corroboration from at least two distinct websites.
 const score=sourceCount>=2?sourceAverage*2:null;
 const lowSample=sources.some(r=>Number(r.reviews)<5);
 const older=sources.some(r=>r.evidenceEra==='legacy');
 return {score,sourceAverage,sourceCount,kind:sourceCount===0?'unrated':sourceCount===1?'preliminary':'combined',
  lowSample,older,sources,confidence:sourceCount===0?'Awaiting ratings':
  sourceCount===1?'Preliminary':sourceCount===2?'Two-site average':'Multi-site average'};
}
function listTag(shop){
 const a=assess(shop);
 if(a.sourceCount===0)return '<span class="atlasPendingTag">BudMap · not yet rated</span>';
 if(a.sourceCount===1)return '<span class="atlasTag atlasEstimateTag">★ '+a.sourceAverage.toFixed(1)+'/5 · Preliminary · 1 site</span>';
 return '<span class="atlasTag">★ BudMap '+a.score.toFixed(1)+'/10 · '+a.sourceCount+' ratings combined</span>';
}
function detail(shop){
 const a=assess(shop);
 if(a.sourceCount===0)return '<section class="atlasVerdict atlasPending" aria-label="BudMap rating"><div class="atlasScoreHead"><strong>BudMap Score</strong><span class="atlasAwait">Not rated yet</span></div><p class="atlasBrief">We have not found a suitable independently published venue rating for this address. No score has been invented.</p></section>';
 const sampleWarning=a.lowSample?' At least one website has fewer than five reviews.':'';
 const ageWarning=a.older?' Some reviews may refer to an earlier business or trading name.':'';
 if(a.sourceCount===1){
  const r=a.sources[0];
  return '<section class="atlasVerdict atlasEstimated" aria-label="Preliminary venue rating">'
   +'<div class="atlasScoreHead"><div><small>PRELIMINARY VENUE RATING</small><strong>★ '+a.sourceAverage.toFixed(1)+' <small>/ 5</small></strong></div><span>1 website · '+Number(r.reviews)+' review'+(Number(r.reviews)===1?'':'s')+'</span></div>'
   +'<p class="atlasBrief">BudMap Score pending. A second independently published venue rating is needed before a combined score out of 10 can be shown.</p>'
   +'<p class="atlasUnknown">This single-site average is historical and does not establish a perfect visitor experience.'+escaped(sampleWarning+ageWarning)+'</p></section>';
 }
 return '<section class="atlasVerdict" aria-label="BudMap Score">'
  +'<div class="atlasScoreHead"><div><small>BUDMAP SCORE</small><strong>★ '+a.score.toFixed(1)+' <small>/ 10</small></strong></div><span>'+escaped(a.confidence)+'</span></div>'
  +'<p class="atlasBrief">Simple average of '+a.sourceCount+' independently published five-star venue ratings, converted to a score out of ten. Each website has equal weight.</p>'
  +'<p class="atlasUnknown">Ratings are a dated snapshot, may cover older visits, and are not a test of current products, service or opening hours.'+escaped(sampleWarning+ageWarning)+'</p></section>';
}
function coverage(shops){
 const out={combined:0,preliminary:0,unrated:0};
 for(const shop of shops){out[assess(shop).kind]++;}
 return out;
}
window.BudMapScore={assess,listTag,detail,coverage};
})();
