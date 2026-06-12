/* ═══════════════════════════════════════════════════════════════════
   THE COST OF WAR — APP LOGIC
   ═══════════════════════════════════════════════════════════════════ */

// ═══ STATE ══════════════════════════════════════════════════════
const sel = new Set();
let allocated = 0;
let ranking = [];
let selectedCountry = null;

// ═══ FORMAT ═════════════════════════════════════════════════════
function fmt(b){return b>=1000?'$'+(b/1000).toFixed(2)+'T':'$'+Math.round(b)+'B';}

// ═══ BG CANVAS ══════════════════════════════════════════════════
const bgEl=document.getElementById('bg'), bgX=bgEl.getContext('2d');
let bgPs=[];
function rsz(){bgEl.width=innerWidth;bgEl.height=innerHeight;}
rsz(); window.addEventListener('resize',()=>{rsz();rszFlow();drawDotField();drawLives();});
for(let i=0;i<90;i++)bgPs.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.1+.2,sx:(Math.random()-.5)*.22,sy:(Math.random()-.5)*.22,c:Math.random()>.7?'255,45,45':Math.random()>.5?'0,229,255':'120,80,200',a:Math.random()*.1+.02});
(function bgL(){bgX.clearRect(0,0,bgEl.width,bgEl.height);bgPs.forEach(p=>{p.x+=p.sx;p.y+=p.sy;if(p.x<0||p.x>bgEl.width||p.y<0||p.y>bgEl.height){p.x=Math.random()*bgEl.width;p.y=Math.random()*bgEl.height;}bgX.beginPath();bgX.arc(p.x,p.y,p.r,0,Math.PI*2);bgX.fillStyle=`rgba(${p.c},${p.a})`;bgX.fill();});requestAnimationFrame(bgL);})();

// ═══ LIVE SPEND TICKER ══════════════════════════════════════════
const pageOpened=Date.now();
function tickLiveSpend(){
  const el=document.getElementById('liveSpend');
  if(el){
    const spent=(Date.now()-pageOpened)/1000*MIL_PER_SECOND;
    el.textContent='$'+Math.floor(spent).toLocaleString();
  }
  requestAnimationFrame(tickLiveSpend);
}

// ═══ HERO COUNTERS ══════════════════════════════════════════════
function cntTo(el,target,dur){
  const s=performance.now();
  (function f(now){
    const p=Math.min((now-s)/dur,1),v=target*(1-Math.pow(1-p,4));
    el.textContent='$'+(v>=1000?(v/1000).toFixed(1)+'T':v.toFixed(0)+'B');
    if(p<1)requestAnimationFrame(f);
  })(performance.now());
}

// ═══ SCROLL REVEAL ══════════════════════════════════════════════
function initReveal(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('on');
        // trigger any data-w bars inside
        e.target.querySelectorAll?.('[data-w]').forEach(b=>{b.style.width=b.dataset.w+'%';});
        if(e.target.dataset.w)e.target.style.width=e.target.dataset.w+'%';
        io.unobserve(e.target);
      }
    });
  },{threshold:.15});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
  // gap bars (inside non-.rv containers too)
  const io2=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('[data-w]').forEach(b=>{b.style.width=b.dataset.w+'%';});
        io2.unobserve(e.target);
      }
    });
  },{threshold:.3});
  document.querySelectorAll('.gap-box').forEach(el=>io2.observe(el));
}

// ═══ COST CARDS (machine + destruction) ═════════════════════════
function buildCostGrid(gridId,data,prefix){
  const g=document.getElementById(gridId);
  if(!g)return;
  data.forEach((w,i)=>{
    const d=document.createElement('div');
    d.className='wc';
    d.innerHTML=`<div class="wc-tag">${w.tag}</div><div class="wc-amt">${w.amt}</div><div class="wc-name">${w.name}</div><div class="wc-sum">${w.sum}</div><div class="wc-expand">${w.detail}</div><div class="wc-bar"><div class="wc-bar-fill" id="${prefix}${i}" style="width:0%"></div></div><div class="wc-src"><a href="${w.url}" target="_blank" rel="noopener">${w.src} ↗</a></div><div class="wc-more" onclick="event.stopPropagation();const c=this.closest('.wc');c.classList.toggle('open');this.textContent=c.classList.contains('open')?'▲ less':'▼ more'">▼ more</div>`;
    d.addEventListener('click',e=>{
      if(e.target.closest('a')||e.target.closest('.wc-more'))return;
      d.classList.toggle('open');
      const m=d.querySelector('.wc-more');if(m)m.textContent=d.classList.contains('open')?'▲ less':'▼ more';
    });
    g.appendChild(d);
    setTimeout(()=>{const f=document.getElementById(prefix+i);if(f)f.style.width=Math.min(w.pct,100)+'%';},500+i*120);
  });
}

// ═══ TOP SPENDERS CHART ═════════════════════════════════════════
function buildSpenders(){
  const wrap=document.getElementById('spendersChart');
  if(!wrap)return;
  const max=topSpenders[0].amt;
  topSpenders.forEach((s,i)=>{
    const row=document.createElement('div');
    row.className='sp-row';
    const up=s.change.startsWith('+');
    row.innerHTML=`<div class="sp-name">${s.name}</div><div class="sp-track"><div class="sp-fill" data-w="${(s.amt/max*100).toFixed(1)}"></div></div><div class="sp-amt">$${s.amt>=100?Math.round(s.amt):s.amt}B</div><div class="sp-chg ${up?'up':'down'}">${s.change}</div>`;
    wrap.appendChild(row);
    if(s.note){
      const n=document.createElement('div');
      n.className='sp-note';n.textContent=s.note;
      wrap.appendChild(n);
    }
  });
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){wrap.querySelectorAll('[data-w]').forEach((b,k)=>setTimeout(()=>b.style.width=b.dataset.w+'%',k*90));io.disconnect();}});},{threshold:.2});
  io.observe(wrap);
}

