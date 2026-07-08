/* ============ MSC Tools prototype — all data simulated ============ */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);

const state = {
  cart: [],            // {sku,name,price,qty}
  lib: [],             // {sku,name,price,preset}
  brands: new Set(['Accupro','Hertel']),
  wiz: { step:0, mats:new Set(), proc:'End milling',
         dia:'', loc:'', rad:'', holder:'CAT40 · ER32' },
  sort:'fit',
  seen: 0,             // expanded rows in "see all"
  view: 'cards',
  cribSel: 0,
};

/* shaded catalog-style tool renders */
const COATS = {altin:['#6B5E7E','#372E47','#8E82A4'], tialn:['#565064','#2A2434','#7A7490'],
  tin:['#E2BE4E','#96771C','#F2DC90'], ticn:['#617082','#3A4451','#8493A6'], zrn:['#DCCF9A','#A8985C','#F0E8C8'],
  bright:['#C4CAD3','#848D99','#EDF0F4']};
const TOOL_COAT = {'09990412':'altin','09990627':'tialn','09990981':'bright','09990455':'zrn','09991172':'ticn',
  '09991104':'zrn','09991301':'bright','09991488':'altin','09991701':'bright','09991512':'tin',
  '09990118':'tin','09990904':'bright','09991177':'ticn','09990619':'altin'};
let _uid=0;
function toolArt(kind, coat){
  const cc = COATS[coat]||COATS.altin, c1=cc[0], c2=cc[1], hi=cc[2], u='tg'+(++_uid);
  const steel = '<linearGradient id="'+u+'s" x1="0" y1="0" x2="1" y2="0">'
    +'<stop offset="0" stop-color="#7E8791"/><stop offset=".28" stop-color="#E9EDF2"/>'
    +'<stop offset=".55" stop-color="#B6BDC6"/><stop offset="1" stop-color="#6B737E"/></linearGradient>';
  const coatG = '<linearGradient id="'+u+'c" x1="0" y1="0" x2="1" y2="0">'
    +'<stop offset="0" stop-color="'+c2+'"/><stop offset=".3" stop-color="'+hi+'"/>'
    +'<stop offset=".55" stop-color="'+c1+'"/><stop offset="1" stop-color="'+c2+'"/></linearGradient>';
  let body='';
  if(kind==='drill'){
    body = '<rect x="26" y="4" width="12" height="18" fill="url(#'+u+'s)"/>'
      +'<path d="M26 22 h12 l-1 26 L32 60 27 48 Z" fill="url(#'+u+'c)"/>'
      +'<path d="M28 24 C35 32,30 42,34 52 M35 24 C29 34,35 42,31 54" stroke="'+hi+'" stroke-width="1" fill="none" opacity=".8"/>'
      +'<path d="M27 48 L32 60 L37 48" fill="'+c2+'" opacity=".55"/>';
  } else if(kind==='chamfer'){
    body = '<rect x="26" y="4" width="12" height="30" fill="url(#'+u+'s)"/>'
      +'<path d="M26 34 h12 v10 l-6 12 -6 -12 Z" fill="url(#'+u+'c)"/>'
      +'<path d="M28 36 l3 16 M35 36 l-2 16" stroke="'+hi+'" stroke-width="1" opacity=".8"/>';
  } else if(kind==='ball'){
    body = '<rect x="26" y="4" width="12" height="22" fill="url(#'+u+'s)"/>'
      +'<path d="M26 26 h12 v26 a6 6 0 0 1 -12 0 Z" fill="url(#'+u+'c)"/>'
      +'<path d="M29 28 C35 36,30 44,33 54 M35 28 C30 38,36 44,31 52" stroke="'+hi+'" stroke-width="1" fill="none" opacity=".8"/>';
  } else {
    body = '<rect x="26" y="4" width="12" height="20" fill="url(#'+u+'s)"/>'
      +'<path d="M27 24 h10 l1 4 v30 h-14 v-30 Z" fill="url(#'+u+'c)"/>'
      +'<path d="M28 26 C36 36,29 46,35 58 M33 25 C27 37,35 45,29 57 M37 27 C32 39,38 47,33 58" stroke="'+hi+'" stroke-width="1.1" fill="none" opacity=".85"/>'
      +'<path d="M24 58 h16 l-3 3 h-10 Z" fill="'+c2+'"/>';
  }
  return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs>'+steel+coatG+'</defs>'
    +'<ellipse cx="32" cy="61" rx="14" ry="2" fill="#12161B" opacity=".12"/>'+body+'</svg>';
}

/* per-material result sets — coatings chosen for the workpiece:
   aluminum: ZrN / polished uncoated (never AlTiN); steel/stainless/hardened: AlTiN, TiAlN;
   cast iron: TiCN; superalloys/Ti: AlTiN, TiAlN */
const RESULT_SETS = {
  N:[['09991104',96],['09991301',94],['09990981',92]],
  P:[['09990412',96],['09990627',93],['09991172',90]],
  M:[['09990412',95],['09990627',93],['09991488',91]],
  K:[['09991172',94],['09990412',92],['09991701',89]],
  S:[['09990412',93],['09990627',91],['09991512',89]],
  H:[['09990412',92],['09991488',90],['09990627',88]]
};
const GRP_SFM = {N:900,P:350,M:240,K:300,S:120,H:150};
const GRP_NAME = {N:'Aluminum',P:'Steel',M:'Stainless',K:'Cast iron',S:'Superalloy/Ti',H:'Hardened'};
function pickGroup(mats){ for(const g of ['H','S','K','M','P','N']) if(mats.has(g)) return g; return 'N'; }
function calcParams(p, g){
  const rpm = Math.round((GRP_SFM[g]||350)*3.82/p.diaDec/10)*10;
  const chip = +(0.0008 + p.diaDec*0.0028).toFixed(4);
  return {sfm:GRP_SFM[g]||350, rpm, chip, ipm:Math.round(rpm*(+p.fl)*chip)};
}
function asResult(sku, fit, g){
  const p = PRODUCTS[sku], pr = calcParams(p, g);
  const crib = CRIBS[0].lines.find(l=>l.sku===sku);
  return {...p, fit, name:p.title,
    spec:`\u00d8 ${p.dia}" \u00b7 ${p.fl}FL \u00b7 LOC ${p.loc}" \u00b7 ${p.coatName}`,
    preset:`ISO ${g} preset \u00b7 ${pr.rpm.toLocaleString()} RPM \u00b7 ${pr.ipm} IPM`,
    stock:`${p.stock} in stock \u00b7 ${p.lead}`, crib:crib?crib.on:0};
}
const MORE = [
  ['SGS','09991104','1/2" 3FL Alum-spec End Mill — ZrN',72.88],['Niagara','09991172','1/2" 4FL Square End Mill — TiCN',66.10],
  ['Kennametal','09991245','1/2" 4FL HARVI I TE',118.60],['Accupro','09991301','1/2" 2FL Carbide End Mill — Uncoated',48.95],
  ['Hertel','09991377','1/2" 4FL Long-reach End Mill',79.40],['OSG','09991420','1/2" 4FL Corner-radius .030',102.15],
  ['Niagara','09991488','1/2" 6FL Finisher — AlTiN',94.70],['SGS','09991512','1/2" 3FL High-helix — Ti-Namite',81.25],
  ['Accupro','09991590','1/2" 4FL Stub-length — AlTiN',69.85],['Kennametal','09991633','1/2" 4FL GOmill GP',88.30],
  ['Hertel','09991701','1/2" 4FL Roughing (corncob)',74.60],['OSG','09991766','1/2" 4FL Variable-index — EXOCARB',109.90],
];

const THEIRS = {name:'OEM 1/2" 4-Flute End Mill', dia:'.500', fl:'4', loc:'1.25', coat:'AlTiN', price:142.55, lead:'5-day'};
const MATCH_ALTS = [
  {brand:'Accupro', sku:'09990412', name:'1/2" 4-Flute Carbide Square End Mill — AlTiN', price:84.12, fit:96, lead:'Next day', dia:'.500', fl:'4', loc:'1.25', coat:'AlTiN'},
  {brand:'Hertel',  sku:'09990627', name:'1/2" 4-Flute Carbide Square End Mill — TiAlN', price:61.30, fit:93, lead:'Next day', dia:'.500', fl:'4', loc:'1.00', coat:'TiAlN'},
  {brand:'Niagara', sku:'09991172', name:'1/2" 4-Flute Square End Mill — TiCN',          price:71.88, fit:90, lead:'Next day', dia:'.500', fl:'4', loc:'1.25', coat:'TiCN'},
  {brand:'OSG',     sku:'09990981', name:'1/2" 5-Flute Carbide End Mill — Bright',       price:97.45, fit:88, lead:'2-day',    dia:'.500', fl:'5', loc:'1.25', coat:'Bright'},
];

