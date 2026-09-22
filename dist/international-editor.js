let internationalEditIndex=null,internationalEntryInitial='';
function internationalEntryValue(){
 const f=new FormData($('playerForm')),value=k=>f.get('intl-entry-'+k);
 return {nation:String(value('nation')||'').trim(),level:String(value('level')||'Por indicar'),caps:value('caps')===''?null:Number(value('caps')),goals:value('goals')===''?null:Number(value('goals')),startDate:String(value('startDate')||''),endDate:String(value('endDate')||'')};
}
function internationalEntryDirty(){return JSON.stringify(internationalEntryValue())!==internationalEntryInitial;}
function drawInternationalRows(index=null){
 internationalEditIndex=index;
 const rows=playerDraft.internationalRecords,r=index===null?{nation:playerDraft.nation||'',level:'Principal',caps:null,goals:null}:rows[index];
 $('internationalRows').innerHTML=`<section class="international-entry"><h3>${index===null?'Adicionar registo':'Editar registo'}</h3><div class="international-row"><label>País representado${countrySelect('intl-entry-nation',r.nation)}</label><label>Escalão<select name="intl-entry-level">${options(Engine.internationalLevels,r.level)}</select></label><label>Internacionalizações<input name="intl-entry-caps" type="number" min="0" max="2000" step="1" placeholder="Por indicar" value="${r.caps??''}"></label><label>Golos<input name="intl-entry-goals" type="number" min="0" max="2000" step="1" placeholder="Por indicar" value="${r.goals??''}"></label><label>Desde<input name="intl-entry-startDate" type="date" value="${esc(r.startDate||'')}"></label><label>Até<input name="intl-entry-endDate" type="date" value="${esc(r.endDate||'')}"></label></div><div class="toolbar"><button type="button" id="internationalAdd">${index===null?'Adicionar escalão':'Aplicar edição'}</button><button type="button" id="internationalReset">${index===null?'Limpar':'Cancelar edição'}</button></div><p id="internationalError" role="alert"></p></section>${rows.length?`<div class="table-wrap international-table"><table><thead><tr><th>PAÍS</th><th>ESCALÃO</th><th>PERÍODO</th><th>JOGOS</th><th>GOLOS</th><th>ACÇÕES</th></tr></thead><tbody>${rows.map((row,i)=>`<tr><td><span class="search-nationality">${countryFlag(row.nation)}${esc(row.nation||'Por indicar')}</span></td><td>${esc(row.level)}</td><td>${esc(row.startDate||'—')} → ${esc(row.endDate||'—')}</td><td>${row.caps??'—'}</td><td>${row.goals??'—'}</td><td><button type="button" data-international-edit="${i}">Editar</button> <button type="button" data-international-remove="${i}">Remover</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Ainda não existem registos de selecções.</p>'}`;
 internationalEntryInitial=JSON.stringify(internationalEntryValue());
 $('internationalAdd').onclick=()=>{readPlayerForm();commitInternationalEntry();};
 $('internationalReset').onclick=()=>drawInternationalRows();
 const canChange=()=>{if(internationalEntryDirty()){$('internationalError').textContent='Adiciona, aplica ou cancela primeiro a linha em edição.';return false;}return true;};
 document.querySelectorAll('[data-international-edit]').forEach(b=>b.onclick=()=>{if(canChange())drawInternationalRows(+b.dataset.internationalEdit);});
 document.querySelectorAll('[data-international-remove]').forEach(b=>b.onclick=()=>{if(!canChange())return;playerDraft.internationalRecords.splice(+b.dataset.internationalRemove,1);drawInternationalRows();drawPlayer();});
}
function commitInternationalEntry(){
 try{
  for(const input of $('internationalRows').querySelectorAll('input'))if(!input.reportValidity())return false;
  const row=internationalEntryValue(),rows=structuredClone(playerDraft.internationalRecords);
  if(internationalEditIndex===null)rows.push(row);else rows[internationalEditIndex]=row;
  Engine.validateInternational({internationalRecords:rows});
  playerDraft.internationalRecords=rows;readInternationalRows();drawInternationalRows();drawPlayer();return true;
 }catch(e){$('internationalError').textContent=e.message;return false;}
}
function readInternationalRows(){
 for(const k of ['representedNation','internationalLevel','caps','internationalGoals'])playerDraft[k]=undefined;
}
function drawInternationalTotals(){
 const totals=Engine.internationalTotals(playerDraft);
 const number=(group,key)=>!group.rows?'—':group[key]+(group[key+'Unknown']?' + ?':'');
 const lines=[['Selecção principal',totals.senior],['Escalões jovens',totals.youth],...(totals.other.rows?[['Outras selecções / por indicar',totals.other]]:[]),['Total acumulado',totals.all]];
 $('internationalTotals').innerHTML='<h3>Resumo internacional</h3>'+lines.map(([label,g])=>`<p>${label}<b>${number(g,'caps')} jogos · ${number(g,'goals')} golos</b></p>`).join('')+(totals.all.capsUnknown||totals.all.goalsUnknown?'<small class="muted">? indica valores ainda por preencher.</small>':'');
 if(totals.all.rows)$('playerSummary').insertAdjacentHTML('beforeend','<h3>Internacionalizações</h3>'+lines.map(([label,g])=>`<p>${label}<b>${number(g,'caps')}</b></p>`).join(''));
}
