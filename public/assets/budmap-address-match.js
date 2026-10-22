/* BudMap address-to-BAG matching. No guessed coordinates or third-party venue ratings.
   PDOK/BAG address centroids are not guaranteed to be actual storefront entrances. */
(function(){
'use strict';
const pc=p=>String(p||'').toUpperCase().replace(/\s+/g,'');
const unit=v=>String(v||'').toUpperCase().trim().replace(/\s+/g,'');
function addressParts(shop){
 const m=String(shop?.number||'').trim().match(/^(\d+)\s*([A-Za-z]?)$/);
 if(!m||!/^\d{4}[A-Z]{2}$/.test(pc(shop?.postcode)))return null;
 const explicit=unit(shop.suffix),inNumber=unit(m[2]);
 if(explicit&&inNumber&&explicit!==inNumber)return null;
 return {postcode:pc(shop.postcode),number:Number(m[1]),suffix:explicit||inNumber,
  key:pc(shop.postcode)+'|'+Number(m[1])+'|'+(explicit||inNumber)};
}
function location(doc){
 const str=String(doc?.centroide_ll||'');
 const match=str.match(/^POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i);
 if(!match)return null;
 const lat=Number(match[2]),lng=Number(match[1]);
 return lat>52.15&&lat<52.52&&lng>4.58&&lng<5.32?{lat,lng}:null;
}
function hasMatchingUnit(suffix,doc){
 const letter=unit(doc.huisletter),addition=unit(doc.huisnummertoevoeging);
 // Avoid assigning 88, 88-A, or 88-H to each other.
 if(!suffix)return !letter&&!addition;
 return suffix===letter||suffix===addition||suffix===(letter+addition);
}
function exactMatch(shop,docs){
 const a=addressParts(shop);
 if(!a||!Array.isArray(docs))return null;
 const candidates=docs.filter(doc=>{
  const dnum=Number(doc?.huisnummer);
  if(doc?.type&&doc.type!=='adres')return false;
  if(doc?.woonplaatsnaam&&unit(doc.woonplaatsnaam)!=='AMSTERDAM')return false;
  return pc(doc.postcode)===a.postcode&&dnum===a.number&&hasMatchingUnit(a.suffix,doc)&&location(doc);
 });
 if(!candidates.length)return null;
 // A duplicated BAG result is safe only if its address points remain very close.
 const geo=location(candidates[0]);
 for(const doc of candidates.slice(1)){
  const point=location(doc);
  const dx=(point.lng-geo.lng)*68000,dy=(point.lat-geo.lat)*111320;
  if(Math.hypot(dx,dy)>18)return null;
 }
 return {lat:geo.lat,lng:geo.lng,source:'PDOK_BAG_address',
  addressKey:a.key,sourceId:String(candidates[0].id||''),verifiedAt:new Date().toISOString().slice(0,10)};
}
function cached(shop,entry,days=120){
 const parts=addressParts(shop);
 if(!parts||!entry||entry.source!=='PDOK_BAG_address'||entry.addressKey!==parts.key)return null;
 const coords={lat:entry.lat,lng:entry.lng};
 if(!Number.isFinite(coords.lat)||!Number.isFinite(coords.lng)
  ||coords.lat<=52.15||coords.lat>=52.52||coords.lng<=4.58||coords.lng>=5.32)return null;
 const then=Date.parse(String(entry.verifiedAt||'')+'T12:00:00Z');
 const age=(Date.now()-then)/86400000;
 if(!Number.isFinite(age)||age<-.8||age>days)return null;
 return coords;
}
window.BudMapAddressMatch={addressParts,exactMatch,cached};
})();