const CRIBS = [
  {name:'Bay 2 — Haas VF-2', lines:[
    {sku:'09990412', name:'Accupro 1/2" 4FL End Mill', on:2, min:4, msc:true, price:84.12},
    {sku:'09990101', name:'Hertel 1/4" Jobber Drill — TiN', on:6, min:3, msc:true, price:12.40},
    {sku:'X-77-0455', name:'Legacy-brand 3/8-16 Spiral Tap', on:1, min:2, msc:false, price:0},
    {sku:'09990233', name:'Accupro 90° Chamfer Mill', on:5, min:2, msc:true, price:54.20},
  ]},
  {name:'Bay 1 — DMG Mori', lines:[
    {sku:'09990627', name:'Hertel 1/2" 4FL End Mill', on:3, min:3, msc:true, price:61.30},
    {sku:'09990840', name:'Accupro 3/8" Ball End Mill', on:1, min:3, msc:true, price:47.75},
    {sku:'X-19-2210', name:'Legacy-brand Spot Drill 120°', on:4, min:2, msc:false, price:0},
  ]},
];

const XM_SAMPLE = [
  {theirs:'CM-2F340-0500', tname:'OEM 1/2" 4FL end mill', tprice:89.40, on:true, pick:0,
   alts:[{brand:'Accupro',sku:'09990412',fit:96,price:84.12},{brand:'Hertel',sku:'09990627',fit:93,price:61.30}]},
  {theirs:'CM-1P330-0250', tname:'OEM 1/4" 3FL end mill', tprice:64.15, on:true, pick:0,
   alts:[{brand:'Accupro',sku:'09990455',fit:95,price:41.05}]},
  {theirs:'DR-870-0201', tname:'OEM #7 carbide drill', tprice:71.20, on:true, pick:0,
   alts:[{brand:'Hertel',sku:'09990118',fit:94,price:38.91},{brand:'OSG',sku:'09990904',fit:91,price:52.10}]},
  {theirs:'TM-4F125-0750', tname:'OEM 3/4" 4FL rougher', tprice:136.45, on:true, pick:0,
   alts:[{brand:'Niagara',sku:'09991177',fit:92,price:60.30},{brand:'Accupro',sku:'09990619',fit:90,price:78.12}]},
  {theirs:'CUSTOM-GRIND-77', tname:'Custom form tool (shop grind)', tprice:null, unmatched:true},
];
/* Fusion document library: supplier/generic tools someone specced in, to be re-specced with MSC */
const XM_FUSION = [
  {theirs:'T1 \u00b7 GEN-EM-500-4F', tname:'Generic 1/2" 4FL end mill \u00b7 doc tool', tprice:96.00, on:true, pick:0,
   alts:[{brand:'Accupro',sku:'09990412',fit:97,price:84.12},{brand:'Hertel',sku:'09990627',fit:94,price:61.30}]},
  {theirs:'T2 \u00b7 SUP-BN-375', tname:'Supplier 3/8" ball nose \u00b7 doc tool', tprice:44.10, on:true, pick:0,
   alts:[{brand:'Accupro',sku:'09990840',fit:95,price:47.75}]},
  {theirs:'T3 \u00b7 GEN-DR-201', tname:'Generic #7 drill \u00b7 doc tool', tprice:61.75, on:true, pick:0,
   alts:[{brand:'Hertel',sku:'09990118',fit:96,price:38.91},{brand:'OSG',sku:'09990904',fit:92,price:52.10}]},
  {theirs:'T4 \u00b7 SUP-CH-90', tname:'Supplier 90\u00b0 chamfer mill \u00b7 doc tool', tprice:71.30, on:true, pick:0,
   alts:[{brand:'Accupro',sku:'09990233',fit:93,price:54.20}]},
  {theirs:'T5 \u00b7 GEN-EM-750-R', tname:'Generic 3/4" rougher \u00b7 doc tool', tprice:104.50, on:true, pick:0,
   alts:[{brand:'Niagara',sku:'09991177',fit:91,price:60.30},{brand:'Accupro',sku:'09990619',fit:90,price:78.12}]},
  {theirs:'T6 \u00b7 CUSTOM-FORM-12', tname:'Custom form tool \u00b7 doc tool', tprice:null, unmatched:true},
];
let XM = XM_SAMPLE;

/* ---------- toast / cart bar / tabs ---------- */
let toastT;
function toast(msg, undoFn){
  const t=$('#toast');
  t.innerHTML = '<svg class="t-ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg><span></span>'
    + (undoFn?'<button class="t-undo">Undo</button>':'');
  t.querySelector('span').textContent = msg;
  if(undoFn){ t.style.pointerEvents='auto';
    t.querySelector('.t-undo').addEventListener('click',()=>{ undoFn(); t.classList.remove('show'); t.style.pointerEvents='none'; });
  } else t.style.pointerEvents='none';
  t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>{t.classList.remove('show');t.style.pointerEvents='none';},2600); }

function cartTotal(){ return state.cart.reduce((s,l)=>s+l.price*l.qty,0); }
function renderBar(){
  const n = state.cart.reduce((s,l)=>s+l.qty,0);
  $('#barCount').textContent = n + (n===1?' item':' items');
  $('#barTotal').textContent = money(cartTotal());
  $('#cartBadge').textContent = n||'';
  $('#libBadge').textContent = state.lib.length||'';
  const cb=$('#cartbar'); if(cb){ cb.classList.remove('pulse'); void cb.offsetWidth; cb.classList.add('pulse'); }
}
function addCart(item, qty=1){
  const snap = JSON.stringify(state.cart);
  const ex = state.cart.find(l=>l.sku===item.sku);
  if(ex) ex.qty+=qty; else state.cart.push({sku:item.sku,name:(item.brand?item.brand+' ':'')+item.name,price:item.price,qty});
  renderBar(); renderCart();
  toast('Added to staging cart — ' + item.sku, ()=>{ state.cart = JSON.parse(snap); renderBar(); renderCart(); });
}
function addLib(item){
  if(state.lib.find(l=>l.sku===item.sku)){ toast('Already in Library — '+item.sku); return; }
  state.lib.push({sku:item.sku,name:(item.brand?item.brand+' ':'')+item.name,price:item.price,preset:item.preset||'ISO N preset · material-matched'});
  renderBar(); renderLib(); toast('Added to Library — '+item.sku);
}

function showTab(id){
  $$('.p-tab').forEach(b=>b.setAttribute('aria-selected', b.dataset.tab===id));
  $$('.p-view').forEach(v=>v.classList.toggle('on', v.id==='view-'+id));
}
$$('.p-tab').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
$('#barOpen').addEventListener('click',()=>showTab('cart'));

/* ---------- FIND wizard ---------- */
const ISO = [
  ['P','Steel','var(--iso-p)','Carbon & alloy steels'],
  ['M','Stainless','var(--iso-m)','Austenitic, duplex'],
  ['K','Cast iron','var(--iso-k)','Gray, ductile, CGI'],
  ['N','Non-ferrous','var(--iso-n)','Aluminum, copper, brass'],
  ['S','Superalloys / Ti','var(--iso-s)','Inconel, titanium'],
  ['H','Hardened','var(--iso-h)','45–65 HRC'],
];
const PROCS = ['End milling','Drilling','Face milling','Threading','Slotting','Chamfer'];
const PROC_ICONS = {
 'End milling':'<svg viewBox="0 0 32 32"><rect x="13" y="3" width="6" height="7"/><path d="M12.5 10h7v12h-7zM16 10v12"/><path d="M9 27h14M19.5 24.5L23 27l-3.5 2.5"/></svg>',
 'Drilling':'<svg viewBox="0 0 32 32"><rect x="13" y="3" width="6" height="7"/><path d="M13 10h6l-1.2 9L16 24l-1.8-5z"/><path d="M26 10v11M23.5 18.5L26 21l2.5-2.5"/></svg>',
 'Face milling':'<svg viewBox="0 0 32 32"><rect x="8" y="5" width="16" height="8" rx="1.5"/><path d="M11 13l1.5 3.5M16 13v3.5M21 13l-1.5 3.5"/><path d="M5 23h22M5 27h22"/></svg>',
 'Threading':'<svg viewBox="0 0 32 32"><rect x="13" y="3" width="6" height="6"/><path d="M13 9h6v13l-3 5-3-5z"/><path d="M12 13h8M12 16.5h8M12 20h8"/></svg>',
 'Slotting':'<svg viewBox="0 0 32 32"><path d="M4 26h7v-9h10v9h7"/><rect x="14" y="4" width="4" height="10"/></svg>',
 'Chamfer':'<svg viewBox="0 0 32 32"><path d="M5 26V8h13l9 9v9z"/><path d="M18 8l9 9" stroke-dasharray="3 3"/></svg>'
};
const BRANDS = ['Accupro','Hertel','SGS','Niagara','Kennametal','OSG'];
const STEPS = ['Materials','Process','Brands','Size & limits'];