// ═══ DISPLACED DOT FIELD ════════════════════════════════════════
function drawDotField(){
  const c=document.getElementById('dotField');
  if(!c)return;
  const dpr=window.devicePixelRatio||1;
  const w=c.parentElement.getBoundingClientRect().width;
  if(w<=0)return;
  const totalDots=Math.round(displacedStats.displaced*10);   // 1 dot = 100k people
  const refDots=Math.round((displacedStats.refugees+9)*10);  // refugees + asylum seekers crossed a border
  const cols=Math.floor(w/9);
  const rows=Math.ceil(totalDots/cols);
  const h=rows*9+4;
  c.width=w*dpr;c.height=h*dpr;
  c.style.width=w+'px';c.style.height=h+'px';
  const x=c.getContext('2d');
  x.scale(dpr,dpr);
  for(let i=0;i<totalDots;i++){
    const col=i%cols,row=Math.floor(i/cols);
    const crossed=i<refDots;
    x.beginPath();
    x.arc(col*9+4,row*9+4,1.7,0,Math.PI*2);
    x.fillStyle=crossed?'rgba(0,229,255,.75)':'rgba(0,229,255,.18)';
    x.fill();
  }
}

// ═══ HUMAN COST ═════════════════════════════════════════════════
function buildHuman(){
  const wrap=document.getElementById('humanStats');
  if(!wrap)return;
  humanData.forEach(h=>{
    const d=document.createElement('div');
    d.className='hstat rv';
    d.innerHTML=`<div class="hstat-num">${h.num}</div><div class="hstat-unit">${h.unit}</div><div class="hstat-body">${h.body}</div><div class="hstat-src"><a href="${h.url}" target="_blank" rel="noopener">${h.src} ↗</a></div>`;
    wrap.appendChild(d);
  });
}

function drawLives(){
  const c=document.getElementById('livesCanvas');
  if(!c)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=c.parentElement.getBoundingClientRect().width-(window.innerWidth<=620?40:64);
  if(w<=0)return;
  const total=DEATHS_PER_YEAR;          // one point per person
  const spacing=2;
  const cols=Math.floor(w/spacing);
  const rows=Math.ceil(total/cols);
  const h=rows*spacing+2;
  c.width=w*dpr;c.height=h*dpr;
  c.style.width=w+'px';c.style.height=h+'px';
  const x=c.getContext('2d');
  x.scale(dpr,dpr);
  x.fillStyle='#000';
  for(let i=0;i<total;i++){
    const col=i%cols,row=Math.floor(i/cols);
    const a=.25+Math.random()*.55;
    x.fillStyle=`rgba(255,255,255,${a.toFixed(2)})`;
    x.fillRect(col*spacing,row*spacing,1,1);
  }
}

// ═══ ISSUE CARDS ════════════════════════════════════════════════
function buildIssues(){
  const dg=document.getElementById('detailGrid');
  const pg=document.getElementById('issuesGrid');
  issueData.forEach((iss,i)=>{
    const pct=(iss.cost/DEFENCE)*100;
    const dc=document.createElement('div');dc.className='ic';dc.id='ic'+i;
    dc.innerHTML=`<div class="ic-top"><div class="ic-sdg">${iss.sdg}</div><div class="ic-chk" id="chk${i}"></div></div><div class="ic-name">${iss.name}</div><div class="ic-cost" style="color:${iss.color}">${fmt(iss.cost)}</div><div class="ic-unit">per year · additional investment gap</div><div class="ic-pb"><div id="ipb${i}" style="width:0%;height:100%;background:linear-gradient(90deg,${iss.color}55,${iss.color});transition:width .8s cubic-bezier(.16,1,.3,1)"></div></div><div class="ic-pct"><span>${pct.toFixed(1)}%</span> of the military budget</div><div class="ic-sum">${iss.sum}</div><div class="ic-detail">${iss.detail}</div><div class="ic-more" onclick="event.stopPropagation();const c=this.closest('.ic');c.classList.toggle('exp');this.textContent=c.classList.contains('exp')?'▲ less':'▼ more detail'">▼ more detail</div><div class="ic-src"><a href="${iss.url}" target="_blank" rel="noopener">${iss.src} ↗</a></div>`;
    dc.addEventListener('click',e=>{if(e.target.closest('a'))return;toggleIssue(i);});
    dg.appendChild(dc);
    setTimeout(()=>{const b=document.getElementById('ipb'+i);if(b)b.style.width=Math.min(pct*1.8,100)+'%';},350+i*45);

    const pr=document.createElement('div');pr.className='pic';pr.id='pic'+i;
    pr.innerHTML=`<div class="pic-chk" id="pchk${i}"></div>
<div class="pic-body">
  <div class="pic-name">${iss.name}</div>
  <div class="pic-cost" style="color:${iss.color}">${fmt(iss.cost)}<span style="font-size:.5rem;color:var(--muted);font-weight:400"> /yr</span></div>
  <div class="pic-sum">${iss.sum}</div>
  <div class="pic-detail">${iss.detail}</div>
  <div class="pic-pct-bar"><div id="ppb${i}" style="width:0%;height:100%;background:${iss.color};transition:width .6s cubic-bezier(.16,1,.3,1)"></div></div>
  <div class="pic-foot">
    <span class="pic-more" onclick="event.stopPropagation();const p=this.closest('.pic');p.classList.toggle('pexp');this.textContent=p.classList.contains('pexp')?'▲ less':'▼ detail'">▼ detail</span>
    <span class="pic-src"><a href="${iss.url}" target="_blank" rel="noopener">${iss.src.split(' ')[0]} ↗</a></span>
  </div>
</div>`;
    pr.addEventListener('click',e=>{if(e.target.closest('a'))return;toggleIssue(i);});
    pg.appendChild(pr);
    setTimeout(()=>{const b=document.getElementById('ppb'+i);if(b)b.style.width=Math.min(pct*1.8,100)+'%';},400+i*40);
  });
}

