/* Address pin safeguards for Amsterdam municipality-listed shops.
   A PDOK BAG address centroid is not a verified coffeeshop front door. */
(function(){
 'use strict';
 const compact=v=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^0-9A-Z]/g,'');
 function expected(shop){
  const raw=String(shop?.number||'').trim().match(/^(\d+)\s*([a-z]*)$/i);
  if(!raw)return null;
  const embedded=compact(raw[2]),explicit=compact(shop.suffix);
  if(embedded&&explicit&&embedded!==explicit)return null;
  return {postcode:compact(shop.postcode),house:Number(raw[1]),unit:explicit||embedded,street:compact(shop.street)};
 }
 function key(shop){const e=expected(shop);return e&&e.postcode+'|'+e.house+'|'+e.unit;}
 function suffix(doc){return compact(doc.huisletter)+compact(doc.huisnummertoevoeging);}
 function point(doc){
  const value=doc?.centroide_ll;
  const m=typeof value==='string'&&value.match(/^POINT\s*\(\s*([-+\d.]+)\s+([-+\d.]+)\s*\)$/i);
  if(!m)return null;
  const lat=+m[2],lng=+m[1];
  return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>52.15&&lat<52.52&&lng>4.58&&lng<5.32?{lat,lng}:null;
 }
 function select(shop,docs){
  const e=expected(shop);
  if(!e||e.postcode.length!==6||!Array.isArray(docs))return null;
  const hits=docs.filter(d=>{
   const city=compact(d.woonplaatsnaam||d.woonplaats_naam||'');
   const street=compact(d.straatnaam||d.openbareruimtenaam||d.openbare_ruimte_naam||'');
   return (!d.type||d.type==='adres')
    &&compact(d.postcode)===e.postcode
    &&Number(d.huisnummer)===e.house
    &&suffix(d)===e.unit
    &&(!city||city==='AMSTERDAM')
    &&(!street||street===e.street)
    &&point(d);
  });
  if(!hits.length)return null;
  const first=point(hits[0]);
  // Never choose arbitrarily between two geometrically different exact hits.
  for(const d of hits.slice(1)){
   const p=point(d),dy=(p.lat-first.lat)*111320,dx=(p.lng-first.lng)*111320*Math.cos(first.lat*Math.PI/180);
   if(Math.hypot(dx,dy)>8)return null;
  }
  return {lat:first.lat,lng:first.lng,source:'pdok-bag-address',addressKey:key(shop),bagId:String(hits[0].nummeraanduiding_id||hits[0].id||''),verifiedAt:new Date().toISOString().slice(0,10)};
 }
 function selectBuilding(shop,docs){
  const e=expected(shop);
  // Never substitute a different unit when a specific house letter is listed.
  if(!e||e.unit||e.postcode.length!==6||!Array.isArray(docs)||!docs.length)return null;
  const hits=docs.filter(d=>{
   const city=compact(d.woonplaatsnaam||d.woonplaats_naam||'');
   const street=compact(d.straatnaam||d.openbareruimtenaam||d.openbare_ruimte_naam||'');
   return (!d.type||d.type==='adres')
    &&compact(d.postcode)===e.postcode&&Number(d.huisnummer)===e.house
    &&(!city||city==='AMSTERDAM')&&(!street||street===e.street)&&point(d);
  });
  // Refuse a possibly truncated list of fifty units for this exact building.
  if(!hits.length||hits.length>=50)return null;
  const coords=hits.map(point);
  // Only use a whole-building pin if every returned unit's BAG point is tightly clustered.
  for(const a of coords)for(const b of coords){
   const dy=(a.lat-b.lat)*111320,dx=(a.lng-b.lng)*111320*Math.cos(a.lat*Math.PI/180);
   if(Math.hypot(dx,dy)>8)return null;
  }
  const ground=hits.find(d=>suffix(d)==='H')||hits[0],p=point(ground);
  return {lat:p.lat,lng:p.lng,source:'pdok-bag-building',addressKey:key(shop),
   bagId:String(ground.nummeraanduiding_id||ground.id||''),verifiedAt:new Date().toISOString().slice(0,10),
   precision:'building_only',matchedUnit:suffix(ground)};
 }
 function validCache(shop,c){
  const k=key(shop);
  return !!k&&['pdok-bag-address','pdok-bag-building'].includes(c?.source)&&c.addressKey===k&&Number.isFinite(c.lat)&&Number.isFinite(c.lng)&&c.lat>52.15&&c.lat<52.52&&c.lng>4.58&&c.lng<5.32;
 }
 // Expose the map's adapter names while retaining the strict matching rules.
 function addressParts(shop){
  const e=expected(shop);
  return e?{postcode:e.postcode,number:e.house,suffix:e.unit,key:key(shop)}:null;
 }
 function exactMatch(shop,docs){return select(shop,docs);}
 function cached(shop,entry){
  if(!validCache(shop,entry))return null;
  const stamp=Date.parse(String(entry.verifiedAt||'')+'T12:00:00Z');
  const age=(Date.now()-stamp)/86400000;
  return Number.isFinite(age)&&age>=-1&&age<=120?{lat:entry.lat,lng:entry.lng}:null;
 }
 window.BudMapAddressMatch={expected,key,select,selectBuilding,validCache,addressParts,exactMatch,cached};
})();