/* preferred brands: one shared setting, editable on Find, Match, and Library */
function renderBrandBars(){
  ['#brandsMatch','#brandsXm'].forEach(sel=>{
    const el = $(sel); if(!el) return;
    el.innerHTML = '<span class="bb-lab">Preferred brands</span>'
      + BRANDS.map(b=>`<button class="chip xs" data-bb="${b}" aria-pressed="${state.brands.has(b)}">${b}</button>`).join('')
      + `<button class="chip xs" data-bb="" aria-pressed="${state.brands.size===0}">No preference</button>`;
    el.querySelectorAll('[data-bb]').forEach(btn=>btn.addEventListener('click',()=>{
      const v = btn.dataset.bb;
      if(!v) state.brands.clear();
      else state.brands.has(v) ? state.brands.delete(v) : state.brands.add(v);
      renderBrandBars(); refreshRankedViews();
    }));
  });
}
function refreshRankedViews(){
  if(!$('#matchOut').hidden) renderMatch();
  if($('#xmOut').innerHTML) renderXM();
  if(!$('#findResults').hidden) renderResults();
  if(!$('#wizard').hidden && state.wiz.step===2) renderWiz();
}

function railVal(i){
  const w=state.wiz;
  return [ [...w.mats].join(' + ')||'—', w.proc||'—',
    state.brands.size?[...state.brands].join(', '):'No preference',
    w.dia?('Ø '+w.dia+' · LOC '+(w.loc||'—')):'—' ][i];
}
function renderRail(){
  $('#steprail').innerHTML = STEPS.map((s,i)=>
    `<button class="${i===state.wiz.step?'cur':''}" data-go="${i}">
       <span class="sr-lab">${i+1} · ${s}</span><span class="sr-val">${railVal(i)}</span></button>`).join('');
  $$('#steprail [data-go]').forEach(b=>b.addEventListener('click',()=>{state.wiz.step=+b.dataset.go;renderWiz();}));
}
function renderWiz(){
  $('#findResults').hidden = true; $('#wizard').hidden = false;
  renderRail();
  const w = state.wiz, el = $('#wizStep');
  if(w.step===0){
    el.innerHTML = `<div class="p-h">Workpiece material</div>
      <p class="p-note">ISO groups — pick any combination. Presets follow the most conservative group selected.</p>
      <div class="iso-grid">${ISO.map(([L,n,c,sub])=>`
        <button class="iso" data-iso="${L}" aria-pressed="${w.mats.has(L)}">
          <span class="iso-letter" style="background:${c};${L==='M'?'color:#3d3200':''}">${L}</span>
          <span class="iso-name">${n}</span><span class="iso-sub">${sub}</span>
        </button>`).join('')}</div>`;
    $$('[data-iso]').forEach(b=>b.addEventListener('click',()=>{
      const L=b.dataset.iso; w.mats.has(L)?w.mats.delete(L):w.mats.add(L); renderWiz();
    }));
  }
  if(w.step===1){
    el.innerHTML = `<div class="p-h">Process</div>
      <p class="p-note">What operation are you tooling for?</p>
      <div class="proc-grid">${PROCS.map(p=>`
        <button class="proc" data-proc="${p}" aria-pressed="${w.proc===p}">
          <span class="proc-ic">${PROC_ICONS[p]}</span><span>${p}</span></button>`).join('')}</div>`;
    $$('[data-proc]').forEach(b=>b.addEventListener('click',()=>{ w.proc=b.dataset.proc; renderWiz(); }));
  }
  if(w.step===2){
    el.innerHTML = `<div class="p-h">Preferred brands</div>
      <p class="p-note">Preferences persist and rank results across the whole add-in — Find, Match, and Extract &amp; Match.</p>
      <div class="optrow">${BRANDS.map(b=>`
        <button class="chip" data-brand="${b}" aria-pressed="${state.brands.has(b)}">${b}</button>`).join('')}
        <button class="chip" data-brand="" aria-pressed="${state.brands.size===0}">No preference</button></div>`;
    $$('[data-brand]').forEach(b=>b.addEventListener('click',()=>{
      const v=b.dataset.brand;
      if(!v) state.brands.clear();
      else state.brands.has(v)?state.brands.delete(v):state.brands.add(v);
      renderWiz(); renderBrandBars();
    }));
  }
  if(w.step===3){
    el.innerHTML = `<div class="p-h">Size &amp; limits</div>
      <p class="p-note">Enter the cut you're making — every field is optional.</p>
      <div class="formgrid">
        <div class="fld"><label for="fDia">Diameter (in)</label><input id="fDia" value="${w.dia}" placeholder=".500"></div>
        <div class="fld"><label for="fLoc">Cut depth / LOC (in)</label><input id="fLoc" value="${w.loc}" placeholder="1.25"></div>
        <div class="fld"><label for="fRad">Corner radius (in)</label><input id="fRad" value="${w.rad}" placeholder=".000"></div>
        <div class="fld"><label for="fHold">Holder</label><select id="fHold"><option>CAT40 · ER32</option><option>CAT40 · shrink fit</option><option>BT30 · ER16</option></select></div>
      </div>`;
    ['fDia','fLoc','fRad'].forEach((id,i)=>$('#'+id).addEventListener('input',e=>{ w[['dia','loc','rad'][i]]=e.target.value; renderRail(); }));
  }
  $('#wizBack').disabled = w.step===0;
  $('#wizNext').textContent = w.step===3 ? 'See results' : 'Next';
}
$('#wizBack').addEventListener('click',()=>{ if(state.wiz.step>0){state.wiz.step--; renderWiz();} });
$('#wizNext').addEventListener('click',()=>{
  if(state.wiz.step<3){ state.wiz.step++; renderWiz(); }
  else{ if(!state.wiz.dia){ state.wiz.dia='.500'; state.wiz.loc='1.25'; state.wiz.rad='.000'; } state.seen=0; renderResults(); }
});


/* ---------- FIND results ---------- */
function starIf(brand){ return state.brands.has(brand)?'<span class="star" title="Preferred brand">★</span>':''; }
function sortPref(list){ return [...list].sort((a,b)=>{
  const p = state.brands.has(b.brand)-state.brands.has(a.brand); if(p) return p;
  if(state.sort==='price') return a.price-b.price;
  if(state.sort==='lead') return (/next/i.test(b.stock)-/next/i.test(a.stock)) || b.fit-a.fit;
  return b.fit-a.fit; }); }