// ═══ TOGGLE ═════════════════════════════════════════════════════
function toggleIssue(i){
  const c=document.getElementById('ic'+i);
  const p=document.getElementById('pic'+i);
  if((c&&c.classList.contains('cant')||p&&p.classList.contains('pcant'))&&!sel.has(i))return;
  if(sel.has(i)){
    sel.delete(i);
    if(c){c.classList.remove('sel');burst(c,'-'+fmt(issueData[i].cost),'#ff2d2d');}
    if(p)p.classList.remove('psel');
  } else {
    sel.add(i);
    if(c)c.classList.add('sel');
    if(p){p.classList.add('psel');burst(p,'+'+fmt(issueData[i].cost),'#00ff88');}
  }
  allocated=0; sel.forEach(x=>allocated+=issueData[x].cost);
  updateTracker(); updateCant(); updateSummary();
}

function updateCant(){
  issueData.forEach((_,i)=>{
    const c=document.getElementById('ic'+i);
    const p=document.getElementById('pic'+i);
    if(sel.has(i)){
      if(c){c.classList.remove('cant');const t=c.querySelector('.cant-tag');if(t)t.remove();}
      if(p)p.classList.remove('pcant');
      return;
    }
    const over=allocated+issueData[i].cost>DEFENCE;
    if(over){
      if(c){c.classList.add('cant');if(!c.querySelector('.cant-tag')){const t=document.createElement('div');t.className='cant-tag';t.textContent='exceeds remaining budget';c.appendChild(t);}}
      if(p)p.classList.add('pcant');
    } else {
      if(c){c.classList.remove('cant');const t=c.querySelector('.cant-tag');if(t)t.remove();}
      if(p)p.classList.remove('pcant');
    }
  });
}

function updateTracker(){
  const rem=Math.max(0,DEFENCE-allocated);
  const pct=Math.max(0,(rem/DEFENCE)*100);
  document.getElementById('tiRem').textContent=fmt(rem);
  document.getElementById('tiAlloc').textContent=fmt(allocated);
  document.getElementById('tiCount').textContent=`${sel.size} issue${sel.size!==1?'s':''} selected`;
  const bar=document.getElementById('tiBar');bar.style.width=pct+'%';
  const remEl=document.getElementById('tiRem');
  if(pct>60){remEl.className='ti-val g';bar.className='ti-bar-fill';}
  else if(pct>25){remEl.className='ti-val a';bar.className='ti-bar-fill a';}
  else{remEl.className='ti-val r';bar.className='ti-bar-fill r';}
}

function updateSummary(){
  const rem=Math.max(0,DEFENCE-allocated);
  const pct=(rem/DEFENCE)*100;
  const sb=document.getElementById('sumBig'),ss=document.getElementById('sumStmt');
  if(sel.size===0){
    sb.innerHTML='Select issues above<br>to begin redistributing';
    ss.textContent='The money to solve these crises already exists in the world\'s annual military budgets. This is not a question of financial capacity. It is a question of political will.';
  } else if(pct<=0){
    sb.innerHTML=`<span class="g">${sel.size} global crises</span><br>fully funded from one year of military spending.`;
    ss.textContent=`You allocated ${fmt(allocated)}. The military budget is exhausted. ${sel.size} of humanity's greatest challenges — fully addressable from a single year of weapons spending. The money was always there.`;
  } else {
    sb.innerHTML=`<span class="g">${fmt(allocated)}</span> allocated to ${sel.size} issue${sel.size!==1?'s':''}.<br><span class="r">${fmt(rem)}</span> still goes to weapons.`;
    ss.textContent=`After funding ${sel.size} global crisis${sel.size!==1?'es':''}, ${fmt(rem)} — ${pct.toFixed(0)}% of the military budget — remains. It continues to flow into weapons. This is the geometry of our current priorities.`;
  }
}

// ═══ BURST ══════════════════════════════════════════════════════
function burst(card,txt,col){
  const r=card.getBoundingClientRect();
  const el=document.createElement('div');
  el.className='burst';el.style.cssText=`left:${r.left+r.width/2-40}px;top:${r.top+8}px;color:${col};text-shadow:0 0 10px ${col}`;
  el.textContent=txt;document.body.appendChild(el);setTimeout(()=>el.remove(),950);
}

// ═══ FLOW CANVAS ════════════════════════════════════════════════
const fC=document.getElementById('flowC'),fX=fC.getContext('2d');
let fW,fH,fParts=[];
const dpr=window.devicePixelRatio||1;

