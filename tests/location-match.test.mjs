import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const window={};
vm.runInNewContext(fs.readFileSync('public/assets/budmap-address-match.js','utf8'),{window,Date});
vm.runInNewContext(fs.readFileSync('public/assets/shops.js','utf8'),{window});
const m=window.BudMapAddressMatch,shops=window.ATLAS_SHOPS;
const shop={id:10,street:'Balboastraat',number:'19',suffix:'',postcode:'1057 VT'};
const base={type:'adres',woonplaatsnaam:'Amsterdam',straatnaam:'Balboastraat',huisnummer:19,postcode:'1057 VT',huisletter:null,huisnummertoevoeging:null,centroide_ll:'POINT(4.85371085 52.36887689)'};
test('All 167 civic address identifiers are unique and parseable',()=>{
 assert.equal(shops.length,167);
 const keys=shops.map(s=>m.key(s));assert.ok(keys.every(Boolean));assert.equal(new Set(keys).size,167);
});
test('Literal H must not match an unsuffixed civic address',()=>{
 assert.equal(m.select(shop,[{...base,huisnummertoevoeging:'H'}]),null);
 assert.ok(m.select({...shop,suffix:'H'},[{...base,huisnummertoevoeging:'H'}]));
 assert.equal(m.select({...shop,suffix:'H'},[{...base,huisnummertoevoeging:'H1'}]),null);
});
test('Building-level fallback is labelled separately from exact address',()=>{
 const result=m.selectBuilding(shop,[{...base,huisnummertoevoeging:'H'},{...base,huisnummertoevoeging:'1'}]);
 assert.equal(result?.source,'pdok-bag-building');
 assert.equal(result?.precision,'building_only');
 assert.ok(m.cached(shop,result));
});
test('Known exact letter suffix never falls back to unrelated unit',()=>{
 assert.equal(m.selectBuilding({...shop,suffix:'H'},[{...base,huisnummertoevoeging:'1'}]),null);
});
test('Building candidate points must not be spread across the street',()=>{
 assert.equal(m.selectBuilding(shop,[base,{...base,huisnummertoevoeging:'1',centroide_ll:'POINT(4.855 52.369)'}]),null);
});
test('Building fallback does not accept truncated result sets',()=>{
 const docs=Array.from({length:50},(_,i)=>({...base,huisnummertoevoeging:String(i)}));
 assert.equal(m.selectBuilding(shop,docs),null);
});
test('Never trust earlier unlabelled cache or changed postcode',()=>{
 const current=m.select(shop,[base]);
 assert.ok(m.cached(shop,current));
 assert.equal(m.cached(shop,{lat:current.lat,lng:current.lng}),null);
 assert.equal(m.cached({...shop,postcode:'1057 VS'},current),null);
});
test('House letter within original number is preserved',()=>{
 const found=shops.find(s=>s.id===54);
 assert.equal(m.addressParts(found).suffix,'B');
 assert.equal(m.addressParts(shops.find(s=>s.id===143)).suffix,'C');
});