function renderResults(sku){
  $('#wizard').hidden = true; const R=$('#findResults'); R.hidden=false;
  const grp = pickGroup(state.wiz.mats);
  const top = sortPref(RESULT_SETS[grp].map(([s,f])=>asResult(s,f,grp)));
  const head = `<div class="res-head">
      <div class="p-h">${sku?`SKU lookup — <span class="mono">${sku}</span>`:'Top 3 of 127 — sorted by fit'}</div>
      <select class="sortsel" id="sortSel" aria-label="Sort results">
        <option value="fit" ${state.sort==='fit'?'selected':''}>Sort: Best fit</option>
        <option value="price" ${state.sort==='price'?'selected':''}>Sort: Lowest price</option>
        <option value="lead" ${state.sort==='lead'?'selected':''}>Sort: Fastest</option></select>
      <div class="viewtog" role="group" aria-label="Result view">
        <button data-v="cards" aria-pressed="${state.view==='cards'}">Cards</button>
        <button data-v="compare" aria-pressed="${state.view==='compare'}">Compare</button></div>
      <button class="tbtn sm" id="newSearch">New search</button></div>
    <p class="p-note">ISO ${[...state.wiz.mats].join('+')||'N'} · ${state.wiz.proc} · Ø ${state.wiz.dia||'.500'} — coatings and presets follow ISO ${grp} (${GRP_NAME[grp]}), the most conservative group selected. ★ preferred brands ranked first.</p>`;

  let body='';
  let shown = top;
  if(sku){ const hit = top.find(t=>t.sku===sku) || (PRODUCTS[sku] && asResult(sku, 95, grp));
    shown = [hit || top[0]]; }
  if(state.view==='cards'||sku){
    body = shown.map((t,i)=>`
      <div class="rescard ${i===0&&!sku?'best':''}">
        <button class="thumb" data-pdp="${t.sku}" aria-label="View product details">${toolArt('endmill', TOOL_COAT[t.sku])}</button>
        <div>
          <div class="rc-name">${starIf(t.brand)}<button class="pdp-link" data-pdp="${t.sku}">${t.brand} — ${t.name}</button></div>
          <div class="rc-sku">SKU ${t.sku} · simulated</div>
          <div class="rc-spec">${t.spec}</div>
          <div class="rc-spec mono" style="font-size:10.5px;margin-top:3px">${t.preset}</div>
          <div class="rc-meta"><span class="stock-ok">${t.stock}</span>${t.crib?` · <span class="stock-crib">${t.crib} in your crib</span>`:''}</div>
        </div>
        <div class="rc-side">
          <div><div class="rc-price">${money(t.price)} <small>ea.</small></div><div class="rc-fitlab"><span class="fitpct">${t.fit}%</span> fit</div></div>
          <div class="rc-actions"><button class="tbtn sm" data-lib="${t.sku}">+ Library</button><button class="tbtn sm pri" data-cart="${t.sku}">+ Cart</button></div>
        </div>
      </div>`).join('');
  } else {
    const rows = ['Price','Fit','Spec','Preset','Stock','Actions'];
    body = `<table class="cmp"><thead><tr><th></th>${top.map(t=>`<th>${starIf(t.brand)}${t.brand}<br><span class="mono" style="font-size:9.5px;text-transform:none">${t.sku}</span></th>`).join('')}</tr></thead><tbody>
      ${rows.map(r=>`<tr><td>${r}</td>${top.map(t=>{
        if(r==='Price') return `<td class="mono"><b>${money(t.price)}</b></td>`;
        if(r==='Fit') return `<td><span class="fitpct">${t.fit}%</span></td>`;
        if(r==='Spec') return `<td>${t.spec}</td>`;
        if(r==='Preset') return `<td class="mono" style="font-size:10px">${t.preset}</td>`;
        if(r==='Stock') return `<td><span class="stock-ok">${t.stock}</span>${t.crib?`<br><span class="stock-crib">${t.crib} in crib</span>`:''}</td>`;
        return `<td><button class="tbtn sm" data-lib="${t.sku}">+ Lib</button> <button class="tbtn sm pri" data-cart="${t.sku}">+ Cart</button></td>`;
      }).join('')}</tr>`).join('')}</tbody></table>`;
  }

  let more='';
  if(!sku){
    if(state.seen>0){
      more += MORE.slice(0,state.seen).map(([b,s,n,p])=>`
        <div class="rowres">${starIf(b)}<button class="pdp-link" data-pdp="${s}"><b>${b}</b> ${n}</button> <span class="mono">${s}</span><span class="rr-p">${money(p)}</span>
        <button class="tbtn sm" data-libm="${s}">+ Library</button>
        <button class="tbtn sm pri" data-cartm="${s}">+ Cart</button></div>`).join('');
    }
    more += state.seen < MORE.length
      ? `<button class="seeall" id="seeAll">${state.seen===0?'See all 127 results':'Show 6 more ('+(127-3-state.seen)+' remaining)'}</button>`
      : `<div class="refine-note">Showing the closest ${3+state.seen} of 127. That's a lot of end mills — tighten <b>size</b> or <b>process</b> in the wizard to cut the list down.</div>`;
  }

  R.innerHTML = head + body + more;
  $$('#findResults [data-v]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.v;renderResults();}));
  const ss=$('#sortSel'); if(ss) ss.addEventListener('change',()=>{state.sort=ss.value;renderResults();});
  $('#newSearch').addEventListener('click',()=>{state.wiz.step=0;renderWiz();});
  const byS = s=>top.find(t=>t.sku===s)||asResult(s, 95, grp);
  $$('#findResults [data-lib]').forEach(b=>b.addEventListener('click',()=>addLib(byS(b.dataset.lib))));
  $$('#findResults [data-cart]').forEach(b=>b.addEventListener('click',()=>addCart(byS(b.dataset.cart))));
  $$('#findResults [data-cartm]').forEach(b=>b.addEventListener('click',()=>{
    const p=PRODUCTS[b.dataset.cartm];
    addCart({sku:p.sku,brand:p.brand,name:p.title,price:p.price});
  }));
  $$('#findResults [data-libm]').forEach(b=>b.addEventListener('click',()=>{
    const p=PRODUCTS[b.dataset.libm];
    addLib({sku:p.sku,brand:p.brand,name:p.title,price:p.price,preset:`ISO N \u00b7 ${p.params.N.rpm.toLocaleString()} RPM \u00b7 ${p.params.N.ipm} IPM`});
  }));
  const sa=$('#seeAll'); if(sa) sa.addEventListener('click',()=>{state.seen=Math.min(state.seen+6,MORE.length);renderResults();});
}

/* ---------- MATCH ---------- */
/* ---------- MATCH — alternatives explorer ---------- */
const MATCH_HIST = [];
const CMP_SET = new Set();
const CMP_CUSTOM = new Set();
function sortAlts(list){ return [...list].sort((a,b)=>(state.brands.has(b.brand)-state.brands.has(a.brand))||b.fit-a.fit); }
function pctChip(base, alt){
  if(!base) return '';
  const d = Math.round((alt-base)/base*100);
  if(d<0) return `<span class="savechip">${d}%</span>`;
  if(d>0) return `<span class="upchip">+${d}%</span>`;
  return `<span class="savechip">\u00b10%</span>`;
}
function specMark(same){ return same ? '<span class="mk-ok">\u2713</span>' : '<span class="mk-close">~</span>'; }
function renderMatch(){
  const input = $('#matchIn').value.trim()||'CM-2F340-0500-DEMO';
  if(!MATCH_HIST.includes(input)){ MATCH_HIST.unshift(input); if(MATCH_HIST.length>6) MATCH_HIST.pop(); }
  const out = $('#matchOut'); out.hidden=false;
  const alts = sortAlts(MATCH_ALTS);
  const sel = alts.filter(a=>CMP_SET.has(a.sku));
  const custom = [...CMP_CUSTOM].map(s=>PRODUCTS[s]).filter(Boolean);
  const tDia = parseFloat(THEIRS.dia), tLoc = parseFloat(THEIRS.loc);
  out.innerHTML = `
    <div class="idline">Identified: <b>Sandvik-format part number</b> <span class="mono">${input}</span> \u00b7 matched to OEM catalog spec (simulated)</div>
    <div class="refcard">
      <span class="rf-tag">Your part</span>
      <div class="rf-body">
        <div><div class="rc-name">${THEIRS.name}</div>
          <div class="rc-sku">${input}</div>
          <div class="rc-spec">\u00d8 ${THEIRS.dia}" \u00b7 ${THEIRS.fl}FL \u00b7 LOC ${THEIRS.loc}" \u00b7 ${THEIRS.coat}</div></div>
        <div class="rc-side"><div class="rc-price">${money(THEIRS.price)} <small>ea.</small></div>
          <div class="rc-fitlab muted">${THEIRS.lead} lead</div></div>
      </div>
    </div>
    <div class="p-h" style="font-size:14px;margin:20px 0 10px">${alts.length} MSC alternatives <span class="muted" style="font-weight:500;font-size:12px">\u00b7 ranked by fit \u00b7 select any to compare</span></div>
    ${alts.map(a=>`
      <div class="rescard">
        <button class="thumb" data-pdp="${a.sku}" aria-label="View product details">${toolArt('endmill', TOOL_COAT[a.sku])}</button>
        <div>
          <div class="rc-name">${starIf(a.brand)}<button class="pdp-link" data-pdp="${a.sku}">${a.brand} \u2014 ${a.name}</button></div>
          <div class="rc-sku">MSC #${a.sku} \u00b7 simulated</div>
          <div class="rc-spec">\u00d8 ${a.dia}" \u00b7 ${a.fl}FL \u00b7 LOC ${a.loc}" \u00b7 ${a.coat}</div>
          <div class="rc-meta"><span class="stock-ok">${a.lead}</span>
            ${a.price<THEIRS.price?`<span class="savechip">Save ${money(THEIRS.price-a.price)} \u00b7 ${Math.round((a.price-THEIRS.price)/THEIRS.price*100)}%</span>`:pctChip(THEIRS.price,a.price)}</div>
        </div>
        <div class="rc-side">
          <div><div class="rc-price">${money(a.price)} <small>ea.</small></div>
            <div class="rc-fitlab"><span class="fitpct">${a.fit}%</span> fit</div></div>
          <div class="rc-actions">
            <button class="tbtn sm" data-cmp="${a.sku}" aria-pressed="${CMP_SET.has(a.sku)}">${CMP_SET.has(a.sku)?'\u2713 Comparing':'+ Compare'}</button>
            <button class="tbtn sm" data-mlib="${a.sku}">+ Library</button>
            <button class="tbtn sm pri" data-mcart="${a.sku}">+ Cart</button>
          </div>
        </div>
      </div>`).join('')}
    <div class="addcmp">
      <input id="cmpSku" placeholder="Compare another MSC #\u2026" aria-label="Add an MSC number to the comparison">
      <button class="tbtn sm" id="cmpAdd">Add to compare</button>
    </div>
    ${(sel.length+custom.length)?`
      <div class="p-h" style="font-size:14px;margin:22px 0 10px">Compare <span class="muted" style="font-weight:500;font-size:12px">\u00b7 your part vs ${sel.length+custom.length} selected</span></div>
      <table class="cmp"><thead><tr><th></th>
        <th>Your part<br><span class="mono" style="font-size:9px;text-transform:none">${input}</span></th>
        ${sel.map(a=>`<th>${starIf(a.brand)}${a.brand}<br><span class="mono" style="font-size:9px;text-transform:none">${a.sku}</span> <button class="cmp-x" data-cmp="${a.sku}" aria-label="Remove ${a.brand} from compare">\u2715</button></th>`).join('')}
        ${custom.map(p=>`<th>${starIf(p.brand)}${p.brand}<br><span class="mono" style="font-size:9px;text-transform:none">${p.sku}</span> <button class="cmp-x" data-cmpc="${p.sku}" aria-label="Remove ${p.brand} from compare">\u2715</button></th>`).join('')}
      </tr></thead><tbody>
        <tr><td>Price</td><td class="mono">${money(THEIRS.price)}</td>${sel.map(a=>`<td class="mono"><b>${money(a.price)}</b>${a.price<THEIRS.price?`<br><span class="savechip">\u2212${money(THEIRS.price-a.price)}</span>`:''}</td>`).join('')}${custom.map(p=>`<td class="mono"><b>${money(p.price)}</b>${p.price<THEIRS.price?`<br><span class="savechip">\u2212${money(THEIRS.price-p.price)}</span>`:''}</td>`).join('')}</tr>
        <tr><td>Lead</td><td>${THEIRS.lead}</td>${sel.map(a=>`<td class="stock-ok">${a.lead}</td>`).join('')}${custom.map(p=>`<td class="stock-ok">${p.lead}</td>`).join('')}</tr>
        <tr><td>Diameter</td><td>${THEIRS.dia}"</td>${sel.map(a=>`<td>${a.dia}" ${specMark(a.dia===THEIRS.dia)}</td>`).join('')}${custom.map(p=>`<td>${p.dia}" ${specMark(Math.abs(p.diaDec-tDia)<0.001)}</td>`).join('')}</tr>
        <tr><td>Flutes</td><td>${THEIRS.fl}</td>${sel.map(a=>`<td>${a.fl} ${specMark(a.fl===THEIRS.fl)}</td>`).join('')}${custom.map(p=>`<td>${p.fl} ${specMark(p.fl===THEIRS.fl)}</td>`).join('')}</tr>
        <tr><td>LOC</td><td>${THEIRS.loc}"</td>${sel.map(a=>`<td>${a.loc}" ${specMark(a.loc===THEIRS.loc)}</td>`).join('')}${custom.map(p=>`<td>${p.loc}" ${specMark(Math.abs(p.locDec-tLoc)<0.001)}</td>`).join('')}</tr>
        <tr><td>Coating</td><td>${THEIRS.coat}</td>${sel.map(a=>`<td>${a.coat} ${specMark(a.coat===THEIRS.coat)}</td>`).join('')}${custom.map(p=>`<td>${p.coatName} ${specMark(p.coatName===THEIRS.coat)}</td>`).join('')}</tr>
        <tr><td>Fit</td><td class="muted">\u2014</td>${sel.map(a=>`<td><span class="fitpct">${a.fit}%</span></td>`).join('')}${custom.map(()=>`<td class="muted">\u2014</td>`).join('')}</tr>
        <tr><td></td><td></td>${sel.map(a=>`<td><button class="tbtn sm pri" data-mcart="${a.sku}">+ Cart</button></td>`).join('')}${custom.map(p=>`<td><button class="tbtn sm pri" data-mcart="${p.sku}">+ Cart</button></td>`).join('')}</tr>
      </tbody></table>`:''}
    <p class="brandnote">Preferred brands rank every alternative \u2014 adjust them above the search box.</p>
    ${MATCH_HIST.length>1?`<div class="p-h" style="font-size:13px;margin-top:18px">Recent matches</div>
      ${MATCH_HIST.filter(h=>h!==input).map(h=>`<button class="altrow" data-hist="${h}">
        <span class="mono">${h}</span><span class="rr-p muted" style="font-weight:500;font-size:11px">re-run \u203a</span></button>`).join('')}`:''}`;
  const bySku = s=>MATCH_ALTS.find(a=>a.sku===s)||PRODUCTS[s];
  $$('#matchOut [data-cmp]').forEach(b=>b.addEventListener('click',()=>{
    const s=b.dataset.cmp; CMP_SET.has(s)?CMP_SET.delete(s):CMP_SET.add(s); renderMatch(); }));
  $$('#matchOut [data-mlib]').forEach(b=>b.addEventListener('click',()=>addLib({...bySku(b.dataset.mlib),preset:'material-matched preset'})));
  $$('#matchOut [data-mcart]').forEach(b=>b.addEventListener('click',()=>{
    const x = bySku(b.dataset.mcart); addCart({sku:x.sku,brand:x.brand,name:x.name||x.title,price:x.price}); }));
  $$('#matchOut [data-cmpc]').forEach(b=>b.addEventListener('click',()=>{ CMP_CUSTOM.delete(b.dataset.cmpc); renderMatch(); }));
  const cAdd = ()=>{ const v = $('#cmpSku').value.replace(/[^0-9]/g,'');
    if(!v) return;
    if(MATCH_ALTS.some(a=>a.sku===v)){ CMP_SET.add(v); renderMatch(); return; }
    if(PRODUCTS[v]){ CMP_CUSTOM.add(v); renderMatch(); }
    else toast('MSC #'+v+' not found in the demo catalog'); };
  $('#cmpAdd').addEventListener('click',cAdd);
  $('#cmpSku').addEventListener('keydown',e=>{ if(e.key==='Enter') cAdd(); });
  $$('#matchOut [data-hist]').forEach(b=>b.addEventListener('click',()=>{
    $('#matchIn').value=b.dataset.hist; renderMatch(); }));
}
$('#matchGo').addEventListener('click',renderMatch);

/* ---------- CRIB ---------- */
function renderCribSel(){
  $('#cribSel').innerHTML = CRIBS.map((c,i)=>`<option value="${i}" ${i===state.cribSel?'selected':''}>${c.name}</option>`).join('');
}
function renderCrib(){
  const c = CRIBS[state.cribSel];
  const q = (state.cribQ||'').toLowerCase();
  const low = c.lines.filter(l=>l.on<l.min);
  const cost = low.filter(l=>l.msc).reduce((s,l)=>s+(2*l.min-l.on)*l.price,0);
  const rows = c.lines.map((l,i)=>({l,i}))
    .filter(r=>!q || r.l.sku.toLowerCase().includes(q) || r.l.name.toLowerCase().includes(q));
  $('#cribTbl').innerHTML = `
  <div class="cribsum">
    <span class="sumchip">${c.lines.length} SKUs tracked</span>
    <span class="sumchip ${low.length?'warn':''}">${low.length} below min</span>
    <span class="sumchip">${money(cost)} to replenish</span>
    <input id="cribFilter" placeholder="Filter SKUs&hellip;" value="${state.cribQ||''}" aria-label="Filter crib lines">
  </div>
  <table class="cribtbl"><thead><tr>
      <th>SKU</th><th>Item</th><th>On hand</th><th>Min</th><th>Source</th><th></th></tr></thead><tbody>
    ${rows.length?rows.map(({l,i})=>`<tr class="${l.on<l.min?'low':''}">
      <td class="mono" style="font-size:10.5px">${l.msc?`<button class="pdp-link" data-pdp="${l.sku}">${l.sku}</button>`:l.sku}</td><td>${l.name}</td>
      <td><span class="stepper"><button data-cq="${i}|-1" aria-label="decrease">−</button><span>${l.on}</span><button data-cq="${i}|1" aria-label="increase">+</button></span></td>
      <td class="mono">${l.min}</td>
      <td><span class="srcbadge ${l.msc?'msc':''}">${l.msc?'MSC':'OTHER'}</span></td>
      <td>${l.on<l.min?'<span class="lowflag">▼ below min</span>':''}</td></tr>`).join('')
      :'<tr><td colspan="6" style="text-align:center;color:var(--faint)">No lines match the filter.</td></tr>'}
  </tbody></table>`;
  $$('#cribTbl [data-cq]').forEach(b=>b.addEventListener('click',()=>{
    const [i,d]=b.dataset.cq.split('|'); const l=c.lines[+i]; l.on=Math.max(0,l.on+ +d); renderCrib();
  }));
  const cf=$('#cribFilter');
  cf.addEventListener('input',()=>{ state.cribQ=cf.value; renderCrib();
    const nf=$('#cribFilter'); nf.focus(); nf.setSelectionRange(nf.value.length,nf.value.length); });
}
$('#cribSel').addEventListener('change',e=>{ state.cribSel=+e.target.value; $('#poOut').innerHTML=''; renderCrib(); });
$('#cribRename').addEventListener('click',()=>{
  const n=prompt('Profile name:',CRIBS[state.cribSel].name); if(n){CRIBS[state.cribSel].name=n;renderCribSel();toast('Profile renamed');}
});
$('#cribNew').addEventListener('click',()=>{
  const n=prompt('New profile name:','Bay 3 — new machine'); if(n){CRIBS.push({name:n,lines:[]});state.cribSel=CRIBS.length-1;renderCribSel();renderCrib();$('#poOut').innerHTML='';toast('Profile created');}
});
$('#cribAdd').addEventListener('click',()=>{
  const s=prompt('MSC SKU to add (simulated):','09990333'); if(!s) return;
  CRIBS[state.cribSel].lines.push({sku:s,name:'Accupro item '+s.slice(-3),on:0,min:2,msc:true,price:29.50});
  renderCrib(); toast('SKU added to profile');
});
$('#poGo').addEventListener('click',()=>{
  const c=CRIBS[state.cribSel];
  const low=c.lines.filter(l=>l.on<l.min&&l.msc), excl=c.lines.filter(l=>l.on<l.min&&!l.msc);
  if(!low.length){ $('#poOut').innerHTML='<div class="refine-note" style="margin-top:12px">No MSC lines below minimum in this profile — nothing to reorder.</div>'; return; }
  const rows=low.map(l=>({...l,qty:2*l.min-l.on}));
  const total=rows.reduce((s,r)=>s+r.qty*r.price,0);
  $('#poOut').innerHTML = `<div class="pocard">
    <h4>Purchase order — draft</h4>
    <div class="mono-line">PO-2026-0708-DEMO · July 8, 2026 · Acct #0000-DEMO · ${c.name} · reorder to 2× min</div>
    ${excl.length?`<div class="excl">Excluded — not MSC SKUs: ${excl.map(e=>e.sku).join(', ')}. Match them on the Match tab to bring them into the crib program.</div>`:''}
    <table>${rows.map(r=>`<tr><td class="mono" style="font-size:10.5px">${r.sku}</td><td>${r.name}</td><td class="mono">×${r.qty}</td><td class="mono" style="text-align:right">${money(r.qty*r.price)}</td></tr>`).join('')}
      <tr><td colspan="3"><b>Total</b></td><td class="mono" style="text-align:right"><b>${money(total)}</b></td></tr></table>
    <div style="display:flex;gap:8px"><button class="tbtn pri" id="poSend">Send to purchasing</button><button class="tbtn" id="poCart">Add to staging cart</button></div>
  </div>`;
  $('#poSend').addEventListener('click',()=>toast('PO sent to purchasing (simulated)'));
  $('#poCart').addEventListener('click',()=>{ rows.forEach(r=>addCart({sku:r.sku,name:r.name,price:r.price},r.qty)); });
});

/* ---------- LIBRARY + Extract & Match ---------- */
function renderLib(){
  $('#libList').innerHTML = state.lib.length
    ? state.lib.map(l=>`<div class="libitem"><button class="thumb-sm" data-pdp="${l.sku}">${toolArt('endmill', TOOL_COAT[l.sku]||'altin')}</button><div><button class="pdp-link" data-pdp="${l.sku}"><b>${l.name}</b></button><span class="li-preset">SKU ${l.sku} · ${l.preset}</span></div><span class="rr-p">${money(l.price)}</span></div>`).join('')
    : '<div class="emptybox">Nothing staged yet. Add tools from Find, Match, or an Extract &amp; Match audit — then export them all to Fusion in one move.</div>';
  $('#libExport').disabled = $('#libToCart').disabled = !state.lib.length;
}
$('#libExport').addEventListener('click',()=>{
  const f=$('#expFmt'); toast(`Exported ${state.lib.length} tool${state.lib.length>1?'s':''} — ${f?f.value:'CAM'} · geometry + presets (simulated)`); });
$('#libToCart').addEventListener('click',()=>{ state.lib.forEach(l=>addCart({sku:l.sku,name:l.name,price:l.price})); });

function xmTotals(){
  let matched=0,msc=0,theirs=0,count=0;
  XM.forEach(r=>{ if(r.unmatched) return; matched++;
    if(r.on){ count++; msc+=r.alts[r.pick].price; theirs+=r.tprice; } });
  return {matched,msc,theirs,count};
}
function renderXM(){
  const t=xmTotals();
  $('#xmOut').innerHTML = `
    <div class="rollup"><span class="r-lab">Audit</span>
      <span class="r-big">${t.matched} of ${XM.length} matched</span>
      <span class="r-lab">${t.count} selected</span>
      <span class="r-big">${money(t.msc)} <span style="font-weight:400;color:#9FB4E4">vs ${money(t.theirs)} current brands</span></span>
      ${(()=>{ const d=t.theirs-t.msc, p=t.theirs?Math.round(Math.abs(d)/t.theirs*100):0;
        return d>=0 ? `<span class="r-save">save ${money(d)} (\u2212${p}%)</span>`
                    : `<span class="r-up">+${money(-d)} (+${p}%)</span>`; })()}
      <span class="r-lab">all next-day</span></div>
    ${XM.map((r,ri)=>r.unmatched
      ? `<div class="xmrow unmatched"><div class="xm-top"><span class="mono xm-theirs">${r.theirs}</span>
           <span>${r.tname}</span><span class="xm-arrow">→</span><span class="muted">no catalog match</span>
           <span style="margin-left:auto"><span class="qlink" data-q="${r.theirs}">Request quote</span></span></div></div>`
      : `<div class="xmrow"><div class="xm-top">
           <input type="checkbox" data-xon="${ri}" ${r.on?'checked':''} aria-label="Include ${r.theirs}">
           <span class="mono xm-theirs">${r.theirs}</span><span class="muted" style="font-size:11px">${r.tname} · ${money(r.tprice)}</span>
           <span class="xm-arrow">→</span></div>
         <div class="xm-alts">${r.alts.map((a,ai)=>`
           <label><input type="radio" name="xm${ri}" data-xp="${ri}|${ai}" ${r.pick===ai?'checked':''}>
             ${starIf(a.brand)}<b>${a.brand}</b> <span class="mono" style="font-size:10px">${a.sku}</span>
             <span class="fitpct">${a.fit}%</span><span class="rr-p">${money(a.price)}</span>${pctChip(r.tprice,a.price)}</label>`).join('')}</div></div>`).join('')}
    <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
      <button class="tbtn pri" id="xmStage">Add selected to Library + cart</button>
      <span class="stagenote">Nothing is ordered yet — staging is explicit.</span></div>`;
  $$('#xmOut [data-xon]').forEach(cb=>cb.addEventListener('change',()=>{ XM[+cb.dataset.xon].on=cb.checked; renderXM(); }));
  $$('#xmOut [data-xp]').forEach(rb=>rb.addEventListener('change',()=>{ const[ri,ai]=rb.dataset.xp.split('|'); XM[+ri].pick=+ai; renderXM(); }));
  $$('#xmOut [data-q]').forEach(q=>q.addEventListener('click',()=>toast('Quote requested for '+q.dataset.q+' (simulated)')));
  $('#xmStage').addEventListener('click',()=>{
    XM.forEach(r=>{ if(r.unmatched||!r.on) return; const a=r.alts[r.pick];
      addLib({brand:a.brand,sku:a.sku,name:'Match for '+r.theirs,price:a.price,preset:'material-matched preset'});
      const ex=state.cart.find(l=>l.sku===a.sku); if(!ex) state.cart.push({sku:a.sku,name:a.brand+' — match for '+r.theirs,price:a.price,qty:1}); });
    renderBar(); renderCart(); toast('Staged to Library and cart — nothing ordered yet');
  });
}
$('#xmGo').addEventListener('click',()=>{ XM = XM_SAMPLE; renderXM(); toast('Parsed sample_tools.csv \u2014 4 of 5 lines matched'); });
$('#xmFusion').addEventListener('click',()=>{ XM = XM_FUSION; renderXM(); toast("Read this document's Fusion tool library \u2014 5 of 6 tools matched"); });
const xmFile=$('#xmFile');
if(xmFile) xmFile.addEventListener('change',e=>{
  const n = e.target.files && e.target.files[0] ? e.target.files[0].name : 'file';
  XM = XM_SAMPLE; renderXM(); toast('Parsed '+n+' — 4 of 5 lines matched to catalog (simulated)');
});
const xmDrop=$('#xmDrop');
if(xmDrop){
  xmDrop.addEventListener('dragover',e=>{e.preventDefault();xmDrop.style.background='var(--b50)';});
  xmDrop.addEventListener('dragleave',()=>{xmDrop.style.background='';});
  xmDrop.addEventListener('drop',e=>{ e.preventDefault(); xmDrop.style.background='';
    const n = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0].name : 'dropped file';
    XM = XM_SAMPLE; renderXM(); toast('Parsed '+n+' — 4 of 5 lines matched to catalog (simulated)'); });
}