function rszFlow(){
  const panel=fC.parentElement;
  const availW=panel?panel.getBoundingClientRect().width:window.innerWidth*0.65;
  const sz=Math.round(Math.min(availW, window.innerHeight*0.9, 800));
  fW=fC.width=sz*dpr;
  fH=fC.height=sz*dpr;
  fC.style.width=sz+'px';
  fC.style.height=sz+'px';
}

function getNodes(){
  const cx=fW/2,cy=fH/2;
  const n=sel.size;
  const bigR=Math.min(fW,fH)*0.15;
  const arr=[...sel];
  const nodes=[];
  if(n===0) return{cx,cy,bigR,nodes};
  const scale=Math.min(fW,fH)*0.22;
  const rawRs=arr.map(idx=>Math.sqrt(issueData[idx].cost/DEFENCE)*scale);
  const maxRaw=Math.max(...rawRs);
  const margin=Math.min(fW,fH)*0.04;
  const minRing=bigR+maxRaw*1.1+margin;
  const maxRing=Math.min(fW,fH)/2-maxRaw-margin;
  const packRing=n>1?(n*maxRaw*1.15)/Math.PI:minRing;
  const ringDist=Math.max(minRing, Math.min(maxRing, packRing));
  arr.forEach((idx,k)=>{
    const iss=issueData[idx];
    const angle=(k/n)*Math.PI*2-Math.PI/2;
    const r=Math.sqrt(iss.cost/DEFENCE)*scale;
    nodes.push({x:cx+Math.cos(angle)*ringDist,y:cy+Math.sin(angle)*ringDist,r,color:iss.color,idx});
  });
  return{cx,cy,bigR,nodes};
}

function spawnP(cx,cy,tx,ty,col){
  fParts.push({x:cx,y:cy,tx,ty,col,life:1,spd:.005+Math.random()*.009,ox:cx+(Math.random()-.5)*50*dpr,oy:cy+(Math.random()-.5)*50*dpr});
}

function drawFlow(){
  fX.clearRect(0,0,fW,fH);
  const{cx,cy,bigR,nodes}=getNodes();
  const rem=Math.max(0,DEFENCE-allocated);
  const warPct=rem/DEFENCE;
  const baseF=Math.round(Math.min(fW,fH)*0.013);

  const grd=fX.createRadialGradient(cx,cy,0,cx,cy,bigR*2.5);
  grd.addColorStop(0,'rgba(255,45,45,0.07)');grd.addColorStop(1,'rgba(0,0,0,0)');
  fX.fillStyle=grd;fX.beginPath();fX.arc(cx,cy,bigR*2.5,0,Math.PI*2);fX.fill();

  fX.beginPath();fX.arc(cx,cy,bigR,0,Math.PI*2);fX.fillStyle='rgba(40,0,0,0.6)';fX.fill();
  if(warPct>0){
    fX.beginPath();fX.moveTo(cx,cy);
    fX.arc(cx,cy,bigR,-Math.PI/2,-Math.PI/2+warPct*Math.PI*2);
    fX.closePath();fX.fillStyle='rgba(255,45,45,0.55)';fX.fill();
  }
  const rim=fX.createRadialGradient(cx,cy,bigR*.86,cx,cy,bigR*1.14);
  rim.addColorStop(0,'rgba(255,45,45,0.38)');rim.addColorStop(1,'rgba(255,45,45,0)');
  fX.fillStyle=rim;fX.beginPath();fX.arc(cx,cy,bigR*1.14,0,Math.PI*2);fX.fill();

  fX.textAlign='center';fX.textBaseline='middle';
  fX.fillStyle='rgba(255,255,255,0.45)';
  fX.font=`${Math.round(baseF*0.85)}px 'IBM Plex Mono',monospace`;
  fX.fillText('GLOBAL MILITARY BUDGET',cx,cy-bigR*0.24);
  const lcol=warPct<.3?'#ff2d2d':warPct<.6?'#f5a623':'#00ff88';
  fX.fillStyle=lcol;
  fX.font=`${Math.round(baseF*1.9)}px 'Bebas Neue',sans-serif`;
  fX.fillText(fmt(rem),cx,cy+bigR*0.06);
  fX.fillStyle='rgba(255,255,255,0.28)';
  fX.font=`${Math.round(baseF*0.75)}px 'IBM Plex Mono',monospace`;
  fX.fillText('remaining',cx,cy+bigR*0.3);

  nodes.forEach(n=>{
    fX.save();fX.setLineDash([2*dpr,4*dpr]);
    const lg=fX.createLinearGradient(cx,cy,n.x,n.y);
    lg.addColorStop(0,'rgba(255,45,45,0.25)');lg.addColorStop(1,n.color+'33');
    fX.strokeStyle=lg;fX.lineWidth=dpr*0.7;fX.beginPath();fX.moveTo(cx,cy);fX.lineTo(n.x,n.y);fX.stroke();fX.restore();

    const ng=fX.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*2.2);
    ng.addColorStop(0,n.color+'22');ng.addColorStop(.6,n.color+'0a');ng.addColorStop(1,'transparent');
    fX.fillStyle=ng;fX.beginPath();fX.arc(n.x,n.y,n.r*2.2,0,Math.PI*2);fX.fill();

    fX.beginPath();fX.arc(n.x,n.y,n.r,0,Math.PI*2);fX.fillStyle=n.color+'65';fX.fill();
    fX.beginPath();fX.arc(n.x,n.y,n.r,0,Math.PI*2);fX.fillStyle='rgba(0,0,0,0.28)';fX.fill();

    fX.textAlign='center';fX.textBaseline='middle';
    const fs=Math.max(baseF*0.6, Math.min(baseF*1.15, n.r*0.34));
    fX.fillStyle='rgba(255,255,255,0.92)';
    fX.font=`${Math.round(fs)}px 'Bebas Neue',sans-serif`;
    fX.fillText(issueData[n.idx].name.toUpperCase(),n.x,n.y-fs*0.7);
    fX.fillStyle=n.color;
    fX.font=`${Math.round(fs*1.2)}px 'Bebas Neue',sans-serif`;
    fX.fillText(fmt(issueData[n.idx].cost),n.x,n.y+fs*0.7);

    if(Math.random()<.03)spawnP(cx,cy,n.x,n.y,n.color);
  });

  fParts=fParts.filter(p=>{
    p.life-=p.spd;const t=1-p.life;
    p.x=p.ox+(p.tx-p.ox)*t;p.y=p.oy+(p.ty-p.oy)*t;
    const alpha=Math.round(p.life*130).toString(16).padStart(2,'0');
    fX.beginPath();fX.arc(p.x,p.y,1.4*dpr,0,Math.PI*2);fX.fillStyle=p.col+alpha;fX.fill();
    return p.life>0;
  });

  if(sel.size===0){
    fX.textAlign='center';fX.textBaseline='middle';
    fX.fillStyle='rgba(55,55,55,0.7)';
    fX.font=`${baseF*1.1}px 'IBM Plex Mono',monospace`;
    fX.fillText('Select issues on the right →',fW/2,fH*0.88);
  }
  requestAnimationFrame(drawFlow);
}

