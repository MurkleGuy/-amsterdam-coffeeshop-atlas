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
 u.searchParams.set('rows','20');
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
 const qs=[
  shop.postcode+' '+a.number+(a.suffix?' '+a.suffix:'')+' Amsterdam',
  shop.street+' '+a.number+(a.suffix?' '+a.suffix:'')+' '+shop.postcode+' Amsterdam'
 ];
 for(const query of qs){
  let docs;
  try{docs=await search(query);}
  catch(e){return{id:shop.id,reason:'pdok_unreachable',detail:String(e.message).slice(0,90)}}
  const match=matcher.select(shop,docs);
  if(match)return {id:shop.id,match};
  await wait(120);
 }
 return{id:shop.id,reason:'no_exact_pdok_bag_match'};
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
const failuresByReason=Object.fromEntries([...new Set(failed.map(r=>r.reason))].map(reason=>[reason,failed.filter(r=>r.reason===reason).length]));
if(!resolved.length){
 console.error('Could not verify any coordinates; refusing to replace existing data',JSON.stringify(failuresByReason));
 process.exitCode=1;
}else{
 const generatedAt=new Date().toISOString();
 const locations=Object.fromEntries(resolved.map(r=>[r.id,r.match]));
 const dataset={generatedAt,source:'PDOK Locatieserver v3_1, BAG civic-address centroids',totalListed:shops.length,verifiedCount:resolved.length,unresolvedCount:failed.length,locations};
 await write('public/assets/verified-coordinates.json',dataset);
 const audit=JSON.parse(await read('research/location-accuracy-audit.json'));
 audit.summary.livePdokCoordinatesVerified=resolved.length;
 audit.summary.livePdokCoordinateUnresolved=failed.length;
 audit.summary.physicalEntrancesVerified=0;
 audit.summary.lastLiveCheckAt=generatedAt;
 audit.summary.failureReasons=failuresByReason;
 const resultMap=new Map(results.map(r=>[r.id,r]));
 for(const row of audit.records){
  const r=resultMap.get(row.id);
  row.livePdokMatchVerified=!!r?.match;
  row.storefrontEntranceVerified=false;
  if(r?.match){
   row.pdokBagId=r.match.bagId||null;
   row.pdokCoordinates={lat:r.match.lat,lng:r.match.lng};
   delete row.unresolvedReason;
  }else{
   row.unresolvedReason=r?.reason||'not_checked';
   delete row.pdokBagId;
   delete row.pdokCoordinates;
  }
 }
 audit.note='Exact PDOK/BAG civic address coordinates checked on '+generatedAt+'. A valid address is NOT proof of a current operating coffeeshop or its door location. Unresolved matches remain unpinned.';
 await write('research/location-accuracy-audit.json',audit);
 console.log(JSON.stringify({verified:resolved.length,total:shops.length,unresolved:failed.map(r=>({id:r.id,reason:r.reason})),generatedAt},null,2));
 if(failed.length)process.exitCode=2;
}
