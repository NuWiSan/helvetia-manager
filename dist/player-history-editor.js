/* Documentary rows remain in the shared player model; all editing is a draft. */
let historyEditing=null,historyInitial='',playerNavigationIds=[],playerDraftBaseline='',playerMovementBaseline='',pendingDocumentaryClubs=[],playerPhotoBusy=false;
function historicalClubName(row){return row.clubName||s.clubs.find(c=>c.id===row.club)?.name||'Sem clube';}
function documentaryClubOptions(){
 const known=[...(s.documentaryClubs||[]),...pendingDocumentaryClubs];
 return '<option value="">Escolher clube…</option>'+s.clubs.map(c=>`<option value="club:${c.id}">${esc(c.name)}</option>`).join('')+known.map((c,i)=>`<option value="external:${i}">${esc(c.name)}${c.country?' · '+esc(c.country):''}</option>`).join('')+'<option value="new">+ Outro clube / outro país</option>';
}
function historyEditorMarkup(){return `<section class="history-editor"><h3>Contratos e passagens por clubes</h3><p class="muted">Regista o percurso anterior sem alterar o clube nem o contrato actual. Os clubes de outros países ficam disponíveis nas próximas escolhas.</p><div id="historyEntry"></div><div id="historyRows"></div></section><section><h3>Estatísticas reais por época</h3><p class="muted">Dados documentais. Não são resultados do motor de jogo. Deixa valores desconhecidos em branco.</p><div id="documentaryStatRows"></div></section><details class="journey-timeline" open><summary>Cronologia do percurso</summary><div id="playerTimeline"></div></details>`;}
function historyEntryValue(){const root=$('historyEntry');return JSON.stringify([...root.querySelectorAll('input,select,textarea')].map(el=>[el.id,el.value]));}
function historyEntryDirty(){return !!$('historyEntry')&&historyEntryValue()!==historyInitial;}
function drawHistoryEditor(kind='contract',index=null){
 historyEditing={kind,index};const key=kind==='contract'?'contractHistory':'documentaryStats',row=index===null?{}:playerDraft[key][index];
 const input=(id,label,type='text',v='',extra='')=>`<label>${label}<input id="hist-${id}" type="${type}" value="${esc(v??'')}" ${extra}></label>`;
 $('historyEntry').innerHTML=`<h4>${index===null?'Adicionar':'Editar'} ${kind==='contract'?'contrato anterior':'estatísticas reais'}</h4><div class="player-grid"><label>Clube<select id="hist-club">${documentaryClubOptions()}</select></label><div id="hist-external" class="player-grid wide" hidden>${input('clubName','Nome do clube','text',row.clubName||'','maxlength="200"')}${input('clubCountry','País','text',row.clubCountry||'','maxlength="200"')}</div>${kind==='contract'?input('start','Início','date',row.contractStart)+input('end','Fim','date',row.contractEnd):input('season','Época (ex.: 2025/26)','text',row.season,'maxlength="30"')+input('competition','Competição / âmbito','text',row.competition,'maxlength="200"')+[['appearances','Jogos'],['minutes','Minutos'],['goals','Golos'],['assists','Assistências']].map(([k,l])=>input(k,l,'number',row[k],'min="0" max="1000000" step="1"')).join('')+input('source','Fonte / referência','text',row.source,'maxlength="2000"')}</div><div class="toolbar"><button type="button" id="historyApply">${index===null?'Adicionar':'Aplicar edição'}</button><button type="button" id="historyReset">Cancelar entrada</button></div><p id="historyError" role="alert"></p>`;
 const select=$('hist-club');if(Number.isInteger(row.club))select.value='club:'+row.club;else if(row.clubName){select.value='new';}
 const refresh=()=>{$('hist-external').hidden=select.value!=='new';};select.onchange=refresh;refresh();historyInitial=historyEntryValue();
 $('historyApply').onclick=commitHistoryEntry;$('historyReset').onclick=()=>drawHistoryEditor();drawHistoryRows();
}
function commitHistoryEntry(){
 try{
  for(const el of $('historyEntry').querySelectorAll('input'))if(!el.reportValidity())return false;
  const {kind,index}=historyEditing,key=kind==='contract'?'contractHistory':'documentaryStats',rows=structuredClone(playerDraft[key]||[]),row=index===null?{}:{...rows[index]},chosen=$('hist-club').value;let external;
  if(chosen.startsWith('club:')){row.club=Number(chosen.slice(5));delete row.clubName;delete row.clubCountry;}
  else if(chosen.startsWith('external:')){external=[...(s.documentaryClubs||[]),...pendingDocumentaryClubs][Number(chosen.slice(9))];}
  else if(chosen==='new'){external={name:$('hist-clubName').value.trim(),country:$('hist-clubCountry').value.trim()};Documentary.validateCatalog([external]);}
  else throw Error('Escolhe o clube representado.');
  if(external){row.club=null;row.clubName=external.name;row.clubCountry=external.country;}
  if(kind==='contract'){row.contractStart=$('hist-start').value;row.contractEnd=$('hist-end').value;Documentary.validatePeriod(row,'contractStart','contractEnd');}
  else{row.season=$('hist-season').value.trim();row.competition=$('hist-competition').value.trim();row.source=$('hist-source').value.trim();for(const k of ['appearances','minutes','goals','assists'])row[k]=$('hist-'+k).value===''?null:Number($('hist-'+k).value);}
  if(index===null)rows.push(row);else rows[index]=row;
  const candidate={...playerDraft,[key]:rows};Documentary.validatePlayer(candidate);
  playerDraft[key]=rows;
  if(external&&![...(s.documentaryClubs||[]),...pendingDocumentaryClubs].some(c=>Documentary.normalize(c.name)===Documentary.normalize(external.name)&&Documentary.normalize(c.country)===Documentary.normalize(external.country)))pendingDocumentaryClubs.push(external);
  drawHistoryEditor(kind);drawPlayer();return true;
 }catch(e){$('historyError').textContent=e.message;return false;}
}
function drawHistoryRows(){
 const actions=(kind,i)=>`<button type="button" data-history-edit="${kind}:${i}">Editar</button> <button type="button" data-history-remove="${kind}:${i}">Remover</button>`;
 $('historyRows').innerHTML=(playerDraft.contractHistory||[]).map((h,i)=>`<article class="documentary-row"><div><b>${esc(historicalClubName(h))}</b><p>${esc(h.contractStart||'Início por indicar')} → ${esc(h.contractEnd||'Fim por indicar')}${h.salary!==undefined?' · '+money(h.salary):''}</p></div><div>${actions('contract',i)}</div></article>`).join('')||'<p class="muted">Sem contratos anteriores registados.</p>';
 $('documentaryStatRows').innerHTML=`<button type="button" id="addDocumentaryStats">+ Registar época</button>`+(playerDraft.documentaryStats||[]).map((h,i)=>`<article class="documentary-row"><div><b>${esc(h.season)} · ${esc(historicalClubName(h))}</b><p>${esc(h.competition||'Competição por indicar')} · ${h.appearances??'—'} jogos · ${h.minutes??'—'} min · ${h.goals??'—'} golos · ${h.assists??'—'} assistências</p>${h.source?`<small>Fonte: ${esc(h.source)}</small>`:''}</div><div>${actions('stats',i)}</div></article>`).join('');
 const canSwitch=()=>{if(historyEntryDirty()){$('historyError').textContent='Aplica ou cancela primeiro a entrada em edição.';return false;}return true;};
 $('addDocumentaryStats').onclick=()=>{if(canSwitch()){drawHistoryEditor('stats');$('historyEntry').scrollIntoView({block:'nearest'});}};
 $('playerEditor').querySelectorAll('[data-history-edit]').forEach(b=>b.onclick=()=>{if(!canSwitch())return;const [kind,i]=b.dataset.historyEdit.split(':');drawHistoryEditor(kind,+i);$('historyEntry').scrollIntoView({block:'nearest'});});
 $('playerEditor').querySelectorAll('[data-history-remove]').forEach(b=>b.onclick=()=>{if(!canSwitch()||!confirm('Remover esta entrada do percurso? A remoção só será aplicada ao guardar o jogador.'))return;const [kind,i]=b.dataset.historyRemove.split(':');playerDraft[kind==='contract'?'contractHistory':'documentaryStats'].splice(+i,1);drawHistoryEditor();drawPlayer();});
}
function playerNationalityFlag(p){
 const a=resolveCountry(p.nation),b=resolveCountry(p.secondNation);if(!a||!b||a===b)return countryFlag(p.nation||p.secondNation);
 const label=countryName(a)+' / '+countryName(b);return `<span class="dual-nationality" role="img" aria-label="${esc(label)}" title="${esc(label)}"><img src="${esc(flagAsset(a))}" alt=""><img src="${esc(flagAsset(b))}" alt=""></span>`;
}
function setupPlayerNavigation(id,keep){
 if(!keep){let ids=[];if($('searchResults'))ids=PlayerSearch.find(master,playerFilters,resolveCountry).map(p=>p.id);else if($('global-results')?.querySelector('[data-global-type="players"]')){ids=[...$('global-results').querySelectorAll('[data-global-type="players"]')].map(el=>Number(el.dataset.globalId));}else{ids=[...document.querySelectorAll('[data-player]')].map(el=>Number(el.dataset.player));}if(!ids.includes(id)){const c=s.players.find(p=>p.id===id)?.club;ids=s.players.filter(p=>p.club===c).map(p=>p.id);}playerNavigationIds=[...new Set(ids)];}
 const position=playerNavigationIds.indexOf(id);for(const [key,delta] of [['playerPrevious',-1],['playerNext',1]]){const b=$(key),target=playerNavigationIds[position+delta];b.disabled=position<0||target===undefined;b.onclick=()=>{
  if(playerPhotoBusy){$('playerError').textContent='Aguarda a optimização da fotografia.';return;}
  readPlayerForm();if($('pastApply')){$('playerError').textContent='Aplica ou cancela a edição da transferência antes de mudar de jogador.';return;}if(JSON.stringify(playerDraft)!==playerDraftBaseline||JSON.stringify(playerMovement)!==playerMovementBaseline||sourceEntryDirty()||internationalEntryDirty()||historyEntryDirty()){
   $('playerNavigationPrompt').innerHTML='<span>Há alterações por guardar.</span><button type="button" id="navSave">Guardar e continuar</button><button type="button" id="navDiscard">Descartar e continuar</button><button type="button" id="navStay">Ficar nesta ficha</button>';
   $('navStay').onclick=()=>{$('playerNavigationPrompt').innerHTML='';};$('navDiscard').onclick=()=>{openPlayer(target,true);};$('navSave').onclick=()=>{if(savePlayerDraft())openPlayer(target,true);};
  }else openPlayer(target,true);
 };}
}
function savePlayerDraft(){
 if($('pastApply')){$('pt-carreira').click();$('playerError').textContent='Aplica ou cancela a edição da transferência antes de guardar.';return false;}
 if(playerPhotoBusy){$('playerError').textContent='Aguarda a optimização da fotografia.';return false;}
 readPlayerForm();if(sourceEntryDirty()&&!commitSourceEntry()){$('pt-fontes').click();return false;}if(internationalEntryDirty()&&!commitInternationalEntry()){$('pt-internacional').click();return false;}if(historyEntryDirty()&&!commitHistoryEntry()){$('pt-carreira').click();return false;}
 try{
  if(!playerDraft.name.trim())throw Error('Indica o nome do jogador.');
  const catalog=[...(s.documentaryClubs||[]),...pendingDocumentaryClubs];Documentary.validateCatalog(catalog);
  Engine.updatePlayer(s,playerId,playerDraft,{...playerMovement,archiveContract:$('archiveContract').checked});
  if(pendingDocumentaryClubs.length){s.documentaryClubs=catalog;if(mode==='database')master.documentaryClubs=catalog;}
  if(playerDraft.club!==null&&playerDraft.club!==undefined)editorClub=playerDraft.club;
  $('playerEditor').close();render();message(editorSaveMessage());return true;
 }catch(e){$('playerError').textContent=e.message;return false;}
}
function drawPastTransfers(){
 const root=$('pastTransfers');if(!root)return;
 const clubName=id=>s.clubs.find(c=>c.id===id)?.name||'Sem clube';
 root.innerHTML=(playerDraft.transferHistory||[]).map((h,i)=>`<article class="documentary-row"><div><b>${esc(h.type||'Transferência')} · ${esc(h.date||'Data por indicar')}</b><p>${esc(clubName(h.fromClub))} → ${esc(clubName(h.toClub))}</p>${h.fee!==undefined?`<small>${money(h.fee)}</small>`:''}<p>${esc(h.notes||'')}</p>${h.loan?`<small>Empréstimo · ${esc(h.loan.startDate||'—')} → ${esc(h.loan.endDate||'—')} · ${esc(h.loan.purchaseType||'Sem opção')}</small>`:''}</div><div><button type="button" data-past-edit="${i}">Editar data / notas</button><button type="button" data-past-remove="${i}">Remover</button></div></article>`).join('')||'<p class="muted">Sem transferências registadas.</p>';
 root.querySelectorAll('[data-past-remove]').forEach(b=>b.onclick=()=>{if(confirm('Remover esta transferência do histórico? O clube e o empréstimo actuais não serão alterados.')){playerDraft.transferHistory.splice(+b.dataset.pastRemove,1);drawPastTransfers();drawPlayer();}});
 root.querySelectorAll('[data-past-edit]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pastEdit,h=playerDraft.transferHistory[i];const box=b.closest('article');box.innerHTML=`<div><label>Data<input type="date" id="pastDate" value="${esc(h.date||'')}"></label><label>Notas<textarea id="pastNotes" maxlength="1000">${esc(h.notes||'')}</textarea></label><button type="button" id="pastApply">Aplicar edição</button><button type="button" id="pastCancel">Cancelar edição</button><p id="pastError" role="alert"></p></div>`;
 $('pastCancel').onclick=drawPastTransfers;$('pastApply').onclick=()=>{const date=$('pastDate').value,notes=$('pastNotes').value.trim();if(date&&!Documentary.date(date)||notes.length>1000){$('pastError').textContent='Revê a data e as notas.';return;}playerDraft.transferHistory[i]={...h,date:date||null,notes};drawPastTransfers();drawPlayer();};});
}
function navigateIdentityFilter(filters,label){
 if(playerPhotoBusy||$('pastApply')){$('playerError').textContent='Termina a edição em curso antes de abrir a lista.';return;}
 readPlayerForm();
 const proceed=()=>{
  $('playerEditor').close();
  if(mode==='database'){openFilteredPlayers(filters);return;}
  let dialog=$('identityFilteredPlayers');if(!dialog){dialog=document.createElement('dialog');dialog.id='identityFilteredPlayers';document.body.append(dialog);}
  const rows=PlayerSearch.find(s,filters,resolveCountry);
  dialog.innerHTML=`<div class="dialog-head"><h2>${esc(label)} · ${rows.length} jogadores</h2><button type="button" id="identityListClose" aria-label="Fechar">×</button></div><p class="muted">Jogadores desta carreira</p><div class="identity-filter-list">${rows.map(p=>`<button type="button" data-identity-player="${p.id}">${esc(p.name)} <small>${esc(p.position)} · ${esc(s.clubs.find(c=>c.id===p.club)?.name||'Sem clube')}</small></button>`).join('')||'<p>Sem jogadores neste filtro.</p>'}</div>`;
  $('identityListClose').onclick=()=>dialog.close();dialog.querySelectorAll('[data-identity-player]').forEach(b=>b.onclick=()=>{playerNavigationIds=rows.map(p=>p.id);dialog.close();openPlayer(+b.dataset.identityPlayer,true);});dialog.showModal();
 };
 if(JSON.stringify(playerDraft)!==playerDraftBaseline||JSON.stringify(playerMovement)!==playerMovementBaseline||sourceEntryDirty()||internationalEntryDirty()||historyEntryDirty()){
  $('playerNavigationPrompt').innerHTML='<span>Há alterações por guardar.</span><button type="button" id="navSave">Guardar e abrir lista</button><button type="button" id="navDiscard">Descartar e abrir lista</button><button type="button" id="navStay">Ficar nesta ficha</button>';
  $('navStay').onclick=()=>{$('playerNavigationPrompt').innerHTML='';};$('navDiscard').onclick=proceed;$('navSave').onclick=()=>{if(savePlayerDraft())proceed();};
 }else proceed();
}