// ═══ RESET ══════════════════════════════════════════════════════
function resetAll(){
  sel.clear();allocated=0;
  document.querySelectorAll('.ic').forEach(c=>{
    c.classList.remove('sel','cant');const t=c.querySelector('.cant-tag');if(t)t.remove();
  });
  document.querySelectorAll('.pic').forEach(p=>p.classList.remove('psel','pcant'));
  updateTracker();updateSummary();
}

// ═══ SHARE ══════════════════════════════════════════════════════
function openShare(){document.getElementById('shareOv').classList.add('open');}
function closeShare(){document.getElementById('shareOv').classList.remove('open');}
function submitEmail(){
  const v=document.getElementById('emailIn').value.trim();
  if(!v||!v.includes('@'))return;
  const formData=new FormData();
  formData.append('email',v);
  formData.append('source','cost-of-war');
  fetch('https://formsubmit.co/ajax/greg@studioex.co',{method:'POST',body:formData,headers:{'Accept':'application/json'}}).catch(()=>{});
  document.getElementById('sThanks').style.display='block';
  document.getElementById('emailIn').disabled=true;
}
function doShare(type){
  const txt=sel.size?`I just found out that ${sel.size} of humanity's biggest crises could be funded for less than the world's annual military budget. See for yourself: `:'In 2025, violence cost the world $21.8 trillion. Here is what else that money could do: ';
  if(type==='twitter')window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(txt+location.href),'_blank');
  else if(type==='linkedin')window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(location.href),'_blank');
  else if(type==='copy'){navigator.clipboard.writeText(location.href).then(()=>{const b=document.querySelectorAll('.s-lbtn')[2];b.textContent='✓ Copied';setTimeout(()=>b.textContent='Copy Link',2000);});}
}

// ═══ SCROLL PROGRESS ════════════════════════════════════════════
function initScrollProgress(){
  const bar=document.getElementById('scrollBar');
  const dot=document.getElementById('scrollDot');
  window.addEventListener('scroll',()=>{
    const h=document.documentElement.scrollHeight-window.innerHeight;
    const pct=h>0?Math.min(window.scrollY/h,1):0;
    if(bar){bar.style.height=(pct*100)+'%';}
    if(dot){dot.style.top=(pct*100)+'vh';}
  },{passive:true});
}

// ═══ RANKING ════════════════════════════════════════════════════
function buildRanking(){
  const pool=document.getElementById('rankPool');
  const top=document.getElementById('rankTop');
  if(!pool||!top)return;
  top.innerHTML='<div class="rank-empty-msg">Select issues from the right to add them here, in order of priority.</div>';
  pool.innerHTML='';
  issueData.forEach((iss,i)=>{
    const d=document.createElement('div');
    d.className='rank-pill';d.id='rpool'+i;
    d.innerHTML=`<div class="rp-num">${i+1}</div><div class="rp-dot" style="background:${iss.color}"></div><div class="rp-name">${iss.name}</div><div class="rp-cost">${fmt(iss.cost)}</div>`;
    d.addEventListener('click',()=>addRank(i));
    pool.appendChild(d);
  });
}

function addRank(i){
  if(ranking.includes(i)){removeRank(i);return;}
  if(ranking.length>=5)return;
  ranking.push(i);renderRanking();
}

function removeRank(i){
  ranking=ranking.filter(x=>x!==i);renderRanking();
}

