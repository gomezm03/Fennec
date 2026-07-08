/* ============ MSC Tools prototype — all data simulated ============ */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);

const state = {
  cart: [],            // {sku,name,price,qty}
  lib: [],             // {sku,name,price,preset}
  brands: new Set(['Accupro','Hertel']),
  wiz: { step:0, mats:new Set(['N']), matAuto:true, proc:'End milling', procAuto:true,
         dia:'', loc:'', rad:'', holder:'CAT40 · ER32', read:false },
  seen: 0,             // expanded rows in "see all"
  view: 'cards',
  cribSel: 0,
};

/* shaded catalog-style tool renders */
const COATS = {altin:['#6B5E7E','#372E47','#8E82A4'], tialn:['#565064','#2A2434','#7A7490'],
  tin:['#E2BE4E','#96771C','#F2DC90'], ticn:['#617082','#3A4451','#8493A6'],
  bright:['#C4CAD3','#848D99','#EDF0F4']};
const TOOL_COAT = {'09990412':'altin','09990627':'tialn','09990981':'bright','09990455':'altin',
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

const TOP3 = [
  {brand:'Accupro', sku:'09990412', name:'1/2" 4-Flute Carbide Square End Mill — AlTiN', price:84.12, fit:96,
   spec:'Ø .500 · LOC 1.25 · 4FL · R .000', preset:'ISO N preset · 9,550 RPM · 45 IPM', stock:'143 in stock · next-day', crib:2},
  {brand:'Hertel', sku:'09990627', name:'1/2" 4-Flute Carbide Square End Mill — TiAlN', price:61.30, fit:93,
   spec:'Ø .500 · LOC 1.00 · 4FL · R .000', preset:'ISO N preset · 9,200 RPM · 41 IPM', stock:'88 in stock · next-day', crib:0},
  {brand:'OSG', sku:'09990981', name:'1/2" 5-Flute Carbide End Mill — DUARISE', price:97.45, fit:91,
   spec:'Ø .500 · LOC 1.25 · 5FL · R .015', preset:'ISO N preset · 9,800 RPM · 52 IPM', stock:'12 in stock · 2-day', crib:0},
];
const MORE = [
  ['SGS','09991104','1/2" 3FL Alum-spec End Mill — ZrN',72.88],['Niagara','09991172','1/2" 4FL Square End Mill — TiCN',66.10],
  ['Kennametal','09991245','1/2" 4FL HARVI I TE',118.60],['Accupro','09991301','1/2" 2FL Carbide End Mill — Uncoated',48.95],
  ['Hertel','09991377','1/2" 4FL Long-reach End Mill',79.40],['OSG','09991420','1/2" 4FL Corner-radius .030',102.15],
  ['Niagara','09991488','1/2" 6FL Finisher — AlTiN',94.70],['SGS','09991512','1/2" 3FL High-helix — Ti-Namite',81.25],
  ['Accupro','09991590','1/2" 4FL Stub-length — AlTiN',69.85],['Kennametal','09991633','1/2" 4FL GOmill GP',88.30],
  ['Hertel','09991701','1/2" 4FL Roughing (corncob)',74.60],['OSG','09991766','1/2" 4FL Variable-index — EXOCARB',109.90],
];

const MATCH_PRIMARY = {brand:'Accupro', sku:'09990412', name:'1/2" 4-Flute Carbide Square End Mill — AlTiN', price:84.12, fit:96, lead:'Next day'};
const MATCH_ALTS = [
  {brand:'Hertel', sku:'09990627', name:'1/2" 4FL Square End Mill — TiAlN', price:61.30, fit:93, lead:'Next day', loc:'1.00"'},
  {brand:'Niagara', sku:'09991172', name:'1/2" 4FL Square End Mill — TiCN', price:71.88, fit:90, lead:'Next day', loc:'1.25"'},
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

const XM = [
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
const BRANDS = ['Accupro','Hertel','SGS','Niagara','Kennametal','OSG'];
const STEPS = ['Materials','Process','Brands','Size & limits'];

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
          ${L==='N'&&w.matAuto?'<span class="ctx">from model · AL 6061</span>':''}
        </button>`).join('')}</div>`;
    $$('[data-iso]').forEach(b=>b.addEventListener('click',()=>{
      const L=b.dataset.iso; w.mats.has(L)?w.mats.delete(L):w.mats.add(L);
      if(L==='N') w.matAuto=false; renderWiz();
    }));
  }
  if(w.step===1){
    el.innerHTML = `<div class="p-h">Process</div>
      <p class="p-note">Detected from the active CAM setup — override freely.</p>
      <div class="optrow">${PROCS.map(p=>`
        <button class="chip" data-proc="${p}" aria-pressed="${w.proc===p}">${p}</button>`).join('')}</div>
      ${w.proc==='End milling'&&w.procAuto?'<span class="ctx">from setup · 2D Pocket → Pocket_3</span>':''}`;
    $$('[data-proc]').forEach(b=>b.addEventListener('click',()=>{ w.proc=b.dataset.proc; w.procAuto=(w.proc==='End milling'); renderWiz(); }));
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
      renderWiz();
    }));
  }
  if(w.step===3){
    el.innerHTML = `<div class="p-h">Size &amp; limits</div>
      <p class="p-note">Or read them straight off the selected feature.</p>
      <button class="tbtn" id="readFeat">◈ Read Pocket_3</button>
      ${w.read?'<span class="ctx" style="margin-left:8px">filled from Pocket_3</span>':''}
      <div class="formgrid">
        <div class="fld"><label for="fDia">Diameter (in)</label><input id="fDia" value="${w.dia}" placeholder=".500"></div>
        <div class="fld"><label for="fLoc">Cut depth / LOC (in)</label><input id="fLoc" value="${w.loc}" placeholder="1.25"></div>
        <div class="fld"><label for="fRad">Corner radius (in)</label><input id="fRad" value="${w.rad}" placeholder=".000"></div>
        <div class="fld"><label for="fHold">Holder</label><select id="fHold"><option>CAT40 · ER32</option><option>CAT40 · shrink fit</option><option>BT30 · ER16</option></select></div>
      </div>
      <p class="p-note" style="margin-top:2px">Machine limit respected: <span class="mono">Haas VF-2 · 10,000 RPM max</span> <span class="ctx">from machine</span></p>`;
    $('#readFeat').addEventListener('click',()=>{ w.dia='.500'; w.loc='1.25'; w.rad='.000'; w.read=true; renderWiz(); toast('Read Pocket_3 — Ø .500 × 1.25 deep, sharp corners'); });
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
$('#skuGo').addEventListener('click',()=>{
  const v=$('#skuIn').value.trim()||'09990412'; state.seen=0; renderResults(v);
});

/* ---------- FIND results ---------- */
function starIf(brand){ return state.brands.has(brand)?'<span class="star" title="Preferred brand">★</span>':''; }
function sortPref(list){ return [...list].sort((a,b)=>(state.brands.has(b.brand)-state.brands.has(a.brand))||b.fit-a.fit); }

function renderResults(sku){
  $('#wizard').hidden = true; const R=$('#findResults'); R.hidden=false;
  const top = sortPref(TOP3);
  const head = `<div class="res-head">
      <div class="p-h">${sku?`SKU lookup — <span class="mono">${sku}</span>`:'Top 3 of 127 — sorted by fit'}</div>
      <div class="viewtog" role="group" aria-label="Result view">
        <button data-v="cards" aria-pressed="${state.view==='cards'}">Cards</button>
        <button data-v="compare" aria-pressed="${state.view==='compare'}">Compare</button></div>
      <button class="tbtn sm" id="newSearch">New search</button></div>
    <p class="p-note">ISO ${[...state.wiz.mats].join('+')||'N'} · ${state.wiz.proc} · Ø ${state.wiz.dia||'.500'} — presets use the most conservative group selected. ★ preferred brands ranked first.</p>`;

  let body='';
  const shown = sku ? [top.find(t=>t.sku===sku)||top[0]] : top;
  if(state.view==='cards'||sku){
    body = shown.map((t,i)=>`
      <div class="rescard ${i===0&&!sku?'best':''}">
        <div class="thumb">${toolArt('endmill', TOOL_COAT[t.sku])}</div>
        <div>
          <div class="rc-name">${starIf(t.brand)}${t.brand} — ${t.name}</div>
          <div class="rc-sku">SKU ${t.sku} · simulated</div>
          <div class="rc-spec">${t.spec}</div>
          <div class="rc-spec mono" style="font-size:10.5px;margin-top:3px">${t.preset}</div>
          <div class="rc-meta"><span class="stock-ok">${t.stock}</span>${t.crib?` · <span class="stock-crib">${t.crib} in your crib</span>`:''}</div>
        </div>
        <div class="rc-side">
          <div><div class="rc-price">${money(t.price)}</div><div class="rc-fitlab"><span class="fitpct">${t.fit}%</span> fit</div></div>
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
        <div class="rowres">${starIf(b)}<b>${b}</b> ${n} <span class="mono">${s}</span><span class="rr-p">${money(p)}</span>
        <button class="tbtn sm" data-cartm="${s}|${b} ${n}|${p}">+ Cart</button></div>`).join('');
    }
    more += state.seen < MORE.length
      ? `<button class="seeall" id="seeAll">${state.seen===0?'See all 127 results':'Show 6 more ('+(127-3-state.seen)+' remaining)'}</button>`
      : `<div class="refine-note">Showing the closest ${3+state.seen} of 127. That's a lot of end mills — tighten <b>size</b> or <b>process</b> in the wizard to cut the list down.</div>`;
  }

  R.innerHTML = head + body + more;
  $$('#findResults [data-v]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.v;renderResults();}));
  $('#newSearch').addEventListener('click',()=>{state.wiz.step=0;renderWiz();});
  const byS = s=>TOP3.find(t=>t.sku===s);
  $$('#findResults [data-lib]').forEach(b=>b.addEventListener('click',()=>addLib(byS(b.dataset.lib))));
  $$('#findResults [data-cart]').forEach(b=>b.addEventListener('click',()=>addCart(byS(b.dataset.cart))));
  $$('#findResults [data-cartm]').forEach(b=>b.addEventListener('click',()=>{
    const [s,n,p]=b.dataset.cartm.split('|'); addCart({sku:s,name:n,price:+p});
  }));
  const sa=$('#seeAll'); if(sa) sa.addEventListener('click',()=>{state.seen=Math.min(state.seen+6,MORE.length);renderResults();});
}

/* ---------- MATCH ---------- */
let matchPick = MATCH_PRIMARY;
function renderMatch(){
  const input = $('#matchIn').value.trim()||'CM-2F340-0500-DEMO';
  const M = matchPick, out = $('#matchOut'); out.hidden=false;
  const alts = [MATCH_PRIMARY,...MATCH_ALTS].filter(a=>a.sku!==M.sku);
  const locTheirs='1.25"', locOurs = M.sku==='09990627' ? '1.00"' : '1.25"';
  out.innerHTML = `
    <div class="idline">Maker identified: <b>Sandvik-format part number</b> <span class="mono">${input}</span> · pattern match on OEM catalog structure (simulated)</div>
    <div class="confband"><span class="pct">${M.fit}%</span> match confidence — best MSC equivalent found in <b>${M.brand}</b></div>
    <div class="duel">
      <div class="duelcard"><span class="dc-tag">Theirs</span>
        <div class="dc-name">OEM 1/2" 4-Flute End Mill</div><div class="dc-sku">${input} · simulated</div>
        <div class="dc-price">$142.55</div><div class="dc-lead muted">5-day lead</div></div>
      <div class="duel-vs">VS</div>
      <div class="duelcard win"><div class="thumb-duel">${toolArt('endmill', TOOL_COAT[M.sku])}</div><span class="dc-tag">MSC match</span>
        <div class="dc-name">${starIf(M.brand)}${M.brand} — ${M.name}</div><div class="dc-sku">SKU ${M.sku} · simulated</div>
        <div class="dc-price">${money(M.price)}</div><div class="dc-lead stock-ok">${M.lead} · ${money(142.55-M.price)} less</div></div>
    </div>
    <table class="delta"><thead><tr><th>Spec</th><th>Theirs</th><th>MSC match</th><th>Δ</th></tr></thead><tbody>
      <tr><td>Diameter</td><td>.500"</td><td>.500"</td><td class="mk-ok">✓ exact</td></tr>
      <tr><td>Flutes</td><td>4</td><td>4</td><td class="mk-ok">✓ exact</td></tr>
      <tr><td>LOC</td><td>${locTheirs}</td><td>${locOurs}</td><td class="${locOurs===locTheirs?'mk-ok':'mk-close'}">${locOurs===locTheirs?'✓ exact':'~ close — within tolerance for Pocket_3 (1.25 deep max)'}</td></tr>
      <tr><td>Coating</td><td>AlTiN</td><td>${M.sku==='09990627'?'TiAlN':M.sku==='09991172'?'TiCN':'AlTiN'}</td><td class="${M.sku==='09990412'?'mk-ok':'mk-close'}">${M.sku==='09990412'?'✓ exact':'~ close — equivalent class for ISO N'}</td></tr>
    </tbody></table>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="tbtn pri" id="mLib">Add to Library</button>
      <button class="tbtn" id="mCart">Add to cart — ${money(M.price)}</button></div>
    <div class="p-h" style="font-size:12px">Alternates — tap to promote</div>
    ${alts.map(a=>`<button class="altrow" data-alt="${a.sku}">${starIf(a.brand)}<b>${a.brand}</b> ${a.name}
      <span class="mono">${a.sku}</span> <span class="fitpct">${a.fit}%</span><span class="rr-p">${money(a.price)}</span></button>`).join('')}
    <p class="brandnote">Preferred brands applied — <a id="mEdit">edit in Find</a>.</p>`;
  $('#mLib').addEventListener('click',()=>addLib({...M,preset:'ISO N preset · material-matched'}));
  $('#mCart').addEventListener('click',()=>addCart(M));
  $$('#matchOut [data-alt]').forEach(b=>b.addEventListener('click',()=>{
    matchPick = [MATCH_PRIMARY,...MATCH_ALTS].find(a=>a.sku===b.dataset.alt); renderMatch(); toast('Promoted to primary match');
  }));
  $('#mEdit').addEventListener('click',()=>{ showTab('find'); state.wiz.step=2; renderWiz(); });
}
$('#matchGo').addEventListener('click',()=>{ matchPick=MATCH_PRIMARY; renderMatch(); });

/* ---------- CRIB ---------- */
function renderCribSel(){
  $('#cribSel').innerHTML = CRIBS.map((c,i)=>`<option value="${i}" ${i===state.cribSel?'selected':''}>${c.name}</option>`).join('');
}
function renderCrib(){
  const c = CRIBS[state.cribSel];
  $('#cribTbl').innerHTML = `<table class="cribtbl"><thead><tr>
      <th>SKU</th><th>Item</th><th>On hand</th><th>Min</th><th>Source</th><th></th></tr></thead><tbody>
    ${c.lines.map((l,i)=>`<tr class="${l.on<l.min?'low':''}">
      <td class="mono" style="font-size:10.5px">${l.sku}</td><td>${l.name}</td>
      <td><span class="stepper"><button data-cq="${i}|-1" aria-label="decrease">−</button><span>${l.on}</span><button data-cq="${i}|1" aria-label="increase">+</button></span></td>
      <td class="mono">${l.min}</td>
      <td><span class="srcbadge ${l.msc?'msc':''}">${l.msc?'MSC':'OTHER'}</span></td>
      <td>${l.on<l.min?'<span class="lowflag">▼ below min</span>':''}</td></tr>`).join('')}
  </tbody></table>`;
  $$('#cribTbl [data-cq]').forEach(b=>b.addEventListener('click',()=>{
    const [i,d]=b.dataset.cq.split('|'); const l=c.lines[+i]; l.on=Math.max(0,l.on+ +d); renderCrib();
  }));
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
    ? state.lib.map(l=>`<div class="libitem"><div class="thumb-sm">${toolArt('endmill', TOOL_COAT[l.sku]||'altin')}</div><div><b>${l.name}</b><span class="li-preset">SKU ${l.sku} · ${l.preset}</span></div><span class="rr-p">${money(l.price)}</span></div>`).join('')
    : '<div class="emptybox">Nothing staged yet. Add tools from Find, Match, or an Extract &amp; Match audit — then export them all to Fusion in one move.</div>';
  $('#libExport').disabled = $('#libToCart').disabled = !state.lib.length;
}
$('#libExport').addEventListener('click',()=>toast(`Exported ${state.lib.length} tool${state.lib.length>1?'s':''} to Fusion's tool library — geometry + presets (simulated)`));
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
      <span class="r-big">${t.matched} of 5 matched</span>
      <span class="r-big">${money(t.msc)} <span style="font-weight:400;color:#9FB4E4">vs ${money(t.theirs)} current brands</span></span>
      <span class="r-save">save ${money(t.theirs-t.msc)}</span>
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
             <span class="fitpct">${a.fit}%</span><span class="rr-p">${money(a.price)}</span></label>`).join('')}</div></div>`).join('')}
    <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
      <button class="tbtn pri" id="xmStage">Stage ${t.count} tool${t.count===1?'':'s'} → Library + cart</button>
      <span class="stagenote">Nothing is ordered yet — staging is explicit.</span></div>`;
  $$('#xmOut [data-xon]').forEach(cb=>cb.addEventListener('change',()=>{ XM[+cb.dataset.xon].on=cb.checked; renderXM(); }));
  $$('#xmOut [data-xp]').forEach(rb=>rb.addEventListener('change',()=>{ const[ri,ai]=rb.dataset.xp.split('|'); XM[+ri].pick=+ai; renderXM(); }));
  $$('#xmOut [data-q]').forEach(q=>q.addEventListener('click',()=>toast('Quote requested for '+q.dataset.q+' (simulated)')));
  $('#xmStage').addEventListener('click',()=>{
    XM.forEach(r=>{ if(r.unmatched||!r.on) return; const a=r.alts[r.pick];
      addLib({brand:a.brand,sku:a.sku,name:'Match for '+r.theirs,price:a.price,preset:'ISO preset · material-matched'});
      const ex=state.cart.find(l=>l.sku===a.sku); if(!ex) state.cart.push({sku:a.sku,name:a.brand+' — match for '+r.theirs,price:a.price,qty:1}); });
    renderBar(); renderCart(); toast('Staged to Library and cart — nothing ordered yet');
  });
}
$('#xmGo').addEventListener('click',renderXM);

/* ---------- CART ---------- */
function renderCart(){
  const L=$('#cartList'), X=$('#cartExtras');
  if(!state.cart.length){ L.innerHTML='<div class="emptybox">The staging cart is empty. Add tools from Find, Match, Crib POs, or an Extract &amp; Match audit.</div>'; X.innerHTML=''; return; }
  L.innerHTML = state.cart.map((l,i)=>`
    <div class="cartline">
      <div class="thumb-sm">${toolArt('endmill', TOOL_COAT[l.sku]||'bright')}</div>
      <span class="stepper"><button data-q="${i}|-1" aria-label="decrease">−</button><span>${l.qty}</span><button data-q="${i}|1" aria-label="increase">+</button></span>
      <div><b>${l.name}</b><br><span class="mono muted" style="font-size:10px">SKU ${l.sku}</span></div>
      <span class="rr-p">${money(l.price*l.qty)}</span>
      <button class="tbtn sm" data-x="${i}" aria-label="remove">✕</button>
    </div>`).join('')
    + `<div class="totalrow"><span>Total (simulated pricing)</span><b>${money(cartTotal())}</b></div>`;
  const cribHit = state.cart.find(l=>l.sku==='09990412');
  X.innerHTML = `
    ${cribHit?`<div class="callout">◈ <b>Crib check:</b> 2 × SKU 09990412 already on hand in <b>Bay 2 crib</b> — use crib stock first and drop the order quantity?
      <button class="tbtn sm" id="useCrib" style="margin-left:8px">Use crib stock</button></div>`:''}
    <div class="callout green">Free next-day shipping — order by 8 p.m. ET.</div>
    <div class="cart-exits">
      <button class="tbtn" id="cLib">Add all to Library</button>
      <button class="tbtn pri" id="cOrder">Make it real — order</button>
      <button class="tbtn" id="cQuote">Save as quote</button>
    </div>`;
  $$('#cartList [data-q]').forEach(b=>b.addEventListener('click',()=>{
    const[i,d]=b.dataset.q.split('|'); const l=state.cart[+i]; l.qty=Math.max(1,l.qty+ +d); renderBar(); renderCart();
  }));
  $$('#cartList [data-x]').forEach(b=>b.addEventListener('click',()=>{ state.cart.splice(+b.dataset.x,1); renderBar(); renderCart(); }));
  const uc=$('#useCrib'); if(uc) uc.addEventListener('click',()=>{
    const l=state.cart.find(l=>l.sku==='09990412'); if(l&&l.qty>1){l.qty=Math.max(1,l.qty-2);} toast('Quantity reduced — crib stock applied'); renderBar(); renderCart();
  });
  $('#cLib').addEventListener('click',()=>{ state.cart.forEach(l=>addLib({sku:l.sku,name:l.name,price:l.price})); });
  $('#cOrder').addEventListener('click',()=>toast('Handing off to your mscdirect.com account… (simulated — nothing was ordered)'));
  $('#cQuote').addEventListener('click',()=>toast('Saved as quote Q-2026-0708-DEMO (simulated)'));
}

/* ---------- init ---------- */
renderWiz(); renderCribSel(); renderCrib(); renderLib(); renderCart(); renderBar();