/* ---------- CART ---------- */
function renderCart(){
  const L=$('#cartList'), X=$('#cartExtras');
  if(!state.cart.length){ L.innerHTML='<div class="emptybox">The staging cart is empty. Add tools from Find, Match, Crib POs, or an import audit.</div>'; X.innerHTML=quotesBlock(); wireQuotes(); return; }
  L.innerHTML = state.cart.map((l,i)=>`
    <div class="cartline">
      <div class="thumb-sm">${toolArt('endmill', TOOL_COAT[l.sku]||'bright')}</div>
      <span class="stepper"><button data-q="${i}|-1" aria-label="decrease">−</button><span>${l.qty}</span><button data-q="${i}|1" aria-label="increase">+</button></span>
      <div><button class="pdp-link" data-pdp="${l.sku}"><b>${l.name}</b></button><br><span class="mono muted" style="font-size:10px">MSC #${l.sku}</span></div>
      <span class="rr-p">${money(l.price*l.qty)}</span>
      <button class="tbtn sm" data-x="${i}" aria-label="remove">✕</button>
    </div>`).join('')
    ;
  const cribHit = state.cart.find(l=>l.sku==='09990412');
  X.innerHTML = `
    ${cribHit?`<div class="callout">◈ <b>Crib check:</b> 2 × SKU 09990412 already on hand in <b>Bay 2 crib</b> — use crib stock first and drop the order quantity?
      <button class="tbtn sm" id="useCrib" style="margin-left:8px">Use crib stock</button></div>`:''}
    <div class="ordsum">
      <div class="os-row"><span>Subtotal (${state.cart.reduce((s,l)=>s+l.qty,0)} items)</span><b>${money(cartTotal())}</b></div>
      <div class="os-row"><span>Shipping</span><b class="stock-ok">FREE next-day</b></div>
      <div class="os-row"><span>Order by 8 p.m. ET &middot; tax calculated at order</span><span></span></div>
      <div class="os-row os-total"><span>Estimated total</span><b>${money(cartTotal())}</b></div>
    </div>
    <div class="cart-exits">
      <button class="tbtn" id="cLib">Add all to Library</button>
      <button class="tbtn pri" id="cOrder">Checkout</button>
      <button class="tbtn" id="cQuote">Save quote</button>
    </div>` + quotesBlock();
  $$('#cartList [data-q]').forEach(b=>b.addEventListener('click',()=>{
    const[i,d]=b.dataset.q.split('|'); const l=state.cart[+i]; l.qty=Math.max(1,l.qty+ +d); renderBar(); renderCart();
  }));
  $$('#cartList [data-x]').forEach(b=>b.addEventListener('click',()=>{ state.cart.splice(+b.dataset.x,1); renderBar(); renderCart(); }));
  const uc=$('#useCrib'); if(uc) uc.addEventListener('click',()=>{
    const l=state.cart.find(l=>l.sku==='09990412'); if(l&&l.qty>1){l.qty=Math.max(1,l.qty-2);} toast('Quantity reduced — crib stock applied'); renderBar(); renderCart();
  });
  $('#cLib').addEventListener('click',()=>{ state.cart.forEach(l=>addLib({sku:l.sku,name:l.name,price:l.price})); });
  $('#cOrder').addEventListener('click',renderOrderConfirm);
  $('#cQuote').addEventListener('click',()=>{
    qSeq++; const q = {id:'Q-2026-0'+(400+qSeq), date:'Jul 8, 2026',
      lines:JSON.parse(JSON.stringify(state.cart)), total:cartTotal()};
    QUOTES.unshift(q); renderCart(); toast('Quote saved \u2014 '+q.id+' (simulated)');
  });
  wireQuotes();
}