function renderRanking(){
  const top=document.getElementById('rankTop');
  const cnt=document.getElementById('rankCount');
  const btn=document.getElementById('rankNextBtn');
  if(!top)return;
  if(cnt)cnt.textContent=`${ranking.length} / 5`;
  top.innerHTML='';
  if(ranking.length===0){
    top.innerHTML='<div class="rank-empty-msg">Select issues from the right to add them here, in order of priority.</div>';
  } else {
    ranking.forEach((idx,pos)=>{
      const iss=issueData[idx];
      const d=document.createElement('div');
      d.className='rank-pill is-ranked';
      d.innerHTML=`<div class="rp-num">${pos+1}</div><div class="rp-dot" style="background:${iss.color}"></div><div class="rp-name">${iss.name}</div><div class="rp-cost">${fmt(iss.cost)}/yr</div><div class="rp-rm" onclick="event.stopPropagation();removeRank(${idx})">✕</div>`;
      top.appendChild(d);
    });
  }
  issueData.forEach((_,i)=>{
    const el=document.getElementById('rpool'+i);
    if(el){
      el.classList.toggle('in-top',ranking.includes(i));
      el.style.pointerEvents=(ranking.length>=5&&!ranking.includes(i))?'none':'auto';
    }
  });
  if(btn){btn.disabled=ranking.length!==5;btn.style.opacity=ranking.length===5?'1':'.3';}
  if(ranking.length===5){
    sel.clear();ranking.forEach(i=>sel.add(i));
    allocated=0;sel.forEach(x=>allocated+=issueData[x].cost);
    updateTracker();updateSummary();updateCant();
    issueData.forEach((_,i)=>{
      const c=document.getElementById('ic'+i);const p=document.getElementById('pic'+i);
      if(c){c.classList.toggle('sel',sel.has(i));}
      if(p){p.classList.toggle('psel',sel.has(i));}
    });
    generateLetter();
  }
}

function resetRanking(){ranking=[];renderRanking();}

// ═══ COUNTRY ════════════════════════════════════════════════════
function buildCountrySelect(){
  const csel=document.getElementById('countrySelect');
  if(!csel)return;
  const seen=new Set();
  countryData.forEach(c=>{
    if(seen.has(c[0]))return;seen.add(c[0]);
    const o=document.createElement('option');o.value=c[0];o.textContent=c[0];csel.appendChild(o);
  });
  try{
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
    const tzMap={'Europe/London':'United Kingdom','America/New_York':'United States','America/Chicago':'United States','America/Denver':'United States','America/Los_Angeles':'United States','Europe/Berlin':'Germany','Europe/Paris':'France','Asia/Tokyo':'Japan','Australia/Sydney':'Australia','Australia/Melbourne':'Australia','Asia/Shanghai':'China','Europe/Moscow':'Russia','Asia/Kolkata':'India','Asia/Singapore':'Singapore'};
    const guess=Object.entries(tzMap).find(([t])=>tz===t||tz.startsWith(t));
    if(guess){csel.value=guess[1];showCountry(guess[1]);}
  }catch(e){}
}

function showCountry(name){
  const c=countryData.find(x=>x[0]===name);
  const box=document.getElementById('countryData');
  const btn=document.getElementById('countryNextBtn');
  if(!c||!box){if(box)box.style.display='none';return;}
  selectedCountry=c;
  if(btn){btn.disabled=false;btn.style.opacity='1';}
  box.style.display='block';
  const spend=c[2];
  const comparisons=issueData.slice(0,6).map(iss=>{
    const pct=Math.min((spend/iss.cost)*100,100);
    const covers=(spend/iss.cost*100).toFixed(0);
    const canFund=spend>=iss.cost;
    return `<div class="cc-bar-row">
      <div class="cc-bar-lbl">${iss.name}</div>
      <div class="cc-bar-track"><div class="cc-bar-fill" style="width:0%;background:${iss.color}" data-w="${pct.toFixed(1)}"></div></div>
      <div class="cc-bar-val" style="color:${canFund?'var(--green)':'var(--muted)'}">${covers}%</div>
    </div>`;
  }).join('');
  const contactHTML=c[5]?`<a href="${c[5]}" target="_blank" rel="noopener">Contact your representative ↗</a>`:'';
  box.innerHTML=`<div class="cc-name">${c[0]}</div>
<div class="cc-spend">$${spend}B</div>
<div class="cc-meta">${c[3]}% of GDP · SIPRI 2025 · Population ~${c[4]}M${contactHTML?' · '+contactHTML:''}</div>
<div class="cc-bars">${comparisons}</div>
<div class="cc-note">Your country contributes ${(spend/DEFENCE*100).toFixed(2)}% of the $2.89T global military total. This is the scale of your nation's stake in how the world chooses to spend its resources.</div>`;
  setTimeout(()=>{box.querySelectorAll('.cc-bar-fill').forEach(el=>{el.style.transition='width 1.3s cubic-bezier(.16,1,.3,1)';el.style.width=el.dataset.w+'%';});},100);
  generateLetter();
  const note=document.getElementById('letterContactNote');
  if(note&&c[5])note.innerHTML=`Find your representative: <a href="${c[5]}" target="_blank">${c[0]} government contact page ↗</a>`;
}

