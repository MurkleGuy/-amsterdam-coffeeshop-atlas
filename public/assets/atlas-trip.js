/* Amsterdam Coffeeshop Atlas — opt-in hotel, GPS and walking route tools.
   Saved hotel stays on this device. Live GPS stays in memory and is only sent
   to an external routing provider when the visitor explicitly requests a route.
   Photon searches send the typed hotel query and the map centre. */
(function(){
 'use strict';
 if(typeof L==='undefined'||typeof map==='undefined'||!map)return;
 const STORAGE='atlas-my-hotel-v1';
 const $=id=>document.getElementById(id);
 const escTrip=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 let hotel=null,hotelMarker=null,hotelLayer=L.layerGroup().addTo(map),searchLayer=L.layerGroup().addTo(map);
 let locationMarker=null,accuracyCircle=null,gpsWatch=null,locationFix=null,walkingShape=null,walkingInfo=null,lastShop=null,maneuvers=[],gpsFollow=false;
 const validPoint=(lat,lng)=>Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=52.1&&lat<=52.55&&lng>=4.55&&lng<=5.3;
 try{const h=JSON.parse(localStorage.getItem(STORAGE)||'null');if(h&&validPoint(h.lat,h.lng)&&typeof h.name==='string')hotel=h;}catch{}
 const wrap=document.createElement('div');wrap.className='tripTools';
 wrap.innerHTML='<button type="button" id="tripToggle" class="floating" aria-expanded="false" aria-controls="tripPanel">⌂ My trip</button>'+
 '<section class="tripPanel hidden" id="tripPanel" aria-label="Hotel and route planner">'+
 '<div class="tripHead"><b>My Amsterdam trip</b><button type="button" id="tripClose" aria-label="Close trip planner">×</button></div>'+
 '<div class="tripHotel" id="tripHotelState"></div>'+
 '<label class="tripLabel" for="hotelSearch">Find your hotel</label>'+
 '<div class="tripSearch"><input id="hotelSearch" type="search" autocomplete="off" placeholder="Hotel name or address…"><button type="button" id="hotelFind">Find</button></div>'+
 '<div class="tripRow"><button type="button" id="nearbyHotels">Show nearby hotels</button><button type="button" id="hideHotelPins">Hide search pins</button></div><div id="hotelMatches" class="hotelMatches" role="status"></div>'+
 '<div class="tripRow"><button type="button" id="hotelByTap">⌖ Pick on map</button><button type="button" id="hotelClear">Forget hotel</button></div>'+
 '<div class="tripRow"><button type="button" id="gpsToggle">◎ Start live location</button><button type="button" id="gpsCentre">Centre</button></div>'+
 '<p class="tripNote" id="gpsMessage">GPS is off. Your browser will ask permission when you turn it on.</p>'+
 '<div class="tripRoute hidden" id="tripRoute">'+
 '<div class="tripRouteHead"><b>Walking route</b><button type="button" id="routeClose">×</button></div>'+
 '<div id="tripRouteSummary"></div><p class="tripRouteCaution">Walking paths come from OpenStreetMap. Use marked pavements and legal crossings. Never follow a route through traffic or restricted land. Accessibility and stairs have not been independently checked.</p><div id="tripRouteSteps"></div>'+
 '<div class="tripRow"><button type="button" id="startNavigation">▶ Start GPS guidance</button><button type="button" id="routeRefresh">Replan</button><a id="googleWalkFallback" target="_blank" rel="noopener">Google Maps</a></div>'+
 '</div>'+
 '<p class="tripNote">Hotel details stay on this device. Hotel search uses Photon/OSM. Planning a walk sends the start and destination coordinates to a public walking-route service. GPS only works with permission while this page is open. Do not use this as a safety-critical navigation app.</p>'+
 '</section>';
 document.querySelector('.mapWrap').appendChild(wrap);
 const showMessage=t=>{$('gpsMessage').textContent=t};
 const markerIcon=L.divIcon({className:'hotelPin',html:'<span aria-hidden="true">⌂</span>',iconSize:[31,35],iconAnchor:[15,33]});
 function updateHotelUI(){
  if(hotel){
   $('tripHotelState').innerHTML='<b>⌂ '+escTrip(hotel.name)+'</b><small>Saved as your starting point. Tap any coffeeshop and choose “Walk from hotel”.</small>';
  }else $('tripHotelState').innerHTML='<span>No hotel saved yet. Search for it or choose a point on the map.</span>';
  $('hotelClear').disabled=!hotel;
  hotelLayer.clearLayers();
  if(hotel){
   hotelMarker=L.marker([hotel.lat,hotel.lng],{icon:markerIcon,title:'My hotel: '+hotel.name}).bindPopup('<b>My hotel: '+escTrip(hotel.name)+'</b>').addTo(hotelLayer);
  }
 }
 function saveHotel(name,lat,lng,address){
  if(!validPoint(lat,lng))return;
  hotel={name:String(name).slice(0,110),address:String(address||'').slice(0,180),lat,lng};
  try{localStorage.setItem(STORAGE,JSON.stringify(hotel));}catch{}
  $('hotelMatches').innerHTML='';
  updateHotelUI();map.flyTo([lat,lng],15);
  showMessage('Hotel saved on this device. Choose a coffeeshop to plan a walk from here.');
 }
 function addressFor(p){
  return [p.street&&(p.street+' '+(p.housenumber||'')),p.postcode,p.city||p.district].filter(Boolean).join(', ');
 }
 async function hotelLookup(){
  const q=$('hotelSearch').value.trim();
  if(q.length<3){$('hotelMatches').textContent='Enter at least three characters.';return;}
  $('hotelMatches').textContent='Searching hotels…';
  const centre=map.getCenter();
  const url=new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q',q+' Amsterdam');url.searchParams.set('limit','12');
  url.searchParams.set('lat',centre.lat.toFixed(4));url.searchParams.set('lon',centre.lng.toFixed(4));
  url.searchParams.set('lang','en');
  try{
   const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12500);
   let res;try{res=await fetch(url.toString(),{signal:ctrl.signal});}finally{clearTimeout(timer)}
   if(!res.ok)throw Error('Hotel search is currently unavailable');
   const data=await res.json();
   const matches=(data.features||[]).filter(f=>{
    const [lng,lat]=f.geometry?.coordinates||[];
    return validPoint(lat,lng)&&f.properties?.name;
   }).slice(0,12);
   searchLayer.clearLayers();
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
  }catch(e){$('hotelMatches').textContent='Hotel search unavailable. Use Pick on map to save your hotel instead.'}
 }
 let chooseTap=false;
 function hotelByMap(){
  chooseTap=true;$('tripPanel').classList.add('hidden');$('tripToggle').setAttribute('aria-expanded','false');
  showMessage('Tap the hotel entrance on the map.');
  map.once('click',event=>{
   if(!chooseTap)return;chooseTap=false;
   const name=window.prompt('Hotel name (saved on this device):','My hotel');
   if(name&&name.trim())saveHotel(name.trim(),event.latlng.lat,event.latlng.lng,'Pin selected on map');
   $('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');
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
  if(gpsWatch!==null){navigator.geolocation.clearWatch(gpsWatch);gpsWatch=null;}
  $('gpsToggle').textContent='◎ Start live location';gpsFollow=false;if($('startNavigation'))$('startNavigation').textContent='▶ Start GPS guidance';
  showMessage('Live GPS stopped. Location is not saved.');
 }
 function startGPS(){
  if(gpsWatch!==null){stopGPS();return;}
  if(!navigator.geolocation){showMessage('This browser does not support live GPS.');return;}
  showMessage('Requesting location permission…');
  gpsWatch=navigator.geolocation.watchPosition(
   pos=>setLocation(pos.coords.latitude,pos.coords.longitude,pos.coords.accuracy,false),
   err=>{showMessage('Location unavailable: '+(err.code===1?'permission denied':'try again outdoors or with GPS enabled'));stopGPS()},
   {enableHighAccuracy:true,maximumAge:2500,timeout:17000}
  );
  $('gpsToggle').textContent='■ Stop live location';
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
 function googleFrom(s){
  const u=new URL(directions(s,'walking'));
  if(hotel){u.searchParams.set('origin',hotel.name+', '+(hotel.address||'Amsterdam'));}
  return u.toString();
 }
 async function planTo(s,startSource){
  if(!s||!Number.isFinite(s.lat)||!Number.isFinite(s.lng)){showMessage('This coffeeshop has no verified map coordinates yet. Try Google Maps.');return;}
  if(!startSource){
   if(hotel)startSource=hotel;
   else if(locationFix)startSource=locationFix;
  }
  if(!startSource){$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');showMessage('Save a hotel or enable live location to plan a walk.');return;}
  lastShop=s;
  $('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');
  $('tripRoute').classList.remove('hidden');$('tripRouteSummary').textContent='Planning walking route…';$('tripRouteSteps').innerHTML='';
  $('googleWalkFallback').href=googleFrom(s);
  const body={locations:[{lat:startSource.lat,lon:startSource.lng},{lat:s.lat,lon:s.lng}],costing:'pedestrian',costing_options:{pedestrian:{walkway_factor:.8,sidewalk_factor:.8,alley_factor:3,driveway_factor:7,max_hiking_difficulty:0}},units:'kilometers',directions_options:{language:'en-US',units:'kilometers'}};
  try{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),13000);
   let response;
   try{response=await fetch('https://valhalla1.openstreetmap.de/route',{method:'POST',headers:{'content-type':'application/json','X-Client-Id':'amsterdam-coffeeshop-atlas.pages.dev'},body:JSON.stringify(body),signal:controller.signal});}finally{clearTimeout(timer)}
   if(!response.ok)throw Error('Walking route unavailable ('+response.status+')');
   const json=await response.json(),leg=json.trip?.legs?.[0],shape=leg?.shape&&decodePolyline6(leg.shape);
   if(!shape||shape.length<2)throw Error('Routing provider supplied no walkable route');
   if(walkingShape)map.removeLayer(walkingShape);
   walkingShape=L.polyline(shape,{color:'#1581c1',weight:5,opacity:.86}).addTo(map);
   walkingInfo={shape,destination:s};
   maneuvers=leg.maneuvers||[];
   map.fitBounds(walkingShape.getBounds(),{padding:[30,30],maxZoom:16});
   const summary=json.trip.summary||leg.summary||{};
   $('tripRouteSummary').textContent='To '+(s.name||s.address)+' · '+Number(summary.length||0).toFixed(2)+' km · about '+Math.round(Number(summary.time||0)/60)+' min walking.';
   $('tripRouteSteps').innerHTML=maneuvers.slice(0,14).map((step,i)=>'<div class="tripStep"><b>'+(i+1)+'.</b> '+escTrip(step.instruction||step.verbal_pre_transition_instruction||'Continue')+'</div>').join('');
   updateWalkingProgress();
  }catch(error){
   walkingInfo=null;
   $('tripRouteSummary').textContent='Could not draw a walking route here. Google Maps can still guide you.';
   $('tripRouteSteps').textContent=String(error.message||'Routing unavailable');
  }
 }
 function updateWalkingProgress(){
  if(!walkingInfo||!locationFix||!maneuvers.length)return;
  const points=walkingInfo.shape;let nearest=0,smallest=Infinity;
  for(let i=0;i<points.length;i++){const d=(points[i][0]-locationFix.lat)**2+(points[i][1]-locationFix.lng)**2;if(d<smallest){smallest=d;nearest=i}}
  const routeOffsetMeters=Math.sqrt(smallest)*111000;
  const next=maneuvers.find(m=>m.begin_shape_index>=nearest)||maneuvers[maneuvers.length-1];
  const el=$('tripRouteSteps');
  if(el&&next)el.innerHTML=(routeOffsetMeters>125?'<div class="tripOffRoute">You may be off the walking route. Stop and check your surroundings; tap Replan or use Google Maps.</div>':'')+'<div class="tripStep"><b>Next:</b> '+escTrip(next.instruction||'Continue along the route')+'</div>'+maneuvers.filter(m=>m.begin_shape_index>nearest).slice(1,6).map(m=>'<div class="tripStep">'+escTrip(m.instruction||'Continue')+'</div>').join('');
 }
 function closeRoute(){gpsFollow=false;walkingInfo=null;maneuvers=[];if($('startNavigation'))$('startNavigation').textContent='▶ Start GPS guidance';if(walkingShape){map.removeLayer(walkingShape);walkingShape=null;}$('tripRoute').classList.add('hidden')}
 $('tripToggle').onclick=()=>{const open=$('tripPanel').classList.contains('hidden');$('tripPanel').classList.toggle('hidden',!open);$('tripToggle').setAttribute('aria-expanded',String(open))};
 $('tripClose').onclick=()=>$('tripToggle').click();
 $('hotelFind').onclick=hotelLookup;$('nearbyHotels').onclick=()=>{$('hotelSearch').value='hotel';hotelLookup()};$('hideHotelPins').onclick=()=>{searchLayer.clearLayers();$('hotelMatches').innerHTML=''};
 $('hotelSearch').addEventListener('keydown',e=>{if(e.key==='Enter')hotelLookup()});
 $('hotelByTap').onclick=hotelByMap;
 $('hotelClear').onclick=()=>{hotel=null;try{localStorage.removeItem(STORAGE)}catch{}updateHotelUI();showMessage('Saved hotel removed.')};
 $('gpsToggle').onclick=startGPS;
 $('gpsCentre').onclick=()=>{if(locationFix)map.flyTo([locationFix.lat,locationFix.lng],16);else showMessage('Turn on live location first.')};
 $('routeClose').onclick=closeRoute;
 $('routeRefresh').onclick=()=>{if(lastShop)planTo(lastShop,locationFix||hotel)};
 $('startNavigation').onclick=()=>{if(!walkingInfo){showMessage('Plan a walking route first.');return;}if(gpsFollow){gpsFollow=false;$('startNavigation').textContent='▶ Start GPS guidance';showMessage('Map following stopped. Live location can stay on.');return;}gpsFollow=true;$('startNavigation').textContent='■ Stop following';if(gpsWatch===null)startGPS();if(locationFix)map.panTo([locationFix.lat,locationFix.lng]);showMessage('GPS guidance is on while this page is open. Keep aware of your surroundings and cross safely.')};
 window.addEventListener('pagehide',stopGPS);
 updateHotelUI();
 window.AtlasTrip={planTo,hotel:()=>hotel,gps:()=>locationFix,open:()=>{$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true')},fromGPS:s=>{if(locationFix)planTo(s,locationFix);else{$('tripPanel').classList.remove('hidden');$('tripToggle').setAttribute('aria-expanded','true');showMessage('Enable live GPS, then select this shop again to route from your position.')}}};
})();