/* ---------- quotes + order confirmation (simulated) ---------- */
const QUOTES = [];
let qSeq = 0, ordSeq = 0;
function quotesBlock(){
  if(!QUOTES.length) return '';
  return `<div class="p-h" style="font-size:13px;margin:22px 0 8px">Saved quotes</div>`
    + QUOTES.map(q=>`<div class="quoterow"><span class="mono" style="font-weight:700">${q.id}</span>
      <span class="muted" style="font-size:11.5px">${q.date} \u00b7 ${q.lines.length} line${q.lines.length===1?'':'s'}</span>
      <span class="rr-p">${money(q.total)}</span>
      <button class="tbtn sm" data-qopen="${q.id}">Open in cart</button></div>`).join('');
}
function wireQuotes(){
  $$('#view-cart [data-qopen]').forEach(b=>b.addEventListener('click',()=>{
    const q = QUOTES.find(x=>x.id===b.dataset.qopen); if(!q) return;
    state.cart = JSON.parse(JSON.stringify(q.lines));
    renderBar(); renderCart(); toast(q.id+' loaded into cart');
  }));
}
function renderOrderConfirm(){
  ordSeq++;
  const n = 'SO-2026-0'+(7300+ordSeq);
  const count = state.cart.reduce((s,l)=>s+l.qty,0), total = cartTotal();
  $('#cartList').innerHTML = `<div class="confirm">
    <div class="cf-ic">\u2713</div>
    <div class="p-h">Order submitted</div>
    <p class="p-note">Simulated \u2014 no order was placed.</p>
    <div class="ordsum" style="text-align:left">
      <div class="os-row"><span>Order number</span><b class="mono">${n}</b></div>
      <div class="os-row"><span>Items</span><b>${count}</b></div>
      <div class="os-row"><span>Ship to</span><b>Address on file \u00b7 Acct #0000-DEMO</b></div>
      <div class="os-row"><span>Delivery</span><b class="stock-ok">Next day \u00b7 FREE</b></div>
      <div class="os-row os-total"><span>Total</span><b>${money(total)}</b></div>
    </div>
    <div class="cart-exits" style="justify-content:center"><button class="tbtn pri" id="cfDone">Continue</button></div>
  </div>`;
  $('#cartExtras').innerHTML = quotesBlock();
  state.cart = []; renderBar(); wireQuotes();
  $('#cfDone').addEventListener('click',()=>{ renderCart(); showTab('find'); });
}