// ═══ LETTER ═════════════════════════════════════════════════════
function generateLetter(){
  const out=document.getElementById('letterOutput');
  if(!out)return;
  if(ranking.length<5){
    out.innerHTML='<span class="letter-placeholder">Complete your top 5 ranking and select your country — your letter will appear here, ready to edit.</span>';
    return;
  }
  const name=(document.getElementById('letterName')?.value||'').trim()||'A concerned citizen';
  const leaderRaw=(document.getElementById('letterTitle')?.value||'').trim();
  const leader=leaderRaw||(selectedCountry?`Prime Minister / President of ${selectedCountry[0]}`:'[Your Head of State]');
  const country=selectedCountry?selectedCountry[0]:'our shared world';
  const spend=selectedCountry?`$${selectedCountry[2]} billion`:'billions in public funds';
  const gdpPct=selectedCountry?selectedCountry[3]:null;
  const top5=ranking.map((idx,i)=>`  ${i+1}. ${issueData[idx].name} — ${fmt(issueData[idx].cost)} per year`).join('\n');
  const totalB=ranking.reduce((s,i)=>s+issueData[i].cost,0);
  const totalNeeded=fmt(totalB);
  const shareOfBudget=Math.round(totalB/DEFENCE*100);

  const letter=`Dear ${leader},

My name is ${name}. I am writing to you not as a partisan voice, not as an ideologue, and not from a place of anger — but as a human being who has sat with some uncomfortable numbers, and who can no longer stay quiet about what they mean.

In 2025, the world spent $2.89 trillion on its militaries — the eleventh consecutive annual record. ${country!=='our shared world'?country+' contributed '+spend+' to that total'+(gdpPct?' — '+gdpPct+'% of our national GDP':'')+'.':''} I do not write to question the sincerity of those who serve, or to pretend that the threats governments face are not real. I understand complexity. I understand that the world is not safe.

But I have come to believe that the world is also not as safe as it could be — precisely because of how we are choosing to spend.

This year, 673 million people went hungry. 272 million children could not go to school. 117.8 million people remain displaced from their homes. The UN's humanitarian appeal received barely a third of what it asked for — while spending on nuclear weapons alone rose 19% to a record $119 billion. The climate is warming faster than our institutions are responding. These are not abstract statistics. They are the compounding conditions of a planet in genuine distress — one that will produce more conflict, more instability, and more suffering the longer we leave them unaddressed.

The United Nations' own agencies have calculated what it would cost to make material progress on these crises. The figures are significant — but they are dwarfed by what we already spend on weapons.

I have thought carefully about where I believe the world must focus its resources. My five priorities are:

${top5}

To fund all five of these causes at the levels needed would cost ${totalNeeded} per year — about ${shareOfBudget}% of one year of global military spending. Not a utopian fantasy. A budget question.

I am not naive. I know that reallocation at this scale requires political courage that is rarely rewarded in short electoral cycles. I know that competing interests, alliances, and genuine security threats make this harder than any one letter can resolve. But I also know that the trajectory we are on — ever-increasing military budgets in a warming, hungering, fractured world — is not making any of us safer. It is buying time, not peace.

I am asking you to think across a longer horizon. To build alliances not only of military capability but of shared human survival. To consider that the greatest security threat facing your citizens in the coming decades is not a rival army, but a planet that can no longer sustain the conditions of civilised life.

We are not separate nations with separate interests. We are one species, sharing one atmosphere, drinking from the same water cycles, and feeding from the same soils. The decisions made in the coming years about how to allocate this planet's resources will shape whether our children inherit a liveable world.

I am choosing to believe you share that goal. And I am asking you, respectfully but urgently, to act like it.

Yours sincerely,

${name}
${country}

—
This letter was generated at studioex.co · The Cost of War · An artwork by Blueprint × StudioEX`;

  out.innerText=letter;
  out.dataset.plain=letter;
}

function copyLetter(){
  const out=document.getElementById('letterOutput');
  const txt=out?.innerText||out?.dataset?.plain||'';
  navigator.clipboard.writeText(txt).then(()=>{
    const b=document.querySelector('.tool-btn');
    if(b){const o=b.textContent;b.textContent='✓ Copied';setTimeout(()=>b.textContent=o,2000);}
  });
}

function emailLetter(){
  const out=document.getElementById('letterOutput');
  const txt=out?.innerText||out?.dataset?.plain||'';
  const sub=encodeURIComponent('On the allocation of our national budget — a citizen\'s priorities');
  window.open(`mailto:?subject=${sub}&body=${encodeURIComponent(txt)}`,'_blank');
}

function tweetLetter(){
  const r5=ranking.slice(0,5).map(i=>issueData[i].name).join(', ');
  const txt=`My top 5 priorities for planetary funding:\n${r5}\nCost: ${fmt(ranking.reduce((s,i)=>s+issueData[i].cost,0))}/yr vs the world's $2.89T military budget\nstudioex.co #CostOfWar @404blueprint`;
  window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(txt),'_blank');
}

function goToCountry(){document.getElementById('countrySection')?.scrollIntoView({behavior:'smooth',block:'start'});}
function goToLetter(){document.getElementById('letterSection')?.scrollIntoView({behavior:'smooth',block:'start'});}
function goToCoalition(){document.getElementById('coalitionSection')?.scrollIntoView({behavior:'smooth',block:'start'});}

// ═══ COALITION ══════════════════════════════════════════════════
// NOTE FOR BACKEND DEV: replace localStorage with a real store (e.g.
// Supabase table `submissions` — see README). Set SUPABASE_URL/KEY.
const SUPABASE_URL=null;
const SUPABASE_KEY=null;
const SEED_COUNT=2847;

function getLocalSubs(){try{return JSON.parse(localStorage.getItem('cow_subs')||'[]');}catch(e){return[];}}
function saveLocalSub(d){const a=getLocalSubs();a.push(d);try{localStorage.setItem('cow_subs',JSON.stringify(a.slice(-500)));}catch(e){}}

function getTally(){
  const local=getLocalSubs();
  const tally={};
  local.forEach(s=>{if(s.ranking)s.ranking.forEach(i=>{tally[i]=(tally[i]||0)+1;});});
  return{count:SEED_COUNT+local.length,tally};
}

