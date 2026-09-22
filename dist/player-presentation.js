function stickerInternational(p){
 if(!['silver','gold'].includes(p.theme))return '';
 const totals=Engine.internationalTotals(p),t=totals.senior.caps>0?totals.senior:totals.youth.caps>0?totals.youth:null;
 if(!t)return '';
 const label=t===totals.senior?'INT A':'INT JOVENS';
 return `<div class="sticker-international" title="${t.capsUnknown?'Total parcial: existem contagens por preencher':'Internacionalizações registadas'}"><b>${t.caps}${t.capsUnknown?'+':''}</b><span>${label}</span></div>`;
}
function playerNationalityList(p){
 return [...new Set([p.nation,p.secondNation].filter(Boolean))].map(n=>`<span class="search-nationality">${countryFlag(n)}${esc(n)}</span>`).join(' ')||'Por indicar';
}
function playerStickerMarkup(p,state=s){
 const c=state.clubs.find(c=>c.id===p.club),initials=c?c.name.replace(/FC |AC /g,'').slice(0,2).toUpperCase():'—',bg=c?.color||'#46515d',theme=['silver','gold'].includes(p.theme)?p.theme:'base',age=p.birthDate?Engine.age({...state,round:state.round||0},p):undefined,overall=Engine.gameOverall(p),clubName=c?.name||'Sem clube';
 return `<div class="sticker edition-${theme}" style="--sticker-color:${bg};${cardIdentityStyle(c)}">${cardIdentityArtwork(c)}<div class="top"><div class="club-badge ${c?.logo?'has-logo':''}">${c?clubMark(c):'—'}</div><div class="rating" aria-label="AVG do jogo: ${overall}">${overall}</div></div><div class="portrait">${p.photo?`<img src="${esc(p.photo)}" alt="Fotografia de ${esc(p.name)}" style="object-fit:${p.crop==='cover'?'cover':'contain'};transform:translate(${p.photoX??0}%,${p.photoY??0}%) scale(${(p.photoZoom??100)/100});transform-origin:center">`:`<div class="player-monogram">${esc((p.name||'J').split(' ').map(n=>n[0]).join('').slice(0,2))}<small>SEM FOTOGRAFIA</small></div>`}</div><div class="strip"><h2>${esc(p.name||'Jogador')}</h2><div class="sub"><span>${esc(p.position)} · #${p.number??'—'}</span><span>${esc(clubName)}</span></div></div><div class="sticker-bottom ${Number.isFinite(age)?'':'no-age'}"><div class="sticker-country">${playerNationalityFlag(p)}</div>${stickerInternational(p)}${Number.isFinite(age)?`<div class="sticker-age"><b>${age}</b><span>IDADE</span></div>`:''}</div><div class="collection"><span>HELVETIA COLLECTION</span><span>${state.year}/${String(state.year+1).slice(-2)} · #${p.id??'NOVO'}</span></div></div>`;
}
function drawPlayerIdentity(){
 const p=playerDraft,c=s.clubs.find(c=>c.id===p.club),chips=[p.status||'Activo',Documentary.verification(p)];
 if(Documentary.isInternational(p,'senior'))chips.push('Internacional A');if(Documentary.isInternational(p,'youth'))chips.push('Internacional jovem');
 if(p.contractEnd)chips.push('Contrato até '+p.contractEnd.slice(0,4));
 const id=p.id??-1,candidate={...s,players:p.id===undefined?[...s.players,{...p,id}]:s.players.map(x=>x.id===p.id?p:x)},report=Documentary.diagnostics(candidate),warnings=report.warnings.filter(w=>w.type==='players'&&w.id===id).map(w=>w.message);
 if(report.duplicateIds.has(id))warnings.unshift('Possível duplicado por nome e nascimento. Confirmar a identidade antes de alterar.');
 const root=$('playerIdentityHeader'),open=root.querySelector('details')?.open;
 const nations=[...new Set([p.nation,p.secondNation].filter(Boolean))];
 root.innerHTML=`<div class="player-identity-overview identity-banner"><div class="identity-banner-content"><div class="identity-meta"><button type="button" id="identityClubLink" class="identity-link"><span class="identity-club-mark">${c?clubMark(c):'—'}</span>${esc(c?.name||'Sem clube')}</button><span aria-hidden="true">·</span>${playerNationalityFlag(p)}${nations.map(n=>`<button type="button" class="identity-link" data-identity-nation="${esc(n)}">${esc(resolveCountry(n)?countryName(resolveCountry(n)):n)}</button>`).join('<span aria-hidden="true">/</span>')}<span aria-hidden="true">·</span><span>${esc([p.position,...(p.secondaryPositions||[])].filter(Boolean).join(' / '))} · #${p.number??'—'}</span></div><div class="identity-name-line"><h2>${esc(p.name||'Novo jogador')}</h2><div class="identity-scores" aria-label="Valores da simulação"><div class="identity-score avg" title="AVG do jogo — valor exclusivo da simulação"><strong id="headerAvg">${Engine.gameOverall(p)}</strong><small>AVG</small></div><div class="identity-score potential" title="Potencial do jogo — valor exclusivo da simulação"><strong id="headerPotential">${p.potential??'—'}</strong><small>Potencial</small></div></div></div><div class="identity-chips">${chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></div>${warnings.length?`<details class="identity-warnings" ${open?'open':''}><summary>${warnings.length} aviso(s) para rever</summary><ul>${warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><p>Nenhum dado é corrigido automaticamente.</p></details>`:''}`;
 $('identityClubLink').onclick=()=>navigateIdentityFilter({club:c?String(c.id):'free'},c?.name||'Sem clube');
 root.querySelectorAll('[data-identity-nation]').forEach(b=>b.onclick=()=>navigateIdentityFilter({nation:resolveCountry(b.dataset.identityNation)||PlayerSearch.normalize(b.dataset.identityNation)},b.dataset.identityNation));

}
function drawPlayerTimeline(){
 const root=$('playerTimeline');if(!root)return;const rows=Documentary.timeline(playerDraft,s),render=events=>`<ol class="document-timeline">${events.map(e=>`<li><time>${e.date?esc(e.date.split('-').reverse().join('/')):'Data por indicar'}</time><div><b>${esc(e.title)}</b><p>${esc(e.detail)}</p></div></li>`).join('')}</ol>`;
 root.innerHTML=(rows.dated.length?render(rows.dated):'<p class="muted">Ainda não existem acontecimentos datados.</p>')+(rows.undated.length?'<h3>Informação sem data</h3>'+render(rows.undated):'');
}
let playerBrowserView='table';
const playerColumnLabels=['Jogador','Clube','Posição','Idade','Nacionalidade','Verificação','Completude'];
let playerVisibleColumns=playerColumnLabels.map(()=>true);
function playerViewControls(){return `<div class="toolbar player-view-controls"><button id="viewTable" type="button" aria-pressed="${playerBrowserView==='table'}">Tabela</button><button id="viewCards" type="button" aria-pressed="${playerBrowserView==='cards'}">Cromos</button><details id="playerColumnOptions" ${playerBrowserView==='cards'?'hidden':''}><summary>Colunas da tabela</summary><div>${playerColumnLabels.map((label,i)=>`<label><input type="checkbox" data-player-column="${i}" ${playerVisibleColumns[i]?'checked':''} ${i===0?'disabled':''}> ${label}</label>`).join('')}</div></details></div>`;}
function bindPlayerViewControls(){
 $('viewTable').onclick=()=>{playerBrowserView='table';drawPlayerResults();};$('viewCards').onclick=()=>{playerBrowserView='cards';drawPlayerResults();};
 document.querySelectorAll('[data-player-column]').forEach(el=>el.onchange=()=>{playerVisibleColumns[+el.dataset.playerColumn]=el.checked;drawPlayerResults();});
}
function applyPlayerView(shown){
 $('viewTable').setAttribute('aria-pressed',String(playerBrowserView==='table'));$('viewCards').setAttribute('aria-pressed',String(playerBrowserView==='cards'));$('playerColumnOptions').hidden=playerBrowserView==='cards';
 if(playerBrowserView==='cards'&&shown.length){$('searchResults').innerHTML=`<div class="player-card-grid">${shown.map(p=>`<article class="player-card-result" data-card-player="${p.id}">${playerStickerMarkup(master.players.find(record=>record.id===p.id)||p,World.context(master))}<button class="card-open" data-search-player="${p.id}" type="button">Abrir ficha · ${esc(p.name)}</button><small>${Documentary.completeness(p,master).percent}% documental · ${esc(Documentary.verification(p))}</small></article>`).join('')}</div>`;document.querySelectorAll('[data-card-player]').forEach(el=>el.onclick=e=>{if(!e.target.closest('button'))openPlayer(+el.dataset.cardPlayer);});}
 else $('searchResults').querySelectorAll('tr').forEach(row=>[...row.children].forEach((cell,i)=>cell.hidden=!playerVisibleColumns[i]));
}

function photoFrameControls(p){return `<fieldset class="photo-framing"><legend>Enquadramento da fotografia no cromo</legend>${[['photoZoom','Zoom',80,200,100],['photoX','Posição horizontal',-50,50,0],['photoY','Posição vertical',-50,50,0]].map(([key,label,min,max,def])=>`<label>${label} <output id="${key}Value">${p[key]??def}%</output><input type="range" name="${key}" min="${min}" max="${max}" step="1" value="${p[key]??def}"></label>`).join('')}<button type="button" id="resetPhotoFrame">Repor enquadramento</button><p class="muted">O zoom pode cortar parte da figura. Estes ajustes só afectam o cromo; a fotografia original e as miniaturas são preservadas.</p></fieldset>`;}
function resetPhotoFrame(){for(const [key,value] of [['photoZoom',100],['photoX',0],['photoY',0]]){playerDraft[key]=value;$('playerForm').elements[key].value=value;}drawPlayer();}
