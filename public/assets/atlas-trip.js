/* Amsterdam Coffeeshop Atlas — opt-in hotel, GPS and walking route tools.
   Saved hotel stays on this device. Live GPS stays in memory and is only sent
   to an external routing provider when the visitor explicitly requests a route.
   Photon searches send the typed hotel query and the map centre. */
(function(){
 'use strict';
 if(typeof L==='undefined'||typeof map==='undefined'||!map||!window.BudMapNavMath)return;
 const navMath=window.BudMapNavMath;
 const STORAGE='atlas-my-hotel-v1';
 const SETUP_KEY='atlas-first-hotel-prompt-v1';
 let welcomeActive=false;
 const $=id=>document.getElementById(id);
 const escTrip=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 let hotel=null,hotelMarker=null,hotelLayer=L.layerGroup().addTo(map),searchLayer=L.layerGroup().addTo(map);
 let locationMarker=null,accuracyCircle=null,gpsWatch=null,locationFix=null,walkingShape=null,walkingInfo=null,lastShop=null,maneuvers=[],gpsFollow=false;
 let walkingProgress=null,previousProgressFix=null,nextManeuverIndex=1,arrived=false;
 let hotelLookupController=null,hotelLookupSequence=0,routeController=null,routeSequence=0;
 const validPoint=(lat,lng)=>Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=52.1&&lat<=52.55&&lng>=4.55&&lng<=5.3;
 try{const h=JSON.parse(localStorage.getItem(STORAGE)||'null');if(h&&validPoint(h.lat,h.lng)&&typeof h.name==='string')hotel=h;}catch{}
 const wrap=document.createElement('div');wrap.className='tripTools';
 wrap.innerHTML='<button type="button" id="tripToggle" class="floating" aria-label="My hotel and routes" title="My hotel and routes" aria-expanded="false" aria-controls="tripPanel"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/></svg></button>'+
 '<section class="tripPanel hidden" id="tripPanel" aria-label="Hotel and route planner">'+
 '<div class="tripHead"><b>My Amsterdam trip</b><button type="button" id="tripClose" aria-label="Close trip planner">×</button></div>'+ 
 '<div id="tripWelcome" class="tripWelcome hidden"><b>Welcome to Amsterdam!</b><p>Start by choosing your hotel. We’ll save it on this device, so you can plan routes to coffeeshops from there.</p><button type="button" id="tripSkipWelcome">Skip for now →</button></div>'+
 '<div class="tripHotel" id="tripHotelState"></div>'+
 '<details id="tripHotelFinder" class="tripHotelFinder"><summary id="tripHotelFinderLabel">Find or change accommodation</summary><div class="tripFinderBody">'+
 '<label class="tripLabel" for="hotelSearch">Search Amsterdam accommodation</label>'+
 '<div class="tripSearch"><input id="hotelSearch" type="search" autocomplete="off" placeholder="Hotel name or address…"><button type="button" id="hotelFind">Find</button></div>'+
 '<div class="tripRow tripSearchActions"><button type="button" id="nearbyHotels">Nearby hotels</button><button type="button" id="hideHotelPins">Clear search pins</button><button type="button" id="hotelByTap">⌖ Pick on map</button></div><div id="hotelMatches" class="hotelMatches" role="status"></div>'+
 '</div></details>'+
 '<div class="tripGPSActions"><button type="button" id="gpsToggle">◎ Start live location</button></div>'+
 '<p class="tripNote tripGPSMessage" id="gpsMessage" role="status">GPS is off. Only enabled with your permission.</p>'+
 '<div class="tripRoute hidden" id="tripRoute">'+
 '<div class="tripRouteHead"><b>Walking route</b><button type="button" id="routeClose">×</button></div>'+
 '<div id="tripRouteSummary"></div><p class="tripRouteCaution">Walking paths come from OpenStreetMap. Use marked pavements and legal crossings. Never follow a route through traffic or restricted land. Accessibility and stairs have not been independently checked.</p><div id="tripRouteSteps"></div>'+
 '<div class="tripRow"><button type="button" id="startNavigation">▶ Start GPS guidance</button><button type="button" id="routeRefresh">Replan</button><a id="googleWalkFallback" target="_blank" rel="noopener">Google Maps</a></div>'+
 '</div>'+
 '<details class="tripPrivacy"><summary>Privacy & navigation info</summary><p class="tripNote">Your hotel stays on this device. Searches use Photon/OpenStreetMap. Walking routes send coordinates to a routing service. GPS needs your permission and only runs while the page is open. Check street crossings and use a dedicated navigation app when needed.</p></details>'+
 '</section>';
 (document.getElementById('topHotelSlot')||document.querySelector('.mapWrap')).appendChild(wrap);
 const navigationBanner=document.createElement('aside');
 navigationBanner.id='budmapNavBanner';
 navigationBanner.className='budmapNavBanner hidden';
 navigationBanner.setAttribute('aria-label','Live walking turn directions');
 navigationBanner.innerHTML='<div class="budmapNavSymbol" id="budmapNavSymbol" aria-hidden="true">↑</div>'
  +'<div class="budmapNavCopy"><small id="budmapNavLabel">WALKING NAVIGATION</small>'
  +'<strong id="budmapNavInstruction" role="status" aria-live="polite">Locating you…</strong>'
  +'<span id="budmapNavDistance" aria-live="off">Waiting for GPS</span></div>'
  +'<div class="budmapNavButtons"><button type="button" id="budmapNavReplan" aria-label="Replan walking route from my location" title="Replan route">↻</button>'
  +'<button type="button" id="budmapNavStop" aria-label="Stop walking guidance" title="Stop guidance">×</button></div>';
 document.querySelector('.mapWrap').appendChild(navigationBanner);
 const setBanner=(symbol,instruction,distance,label='NEXT TURN',warning=false)=>{
  if(!gpsFollow)return;
  navigationBanner.classList.remove('hidden');
  navigationBanner.classList.toggle('warning',warning);
  document.querySelector('.mapWrap').classList.add('nav-guiding');
  $('budmapNavSymbol').textContent=symbol;
  $('budmapNavLabel').textContent=label;
  // Screen readers announce turn changes, not every GPS distance update.
  if($('budmapNavInstruction').textContent!==instruction)$('budmapNavInstruction').textContent=instruction;
  $('budmapNavDistance').textContent=distance;
 };
 const hideBanner=()=>{
  navigationBanner.classList.add('hidden');
  document.querySelector('.mapWrap').classList.remove('nav-guiding');
 };
 const endGuidance=()=>{
  gpsFollow=false;
  hideBanner();
  $('startNavigation').textContent='▶ Start GPS guidance';
 };
 $('budmapNavStop').onclick=()=>{
  endGuidance();
  showMessage('Turn guidance stopped. Live GPS can remain on.');
 };
 $('budmapNavReplan').onclick=()=>{
  if(lastShop)planTo(lastShop,locationFix||hotel);
 };

 const tripVisible=()=>{
  const open=!document.getElementById('tripPanel').classList.contains('hidden');
  document.querySelector('.mapWrap')?.classList.toggle('trip-open',open);
 };
 new MutationObserver(tripVisible).observe(document.getElementById('tripPanel'),{attributes:true,attributeFilter:['class']});
 const showMessage=t=>{$('gpsMessage').textContent=t};
 const markerIcon=L.divIcon({className:'hotelPin',html:'<span aria-hidden="true">⌂</span>',iconSize:[31,35],iconAnchor:[15,33]});
 function clearHotel(){
  if(!hotel)return;
  if(!window.confirm('Remove "'+hotel.name+'" as your saved accommodation?'))return;
  hotel=null;
  try{localStorage.removeItem(STORAGE)}catch{}
  if(!$('tripRoute').classList.contains('hidden'))closeRoute();
  updateHotelUI();
  showMessage('Saved accommodation removed. Choose another place to plan walks from your hotel.');
 }
 function updateHotelUI(){
  const state=$('tripHotelState'),finder=$('tripHotelFinder');
  if(hotel){
   state.innerHTML='<div class="tripHotelCopy"><b>⌂ '+escTrip(hotel.name)+'</b><small>Saved starting point · ready for walking routes</small></div>';
   const remove=document.createElement('button');
   remove.type='button';remove.className='tripHotelRemove';
   remove.setAttribute('aria-label','Remove saved accommodation: '+hotel.name);
   remove.title='Remove saved accommodation';remove.textContent='×';
   remove.addEventListener('click',clearHotel);
   state.appendChild(remove);
  }else{
   state.innerHTML='<div class="tripHotelCopy"><b>No accommodation saved</b><small>Find a hotel or pick a point on the map.</small></div>';
  }
  finder.open=!hotel;
  $('tripHotelFinderLabel').textContent=hotel?'Change accommodation':'Find accommodation';
  hotelLayer.clearLayers();hotelMarker=null;
  if(hotel){
   hotelMarker=L.marker([hotel.lat,hotel.lng],{icon:markerIcon,title:'My hotel: '+hotel.name}).bindPopup('<b>My hotel: '+escTrip(hotel.name)+'</b>').addTo(hotelLayer);
  }
 }
 function markWelcomeDone(){
  welcomeActive=false;
  $('tripWelcome').classList.add('hidden');
  try{localStorage.setItem(SETUP_KEY,'seen')}catch{}
 }
 function closeWelcome(){
  if(!welcomeActive)return;
  markWelcomeDone();
 }
 function saveHotel(name,lat,lng,address){
  if(!validPoint(lat,lng))return;
  const wasWelcome=welcomeActive;
  if(!$('tripRoute').classList.contains('hidden'))closeRoute();
  hotel={name:String(name).slice(0,110),address:String(address||'').slice(0,180),lat,lng};
  try{localStorage.setItem(STORAGE,JSON.stringify(hotel));}catch{}
  $('hotelMatches').innerHTML='';
  updateHotelUI();map.flyTo([lat,lng],15);
  showMessage('Hotel saved on this device. Choose a coffeeshop to plan a walk from here.');
  if(wasWelcome){markWelcomeDone();$('tripPanel').classList.add('hidden');$('tripToggle').setAttribute('aria-expanded','false');}
 }
 function addressFor(p){
  return [p.street&&(p.street+' '+(p.housenumber||'')),p.postcode,p.city||p.district].filter(Boolean).join(', ');
 }
 async function hotelLookup(){
  const q=$('hotelSearch').value.trim();
  hotelLookupSequence++;
  hotelLookupController?.abort();
  if(q.length<3){$('hotelMatches').textContent='Enter at least three characters.';return;}
  const sequence=hotelLookupSequence,ctrl=new AbortController();
  hotelLookupController=ctrl;
  $('hotelFind').disabled=true;
  $('hotelMatches').textContent='Searching hotels…';
  searchLayer.clearLayers();
  const centre=map.getCenter();
  const url=new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q',/\bamsterdam\b/i.test(q)?q:q+' Amsterdam');url.searchParams.set('limit','12');
  url.searchParams.set('lat',centre.lat.toFixed(4));url.searchParams.set('lon',centre.lng.toFixed(4));
  url.searchParams.set('lang','en');
  const timer=setTimeout(()=>ctrl.abort(),12500);
  try{
   const res=await fetch(url.toString(),{signal:ctrl.signal});
   if(!res.ok)throw Error('Hotel search is currently unavailable');
   const data=await res.json();
   if(sequence!==hotelLookupSequence)return;
   const matches=(data.features||[]).filter(f=>{
    const [lng,lat]=f.geometry?.coordinates||[];
    return validPoint(lat,lng)&&f.properties?.name;
   }).slice(0,12);
   $('hotelMatches').innerHTML='';
   if(!matches.length){$('hotelMatches').textContent='No matches. Try an address, or use Pick on map.';return;}
   for(const item of matches){
    const [lng,lat]=item.geometry.coordinates,p=item.properties;
    const name=p.name,address=addressFor(p),label=(p.osm_value==='hotel'?'Hotel · ':'')+name;
    const button=document.createElement('button');button.type='button';button.className='hotelMatch';
    button.innerHTML='<strong>'+escTrip(label)+'</strong><small>'+escTrip(address||'Amsterdam')+'</small>';
    button.onclick=()=>saveHotel(name,lat,lng,address);
    $('hotelMatches').append(button);
    const mark=L.circleMarker([lat,lng],{radius:6,color:'#fff',weight:2,fillColor:'#2676ae',fillOpacity:1}).addTo(searchLayer);
    mark.bindPopup('<b>'+escTrip(name)+'</b><br>'+escTrip(address)+'<br><button class="hotelPick" type="button">Choose hotel</button>');
    mark.on('popupopen',e=>e.popup.getElement().querySelector('.hotelPick').onclick=()=>saveHotel(name,lat,lng,address));
   }
  }catch(e){
   if(sequence!==hotelLookupSequence)return;
   $('hotelMatches').textContent=ctrl.signal.aborted?'Hotel search timed out. Try again or pick your hotel on the map.':'Hotel search unavailable. Use Pick on map to save your hotel instead.';
  }finally{
   clearTimeout(timer);
   if(sequence===hotelLookupSequence){hotelLookupController=null;$('hotelFind').disabled=false;}
  }
 }
 let chooseTap=false;
 function hotelByMap(){
  const duringWelcome=welcomeActive;
  chooseTap=true;$('tripPanel').classList.add('hidden');$('tripToggle').setAttribute('aria-expanded','false');
  showMessage('Tap the hotel entrance on the map.');
  map.once('click',event=>{
   if(!chooseTap)return;chooseTap=false;
   const name=window.prompt('Hotel name (saved on this device):','My hotel');
   if(name&&name.trim())saveHotel(name.trim(),event.latlng.lat,event.latlng.lng,'Pin selected on map');
   if(!duringWelcome||!hotel){$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');}
  });
 }
 function setLocation(lat,lng,accuracy,follow){
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
  locationFix={lat,lng,accuracy};
  myPos=[lat,lng];
  if(!locationMarker){
   locationMarker=L.circleMarker([lat,lng],{radius:8,color:'#fff',weight:3,fillColor:'#2778d5',fillOpacity:1}).bindPopup('My live location').addTo(map);
   accuracyCircle=L.circle([lat,lng],{radius:accuracy||20,color:'#2778d5',weight:1,fillOpacity:.08,interactive:false}).addTo(map);
  }else{locationMarker.setLatLng([lat,lng]);accuracyCircle.setLatLng([lat,lng]);accuracyCircle.setRadius(Math.max(accuracy||20,10));}
  if(follow)map.flyTo([lat,lng],16);else if(gpsFollow&&walkingInfo)map.panTo([lat,lng],{animate:true,duration:.3});
  showMessage('Live GPS on · accuracy roughly '+Math.round(accuracy||0)+' m. Stop it when finished.');
  if(walkingInfo)updateWalkingProgress();
 }
 function stopGPS(){
  if(gpsWatch!==null){try{navigator.geolocation?.clearWatch(gpsWatch)}catch(e){}gpsWatch=null;}
  endGuidance();
  locationFix=null;
  if(locationMarker){map.removeLayer(locationMarker);locationMarker=null;}
  if(accuracyCircle){map.removeLayer(accuracyCircle);accuracyCircle=null;}
  $('gpsToggle').textContent='◎ Start live location';
  if($('startNavigation'))$('startNavigation').textContent='▶ Start GPS guidance';
  showMessage('Live GPS stopped. No current position is being tracked.');
 }
 function startGPS(){
  if(gpsWatch!==null){stopGPS();return false;}
  if(!navigator.geolocation){showMessage('This browser does not support live GPS. Use Google Maps for navigation.');return false;}
  showMessage('Requesting location permission…');
  try{
   gpsWatch=navigator.geolocation.watchPosition(
    pos=>setLocation(pos.coords.latitude,pos.coords.longitude,pos.coords.accuracy,false),
    err=>{stopGPS();$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');showMessage('Live GPS could not start: '+(err.code===1?'permission denied':'try again outdoors or use Google Maps'))},
    {enableHighAccuracy:true,maximumAge:2500,timeout:17000}
   );
  }catch(e){stopGPS();showMessage('Live GPS could not start. Use Google Maps for navigation.');return false;}
  $('gpsToggle').textContent='■ Stop live location';
  return true;
 }
 function decodePolyline6(str){
  let index=0,lat=0,lng=0,points=[];
  while(index<str.length){
   const read=()=>{
    let result=0,shift=0,b;
    do{b=str.charCodeAt(index++)-63;result|=(b&31)<<shift;shift+=5;}while(b>=32&&index<str.length);
    return (result&1)?~(result>>1):(result>>1);
   };
   lat+=read();lng+=read();points.push([lat/1e6,lng/1e6]);
  }return points;
 }
 function googleFrom(s,start){
  const u=new URL(directions(s,'walking'));
  if(start&&validPoint(start.lat,start.lng))u.searchParams.set('origin',start.lat+','+start.lng);
  else if(hotel)u.searchParams.set('origin',hotel.lat+','+hotel.lng);
  return u.toString();
 }
 async function planTo(s,startSource){
  if(!s)return;
  if(!Number.isFinite(s.lat)||!Number.isFinite(s.lng)){
   $('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');
   showMessage('This shop is still being located. Open it in Google Maps for walking directions.');
   $('googleWalkFallback').href=googleFrom(s,startSource||hotel||locationFix);
   $('tripRoute').classList.remove('hidden');
   $('tripRouteSummary').textContent='Atlas walking route is not ready for this address.';
   $('tripRouteSteps').textContent='Use the Google Maps link to get directions while its map pin is being checked.';
   return;
  }
  if(!startSource){
   if(hotel)startSource=hotel;
   else if(locationFix)startSource=locationFix;
  }
  if(!startSource){$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');showMessage('Save a hotel or enable live location to plan a walk.');return;}
  if(!lastShop||lastShop.id!==s.id)endGuidance();
  lastShop=s;
  const sequence=++routeSequence;
  routeController?.abort();
  if(walkingShape){map.removeLayer(walkingShape);walkingShape=null;}
  walkingInfo=null;maneuvers=[];walkingProgress=null;previousProgressFix=null;nextManeuverIndex=1;arrived=false;
  if(gpsFollow)setBanner('↻','Replanning walking route…','Using your latest GPS position','REPLANNING');
  else{$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');}
  $('tripRoute').classList.remove('hidden');$('tripRouteSummary').textContent='Planning walking route…';$('tripRouteSteps').innerHTML='';
  $('googleWalkFallback').href=googleFrom(s,startSource);
  const body={locations:[{lat:startSource.lat,lon:startSource.lng},{lat:s.lat,lon:s.lng}],costing:'pedestrian',costing_options:{pedestrian:{walkway_factor:.8,sidewalk_factor:.8,alley_factor:3,driveway_factor:7,max_hiking_difficulty:0}},units:'kilometers',directions_options:{language:'en-US',units:'kilometers'}};
  try{
   const controller=new AbortController();
   routeController=controller;
   const timer=setTimeout(()=>controller.abort(),13000);
   let response;
   try{response=await fetch('https://valhalla1.openstreetmap.de/route',{method:'POST',headers:{'content-type':'application/json','X-Client-Id':'amsterdam-coffeeshop-atlas.pages.dev'},body:JSON.stringify(body),signal:controller.signal});}finally{clearTimeout(timer)}
   if(!response.ok)throw Error('Walking route unavailable ('+response.status+')');
   const json=await response.json();
   if(sequence!==routeSequence)return;
   const leg=json.trip?.legs?.[0],shape=leg?.shape&&decodePolyline6(leg.shape);
   if(!shape||shape.length<2)throw Error('Routing provider supplied no walkable route');
   if(walkingShape)map.removeLayer(walkingShape);
   walkingShape=L.polyline(shape,{color:'#1581c1',weight:5,opacity:.86}).addTo(map);
   walkingInfo={shape,destination:s,offsets:navMath.cumulative(shape)};
   maneuvers=Array.isArray(leg.maneuvers)?leg.maneuvers:[];
   map.fitBounds(walkingShape.getBounds(),{padding:[30,30],maxZoom:16});
   const summary=json.trip.summary||leg.summary||{};
   $('tripRouteSummary').textContent='To '+(s.name||s.address)+' · '+Number(summary.length||0).toFixed(2)+' km · about '+Math.round(Number(summary.time||0)/60)+' min walking.';
   $('tripRouteSteps').innerHTML=maneuvers.slice(0,14).map((step,i)=>'<div class="tripStep"><b>'+(i+1)+'.</b> '+escTrip(step.instruction||step.verbal_pre_transition_instruction||'Continue')+'</div>').join('');
   updateWalkingProgress();
  }catch(error){
   if(sequence!==routeSequence)return;
   walkingInfo=null;
   if(gpsFollow)setBanner('!','Could not replan this walk','Open the planner for Google Maps or try again','ROUTE UNAVAILABLE',true);
   $('tripRouteSummary').textContent='Could not draw a walking route here. Google Maps can still guide you.';
   $('tripRouteSteps').textContent=error?.name==='AbortError'?'Routing timed out. Use Google Maps or tap Replan.':'This route is unavailable from the map provider. Use Google Maps or tap Replan.';
  }finally{
   if(sequence===routeSequence)routeController=null;
  }
 }
 function updateWalkingProgress(){
  if(!walkingInfo||!locationFix||!maneuvers.length)return;
  const fix=locationFix,accuracy=Number.isFinite(fix.accuracy)?Math.max(0,fix.accuracy):80;
  const projected=navMath.nearestOnRoute(walkingInfo.shape,walkingInfo.offsets,fix);
  if(!projected)return;
  const offRouteLimit=Math.max(42,Math.min(110,accuracy*1.8));
  const offRoute=projected.offsetMeters>offRouteLimit,poorSignal=accuracy>65;
  if(offRoute||poorSignal){
   const warning=offRoute?'You may be off the walking route':'GPS accuracy is too low';
   const followUp=offRoute?'Tap ↻ to replan from here, or check Google Maps.':'Move into a clearer area and check your location.';
   if(gpsFollow)setBanner('!',warning,followUp,offRoute?'OFF ROUTE':'WEAK GPS',true);
   $('tripRouteSteps').innerHTML='<div class="tripOffRoute">'+escTrip(warning)+'. '+escTrip(followUp)+'</div>';
   return; // An unreliable GPS fix must not advance the next turn.
  }
  if(walkingProgress===null)walkingProgress=projected.along;
  else{
   // Clamp big jumps and never move backwards because of GPS drift.
   const moved=previousProgressFix?navMath.distance([previousProgressFix.lat,previousProgressFix.lng],[fix.lat,fix.lng]):0;
   const allowed=Math.max(12,Math.min(42,moved*1.6+8));
   walkingProgress=Math.max(walkingProgress,Math.min(projected.along,walkingProgress+allowed));
  }
  previousProgressFix={lat:fix.lat,lng:fix.lng};
  const remaining=Math.max(0,walkingInfo.offsets[walkingInfo.offsets.length-1]-walkingProgress);
  const dest=walkingInfo.destination,destDistance=navMath.distance([fix.lat,fix.lng],[dest.lat,dest.lng]);
  if(accuracy<=35&&remaining<17&&destDistance<20){
   arrived=true;
   $('tripRouteSteps').innerHTML='<div class="tripStep"><b>Arrived:</b> Check the entrance and address of '+escTrip(dest.name||dest.address)+'.</div>';
   if(gpsFollow)setBanner('⌖','You have reached your destination',dest.name||dest.address,'ARRIVED');
   return;
  }
  if(arrived)return; // Do not jump back to an old instruction after arrival.
  const next=navMath.instructionFor(maneuvers,walkingInfo.offsets,walkingProgress,nextManeuverIndex,accuracy);
  if(!next)return;
  nextManeuverIndex=next.index;
  const instruction=next.maneuver.instruction||next.maneuver.verbal_pre_transition_instruction||'Continue on the walking route';
  const label=navMath.distanceLabel(next.metres);
  if(gpsFollow)setBanner(navMath.turnSymbol(next.maneuver.type),instruction,
   label==='Now'?'Turn now':'In '+label,'NEXT TURN');
  $('tripRouteSteps').innerHTML='<div class="tripStep"><b>Next:</b> '+escTrip(instruction)+' · '+escTrip(label)+'</div>'
   +maneuvers.slice(next.index+1,next.index+5).map(m=>'<div class="tripStep">'+escTrip(m.instruction||'Continue')+'</div>').join('');
 }
 function closeRoute(){routeSequence++;routeController?.abort();routeController=null;endGuidance();walkingInfo=null;maneuvers=[];walkingProgress=null;previousProgressFix=null;arrived=false;if(walkingShape){map.removeLayer(walkingShape);walkingShape=null;}$('tripRoute').classList.add('hidden')}
 $('tripToggle').onclick=()=>{const open=$('tripPanel').classList.contains('hidden');if(!open)closeWelcome();$('tripPanel').classList.toggle('hidden',!open);$('tripToggle').setAttribute('aria-expanded',String(open))};
 $('tripSkipWelcome').onclick=()=>{markWelcomeDone();$('tripPanel').classList.add('hidden');$('tripToggle').setAttribute('aria-expanded','false')};
 $('tripClose').onclick=()=>$('tripToggle').click();
 $('hotelFind').onclick=hotelLookup;$('nearbyHotels').onclick=()=>{$('hotelSearch').value='hotel';hotelLookup()};$('hideHotelPins').onclick=()=>{searchLayer.clearLayers();$('hotelMatches').innerHTML=''};
 $('hotelSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();hotelLookup()}});
 $('hotelByTap').onclick=hotelByMap;
 $('gpsToggle').onclick=startGPS;
 $('routeClose').onclick=closeRoute;
 $('routeRefresh').onclick=()=>{if(lastShop)planTo(lastShop,locationFix||hotel)};
 $('startNavigation').onclick=()=>{
  if(!walkingInfo){showMessage('Plan a walking route first.');return;}
  if(gpsFollow){
   endGuidance();
   showMessage('Map following stopped. Live location can stay on.');return;
  }
  if(gpsWatch===null&&!startGPS())return;
  gpsFollow=true;$('startNavigation').textContent='■ Stop following';
  setBanner('◎','Waiting for your GPS position','Checking your location…','GETTING LOCATION');
  if(locationFix){map.panTo([locationFix.lat,locationFix.lng]);updateWalkingProgress();}
  // Keep the top of the screen clear during active walking guidance.
  $('tripPanel').classList.add('hidden');$('tripToggle').setAttribute('aria-expanded','false');
  showMessage('GPS guidance active. Follow the bottom banner and check crossings.');
 };
 window.addEventListener('pagehide',stopGPS);
 updateHotelUI();
 let shouldPrompt=false;
 try{shouldPrompt=!hotel&&!localStorage.getItem(SETUP_KEY)}catch{shouldPrompt=!hotel}
 if(shouldPrompt){
  welcomeActive=true;
  $('tripWelcome').classList.remove('hidden');
  $('tripPanel').classList.remove('hidden');
  $('tripToggle').setAttribute('aria-expanded','true');
 }
 tripVisible();
 window.AtlasTrip={planTo,hotel:()=>hotel,gps:()=>locationFix,open:()=>{$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true')},fromGPS:s=>{if(locationFix)planTo(s,locationFix);else{$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');showMessage('Enable live GPS, then select this shop again to route from your position.')}}};
})();