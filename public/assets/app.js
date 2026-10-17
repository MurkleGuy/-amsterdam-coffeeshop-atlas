/* Atlas homepage interactions — the original map lives independently in map.html. */
(()=>{
 'use strict';
 const shops=Array.isArray(window.ATLAS_SHOPS)?window.ATLAS_SHOPS:[];
 const $=id=>document.getElementById(id);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const areas=s=>{const n=parseInt(s.postcode,10);if(n>=1100)return'Zuidoost';if(n>=1020&&n<1040)return'Noord';if(n>=1040&&n<1060)return'West';if(n>=1060&&n<1070)return'Nieuw-West';if(n>=1070&&n<1090)return'Zuid';if(n>=1090&&n<1100)return'Oost';return'Centrum';};
 const photoUrl=s=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(s.photo.file)+'?width=850';
 const photoSource=s=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(s.photo.file);
 let pendingSearch=null,mapLoaded=false;
 function sendSearch(query){
  const shop=String(query??'').trim().slice(0,110);
  const params=shop?'?shop='+encodeURIComponent(shop):'';
  // Gallery browsing leads into the hotel-first welcome rather than bypassing setup.
  location.assign('index.html'+params);
 }
 function showPhotos(){
  const ids=[47,97,40,81];
  const html=ids.map(id=>{
   const s=shops.find(x=>x.id===id);
   if(!s)return '';
   const photo=s.photo?'<img loading="lazy" referrerpolicy="no-referrer" src="'+esc(photoUrl(s))+'" alt="Historic photograph of '+esc(s.name)+'">':'';
   return '<article class="featured-card"><div class="cover">'+photo+'<span class="label">'+esc(areas(s))+'</span></div><div class="featured-card-content"><h3>'+esc(s.name||'Coffeeshop')+'</h3><div class="address">'+esc(s.address)+'</div><div class="featured-card-bottom"><button type="button" data-find-shop="'+s.id+'">Find on map ↗</button>'+(s.photo?'<a class="credit-link" target="_blank" rel="noopener" href="'+esc(photoSource(s))+'">Photo credit ↗</a>':'')+'</div></div></article>';
  }).join('');
  const grid=$('featuredGrid');
  if(grid){grid.innerHTML=html;grid.addEventListener('click',e=>{const b=e.target.closest('[data-find-shop]');if(!b)return;const s=shops.find(x=>x.id===Number(b.dataset.findShop));if(s)sendSearch(s.name||s.street);});}
  document.querySelectorAll('[data-photo]').forEach(node=>{
   const s=shops.find(x=>x.id===Number(node.dataset.photo));
   if(s?.photo){const img=document.createElement('img');img.src=photoUrl(s);img.alt='Historic photograph of '+s.name;img.referrerPolicy='no-referrer';node.prepend(img);}
  });
  document.addEventListener('error',e=>{if(e.target?.tagName==='IMG'&&e.target?.src?.includes('wikimedia.org'))e.target.remove();},true);
 }
 function boot(){
  showPhotos();
  const frame=$('mapFrame');
  if(frame){
   frame.addEventListener('load',()=>{
    mapLoaded=true;
    const progress=$('mapProgress');if(progress)progress.textContent='Interactive city map · 167 addresses';
    if(pendingSearch!==null)frame.contentWindow?.postMessage({type:'ATLAS_SEARCH',query:pendingSearch},location.origin);
   });
  }
  $('heroSearchForm')?.addEventListener('submit',event=>{
   event.preventDefault();
   sendSearch($('heroSearch')?.value||'');
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();