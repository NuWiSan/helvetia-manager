/* CSV adapters use the canonical records and the same validation as the editors. */
const CsvImport=(()=>{
 const Ops=typeof DatabaseOps!=='undefined'?DatabaseOps:require('./database-ops.js'),E=typeof Engine!=='undefined'?Engine:require('./game.js'),W=typeof World!=='undefined'?World:require('./world.js'),D=typeof Documentary!=='undefined'?Documentary:require('./documentary.js');
 const types={players:'Jogadores',clubs:'Clubes',staff:'Staff',competitions:'Competições',transfers:'Transferências anteriores',contracts:'Contratos anteriores',international:'Internacionalizações',sources:'Fontes',documentaryStatistics:'Estatísticas reais'};
 const numeric=new Set(['club','height','weight','number','salary','age','div','tier','budget','stadiumCapacity','stadiumYear','stadiumPhotoZoom','stadiumPhotoX','stadiumPhotoY','level','pointsWin','pointsDraw','pointsLoss','caps','goals','fee','fromClub','toClub','loan_parent_club','loan_fee','loan_purchase_fee','releaseClause']);
 const nullable=new Set(['club','fromClub','toClub']);
 const dateKeys=new Set(['birthDate','founded','contractStart','contractEnd','recordedAt','date','startDate','endDate','consultedAt','verifiedAt','loan_start','loan_end']);
 const fields={name:'Nome',fullName:'Nome completo',city:'Cidade',role:'Função',club:'Clube',div:'Divisão',tier:'Escalão',budget:'Orçamento',stadium:'Estádio',color:'Cor',created:'Novo registo',contractHistory:'Contratos anteriores',internationalRecords:'Internacionalizações',transferHistory:'Transferências anteriores',documentSources:'Fontes'};
 const display=v=>v===undefined||v===null||v===''?'Por indicar':typeof v==='object'?JSON.stringify(v):String(v);
 function exported(v){let t=v===undefined||v===null?'':String(v);if(typeof v==='string'&&(/^[\t\r\n]/.test(t)||/^\s*[=+@-]/.test(t)))t="'"+t;return t;}
 function patchRow(old,row,columns,ignore){
  const result=structuredClone(old);
  for(const k of columns){if(ignore.includes(k)||row[k]===exported(old[k]))continue;let v=row[k].trim();if(!v)continue;
   if(numeric.has(k)){if(nullable.has(k)&&['SEM_CLUBE','null'].includes(v))v=null;else{if(!(['stadiumPhotoX','stadiumPhotoY'].includes(k)?/^-?\d+$/:/^\d+$/).test(v)||!Number.isSafeInteger(Number(v)))throw Error('Número inválido em '+k);v=Number(v);}}
   if(dateKeys.has(k)&&!(k==='founded'?E.foundationDateOK(v):D.date(v)))throw Error('Data inválida em '+k+(k==='founded'?' (AAAA ou AAAA-MM-DD).':' (AAAA-MM-DD).'));
   if(k==='color'||k==='secondaryColor'){const color=E.normalizeClubColor(v);if(!color)throw Error('Cor inválida em '+k+' (#RGB ou #RRGGBB).');v=color;} if(typeof v==='string'&&v.length>5000)throw Error('Texto demasiado longo em '+k);
   result[k]=v;
  }return result;
 }
 function plan(master,type,input){
  if(master.kind!=='database')throw Error('Importação disponível apenas na Base Mestre.');
  if(type==='documentaryStatistics')return Ops.importDocumentaryStatsPlan(master,input);
  if(!Object.hasOwn(types,type))throw Error('Categoria de importação inválida. Estatísticas do jogo são apenas exportadas.');
  const parsed=Ops.parseCsv(input),columns=Ops.table(master,type).columns,linked=['transfers','contracts','international','sources'].includes(type),required=linked?['player_id','index']:['id'];
  if(!required.every(k=>parsed.columns.includes(k))||parsed.columns.some(k=>!columns.includes(k)))throw Error('Cabeçalhos inválidos. Descarrega o modelo desta categoria.');
  if(!parsed.rows.length)throw Error('CSV sem registos.');
  return linked?linkedPlan(master,type,parsed):recordsPlan(master,type,parsed);
 }
 // External documentary CSVs may use equivalent labels; retain canonical game values.
 function normalizePlayerLabels(input){
  const row={...input},key=v=>String(v??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const aliases={position:{ava:'AV'},status:{activo:'Activo',ativo:'Activo',active:'Activo',reformado:'Retirado',retirado:'Retirado'},verificationStatus:{verified:'Confirmado',verificado:'Confirmado',confirmado:'Confirmado'}};
  for(const [field,map] of Object.entries(aliases))if(Object.hasOwn(row,field)&&Object.hasOwn(map,key(row[field])))row[field]=map[key(row[field])];
  for(const field of ['birthDate','contractStart','contractEnd']){const value=String(row[field]||'').trim(),match=value.match(/^(\d{2})([/.])(\d{2})\2(\d{4})$/);if(match)row[field]=`${match[4]}-${match[3]}-${match[1]}`;}
  if(['SEM_CLUBE','null'].includes(String(row.club||'').trim())&&row.status==='Activo')row.status='Sem clube';
  return row;
 }
 function recordsPlan(master,type,parsed){
  const candidate=structuredClone(master),summary=[],seen=new Set();let nextId=Math.max(-1,...master[type].map(r=>r.id))+1;
  for(const [line,input] of parsed.rows.entries())try{
   const create=input.id.trim()==='NOVO';if(!create&&(!/^\d+$/.test(input.id.trim())||!Number.isSafeInteger(Number(input.id))))throw Error('ID inválido. Usa NOVO para criar.');
   const id=create?nextId++:Number(input.id),old=create?null:master[type].find(r=>r.id===id);if(!create&&!old)throw Error('ID '+id+' inexistente nesta Base Mestre. Confirma a correspondência dos jogadores; usa NOVO apenas para criar uma pessoa nova.');if(seen.has(id))throw Error('ID repetido.');seen.add(id);
   const defaults=type==='players'?{id,name:'',club:null,position:'MED',quality:60,salary:0,status:'Sem clube'}:type==='staff'?{id,name:'',club:null,role:'',quality:60}:type==='clubs'?{id,name:'',city:'',stadium:'',color:'#46515d',budget:0,div:3,tier:4}:{id,name:'',shortName:'',country:'',kind:'Outro',format:'Outro',engineMode:'catalogue',pointsWin:3,pointsDraw:1,pointsLoss:0,notes:''};
   const normalized=type==='players'?normalizePlayerLabels(input):input;
   const row=patchRow(old||defaults,normalized,parsed.columns,['id']);
   if(type==='players'&&!E.positions.includes(row.position))throw Error('Posição inválida: '+row.position+'. Usa '+E.positions.join(', ')+'. AVA também é aceite como AV.');
   if(!row.name?.trim())throw Error('Indica o nome.');
   if(create&&type==='staff'&&!row.role.trim())throw Error('Indica a função do staff.');
   if(create&&type==='players'&&!input.position?.trim())throw Error('Indica a posição do novo jogador.');
   if(create&&type==='clubs'&&row.div<3)throw Error('Novos clubes entram fora das ligas profissionais; reorganiza depois no editor.');
   if(JSON.stringify(row)===JSON.stringify(old))continue;
   if(type==='players'){
    if(old?.sourcesUnified&&['source','sourceUrl','verificationStatus'].some(k=>row[k]!==old[k]))throw Error('Usa o CSV de Fontes para alterar as fontes unificadas e a verificação.');
    if(old&&(old.loan||old.status==='Emprestado')&&(row.club!==old.club||row.status!==old.status))throw Error('Revê o empréstimo na ficha individual.');
    if(row.status==='Emprestado'&&old?.status!=='Emprestado')throw Error('Documenta o empréstimo actual na ficha individual.');
    if(input.status==='Sem clube')row.club=null;
    E.updatePlayer(W.context(candidate),create?null:id,row);
   }else{
    const index=candidate[type].findIndex(r=>r.id===id);if(create)candidate[type].push(row);else candidate[type][index]=row;
   }
   const applied=candidate[type].find(r=>r.id===id),changes=Object.keys(applied).filter(k=>k!=='changeHistory'&&JSON.stringify(old?.[k])!==JSON.stringify(applied[k])).map(field=>({field,before:display(old?.[field]),after:display(applied[field])}));
   summary.push({id,name:row.name,changes,created:create});if(summary.length>200)throw Error('Máximo de 200 registos alterados por importação.');
  }catch(e){throw Error('Linha '+(line+2)+': '+e.message);}
  W.validate(candidate);return {candidate,summary,baseline:JSON.stringify(master),read:parsed.rows.length};
 }
 const property={international:'internationalRecords',transfers:'transferHistory',contracts:'contractHistory',sources:'documentSources'};
 function rowsFor(p,type){return type==='international'?D.international(p):type==='sources'?D.sources(p):p[property[type]]||[];}
 function flatten(r,type){if(type!=='transfers')return r;return {...r,loan_parent_club:r.loan?.parentClub,loan_start:r.loan?.startDate,loan_end:r.loan?.endDate,loan_fee:r.loan?.fee,loan_purchase_type:r.loan?.purchaseType,loan_purchase_fee:r.loan?.purchaseFee,loan_notes:r.loan?.notes};}
 function unflatten(row,type){
  if(type!=='transfers')return row;
  const loanKeys={loan_parent_club:'parentClub',loan_start:'startDate',loan_end:'endDate',loan_fee:'fee',loan_purchase_type:'purchaseType',loan_purchase_fee:'purchaseFee',loan_notes:'notes'};
  for(const [key,target] of Object.entries(loanKeys)){if(row[key]!==undefined){row.loan={...(row.loan||{}),[target]:row[key]};}delete row[key];}return row;
 }
 function linkedPlan(master,type,parsed){
  const candidate=structuredClone(master),updates=new Map(),seen=new Set(),summary=[];
  for(const [line,input] of parsed.rows.entries())try{
   if(!/^\d+$/.test(input.player_id.trim()))throw Error('ID de jogador inválido.');
   const id=Number(input.player_id),p=master.players.find(p=>p.id===id);if(!p)throw Error('Jogador inexistente.');
   const create=input.index.trim()==='NOVO';if(!create&&!/^\d+$/.test(input.index.trim()))throw Error('index deve ser o índice exportado ou NOVO.');
   const index=Number(input.index),original=rowsFor(p,type),old=create?null:original[index];if(!create&&!old)throw Error('Índice inexistente.');
   const key=id+':'+index;if(!create&&seen.has(key))throw Error('Índice repetido para o mesmo jogador.');if(!create)seen.add(key);
   if(type==='sources'&&input.url?.trim()&&input.url!==exported(old?.url)&&!D.safeUrl(input.url.trim()))throw Error('A URL da fonte deve começar por https:// ou http://.');
   if(input.legacy&&input.legacy!==exported(old?.legacy))throw Error('A coluna legacy não é editável.');
   const defaults=type==='international'?{nation:'',level:'Principal',caps:null,goals:null}:type==='sources'?{title:'',field:'general',url:'',consultedAt:'',notes:'',status:'Por verificar'}:type==='contracts'?{club:null,contractStart:'',contractEnd:''}:{date:null,fromClub:null,toClub:null,type:'Transferência definitiva'};
   // level is a string for international teams, numeric only for competitions.
   let row=patchRow(flatten(old||defaults,type),input,parsed.columns,['player_id','index','legacy',...(type==='international'?['level']:[])]);
   if(type==='international'&&input.level?.trim())row.level=input.level.trim();
   row=unflatten(row,type);if(type==='transfers'&&row.type==='Transferência')row.type='Transferência definitiva';
   if(create&&type==='international'&&!row.nation.trim())throw Error('Indica o país representado.');
   if(type==='contracts'&&row.club===null&&!row.clubName?.trim())throw Error('Indica club (ID) ou clubName para o contrato.');
   if(type==='contracts'&&input.clubName?.trim()&&Number.isInteger(row.club)&&!input.club?.trim())throw Error('Usa SEM_CLUBE em club ao indicar um clube externo.');
   if(type==='contracts'&&Number.isInteger(row.club)){delete row.clubName;delete row.clubCountry;}
   if(type==='transfers'&&row.fromClub===row.toClub)throw Error('Origem e destino não podem ser iguais.');
   if(type==='transfers'&&row.type==='Empréstimo'&&!row.loan)throw Error('Indica loan_parent_club para o empréstimo histórico.');
   const rows=updates.get(id)||structuredClone(original);if(create)rows.push(row);else rows[index]=row;
   if(JSON.stringify(rows)!==JSON.stringify(original))updates.set(id,rows);
  }catch(e){throw Error('Linha '+(line+2)+': '+e.message);}
  if(updates.size>200)throw Error('Máximo de 200 jogadores alterados por importação.');
  for(const [id,rows] of updates){
   const p=candidate.players.find(p=>p.id===id),count=p.changeHistory?.length||0;let patch={[property[type]]:rows};
   if(type==='sources'){const adapted={documentSources:rows};D.unifySources(adapted);patch={...adapted};}
   try{E.updatePlayer(W.context(candidate),id,patch);}catch(e){throw Error('Jogador '+id+': '+e.message);}
   if(type==='contracts')for(const h of rows)if(h.clubName){const ref={name:h.clubName,country:h.clubCountry||''};candidate.documentaryClubs=candidate.documentaryClubs||[];if(!candidate.documentaryClubs.some(c=>D.normalize(c.name)===D.normalize(ref.name)&&D.normalize(c.country)===D.normalize(ref.country)))candidate.documentaryClubs.push(ref);}
   summary.push({id,name:p.name,changes:(p.changeHistory||[]).slice(count).flatMap(h=>h.changes)});
  }
  W.validate(candidate);return {candidate,summary,baseline:JSON.stringify(master),read:parsed.rows.length};
 }
 function template(type){return '\ufeff'+Ops.table({players:[],clubs:[],staff:[],competitions:[]},type).columns.map(c=>'"'+c+'"').join(';')+'\r\n';}
 // Matching is advisory: an external ID never grants permission to overwrite a person.
 function reviewPlayers(master,input){
  if(master.kind!=='database')throw Error('Importação disponível apenas na Base Mestre.');
  const parsed=Ops.parseCsv(input),allowed=Ops.table(master,'players').columns;
  if(!parsed.columns.includes('id')||parsed.columns.some(k=>!allowed.includes(k)))throw Error('Cabeçalhos inválidos. Usa o modelo de jogadores existente.');
  if(!parsed.rows.length)throw Error('CSV sem registos.');
  const key=v=>D.normalize(String(v||'')),names=p=>[key(p.name),key(p.fullName)].filter(Boolean),byId=new Map(master.players.map(p=>[p.id,p]));
  const entries=parsed.rows.map((original,index)=>{
   const input=normalizePlayerLabels(original);
   const raw=input.id.trim(),valid=raw==='NOVO'||(/^\d+$/.test(raw)&&Number.isSafeInteger(Number(raw))),old=raw==='NOVO'?null:byId.get(Number(raw)),incoming=names(input);
   const suggestions=master.players.filter(p=>names(p).some(n=>incoming.includes(n))).map(p=>({id:p.id,name:p.name,birthDate:p.birthDate||'',club:p.club}));
   const conflict=old&&((incoming.length&&!names(old).some(n=>incoming.includes(n)))||(input.birthDate?.trim()&&old.birthDate&&input.birthDate.trim()!==old.birthDate));
   const status=!valid?'invalid':old&&!conflict?'existing':old||suggestions.length?'doubtful':'new';
   return {line:index+2,input,status,suggestions,action:status==='existing'?'update':raw==='NOVO'&&status==='new'?'create':'pending',targetId:old?.id??null,reason:!valid?'ID inválido.':conflict?'O ID existe, mas a identidade não coincide.':old?'ID e dados de identidade compatíveis.':suggestions.length?'Há nomes semelhantes na Base Mestre. Confirmar a pessoa.':raw==='NOVO'?'Criação pedida no CSV.':'ID desconhecido: escolher criar ou associar a um jogador.'};
  });
  const ids=new Map(),identities=new Map();
  for(const e of entries){const id=e.input.id.trim(),identity=key(e.input.fullName||e.input.name)+'|'+(e.input.birthDate||'');for(const [map,k] of [[ids,id==='NOVO'?'':id],[identities,identity==='|'?'':identity]])if(k){const previous=map.get(k);if(previous){for(const item of [previous,e]){item.status='doubtful';item.action='pending';item.reason='ID ou identidade repetida no ficheiro. Rever e ignorar a linha redundante.';}}else map.set(k,e);}}
  return {baseline:JSON.stringify(master),columns:parsed.columns,entries,read:entries.length};
 }
 async function resolvePlayers(master,review,{onProgress=()=>{},cancelled=()=>false}={}){
  if(JSON.stringify(master)!==review.baseline)throw Error('A base mudou. Selecciona novamente o ficheiro para refazer a revisão.');
  const chosen=[],targets=new Set(),newIdentities=new Set();
  for(const e of review.entries){
   if(e.action==='skip')continue;
   if(!['create','update'].includes(e.action))throw Error('Linha '+e.line+': escolhe uma acção ou ignora a linha.');
   if(e.status==='invalid')throw Error('Linha '+e.line+': corrige o ID no CSV ou ignora a linha.');
   if(e.action==='update'){
    const target=Number(e.targetId);if(e.targetId===null||e.targetId===''||!Number.isSafeInteger(target)||!master.players.some(p=>p.id===target))throw Error('Linha '+e.line+': jogador de destino inexistente.');
    if(targets.has(target))throw Error('Linha '+e.line+': duas linhas apontam para o mesmo jogador.');targets.add(target);
   }else{
    const identity=D.normalize(e.input.fullName||e.input.name||'')+'|'+(e.input.birthDate||'');if(newIdentities.has(identity))throw Error('Linha '+e.line+': criação repetida da mesma identidade.');newIdentities.add(identity);
   }
   chosen.push({entry:e,input:{...e.input,id:e.action==='create'?'NOVO':String(e.targetId)}});
  }
  let candidate=structuredClone(master);const summary=[];
  // Reuse the established editor adapter and its validation, yielding between small batches.
  for(let start=0;start<chosen.length;start+=50){
   await new Promise(resolve=>setTimeout(resolve,0));if(cancelled())throw Error('Revisão cancelada.');
   const batch=chosen.slice(start,start+50);let result;
   try{result=recordsPlan(candidate,'players',{columns:review.columns,rows:batch.map(r=>r.input)});}
   catch(error){throw Error(error.message.replace(/^Linha (\d+):/,(_,n)=>'Linha '+(batch[Number(n)-2]?.entry.line??n)+':'));}
   candidate=result.candidate;summary.push(...result.summary);onProgress(Math.min(start+50,chosen.length),chosen.length);
  }
  W.validate(candidate);return {candidate,summary,baseline:review.baseline,read:review.read,skipped:review.entries.length-chosen.length};
 }
 return {types,fields,plan,template,reviewPlayers,resolvePlayers};
})();
if(typeof module!=='undefined')module.exports=CsvImport;