function initCoalition(){
  const{count,tally}=getTally();
  animCoalitionNum(count);
  const topDiv=document.getElementById('coalitionTopIssues');
  if(topDiv){
    topDiv.innerHTML='';
    issueData.forEach((_,i)=>{
      const div=document.createElement('div');
      div.className='cti'+(tally[i]?' hot':'');
      div.textContent=issueData[i].name;
      topDiv.appendChild(div);
    });
  }
  setTimeout(()=>{const f=document.getElementById('coalitionBarFill');if(f)f.style.width=Math.min(count/10000*100,100)+'%';},700);
}

function animCoalitionNum(target){
  const el=document.getElementById('coalitionNum');if(!el)return;
  const s=performance.now(),from=SEED_COUNT,dur=1800;
  (function f(now){const p=Math.min((now-s)/dur,1),v=Math.round(from+(target-from)*(1-Math.pow(1-p,4)));el.textContent=v.toLocaleString();if(p<1)requestAnimationFrame(f);})(s);
}

function submitCoalition(){
  if(ranking.length<5){alert('Please complete your top 5 ranking first (above).');return;}
  const email=(document.getElementById('coalitionEmail')?.value||'').trim();
  const country=selectedCountry?selectedCountry[0]:'Unknown';
  const data={ranking:[...ranking],country,email,ts:Date.now()};
  saveLocalSub(data);
  if(SUPABASE_URL&&SUPABASE_KEY){fetch(`${SUPABASE_URL}/rest/v1/submissions`,{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(data)}).catch(()=>{});}
  if(email){const fd=new FormData();fd.append('email',email);fd.append('country',country);fd.append('priorities',ranking.map(i=>issueData[i].name).join(', '));fd.append('source','coalition');fetch('https://formsubmit.co/ajax/greg@studioex.co',{method:'POST',body:fd,headers:{'Accept':'application/json'}}).catch(()=>{});}
  const thanks=document.getElementById('coalitionThanks');if(thanks)thanks.style.display='block';
  const btn=document.querySelector('.coalition-form .btn-t');if(btn)btn.disabled=true;
  const emailEl=document.getElementById('coalitionEmail');if(emailEl)emailEl.disabled=true;
  const{count}=getTally();animCoalitionNum(count);initCoalition();
  setTimeout(()=>generateShareCard(),500);
}

// ═══ SHARE CARD ═════════════════════════════════════════════════
function generateShareCard(){
  if(ranking.length<5)return;
  const country=selectedCountry?selectedCountry[0]:'the world';
  const spend=selectedCountry?`$${selectedCountry[2]}B`:'$2.89T';
  const totalB=ranking.reduce((s,i)=>s+issueData[i].cost,0);
  const total=fmt(totalB);
  const{count}=getTally();

  const hed=document.getElementById('scHeadline');
  if(hed)hed.textContent=`I choose to fund the planet.`;

  const issDiv=document.getElementById('scIssues');
  if(issDiv){
    issDiv.innerHTML='';
    ranking.slice(0,5).forEach((idx,pos)=>{
      const iss=issueData[idx];
      const row=document.createElement('div');row.className='sc-row';
      row.innerHTML=`<div class="sc-rn">${pos+1}</div><div class="sc-dot" style="background:${iss.color}"></div><div class="sc-in">${iss.name}</div><div class="sc-ic" style="color:${iss.color}">${fmt(iss.cost)}/yr</div>`;
      issDiv.appendChild(row);
    });
  }

  const statL=document.getElementById('scStatLeft');
  if(statL)statL.innerHTML=`Total annual cost:<br>${total}<br><br>${Math.round(totalB/DEFENCE*100)}% of the global military budget`;
  const statR=document.getElementById('scStatRight');
  if(statR)statR.textContent=`${count.toLocaleString()}\npeople\nhave chosen`;

  const cl=document.getElementById('scCountryLine');
  if(cl)cl.textContent=`From ${country} · ${spend} annual military spend`;

  document.getElementById('scOverlay')?.classList.add('open');
}

function downloadCard(){
  if(window.html2canvas){
    html2canvas(document.getElementById('shareCard'),{backgroundColor:'#000',scale:2}).then(c=>{
      const a=document.createElement('a');a.download='cost-of-war-my-priorities.png';a.href=c.toDataURL('image/png');a.click();
    });
  } else {
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';s.onload=()=>downloadCard();document.head.appendChild(s);
  }
}

function shareCardTo(type){
  const r5=ranking.slice(0,5).map(i=>issueData[i].name).join(' · ');
  const txt=`My top 5 priorities if we redirected the world's $2.89T military budget:\n${r5}\nTotal: ${fmt(ranking.reduce((s,i)=>s+issueData[i].cost,0))}/yr\nstudioex.co  #CostOfWar @404blueprint`;
  if(type==='twitter')window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(txt),'_blank');
  else if(type==='linkedin')window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(location.href),'_blank');
  else if(type==='instagram')navigator.clipboard.writeText(txt).then(()=>alert('Caption copied — paste into Instagram. Screenshot your card first!'));
}

// ═══ INIT ═══════════════════════════════════════════════════════
window.addEventListener('load',()=>{
  setTimeout(()=>{
    cntTo(document.getElementById('hDef'),2887,2200);
    cntTo(document.getElementById('hTotal'),21810,3000);
  },450);
  tickLiveSpend();
  buildCostGrid('machineGrid',machineData,'mb');
  buildCostGrid('destructionGrid',destructionData,'db');
  buildSpenders();
  drawDotField();
  buildHuman();
  drawLives();
  buildIssues();
  buildRanking();
  buildCountrySelect();
  initCoalition();
  initScrollProgress();
  initReveal();
  rszFlow();
  drawFlow();
  updateTracker();
  updateSummary();
});
