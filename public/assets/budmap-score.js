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
 const score=sourceCount?2*sources.reduce((sum,r)=>sum+Number(r.rating),0)/sourceCount:null;
 const lowSample=sources.some(r=>Number(r.reviews)<5);
 const older=sources.some(r=>r.evidenceEra==='legacy');
 return {score,sourceCount,kind:sourceCount===0?'unrated':sourceCount===1?'preliminary':'combined',
  lowSample,older,sources,confidence:sourceCount===0?'Awaiting ratings':
  sourceCount===1?'Preliminary':sourceCount===2?'Two-site average':'Multi-site average'};
}
function listTag(shop){
 const a=assess(shop);
 if(a.score==null)return '<span class="atlasPendingTag">BudMap · not yet rated</span>';
 return '<span class="atlasTag'+(a.sourceCount===1?' atlasEstimateTag':'')+'">★ BudMap '+a.score.toFixed(1)+'/10'
  +(a.sourceCount===1?' · Preliminary':' · '+a.sourceCount+' ratings combined')+'</span>';
}
function detail(shop){
 const a=assess(shop);
 if(a.score==null)return '<section class="atlasVerdict atlasPending" aria-label="BudMap rating"><div class="atlasScoreHead"><strong>BudMap Score</strong><span class="atlasAwait">Not rated yet</span></div><p class="atlasBrief">We have not found a suitable independently published venue rating for this address. No score has been invented.</p></section>';
 const count=a.sourceCount;
 const sampleWarning=a.lowSample?' At least one rating has fewer than five reviews.':'';
 const ageWarning=a.older?' Some reviews may refer to an earlier business or trading name.':'';
 const introduction=count===1
  ?'Preliminary score from one published venue rating. An independent second rating is needed before this can be considered a combined score.'
  :'Simple arithmetic average of '+count+' independently published five-star venue ratings, converted to a score out of ten. Each website has equal weight.';
 return '<section class="atlasVerdict'+(count===1?' atlasEstimated':'')+'" aria-label="BudMap Score">'
  +'<div class="atlasScoreHead"><div><small>BUDMAP SCORE</small><strong>★ '+a.score.toFixed(1)+' <small>/ 10</small></strong></div><span>'+escaped(a.confidence)+'</span></div>'
  +'<p class="atlasBrief">'+escaped(introduction)+'</p>'
  +'<p class="atlasUnknown">Ratings are a dated snapshot, may cover older visits, and are not a test of current products, service or opening hours.'+escaped(sampleWarning+ageWarning)+'</p>'
  +'</section>';
}
function coverage(shops){
 const out={combined:0,preliminary:0,unrated:0};
 for(const shop of shops){out[assess(shop).kind]++;}
 return out;
}
window.BudMapScore={assess,listTag,detail,coverage};
})();
