/* Public Cloudflare Pages HTTP smoke test. Does not test phone GPS or storefront doors.
 * Expected verified data is read from the current checkout after geocoding.
 */
import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const expected=JSON.parse(await fs.readFile(new URL('public/assets/verified-coordinates.json',root),'utf8'));
const base='https://amsterdam-coffeeshop-atlas.pages.dev/';
const date=new Date().toISOString();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const get=async(path)=>{
 const response=await fetch(base+path,{signal:AbortSignal.timeout(12000),cache:'no-store'});
 if(!response.ok)throw Error(path+' returned HTTP '+response.status);
 return await response.text();
};
let result={checkedAt:date,url:base+'map.html',outcome:'unverified',expectedCount:expected.pinnedCount,
 expectedDatasetAt:expected.generatedAt,notes:'HTTP deployment check only; no device GPS or storefront inspection'};
let lastError='Site did not respond with the updated code';
for(let attempt=1;attempt<=12;attempt++){
 try{
  const [map,coordinates,helper,trip,menu]=await Promise.all([
   get('map.html'),get('assets/verified-coordinates.json'),get('assets/budmap-address-match.js'),get('assets/atlas-trip.js'),get('menu.html')
  ]);
  const online=JSON.parse(coordinates);
  if(online.generatedAt!==expected.generatedAt)throw Error('Cloudflare has not yet published the latest coordinates');
  if(online.pinnedCount!==167||Object.keys(online.locations||{}).length!==167)throw Error('Online coordinates do not cover all 167 IDs');
  if(!map.includes('assets/budmap-address-match.js?v=3')||!map.includes('loadVerifiedCoordinates().then(()=>geocodeAll()'))throw Error('Old map JavaScript currently deployed');
  if(!map.includes('Pieter Vlamingstraat 286, 1093 DK')||!map.includes('Nieuwmarkt 4A-1')||!map.includes('Nieuwe Nieuwstraat 32C'))throw Error('Outdated address records in map');
  if(!helper.includes('selectBuilding')||!trip.includes('budmapNavBanner')||!menu.includes('ownerPanel'))throw Error('A required JavaScript or menu asset is missing');
  result={...result,outcome:'pass',attempts:attempt,onlineExact:online.verifiedCount,onlineBuilding:online.buildingLevelCount,onlinePinned:online.pinnedCount,onlineDataAt:online.generatedAt};
  lastError='';
  break;
 }catch(error){
  lastError=String(error?.message||error);
  if(attempt<12)await pause(10000);
 }
}
if(result.outcome!=='pass')result={...result,outcome:'failed',lastError};
await fs.writeFile(new URL('research/live-site-smoke.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(result.outcome!=='pass')process.exitCode=1;
