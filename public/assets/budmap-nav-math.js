/* BudMap walking-navigation geometry helpers.
   Pure calculations: no network, geolocation, or persisted GPS data. */
(function(){
 'use strict';
 const radians=Math.PI/180;
 const distance=(a,b)=>{
  const lat=(a[0]+b[0])/2*radians,dy=(b[0]-a[0])*111320,dx=(b[1]-a[1])*111320*Math.cos(lat);
  return Math.hypot(dx,dy);
 };
 function cumulative(shape){
  const out=[0];
  for(let i=1;i<shape.length;i++)out.push(out[i-1]+distance(shape[i-1],shape[i]));
  return out;
 }
 function nearestOnRoute(shape,offsets,fix){
  if(!Array.isArray(shape)||shape.length<2||!fix)return null;
  const perLat=111320,perLng=111320*Math.cos(fix.lat*radians);
  let best=null;
  for(let i=0;i<shape.length-1;i++){
   const a=shape[i],b=shape[i+1];
   const ax=(a[1]-fix.lng)*perLng,ay=(a[0]-fix.lat)*perLat;
   const dx=(b[1]-a[1])*perLng,dy=(b[0]-a[0])*perLat;
   const len2=dx*dx+dy*dy;
   const t=len2>0?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len2)):0;
   const d=Math.hypot(ax+t*dx,ay+t*dy);
   const along=offsets[i]+(offsets[i+1]-offsets[i])*t;
   if(!best||d<best.offsetMeters-.01||(Math.abs(d-best.offsetMeters)<=.01&&along<best.along)){
    best={offsetMeters:d,along,segment:i};
   }
  }
  return best;
 }
 function instructionFor(maneuvers,offsets,along,lastIndex,accuracy){
  if(!maneuvers.length)return null;
  const margin=Math.max(10,Math.min(22,Number.isFinite(accuracy)?accuracy*.4:12));
  const passedLimit=along-margin;
  let next=maneuvers.length-1;
  for(let i=1;i<maneuvers.length;i++){
   const pos=offsets[Math.min(offsets.length-1,Math.max(0,maneuvers[i].begin_shape_index||0))];
   if(pos>passedLimit){next=i;break;}
  }
  // Never move back to an earlier instruction because of a transient GPS jump.
  next=Math.max(Math.min(lastIndex||1,maneuvers.length-1),next);
  const target=maneuvers[next];
  const at=offsets[Math.min(offsets.length-1,Math.max(0,target.begin_shape_index||0))];
  return {index:next,maneuver:target,metres:Math.max(0,at-along)};
 }
 function turnSymbol(type){
  if([9,10,11,18,20,23,37].includes(type))return '↱';
  if([14,15,16,19,21,24,38].includes(type))return '↰';
  if([12,13].includes(type))return '⤴';
  if([26,27].includes(type))return '↻';
  if([4,5,6].includes(type))return '⌖';
  return '↑';
 }
 function distanceLabel(metres){
  const n=Math.max(0,metres||0);
  return n<15?'Now':n<1000?Math.round(n/10)*10+' m':(n/1000).toFixed(1)+' km';
 }
 window.BudMapNavMath={distance,cumulative,nearestOnRoute,instructionFor,turnSymbol,distanceLabel};
})();
