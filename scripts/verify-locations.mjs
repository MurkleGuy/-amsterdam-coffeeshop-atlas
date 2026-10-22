/* Check municipality-listed addresses against current PDOK / BAG address records.
 * Only exact address matches can be written as coordinates. Does not verify entrances.
 * Run: node scripts/verify-locations.mjs
 */
import fs from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=async p=>fs.readFile(new URL(p,root),'utf8');
const write=async(p,value)=>fs.writeFile(new URL(p,root),JSON.stringify(value,null,2)+'\n');
const window={};
vm.runInNewContext(await read('public/assets/shops.js'),{window});
vm.runInNewContext(await read('public/assets/budmap-address-match.js'),{window,Date});
const shops=window.ATLAS_SHOPS;
const matcher=window.BudMapAddressMatch;
if(shops.length!==167)throw Error('Unexpected published address count');
const keys=shops.map(s=>matcher.key(s));
if(keys.some(k=>!k)||new Set(keys).size!==shops.length)throw Error('Invalid or duplicate address key; refusing to publish');
const wait=t=>new Promise(r=>setTimeout(r,t));
async function search(query){
 const u=new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');
 u.searchParams.set('q',query);
 u.searchParams.set('fq','type:adres');
 u.searchParams.set('rows','50');
 let error;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await fetch(u,{signal:AbortSignal.timeout(14000),headers:{Accept:'application/json'}});
   if(!r.ok)throw Error('PDOK HTTP '+r.status);
   const body=await r.json();
   if(!Array.isArray(body?.response?.docs))throw Error('PDOK response missing docs array');
   return body.response.docs;
  }catch(e){error=e;if(attempt!==2)await wait(750*(attempt+1));}
 }
 throw error;
}
async function verify(shop){
 const a=matcher.addressParts(shop);
 if(!a)return {id:shop.id,reason:'invalid_address_format'};
 const nearby=[];
 const qs=[
  shop.postcode+' '+a.number+(a.suffix?' '+a.suffix:'')+' Amsterdam',
  shop.street+' '+a.number+(a.suffix?' '+a.suffix:'')+' '+shop.postcode+' Amsterdam'
 ];
 for(const query of qs){
  let docs;
  try{docs=await search(query);}
  catch(e){return{id:shop.id,reason:'pdok_unreachable',detail:String(e.message).slice(0,90)}}
  const match=matcher.select(shop,docs)||matcher.selectBuilding(shop,docs);
  if(match)return {id:shop.id,match};
  for(const doc of docs){
   const dc=v=>String(v??'').toUpperCase().replace(/[^0-9A-Z]/g,'');
   if(dc(doc.postcode)!==dc(shop.postcode)||Number(doc.huisnummer)!==a.number)continue;
   if(nearby.length>=5)break;
   const candidate={letter:doc.huisletter??null,addition:doc.huisnummertoevoeging??null,
    street:doc.straatnaam??doc.openbareruimtenaam??null,city:doc.woonplaatsnaam??null,
    point:doc.centroide_ll??null};
   if(!nearby.some(x=>JSON.stringify(x)===JSON.stringify(candidate)))nearby.push(candidate);
  }
  await wait(120);
 }
 return{id:shop.id,reason:'no_exact_pdok_bag_match',candidateSamples:nearby};
}
const results=new Array(shops.length);
let next=0;
await Promise.all(Array.from({length:3},async()=>{
 while(next<shops.length){
  const index=next++;
  results[index]=await verify(shops[index]);
  await wait(180);
 }
}));
const resolved=results.filter(r=>r.match),failed=results.filter(r=>!r.match);
const exact=resolved.filter(r=>r.match.source==='pdok-bag-address');
const buildings=resolved.filter(r=>r.match.source==='pdok-bag-building');
const failuresByReason=Object.fromEntries([...new Set(failed.map(r=>r.reason))].map(reason=>[reason,failed.filter(r=>r.reason===reason).length]));
if(!resolved.length){
 console.error('Could not verify any coordinates; refusing to replace existing data',JSON.stringify(failuresByReason));
 process.exitCode=1;
}else{
 const generatedAt=new Date().toISOString();
 const locations=Object.fromEntries(resolved.map(r=>[r.id,r.match]));
 const dataset={generatedAt,source:'PDOK Locatieserver v3_1, BAG civic-address centroids',totalListed:shops.length,verifiedCount:exact.length,buildingLevelCount:buildings.length,pinnedCount:resolved.length,unresolvedCount:failed.length,locations};
 await write('public/assets/verified-coordinates.json',dataset);
 const audit=JSON.parse(await read('research/location-accuracy-audit.json'));
 audit.summary.livePdokCoordinatesVerified=exact.length;
 audit.summary.buildingLevelCoordinates=buildings.length;
 audit.summary.livePdokCoordinateUnresolved=failed.length;
 audit.summary.physicalEntrancesVerified=0;
 audit.summary.lastLiveCheckAt=generatedAt;
 audit.summary.failureReasons=failuresByReason;
 audit.summary.addressCorrectionsRecorded=audit.records.filter(row=>row.currentDisplayAddress!==row.municipalAddress).length;
 const resultMap=new Map(results.map(r=>[r.id,r]));
 for(const row of audit.records){
  const shop=shops.find(s=>s.id===row.id);
  if(!shop)throw Error('Audit row has unknown shop '+row.id);
  row.addressKey=matcher.key(shop);
  row.currentDisplayAddress=shop.address;
  row.cityListedAddress=shop.cityListedAddress||row.cityListedAddress||row.municipalAddress;
  if(shop.addressCorrectionSource)row.addressCorrectionSource=shop.addressCorrectionSource;
  if(shop.addressCorrectionNote)row.addressCorrectionNote=shop.addressCorrectionNote;
  const r=resultMap.get(row.id);
  row.livePdokMatchVerified=r?.match?.source==='pdok-bag-address';
  row.buildingLevelGeocoded=r?.match?.source==='pdok-bag-building';
  row.storefrontEntranceVerified=false;
  if(r?.match){
   row.coordinatePrecision=r.match.source==='pdok-bag-address'?'exact_bag_unit':'building_only';
   row.pdokBagId=r.match.bagId||null;
   row.pdokCoordinates={lat:r.match.lat,lng:r.match.lng};
   delete row.unresolvedReason;
   delete row.pdokCandidateSamples;
  }else{
   row.unresolvedReason=r?.reason||'not_checked';
   delete row.coordinatePrecision;
   row.pdokCandidateSamples=r?.candidateSamples||[];
   delete row.pdokBagId;
   delete row.pdokCoordinates;
  }
 }
 audit.note='PDOK/BAG civic addresses checked on '+generatedAt+'. Exact unit matches and tightly clustered building-level approximations are counted separately. None of these are verified coffeeshop door locations. Unresolved addresses remain unpinned.';
 await write('research/location-accuracy-audit.json',audit);
 console.log(JSON.stringify({exact:exact.length,buildingLevel:buildings.length,pinned:resolved.length,total:shops.length,unresolved:failed.map(r=>({id:r.id,reason:r.reason})),generatedAt},null,2));
 if(failed.length)process.exitCode=2;
}
