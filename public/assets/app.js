/* Amsterdam Coffeeshop Atlas — zero-build static site. */
(()=>{
'use strict';
const shops=Array.isArray(window.ATLAS_SHOPS)?window.ATLAS_SHOPS:[];
const $=id=>document.getElementById(id);
const FAV_KEY='coffeeshop-atlas-favourites-v1';
const COORD_KEY='coffeeshop-atlas-coordinates-v1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const area=s=>{const x=parseInt(s.postcode,10);if(x>=1100)return'Zuidoost';if(x>=1020&&x<1040)return'Noord';if(x>=1040&&x<1060)return'West';if(x>=1060&&x<1070)return'Nieuw-West';if(x>=1070&&x<1090)return'Zuid';if(x>=1090&&x<1100)return'Oost';return'Centrum';};
const name=s=>s.name||'Coffeeshop address · '+s.street+' '+s.number;
const initial=s=>name(s).trim().slice(0,1).toUpperCase();
const googleMaps=s=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.address);
const walking=s=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(s.address)+'&travelmode=walking';
const photoSource=s=>s.photo?'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(s.photo.file):'';
const photoUrl=s=>s.photo?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(s.photo.file)+'?width=850':'';
const dist=(a,b)=>{let r=Math.PI/180,dLat=(b[0]-a[0])*r,dLon=(b[1]-a[1])*r,lat1=a[0]*r,lat2=b[0]*r,h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 12742*Math.asin(Math.sqrt(h));};
const state={saved:new Set(),selected:null,tab:'all',query:'',zone:'all',nearby:null,coords:{},map:null,markers:{},cluster:null,disabledGeo:false,errors:0,waiting:0};
try{state.saved=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]').map(Number));}catch{}
try{state.coords=JSON.parse(localStorage.getItem(COORD_KEY)||'{}');}catch{}
shops.forEach(s=>{let c=state.coords[s.id];if(c&&Number.isFinite(c.lat)&&Number.isFinite(c.lng)&&c.lat>52.10&&c.lat<52.55&&c.lng>4.55&&c.lng<5.35){s.lat=c.lat;s.lng=c.lng;}});
const photoHtml=(s,cls='')=>s.photo?`<img class="${cls}" loading="lazy" src="${esc(photoUrl(s))}" alt="Historic photograph of ${esc(name(s))} storefront" referrerpolicy="no-referrer">`:'';
function cover(s,mode='thumb'){return s.photo?`<div class="${mode}">${photoHtml(s)}</div>`:`<div class="${mode} thumb-letter" aria-label="Photo not yet available">${esc(initial(s))}</div>`;}
function featured(){const ids=[47,97,40,81];$('featuredGrid').innerHTML=ids.map(id=>{const s=shops.find(x=>x.id===id);return `<article class="featured-card"><div class="cover">${photoHtml(s)}<span class="label">${esc(area(s))}</span></div><div class="featured-card-content"><h3>${esc(name(s))}</h3><div class="address">${esc(s.address)}</div><div class="featured-card-bottom"><button type="button" data-featured="${s.id}" aria-label="Find ${esc(name(s))} on map">Explore shop ↗</button><a class="credit-link" href="${esc(photoSource(s))}" target="_blank" rel="noopener">Photo credit ↗</a></div></div></article>`}).join('');
 $('featuredGrid').addEventListener('click',e=>{const b=e.target.closest('[data-featured]');if(!b)return;e.preventDefault();$('explore').scrollIntoView({behavior:'smooth'});selectPlace(Number(b.dataset.featured),true);});
 for(const p of document.querySelectorAll('[data-photo]')){let s=shops.find(x=>x.id===+p.dataset.photo);p.insertAdjacentHTML('afterbegin',photoHtml(s));}
 document.addEventListener('error',e=>{if(e.target?.tagName==='IMG'&&e.target.src.includes('wikimedia.org'))e.target.remove();},true);
}
function filtered(){let out=shops.filter(s=>(state.tab==='all'||state.saved.has(s.id))&&(state.zone==='all'||area(s)===state.zone)&&(!state.query||[s.name,s.street,s.address,s.postcode,area(s)].join(' ').toLowerCase().includes(state.query)));
 if(state.nearby){out.sort((a,b)=>(a.lat==null?1e6:dist(state.nearby,[a.lat,a.lng]))-(b.lat==null?1e6:dist(state.nearby,[b.lat,b.lng])));}else out.sort((a,b)=>(a.name||a.street).localeCompare(b.name||b.street));return out;}
function render(){const items=filtered();$('visibleCount').textContent=`${items.length} ${items.length===1?'place':'places'}`;$('savedCount').textContent=state.saved.size;$('shopList').innerHTML=items.length?items.map(s=>`<article class="shop-row ${state.selected===s.id?'selected':''}" tabindex="0" role="button" aria-label="See details for ${esc(name(s))}" data-shop="${s.id}">${cover(s)}<div><h4>${esc(name(s))}</h4><p>${esc(s.street)} ${esc(s.number)}${esc(s.suffix||'')} · ${esc(s.postcode)}</p><div class="mini-meta">${esc(area(s))}${state.nearby&&s.lat!=null?' · '+dist(state.nearby,[s.lat,s.lng]).toFixed(1)+' km':''}</div></div><button class="save-btn ${state.saved.has(s.id)?'saved':''}" type="button" data-save="${s.id}" aria-label="${state.saved.has(s.id)?'Remove':'Add'} ${esc(name(s))} ${state.saved.has(s.id)?'from':'to'} saved places">${state.saved.has(s.id)?'★':'☆'}</button></article>`).join(''):'<p class="no-results">No places match that search. Try another name, area or postcode.</p>';refreshMarkers(items);}
function save(){try{localStorage.setItem(FAV_KEY,JSON.stringify([...state.saved]))}catch{}}
function toggleSaved(id){if(state.saved.has(id))state.saved.delete(id);else state.saved.add(id);save();render();if(state.selected===id)showPanel(shops.find(s=>s.id===id));}
function showPanel(s){if(!s){$('placePanel').classList.add('is-hidden');return;}const panel=$('placePanel');panel.classList.remove('is-hidden');panel.innerHTML=`<div class="panel-cover">${s.photo?photoHtml(s):'<div class="panel-letter">'+esc(initial(s))+'</div>'}<button type="button" class="panel-close" id="panelClose" aria-label="Close place details">×</button></div><div class="panel-body"><span class="panel-overline">${esc(area(s))} · COFFEESHOP ATLAS</span><h3>${esc(name(s))}</h3><p class="panel-address">⌖ ${esc(s.address)}</p><div class="panel-help">Included on the published 2026 address reference. Name, current trading status, hours and appearance are not independently verified.</div><div class="panel-actions"><a class="primary" href="${walking(s)}" rel="noopener noreferrer" target="_blank">↗ Walking route</a><a href="${googleMaps(s)}" rel="noopener noreferrer" target="_blank">View in Google Maps</a><button type="button" id="panelSave">${state.saved.has(s.id)?'★ Saved place':'☆ Save this place'}</button><a href="${googleMaps(s)}" rel="noopener noreferrer" target="_blank">Check recent photos ↗</a></div>${s.photo?`<p class="panel-credit">Historic photo: ${esc(s.photo.author)}, ${esc(s.photo.license)}. <a href="${esc(photoSource(s))}" target="_blank" rel="noopener">Source &amp; license ↗</a></p>`:'<p class="panel-credit">A verified shop photo or official logo can be added later.</p>'}</div>`;
 $('panelClose').onclick=()=>{state.selected=null;showPanel(null);render();};$('panelSave').onclick=()=>toggleSaved(s.id);
}
function ensureMapReady(){
 const node=$('map'),rect=node.getBoundingClientRect();
 // Leaflet cannot calculate tiles or marker panes while its parent is display:none.
 if(rect.width<50||rect.height<50)return;
 if(!state.map){if(initMap()){restoreMarkers();refreshMarkers(filtered());}}
 if(state.map){state.map.invalidateSize({pan:false,animate:false});}
}
function switchMobile(mode){
 const app=$('atlasApp'),show=mode==='map';
 app.classList.toggle('map-mode',show);
 $('showListBtn').classList.toggle('active',!show);
 $('showMapBtn').classList.toggle('active',show);
 if(show){
  requestAnimationFrame(()=>requestAnimationFrame(ensureMapReady));
  setTimeout(ensureMapReady,180);
  setTimeout(ensureMapReady,650);
 }
}
function selectPlace(id,switchMap=false){const s=shops.find(x=>x.id===id);if(!s)return;state.selected=id;showPanel(s);render();if(switchMap||window.innerWidth<=780)switchMobile('map');if(state.map&&s.lat!=null){state.map.flyTo([s.lat,s.lng],Math.max(16,state.map.getZoom()),{duration:.65});}else if(s.lat==null){$('pinProgress').textContent='Locating this address. Google Maps link is available in details.';}
}
function bindEvents(){
 $('shopSearch').addEventListener('input',e=>{state.query=e.target.value.trim().toLowerCase();render();});
 $('areaSelect').addEventListener('change',e=>{state.zone=e.target.value;render();});
 $('shopList').addEventListener('click',e=>{const b=e.target.closest('[data-save]');if(b){e.stopPropagation();toggleSaved(+b.dataset.save);return;}const row=e.target.closest('[data-shop]');if(row)selectPlace(+row.dataset.shop);});
 $('shopList').addEventListener('keydown',e=>{if(e.target.matches('[data-shop]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectPlace(+e.target.dataset.shop);}});
 $('allTab').onclick=()=>{state.tab='all';$('allTab').classList.add('is-active');$('savedTab').classList.remove('is-active');render();};
 $('savedTab').onclick=()=>{state.tab='saved';$('savedTab').classList.add('is-active');$('allTab').classList.remove('is-active');render();};
 $('resetFilters').onclick=()=>{state.query='';state.zone='all';state.nearby=null;state.tab='all';$('shopSearch').value='';$('areaSelect').value='all';$('allTab').classList.add('is-active');$('savedTab').classList.remove('is-active');$('nearbyBtn').classList.remove('active');render();};
 $('heroSearchForm').addEventListener('submit',e=>{e.preventDefault();state.query=$('heroSearch').value.trim().toLowerCase();$('shopSearch').value=$('heroSearch').value.trim();$('explore').scrollIntoView({behavior:'smooth'});switchMobile('list');render();});
 $('showListBtn').onclick=()=>switchMobile('list');$('showMapBtn').onclick=()=>switchMobile('map');
 $('resetMapBtn').onclick=()=>state.map?.flyTo([52.3695,4.8975],12);
 $('locateBtn').onclick=findNearby;$('nearbyBtn').onclick=findNearby;
 $('downloadCsv').onclick=()=>{const cols=['name','address','postcode','area','latitude','longitude'];const csv=[cols.join(','),...shops.map(s=>[name(s),s.address,s.postcode,area(s),s.lat??'',s.lng??''].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='amsterdam-coffeeshops-atlas.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
}
function findNearby(){if(!navigator.geolocation){$('pinProgress').textContent='Geolocation is not available in this browser.';return;}$('pinProgress').textContent='Requesting location permission…';navigator.geolocation.getCurrentPosition(pos=>{state.nearby=[pos.coords.latitude,pos.coords.longitude];$('nearbyBtn').classList.add('active');const fromAmsterdam=dist(state.nearby,[52.3695,4.8975]);if(fromAmsterdam<=40&&state.map){state.map.flyTo(state.nearby,13);L.circleMarker(state.nearby,{radius:7,color:'white',fillColor:'#328cd3',fillOpacity:1,weight:3}).addTo(state.map).bindPopup('Your location');}$('pinProgress').textContent=fromAmsterdam>40?'Sorted by distance from your location. Map stays in Amsterdam.':'Nearby places first (as coordinates load).';render();},()=>{$('pinProgress').textContent='Location not available. Search by neighbourhood instead.'},{enableHighAccuracy:false,timeout:12000,maximumAge:300000});}
function initMap(){if(!window.L){$('pinProgress').textContent='Map could not load. The complete directory and Google Maps links still work.';$('mapProgress').textContent='Map unavailable — directory works';return false;}
 state.map=L.map('map',{zoomControl:false,preferCanvas:true}).setView([52.3695,4.8975],12);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(state.map);
 L.control.zoom({position:'bottomright'}).addTo(state.map);
 state.cluster=L.markerClusterGroup?L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:48,spiderfyOnMaxZoom:true}):L.layerGroup();state.map.addLayer(state.cluster);return true;}
function addMarker(s){if(!state.map||!Number.isFinite(s.lat)||!Number.isFinite(s.lng)||state.markers[s.id])return;const icon=L.divIcon({className:'atlas-marker',html:'<div class="atlas-pin"></div>',iconSize:[26,26],iconAnchor:[13,26]});const marker=L.marker([s.lat,s.lng],{icon,title:name(s)});marker.on('click',()=>selectPlace(s.id));state.markers[s.id]=marker;}
function refreshMarkers(items){if(!state.cluster)return;state.cluster.clearLayers();items.forEach(s=>{if(state.markers[s.id])state.cluster.addLayer(state.markers[s.id]);});}
function updateProgress(message){const n=shops.filter(s=>s.lat!=null).length;$('mapCount').textContent=`${n} mapped`;$('pinProgress').textContent=message||`${n} of 167 addresses mapped`; $('mapProgress').textContent=n===167?'167 addresses located':`${n}/167 map pins ready`;}
function restoreMarkers(){shops.filter(s=>s.lat!=null).forEach(addMarker);refreshMarkers(filtered());updateProgress();}
function parsePoint(s){if(typeof s!=='string')return null;const m=s.match(/POINT\s*\(\s*([\d.]+)\s+([\d.]+)\s*\)/i);return m?[+m[2],+m[1]]:null;}
async function geocodeOne(s){const url=new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');url.searchParams.set('q',s.postcode+' '+s.number+(s.suffix?' '+s.suffix:'')+' Amsterdam');url.searchParams.set('fq','type:adres');url.searchParams.set('rows','12');const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000);try{const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw Error('PDOK '+r.status);const d=await r.json();const pc=s.postcode.replace(/\s/g,'').toLowerCase();const matches=(d.response?.docs||[]).filter(x=>String(x.postcode||'').replace(/\s/g,'').toLowerCase()===pc&&parseInt(x.huisnummer,10)===parseInt(s.number,10));const preferred=s.suffix?matches.find(x=>String(x.huisletter||x.huisnummertoevoeging||'').toUpperCase()===s.suffix.toUpperCase()):null;const p=parsePoint((preferred||matches[0])?.centroide_ll);state.errors=0;return p&&p[0]>52.10&&p[0]<52.55&&p[1]>4.55&&p[1]<5.35?{lat:p[0],lng:p[1]}:null;}catch{state.errors++;if(state.errors>10)state.disabledGeo=true;return null;}finally{clearTimeout(timer);}}
function persistCoords(){try{localStorage.setItem(COORD_KEY,JSON.stringify(state.coords));}catch{}}
async function locateAddresses(){const missing=shops.filter(s=>s.lat==null);if(!missing.length){updateProgress('All 167 addresses located.');return;}let index=0,done=0;async function worker(){while(index<missing.length&&!state.disabledGeo){let s=missing[index++];const found=await geocodeOne(s);done++;if(found){s.lat=found.lat;s.lng=found.lng;state.coords[s.id]=found;addMarker(s);}if(done%8===0||done===missing.length){persistCoords();updateProgress(`${done}/${missing.length} remaining-address checks completed`);render();}}}await Promise.all(Array.from({length:5},worker));persistCoords();render();updateProgress(state.disabledGeo?'Address geocoding unavailable. All 167 places remain searchable with Google Maps links.':`${shops.filter(s=>s.lat!=null).length} pins located. Other addresses remain searchable.`);}
function boot(){
 featured();
 bindEvents();
 // Desktop is visible on load; on mobile wait until the user opens the Map tab.
 if(window.innerWidth>780)initMap();
 restoreMarkers();
 render();
 locateAddresses();
 window.addEventListener('resize',()=>{
  const visible=window.innerWidth>780||$('atlasApp').classList.contains('map-mode');
  if(visible)requestAnimationFrame(()=>requestAnimationFrame(ensureMapReady));
 });
 window.addEventListener('pageshow',()=>{if(window.innerWidth>780||$('atlasApp').classList.contains('map-mode'))setTimeout(ensureMapReady,120);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