/* ---------- product registry + in-app PDP ---------- */
const PRODUCTS = {};
function regProd(d){
  const mk = sfm => { const rpm = Math.round(sfm*3.82/d.diaDec/10)*10;
    const chip = +(0.0008 + d.diaDec*0.0028).toFixed(4);
    return {sfm, rpm, chip, ipm: Math.round(rpm*(+d.fl)*chip)}; };
  d.params = { N: mk(d.kind==='drill'?300:900), P: mk(d.kind==='drill'?90:350) };
  PRODUCTS[d.sku] = d;
}
[
 {sku:'09990412',brand:'Accupro',title:'1/2" 4-Flute Carbide Square End Mill — AlTiN',kind:'endmill',coat:'altin',coatName:'AlTiN',price:84.12,stock:143,lead:'Next day',desc:'3" OAL, 1/2" shank dia, 38° helix, AlTiN coated, single end, centercutting — Series ACC4-SQ',diaDec:.5,dia:'1/2',fl:'4',loc:'1-1/4',locDec:1.25,shank:'1/2',oal:'3',helix:'38°'},
 {sku:'09990627',brand:'Hertel',title:'1/2" 4-Flute Carbide Square End Mill — TiAlN',kind:'endmill',coat:'tialn',coatName:'TiAlN',price:61.30,stock:88,lead:'Next day',desc:'2-1/2" OAL, 1/2" shank dia, 35° helix, TiAlN coated, single end, centercutting — Series HTL-GP4',diaDec:.5,dia:'1/2',fl:'4',loc:'1',locDec:1.0,shank:'1/2',oal:'2-1/2',helix:'35°'},
 {sku:'09990981',brand:'OSG',title:'1/2" 5-Flute Carbide End Mill — Bright',kind:'endmill',coat:'bright',coatName:'Bright/Uncoated',price:97.45,stock:12,lead:'2-day',desc:'3" OAL, 1/2" shank dia, variable 45° helix, .015" corner radius, single end — Series VGM5',diaDec:.5,dia:'1/2',fl:'5',loc:'1-1/4',locDec:1.25,shank:'1/2',oal:'3',helix:'45° variable'},
 {sku:'09991172',brand:'Niagara',title:'1/2" 4-Flute Square End Mill — TiCN',kind:'endmill',coat:'ticn',coatName:'TiCN',price:71.88,stock:51,lead:'Next day',desc:'3" OAL, 1/2" shank dia, 30° helix, TiCN coated, single end, centercutting — Series N85907',diaDec:.5,dia:'1/2',fl:'4',loc:'1-1/4',locDec:1.25,shank:'1/2',oal:'3',helix:'30°'},
 {sku:'09990455',brand:'Accupro',title:'1/4" 3-Flute Carbide End Mill — ZrN',kind:'endmill',coat:'zrn',coatName:'ZrN',price:41.05,stock:210,lead:'Next day',desc:'2-1/2" OAL, 1/4" shank dia, 40° helix, ZrN coated aluminum-spec geometry, single end — Series ACC3-AL',diaDec:.25,dia:'1/4',fl:'3',loc:'3/4',locDec:.75,shank:'1/4',oal:'2-1/2',helix:'40°'},
 {sku:'09990118',brand:'Hertel',title:'#7 (.201") Carbide Jobber Drill — TiN',kind:'drill',coat:'tin',coatName:'TiN',price:38.91,stock:96,lead:'Next day',desc:'3.6" OAL, 118° point, right hand spiral flute, TiN coated — Series HTL-JD',diaDec:.201,dia:'#7 (.201)',fl:'2',loc:'2.16 flute',locDec:2.16,shank:'.201',oal:'3.6',helix:'118° point'},
 {sku:'09990904',brand:'OSG',title:'#7 (.201") Carbide Drill — Bright',kind:'drill',coat:'bright',coatName:'Bright/Uncoated',price:52.10,stock:33,lead:'Next day',desc:'3.5" OAL, 140° point, coolant-through, right hand spiral — Series EXO-DRL',diaDec:.201,dia:'#7 (.201)',fl:'2',loc:'2.0 flute',locDec:2.0,shank:'.201',oal:'3.5',helix:'140° point'},
 {sku:'09991177',brand:'Niagara',title:'3/4" 4-Flute Carbide Rougher — TiCN',kind:'endmill',coat:'ticn',coatName:'TiCN',price:60.30,stock:27,lead:'Next day',desc:'4" OAL, 3/4" shank dia, corncob chipbreaker profile, single end — Series NRC4',diaDec:.75,dia:'3/4',fl:'4',loc:'1-1/2',locDec:1.5,shank:'3/4',oal:'4',helix:'35°'},
 {sku:'09990619',brand:'Accupro',title:'3/4" 4-Flute Carbide End Mill — AlTiN',kind:'endmill',coat:'altin',coatName:'AlTiN',price:78.12,stock:44,lead:'Next day',desc:'4" OAL, 3/4" shank dia, 38° helix, AlTiN coated, single end, centercutting — Series ACC4-SQ',diaDec:.75,dia:'3/4',fl:'4',loc:'1-1/2',locDec:1.5,shank:'3/4',oal:'4',helix:'38°'},
 {sku:'09990101',brand:'Hertel',title:'1/4" Jobber Length Drill — TiN',kind:'drill',coat:'tin',coatName:'TiN',price:12.40,stock:340,lead:'Next day',desc:'4" OAL, 118° point, right hand spiral flute, TiN coated HSS — Series HTL-JD',diaDec:.25,dia:'1/4',fl:'2',loc:'2.75 flute',locDec:2.75,shank:'1/4',oal:'4',helix:'118° point'},
 {sku:'09990233',brand:'Accupro',title:'90° 4-Flute Carbide Chamfer Mill — AlTiN',kind:'chamfer',coat:'altin',coatName:'AlTiN',price:54.20,stock:58,lead:'Next day',desc:'2-1/2" OAL, 1/2" shank dia, 90° included angle, AlTiN coated — Series ACC-CHM',diaDec:.5,dia:'1/2',fl:'4',loc:'1/4',locDec:.25,shank:'1/2',oal:'2-1/2',helix:'90° incl.'},
 {sku:'09990840',brand:'Accupro',title:'3/8" 2-Flute Carbide Ball End Mill — AlTiN',kind:'ball',coat:'altin',coatName:'AlTiN',price:47.75,stock:71,lead:'Next day',desc:'2-1/2" OAL, 3/8" shank dia, 30° helix, ball nose, AlTiN coated, single end — Series ACC2-BN',diaDec:.375,dia:'3/8',fl:'2',loc:'1',locDec:1.0,shank:'3/8',oal:'2-1/2',helix:'30°'}
].forEach(regProd);
MORE.forEach(([b,s,n,p])=>{ if(PRODUCTS[s]) return;
  const fl=(n.match(/(\d)FL/)||[0,'4'])[1];
  regProd({sku:s,brand:b,title:n,kind:'endmill',coat:TOOL_COAT[s]||'bright',
    coatName:(n.split('— ')[1]||'Bright/Uncoated'),price:p,stock:20+(+s.slice(-2)),lead:'Next day',
    desc:'3" OAL, 1/2" shank dia, solid carbide, single end — simulated catalog item',
    diaDec:.5,dia:'1/2',fl,loc:'1-1/4',locDec:1.25,shank:'1/2',oal:'3',helix:'38°'}); });

