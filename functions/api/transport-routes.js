// Cloudflare Pages Function: same-origin, cached OSM service-route geometry.
// This is route data, not live service or departure information.
// Endpoint is fixed, with no caller-supplied URL or arbitrary Overpass query.
const OSM_QUERY = '[out:json][timeout:35];relation["type"="route"]["route"~"^(tram|subway|light_rail|ferry)$"](52.24,4.65,52.52,5.20);out tags geom(52.14,4.54,52.56,5.27);';
const HOSTS = ['https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter'];
export async function onRequestGet(context) {
 const cache = caches.default;
 try {
  const saved = await cache.match(context.request);
  if(saved)return saved;
 } catch(e) {}
 for(const endpoint of HOSTS){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),24000);
  try{
   const response=await fetch(endpoint+'?data='+encodeURIComponent(OSM_QUERY),{
    method:'GET',headers:{'Accept':'application/json'},signal:controller.signal
   });
   if(!response.ok)continue;
   const type=response.headers.get('content-type')||'';
   if(!type.includes('json'))continue;
   const output=new Response(response.body,{status:200,headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'public, max-age=3600, s-maxage=86400',
    'x-transport-data':'openstreetmap-routes',
    'x-content-type-options':'nosniff'
   }});
   context.waitUntil(cache.put(context.request,output.clone()).catch(()=>{}));
   return output;
  }catch(e){
   // Try another upstream. Stale client cache is retained on the visitor's device.
  }finally{clearTimeout(timeout)}
 }
 return Response.json({error:'Routes are temporarily unavailable. The Street and Tracks maps still work.'},{status:503,headers:{'cache-control':'no-store'}});
}
