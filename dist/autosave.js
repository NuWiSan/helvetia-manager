/* Only applied master/career records are saved, never editor drafts. */
const AutoSave=(()=>{
 let store=null,ready=false,timer=null,running=null,lastSaved=0,startError='';
 const slots={master:{revision:0,saved:null,pending:null,error:'',blocked:false,force:false},career:{revision:0,saved:null,pending:null,error:'',blocked:false,force:false}};
 const labels={master:'Base de Dados',career:'Carreira'};
 function source(key){return key==='master'?master:career;}
 function validate(key,data){return key==='master'?World.validate(data):Engine.validate(data);}
 function describeError(e){return e?.name==='QuotaExceededError'?'O espaço disponível no navegador está cheio. Exporta os dados para ficheiro.':e?.message||'Não foi possível guardar. Exporta os dados para ficheiro.';}
 function paint(){
  const node=$('saveStatus');if(!node)return;
  const entries=Object.values(slots),error=startError||entries.map(x=>x.error).find(Boolean),pending=entries.some(x=>x.pending);
  node.textContent=!ready?'A recuperar a última sessão…':error?'Gravação automática indisponível · '+error:pending||running?'Alterações por guardar…':lastSaved?'Guardado neste navegador · '+new Date(lastSaved).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'Gravação automática pronta';
  node.dataset.state=error?'error':pending||running?'pending':'saved';
  $('saveRetry').hidden=!error;$('saveRetry').onclick=retry;
  $('saveHistory').disabled=!ready||!store;$('saveHistory').onclick=showHistory;
 }
 function changed(){
  if(!ready||startError)return;
  for(const key of Object.keys(slots)){
   const data=source(key),slot=slots[key];if(!data||slot.blocked)continue;
   const text=JSON.stringify(data);
   if(text!==slot.saved)slot.pending=text;
   else slot.pending=null;
  }
  paint();
  if(!timer&&!running&&Object.values(slots).some(x=>x.pending&&!x.error))timer=setTimeout(()=>{timer=null;flush();},800);
 }
 async function drain(){
  for(const key of Object.keys(slots)){
   const slot=slots[key];if(!slot.pending||slot.error||slot.blocked)continue;
   const text=slot.pending,force=slot.force;
   try{
    const data=JSON.parse(text);validate(key,data);
    const result=await store.commit(key,data,slot.revision,{force});
    slot.revision=result.revision;slot.saved=text;slot.force=false;
    if(slot.pending===text)slot.pending=null;
    lastSaved=result.savedAt;
   }catch(e){slot.error=describeError(e);slot.blocked=e.code==='conflict';slot.conflict=e.code==='conflict';}
  }
 }
 function flush(){
  if(timer){clearTimeout(timer);timer=null;}
  if(running)return running;
  if(!store||!ready||startError)return Promise.resolve();
  running=drain().finally(()=>{running=null;paint();if(Object.values(slots).some(x=>x.pending&&!x.error&&!x.blocked))changed();});
  return running;
 }
 async function settle(){
  changed();
  do{await flush();}while(Object.values(slots).some(x=>x.pending&&!x.error&&!x.blocked));
 }
 function forceNext(key){slots[key].force=true;}
 function dirty(){return !ready||!!startError||Object.values(slots).some(x=>x.pending||x.error)||!!running;}
 async function start(){
  document.body.classList.add('storage-loading');document.querySelectorAll('#app,#nav,.header-actions').forEach(n=>n.inert=true);paint();
  try{
   store=await SaveStore.open();const saved=await store.read();
   for(const row of saved.heads){
    const slot=slots[row.key];if(!slot)continue;
    slot.revision=row.revision;
    try{
     validate(row.key,row.data);
     if(row.key==='master')master=row.data;else{career=row.data;if(career.liveMatch)career.liveMatch.paused=true;}
     slot.saved=JSON.stringify(row.data);lastSaved=Math.max(lastSaved,row.savedAt);
    }catch(e){slot.error='A cópia guardada de '+labels[row.key]+' não pôde ser aberta. Usa Recuperação ou exporta a cópia para a analisar.';slot.blocked=true;slot.validationError=describeError(e);}
   }
   s=World.context(master);
  }catch(e){startError=describeError(e);}
  finally{ready=true;document.body.classList.remove('storage-loading');document.querySelectorAll('#app,#nav,.header-actions').forEach(n=>n.inert=false);render();paint();}
 }
 async function retry(){
  if(startError){message('Para voltar a tentar abrir o armazenamento, exporta primeiro os dados desta sessão e recarrega a página.');return;}
  for(const slot of Object.values(slots))if(!slot.blocked)slot.error='';
  if(Object.values(slots).some(x=>x.blocked))message('Há dados guardados que precisam de atenção. Abre Recuperação; podes exportar esta sessão e a cópia guardada antes de recarregar.');
  changed();await flush();
 }
 async function showHistory(){
  pauseMatch();await settle();
  const dialog=$('saveRecovery');dialog.innerHTML='<p>A carregar cópias…</p><button type="button" id="recoveryClose">Fechar</button>';
  $('recoveryClose').onclick=()=>dialog.close();dialog.showModal();
  try{
   const saved=await store.read();
   dialog.innerHTML=`<div class="dialog-head"><h2>Recuperação</h2><button type="button" id="recoveryClose" aria-label="Fechar">×</button></div><p class="muted">Dados guardados neste navegador. Até cinco cópias automáticas anteriores por modo, criadas em intervalos de cinco minutos quando há alterações e antes de substituições. Não são sincronizadas com outros dispositivos. As cópias protegidas são conservadas fora desse limite. Exporta também cópias para ficheiro.</p><p class="muted">Local: ${esc(location.protocol==='file:'?'ficheiro HTML local':location.origin)} · este navegador e perfil. Os downloads ficam na pasta escolhida pelo navegador; a aplicação não conhece o caminho dessa pasta.</p><p id="recoveryError" role="alert"></p>${Object.keys(slots).map(key=>`<section class="panel recovery-section"><h3>${labels[key]}</h3><p>${slots[key].error?esc(slots[key].error+' '+(slots[key].validationError||'')):'A recuperação deste modo não altera os dados do outro.'}</p><button type="button" data-export-current="${key}" ${source(key)&&!slots[key].blocked?'':'disabled'}>Exportar sessão actual</button>${saved.heads.find(h=>h.key===key)?`<button type="button" data-export-head="${key}">Exportar cópia guardada</button>`:''}<button type="button" data-protect="${key}" ${source(key)&&!slots[key].blocked?'':'disabled'}>Criar backup protegido e descarregar</button><p class="muted">${recordCounts(saved.heads.find(h=>h.key===key)?.data)}</p><div class="recovery-list">${saved.backups.filter(b=>b.key===key).map(b=>`<article><span><b>${esc(b.data.name||labels[key])}</b><br>${esc(new Date(b.savedAt).toLocaleString('pt-PT'))}${b.protected?' · Protegida':''}<br>${recordCounts(b.data)}</span><button type="button" data-export-backup="${b.id}">Exportar</button><button type="button" data-restore="${b.id}" ${slots[key].conflict?'disabled':''}>Restaurar</button></article>`).join('')||'<p class="muted">Ainda não existem cópias anteriores.</p>'}</div></section>`).join('')}<p class="muted">Se outra janela guardou alterações, exporta esta sessão antes de recarregar para abrir a versão guardada.</p>`;
   $('recoveryClose').onclick=()=>dialog.close();
   dialog.querySelectorAll('[data-protect]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const key=b.dataset.protect;await protect(key);downloadData(source(key),'helvetia-'+key+'-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');dialog.close();message('Backup protegido em Recuperação neste navegador. Download solicitado: confirma o ficheiro na pasta de transferências.');}catch(e){$('recoveryError').textContent=describeError(e);b.disabled=false;}});
   dialog.querySelectorAll('[data-export-current]').forEach(b=>b.onclick=()=>downloadData(source(b.dataset.exportCurrent),'helvetia-'+b.dataset.exportCurrent+'-sessao.json'));
   dialog.querySelectorAll('[data-export-head]').forEach(b=>b.onclick=()=>downloadData(saved.heads.find(h=>h.key===b.dataset.exportHead).data,'helvetia-'+b.dataset.exportHead+'-guardado.json'));
   dialog.querySelectorAll('[data-export-backup]').forEach(b=>b.onclick=()=>downloadData(saved.backups.find(h=>h.id===b.dataset.exportBackup).data,'helvetia-copia-'+b.dataset.exportBackup+'.json'));
   dialog.querySelectorAll('[data-restore]').forEach(b=>b.onclick=async()=>{
    const backup=saved.backups.find(h=>h.id===b.dataset.restore),key=backup.key;
    if(!confirm('Restaurar '+labels[key]+' para esta cópia? A versão actual será conservada como cópia de recuperação.'))return;
    b.disabled=true;
    try{
     await settle();if(slots[key].conflict)throw Error(slots[key].error);
     const data=structuredClone(backup.data);validate(key,data);if(data.liveMatch)data.liveMatch.paused=true;
     const head=await store.commit(key,data,slots[key].revision,{force:true,protectedBackup:true});
     slots[key].revision=head.revision;slots[key].saved=JSON.stringify(data);slots[key].pending=null;slots[key].error='';slots[key].blocked=false;lastSaved=head.savedAt;
     if(key==='master')master=data;else career=data;
     if(mode==='database'){s=World.context(master);view='Base de Dados';editorClub=master.clubs[0]?.id??'free';}
     else if(mode==='career'){s=career;view='Centro de comando';editorClub=s.managed;division=club(s.managed).div;}
     dialog.close();render();message(labels[key]+' restaurada. O outro modo mantém os seus dados.');
    }catch(e){$('recoveryError').textContent=describeError(e);b.disabled=false;}
   });
  }catch(e){dialog.innerHTML='<p>'+esc(describeError(e))+'</p><button type="button" id="recoveryClose">Fechar</button>';$('recoveryClose').onclick=()=>dialog.close();}
 }
 function recordCounts(data){return data?['players','clubs','staff','competitions'].map((k,i)=>`${Array.isArray(data[k])?data[k].length:'?'} ${['jogadores','clubes','staff','competições'][i]}`).join(' · '):'Sem cópia guardada neste local.';}
 function blocked(key){return !!slots[key].blocked;}
 async function protect(key){
  await settle();const slot=slots[key];
  if(!store||startError||slot.error||slot.blocked)throw Error(slot.error||startError||'Não foi possível criar o backup.');
  const data=structuredClone(source(key));validate(key,data);
  const head=await store.commit(key,data,slot.revision,{protectedBackup:true});
  slot.revision=head.revision;slot.saved=JSON.stringify(data);lastSaved=head.savedAt;paint();
 }
 async function replaceMaster(data,baseline=null){
  validate('master',data);await settle();const slot=slots.master;
  if(baseline!==null&&JSON.stringify(master)!==baseline)throw Error('A base mudou desde o backup. Fecha esta janela e cria um novo backup.');
  if(!store||startError||slot.error||slot.blocked)throw Error(slot.error||startError||'A substituição exige gravação e backup disponíveis.');
  const head=await store.commit('master',data,slot.revision,{protectedBackup:true});
  slot.revision=head.revision;slot.saved=JSON.stringify(data);slot.pending=null;slot.force=false;master=data;lastSaved=head.savedAt;paint();
 }
 async function showReset(){
  const dialog=$('resetMasterDialog');let baseline=null;
  dialog.innerHTML=`<div class="dialog-head"><h2>Limpar Base Mestre</h2><button id="resetClose" aria-label="Fechar">×</button></div><p>Remove jogadores, clubes, staff, competições e informação documental da Mestre. As carreiras e os backups mantêm-se.</p><p>Primeiro é criado um backup protegido em <b>Recuperação</b>, neste navegador, e pedido o download de um JSON completo. Confirma o ficheiro na pasta de transferências antes de continuar.</p><button id="resetBackup">1. Criar backup e descarregar</button><p id="resetBackupLocation" role="status"></p><fieldset id="resetConfirmFields" disabled><label><input type="checkbox" id="resetDownloaded"> Confirmei que tenho o ficheiro de backup descarregado.</label><label>Escreve APAGAR para confirmar<input id="resetPhrase" autocomplete="off"></label><button id="resetCommit" class="danger">2. Apagar os dados da Mestre</button></fieldset><p id="resetError" role="alert"></p>`;
  $('resetClose').onclick=()=>dialog.close();dialog.showModal();
  $('resetBackup').onclick=async()=>{
   const button=$('resetBackup');button.disabled=true;
   try{await protect('master');baseline=JSON.stringify(master);const filename='helvetia-master-antes-de-limpar-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';downloadData(master,filename);$('resetBackupLocation').textContent='Cópia protegida: Recuperação, neste navegador. Ficheiro solicitado: '+filename+'. A pasta é definida pelo navegador.';$('resetConfirmFields').disabled=false;}
   catch(e){$('resetError').textContent=describeError(e);button.disabled=false;}
  };
  $('resetCommit').onclick=async()=>{
   if(!baseline||!$('resetDownloaded').checked||$('resetPhrase').value!=='APAGAR'){$('resetError').textContent='Confirma o backup descarregado e escreve APAGAR.';return;}
   $('resetCommit').disabled=true;
   try{await replaceMaster(World.empty(master.year),baseline);dialog.close();enterDatabase();message('Base Mestre limpa. Backup disponível em Recuperação. As carreiras não foram alteradas.');}
   catch(e){$('resetError').textContent=describeError(e);$('resetCommit').disabled=false;}
  };
 }
 function recoveryGate(){
  if(!slots.master.blocked||mode==='career')return false;
  $('nav').innerHTML='';$('title').textContent='Base de Dados — recuperação necessária';$('modeSave').hidden=true;
  $('app').innerHTML='<section class="panel"><h2>A tua base guardada não foi substituída</h2><p>Não foi possível abri-la nesta sessão. Os dados de demonstração não são a tua base. Abre Recuperação para exportar a cópia guardada e consultar os backups.</p><p role="alert">'+esc(slots.master.error+' '+(slots.master.validationError||''))+'</p><button id="openRecovery" class="primary">Abrir Recuperação</button>'+(career?'<button id="openSavedCareer">Continuar carreira guardada</button>':'')+'</section>';
  $('openRecovery').onclick=showHistory;if($('openSavedCareer'))$('openSavedCareer').onclick=continueCareer;return true;
 }
 return {start,changed,flush,settle,forceNext,dirty,protect,replaceMaster,blocked,recoveryGate,showReset};
})();