function openPDP(sku){
  const p = PRODUCTS[sku];
  if(!p){ toast('No catalog page for '+sku+' in this demo'); return; }
  let qty = 1;
  const crib = CRIBS[0].lines.find(l=>l.sku===sku);
  const row = (k,v)=>`<div class="spec-row"><span>${k}</span><b>${v}</b></div>`;
  const draw = ()=>{
    $('#pdpBody').innerHTML = `
    <div class="pdp-top">
      <div class="pdp-img">${toolArt(p.kind, p.coat)}</div>
      <div class="pdp-info">
        <div class="pdp-brand">${p.brand}</div>
        <h2 class="pdp-title">${p.title}</h2>
        <p class="pdp-desc">${p.desc} (simulated)</p>
        <div class="pdp-ids mono">MSC #${p.sku} \u00b7 Mfr #${p.sku}-D</div>
        <div class="rc-meta"><span class="stock-ok">\u2713 ${p.stock} in stock</span><span class="muted">${p.lead}</span>${crib?`<span class="stock-crib">${crib.on} in your crib</span>`:''}</div>
      </div>
      <div class="pdp-buy">
        <div class="pdp-price">${money(p.price)} <small>/each</small></div>
        <div class="pdp-qty"><span>Quantity</span>
          <span class="stepper"><button id="pqDn" aria-label="decrease">\u2212</button><span>${qty}</span><button id="pqUp" aria-label="increase">+</button></span></div>
        <button class="tbtn pri" id="pAddCart" style="width:100%;justify-content:center">Add to cart</button>
        <button class="tbtn" id="pAddLib" style="width:100%;justify-content:center">Add to Library</button>
        <div class="pdp-ship">FREE next-day \u00b7 order by 8 p.m. ET</div>
      </div>
    </div>
    <h3 class="pdp-h">Specifications</h3>
    <div class="specgrid">
      ${row('Cut Diameter (Inch)', p.dia+'"')}${row('Cut Diameter (Decimal)', p.diaDec.toFixed(4))}
      ${row('Number of Flutes', p.fl)}${row('Material', 'Solid Carbide')}
      ${row('Length of Cut (Inch)', p.loc+'"')}${row('Length of Cut (Decimal)', p.locDec.toFixed(4))}
      ${row('Shank Diameter', p.shank+'"')}${row('Overall Length', p.oal+'"')}
      ${row('Coating / Finish', p.coatName)}${row(p.kind==='drill'?'Point Angle':'Helix Angle', p.helix)}
      ${row('Centercutting', p.kind==='drill'?'\u2014':'Yes')}${row('Cutting Direction', 'Right Hand')}
    </div>
    <h3 class="pdp-h">Feeds &amp; speeds presets <span class="muted" style="font-weight:500;font-size:11px">\u00b7 starting parameters, exported with the tool \u00b7 simulated</span></h3>
    <table class="cmp"><thead><tr><th>Workpiece</th><th>SFM</th><th>Spindle</th><th>Chip load</th><th>Feed</th></tr></thead><tbody>
      <tr><td>ISO N \u2014 Aluminum</td><td class="mono">${p.params.N.sfm}</td><td class="mono">${p.params.N.rpm.toLocaleString()} RPM</td><td class="mono">${p.params.N.chip}"</td><td class="mono">${p.params.N.ipm} IPM</td></tr>
      <tr><td>ISO P \u2014 Steel</td><td class="mono">${p.params.P.sfm}</td><td class="mono">${p.params.P.rpm.toLocaleString()} RPM</td><td class="mono">${p.params.P.chip}"</td><td class="mono">${p.params.P.ipm} IPM</td></tr>
    </tbody></table>
    <div class="pdp-cad"><span>Tool geometry &amp; CAM data</span>
      <button class="tbtn sm" id="pDl">Download .tools \u00b7 simulated</button></div>`;
    $('#pqUp').addEventListener('click',()=>{qty++;draw();});
    $('#pqDn').addEventListener('click',()=>{qty=Math.max(1,qty-1);draw();});
    $('#pAddCart').addEventListener('click',()=>addCart({sku:p.sku,brand:p.brand,name:p.title,price:p.price},qty));
    $('#pAddLib').addEventListener('click',()=>addLib({sku:p.sku,brand:p.brand,name:p.title,price:p.price,preset:`ISO N \u00b7 ${p.params.N.rpm.toLocaleString()} RPM \u00b7 ${p.params.N.ipm} IPM`}));
    $('#pDl').addEventListener('click',()=>toast('Downloaded '+p.sku+'.tools \u2014 geometry + presets (simulated)'));
  };
  draw();
  $('#pdpOv').hidden = false;
  $('#pdpClose').focus();
}
function closePDP(){ $('#pdpOv').hidden = true; }
$('#pdpClose').addEventListener('click', closePDP);
$('#pdpOv').addEventListener('click', e=>{ if(e.target===$('#pdpOv')) closePDP(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !$('#pdpOv').hidden) closePDP(); });
document.addEventListener('click', e=>{ const t = e.target.closest('[data-pdp]'); if(t) openPDP(t.dataset.pdp); });

/* ---------- global search ---------- */
const gS=$('#gSearch');
function gGoRun(){
  const v=(gS.value||'').trim(); if(!v) return;
  const sku=v.replace(/[^0-9]/g,'');
  showTab('find'); state.seen=0;
  renderResults(sku.length>=4 ? sku : '09990412');
}
$('#gGo').addEventListener('click',gGoRun);
gS.addEventListener('keydown',e=>{ if(e.key==='Enter') gGoRun(); });

/* ---------- init ---------- */
renderWiz(); renderBrandBars(); renderCribSel(); renderCrib(); renderLib(); renderCart(); renderBar();
