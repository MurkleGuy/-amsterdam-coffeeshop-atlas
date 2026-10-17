/* Hotel-first Amsterdam Atlas onboarding.
   No GPS request. Accommodation stays on this device. Hotel searches use Photon/OSM. */
(function(){
 'use strict';
 const HOTEL_KEY='atlas-my-hotel-v1', SEEN_KEY='atlas-first-hotel-prompt-v1';
 const $=id=>document.getElementById(id);
 const intro=$('introStage'),hotelStage=$('hotelStage'),feedback=$('hotelFeedback'),results=$('hotelResults');
 const input=$('hotelSearch'),submit=$('hotelSearchButton');
 let searchController=null,searchSequence=0;
 const validPoint=(lat,lng)=>Number.isFinite(lat)&&Number.isFinite(lng)&&lat>52.1&&lat<52.55&&lng>4.55&&lng<5.3;
 function existingHotel(){
  try{
   const value=JSON.parse(localStorage.getItem(HOTEL_KEY)||'null');
   if(value&&validPoint(value.lat,value.lng)&&typeof value.name==='string'&&value.name.trim())return value;
  }catch(e){}
  return null;
 }
 function savedHotelView(){
  const current=existingHotel();
  $('savedTrip').classList.toggle('hidden',!current);
  $('continueSaved').classList.toggle('hidden',!current);
  if(current){
   $('savedHotelName').textContent=current.name;
   $('chooseHotel').innerHTML='Change my accommodation <span aria-hidden="true">→</span>';
   $('exploreWithoutHotel').classList.add('hidden');
  }else{
   $('chooseHotel').innerHTML='Choose my accommodation <span aria-hidden="true">→</span>';
   $('exploreWithoutHotel').classList.remove('hidden');
  }
 }
 function showStage(which){
  const hotel=which==='hotel';
  intro.classList.toggle('hidden',hotel);
  hotelStage.classList.toggle('hidden',!hotel);
  $('stepTag').textContent=hotel?'STEP 2 OF 2':'STEP 1 OF 2';
  if(hotel)feedback.textContent='Search by hotel name, hostel, apartment or street address.';
  if(hotel&&window.innerWidth<650)hotelStage.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function mapUrl(){
  const qs=new URLSearchParams(window.location.search||'');
  const shop=(qs.get('shop')||'').trim().slice(0,110);
  return 'map.html?from=welcome&v=hotel-first-v1'+(shop?'&shop='+encodeURIComponent(shop):'');
 }
 function openMap(){
  try{localStorage.setItem(SEEN_KEY,'seen')}catch(e){}
  window.location.assign(mapUrl());
 }
 function chooseLocation(place){
  if(!validPoint(place.lat,place.lng))return false;
  const entry={name:String(place.name).slice(0,110),address:String(place.address||'').slice(0,180),lat:place.lat,lng:place.lng};
  try{
   localStorage.setItem(HOTEL_KEY,JSON.stringify(entry));
   localStorage.setItem(SEEN_KEY,'seen');
   if(!existingHotel())throw new Error('Saved hotel could not be verified');
  }catch(e){
   feedback.textContent='Your browser could not save this hotel. Allow site storage or try a normal browser tab.';
   feedback.classList.add('error');
   return false;
  }
  window.location.assign(mapUrl());
  return true;
 }
 const queryText=term=>/\bamsterdam\b/i.test(term)?term:term+' Amsterdam';
 function photonURL(q){
  const url=new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q',q);
  url.searchParams.set('limit','12');
  url.searchParams.set('lat','52.3702');
  url.searchParams.set('lon','4.8952');
  url.searchParams.set('lang','en');
  return url;
 }
 async function photonSearch(q,signal){
  const resp=await fetch(photonURL(q).toString(),{signal});
  if(!resp.ok)throw new Error('Search service temporarily unavailable');
  const data=await resp.json();
  return Array.isArray(data.features)?data.features:[];
 }
 function locationFromFeature(feature){
  const coords=feature.geometry?.coordinates;
  if(!Array.isArray(coords)||coords.length<2)return null;
  const lng=Number(coords[0]),lat=Number(coords[1]);
  if(!validPoint(lat,lng))return null;
  const p=feature.properties||{},name=String(p.name||[p.street,p.housenumber].filter(Boolean).join(' ')||'').trim();
  if(!name)return null;
  const isLodging=p.osm_key==='tourism'&&['hotel','hostel','guest_house','motel','apartment','resort','chalet'].includes(p.osm_value);
  const address=[p.street&&[p.street,p.housenumber].filter(Boolean).join(' '),p.postcode,p.city||p.district,p.country].filter(Boolean).join(', ');
  return{name,address,lat,lng,isLodging,osmType:p.osm_value||'',id:p.osm_id||0};
 }
 function uniqueLocations(features){
  const candidates=features.map(locationFromFeature).filter(Boolean);
  candidates.sort((a,b)=>Number(b.isLodging)-Number(a.isLodging));
  const seen=new Set();
  return candidates.filter(p=>{
   const key=p.name.toLowerCase()+'|'+p.lat.toFixed(4)+'|'+p.lng.toFixed(4);
   if(seen.has(key))return false;
   seen.add(key);return true;
  }).slice(0,12);
 }
 function renderResults(places){
  results.replaceChildren();
  for(const place of places){
   const button=document.createElement('button');
   button.type='button';button.className='hotel-result';
   button.setAttribute('aria-label','Choose '+place.name+', '+(place.address||'Amsterdam'));
   const symbol=document.createElement('span');symbol.className='result-icon';symbol.setAttribute('aria-hidden','true');symbol.textContent=place.isLodging?'⌂':'⌖';
   const copy=document.createElement('span');copy.className='result-copy';
   const heading=document.createElement('strong');heading.textContent=place.name;
   const detail=document.createElement('small');
   detail.textContent=(place.isLodging?'Accommodation · ':'Address / place · ')+(place.address||'Amsterdam region');
   const arrow=document.createElement('span');arrow.className='result-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='→';
   copy.append(heading,detail);button.append(symbol,copy,arrow);
   button.addEventListener('click',()=>chooseLocation(place));
   results.appendChild(button);
  }
 }
 async function searchHotel(){
  const term=input.value.trim();
  feedback.classList.remove('error');
  results.replaceChildren();
  if(term.length<3){feedback.textContent='Please enter at least three characters.';feedback.classList.add('error');return;}
  if(searchController)searchController.abort();
  searchController=new AbortController();
  const signal=searchController.signal,sequence=++searchSequence;
  submit.disabled=true;submit.textContent='Finding…';feedback.textContent='Searching accommodation and addresses near Amsterdam…';
  const timeout=setTimeout(()=>searchController.abort(),16000);
  try{
   let features=await photonSearch(queryText(term),signal);
   let places=uniqueLocations(features);
   if(!places.length&&!/\bamsterdam\b/i.test(term)){
    features=await photonSearch(term,signal);
    places=uniqueLocations(features);
   }
   if(sequence!==searchSequence)return;
   if(!places.length){
    feedback.textContent='No matching accommodation found. Try the full street address, or continue without saving a hotel.';
    return;
   }
   renderResults(places);
   feedback.textContent='Select your exact hotel or accommodation below to open the map.';
  }catch(e){
   if(sequence!==searchSequence)return;
   feedback.textContent=signal.aborted?'The search timed out. Please try again.':'Accommodation search is temporarily unavailable. Try again, or continue without saving a hotel.';
   feedback.classList.add('error');
  }finally{
   clearTimeout(timeout);
   if(sequence===searchSequence){submit.disabled=false;submit.textContent='Find';}
  }
 }
 $('chooseHotel').addEventListener('click',()=>showStage('hotel'));
 $('backToIntro').addEventListener('click',()=>{if(searchController)searchController.abort();showStage('intro');savedHotelView()});
 $('hotelForm').addEventListener('submit',e=>{e.preventDefault();searchHotel()});
 $('continueSaved').addEventListener('click',openMap);
 $('exploreWithoutHotel').addEventListener('click',openMap);
 $('skipHotel').addEventListener('click',openMap);
 window.addEventListener('pageshow',savedHotelView);
 savedHotelView();
})();