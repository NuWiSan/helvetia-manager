/* Optional documentary extension v1. Read-only adapters preserve legacy fields. */
const Documentary=(()=>{
 const version=1,states=['Por verificar','Parcial','Confirmado'];
 const fields={general:'Registo geral',identity:'Identidade',birthDate:'Nascimento',nation:'Nacionalidade',height:'Altura',weight:'Peso',position:'Posição',club:'Clube',contract:'Contrato',transfer:'Transferência / empréstimo',international:'Internacionalizações',statistics:'Estatísticas documentais',photo:'Fotografia'};
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 const text=v=>typeof v==='string'&&!!v.trim();
 const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 function safeUrl(v){try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
 function sources(p){
  const rows=Array.isArray(p.documentSources)?p.documentSources.map(r=>({...r})):[];
  if(!p.sourcesUnified&&(text(p.source)||text(p.sourceUrl)))rows.unshift({title:p.source||'Fonte principal existente',url:p.sourceUrl||'',consultedAt:'',verifiedAt:p.lastVerifiedAt||'',notes:'',status:p.verificationStatus||'Por verificar',field:'general',legacy:true});
  return rows;
 }
 function verification(p){
  if(!p.sourcesUnified)return p.verificationStatus||'Por verificar';
  const rows=p.documentSources||[];
  return !rows.length||rows.every(r=>r.status==='Por verificar')?'Por verificar':rows.every(r=>r.status==='Confirmado')?'Confirmado':'Parcial';
 }
 function unifySources(p){
  if(p.sourcesUnified)return;
  p.documentSources=sources(p).map(r=>({...r,title:r.title.slice(0,200),url:safeUrl(r.url)?r.url:'',consultedAt:r.consultedAt||'',notes:[r.notes||'',r.verifiedAt?'Verificação anterior em '+r.verifiedAt:'',!safeUrl(r.url)&&r.url?'Referência anterior: '+r.url:'',r.title.length>200?r.title:''].filter(Boolean).join('\n')}));
  p.sourcesUnified=true;p.documentaryVersion=1;
 }
 function validateCatalog(rows){
  if(rows===undefined)return;
  if(!Array.isArray(rows)||rows.length>20000||rows.some(r=>!r||!text(r.name)||r.name.length>200||typeof r.country!=='string'||r.country.length>200))throw Error('Catálogo de clubes documentais inválido.');
 }
 function validatePeriod(r,start='startDate',end='endDate'){
  for(const k of [start,end])if(r[k]!==undefined&&r[k]!==null&&r[k]!==''&&!date(r[k]))throw Error('Data documental inválida.');
  if(r[start]&&r[end]&&r[end]<r[start])throw Error('O fim não pode ser anterior ao início.');
 }
 function validatePlayer(p){
  if(p.sourcesUnified!==undefined&&typeof p.sourcesUnified!=='boolean')throw Error('Formato de fontes inválido.');
  if(p.documentaryStats!==undefined){
   if(!Array.isArray(p.documentaryStats)||p.documentaryStats.length>1000)throw Error('Máximo de 1000 linhas estatísticas documentais.');
   for(const h of p.documentaryStats){
    if(!h||!text(h.season)||h.season.length>30||!(Number.isInteger(h.club)||text(h.clubName))||['clubName','clubCountry','competition','source','notes'].some(k=>h[k]!==undefined&&(typeof h[k]!=='string'||h[k].length>2000)))throw Error('Indica época e clube nas estatísticas documentais.');
    for(const k of ['appearances','minutes','goals','assists'])if(h[k]!==undefined&&h[k]!==null&&(!Number.isInteger(h[k])||h[k]<0||h[k]>1000000))throw Error('Estatísticas documentais: usa inteiros positivos ou deixa por indicar.');
   }
  }

  for(const [key,min,max] of [['photoZoom',80,200],['photoX',-50,50],['photoY',-50,50]])if(p[key]!==undefined&&(!Number.isInteger(p[key])||p[key]<min||p[key]>max))throw Error('Enquadramento da fotografia inválido: '+key);
  if(p.changeHistory!==undefined&&(!Array.isArray(p.changeHistory)||p.changeHistory.length>1000||!p.changeHistory.every(h=>h&&typeof h.at==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(h.at)&&Number.isFinite(Date.parse(h.at))&&Array.isArray(h.changes)&&h.changes.length>0&&h.changes.length<=40&&h.changes.every(c=>c&&Object.hasOwn(auditFields,c.field)&&typeof c.before==='string'&&typeof c.after==='string'&&c.before.length<=2000&&c.after.length<=2000))))throw Error('Histórico documental de alterações inválido (máximo de 1000 gravações por jogador).');
  if(p.documentaryVersion!==undefined&&p.documentaryVersion!==version)throw Error('Versão documental não suportada. Conserva o ficheiro original.');
  if(p.documentSources===undefined)return;
  if(!Array.isArray(p.documentSources)||p.documentSources.length>100)throw Error('Máximo de 100 fontes adicionais por jogador.');
  for(const r of p.documentSources){
   if(!r||typeof r!=='object'||!text(r.title)||r.title.length>200||!Object.hasOwn(fields,r.field)||!states.includes(r.status))throw Error('Indica título, informação e estado válidos para cada fonte.');
   if(typeof r.url!=='string'||r.url.length>2000||(r.url&&!safeUrl(r.url)))throw Error('A URL da fonte deve começar por https:// ou http://.');
   if(typeof r.consultedAt!=='string'||r.consultedAt&&!date(r.consultedAt))throw Error('Data de consulta da fonte inválida.');
   if(typeof r.notes!=='string'||r.notes.length>2000)throw Error('Observações da fonte demasiado longas.');
  }
 }
 function international(p){
  if(Array.isArray(p.internationalRecords))return p.internationalRecords;
  return ['caps','internationalGoals','representedNation','internationalLevel'].some(k=>p[k]!==undefined&&p[k]!=='')?[{nation:p.representedNation||'',level:p.internationalLevel||'Por indicar',caps:p.caps??null,goals:p.internationalGoals??null}]:[];
 }
 function isInternational(p,kind){return international(p).some(r=>Number(r.caps)>0&&(kind==='senior'?r.level==='Principal':/^Sub-/.test(r.level||'')));}
 function needsContract(p){return p.club!==null&&p.club!==undefined&&p.status!=='Retirado';}
 function missingContract(p){return needsContract(p)&&(!date(p.contractStart)||!date(p.contractEnd));}
 function completeness(p,data){
  const refs=sources(p),intl=international(p),checks=[];
  const add=(key,label,ok,applicable=true)=>checks.push({key,label,ok:!!ok,applicable});
  add('identity','Nome',text(p.name));add('birthDate','Data de nascimento',date(p.birthDate));add('nation','Nacionalidade',text(p.nation));add('position','Posição principal',text(p.position));
  add('body','Altura e peso',Number.isFinite(p.height)&&p.height>0&&Number.isFinite(p.weight)&&p.weight>0);add('photo','Fotografia',text(p.photo));
  add('club','Clube / situação sem clube',p.club===null?['Sem clube','Retirado'].includes(p.status):data.clubs.some(c=>c.id===p.club));
  add('contract','Datas do contrato',!missingContract(p),needsContract(p));
  add('sources','Pelo menos uma fonte',refs.length>0);add('documentaryStats','Histórico estatístico real',!!p.documentaryStats?.length);
  add('internationalSource','Fonte específica das internacionalizações',refs.some(r=>r.field==='international'),intl.length>0);
  const applicable=checks.filter(c=>c.applicable),done=applicable.filter(c=>c.ok).length;
  return {checks,done,total:applicable.length,percent:Math.round(done/applicable.length*100)};
 }
 function diagnostics(data){
  const warnings=[],groups=new Map(),duplicateIds=new Set(),clubIds=new Set(data.clubs.map(c=>c.id));
  const warn=(type,id,message)=>warnings.push({type,id,message});
  for(const p of data.players){
   const name=normalize(p.fullName)||normalize(p.name),key=name+'|'+p.birthDate;
   if(date(p.birthDate)&&name){if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);}
   if(!text(p.nation))warn('players',p.id,'Nacionalidade por indicar.');
   if(p.club!==null&&!clubIds.has(p.club))warn('players',p.id,'O clube indicado não existe.');
   if(p.status==='Retirado'&&p.club!==null)warn('players',p.id,'Jogador retirado ainda associado a um clube.');
   if(p.contractStart&&p.contractEnd&&p.contractEnd<p.contractStart)warn('players',p.id,'Fim de contrato anterior ao início.');
   if(p.status==='Emprestado'&&!p.loan)warn('players',p.id,'Empréstimo sem clube proprietário documentado.');
   if(p.loan&&(!clubIds.has(p.loan.parentClub)||p.loan.parentClub===p.club||p.status!=='Emprestado'))warn('players',p.id,'Vínculo de empréstimo incoerente.');
   for(const r of international(p))if(['caps','goals'].some(k=>r[k]!==null&&r[k]!==undefined&&(!Number.isInteger(r[k])||r[k]<0||r[k]>2000))){warn('players',p.id,'Contagens de internacionalizações ou golos inválidas.');break;}
   const moves=p.transferHistory||[];
   const seenInternational=new Set();
   for(const r of international(p)){const key=normalize(r.nation)+'|'+r.level;if(seenInternational.has(key)){warn('players',p.id,'País e escalão repetidos nas internacionalizações; verificar eventual dupla contagem.');break;}seenInternational.add(key);}
   if(international(p).some(r=>r.caps===0&&r.goals>0))warn('players',p.id,'Golos internacionais registados sem internacionalizações.');
   if(p.birthDate&&p.contractStart&&p.contractStart<p.birthDate)warn('players',p.id,'Contrato iniciado antes do nascimento.');
   if(p.loan?.startDate&&p.loan?.endDate&&p.loan.endDate<p.loan.startDate)warn('players',p.id,'Empréstimo com fim anterior ao início.');
   if(verification(p)==='Confirmado'&&!sources(p).length)warn('players',p.id,'Registo confirmado sem fonte documentada.');
   if(moves.some((h,i)=>i>0&&h.date&&moves[i-1].date&&h.date<moves[i-1].date))warn('players',p.id,'Datas fora de sequência no histórico de transferências.');
   if(moves.some((h,i)=>i>0&&h.fromClub!==moves[i-1].toClub))warn('players',p.id,'Possível passagem por clube em falta entre duas transferências.');
   if(moves.some(h=>h.fromClub===h.toClub||[h.fromClub,h.toClub].some(id=>id!==null&&!clubIds.has(id))))warn('players',p.id,'Transferência com clubes incoerentes.');
   if(moves.length&&moves[moves.length-1].toClub!==p.club)warn('players',p.id,'Último destino do histórico diferente do clube actual; confirmar a sequência.');
  }
  const duplicates=[...groups.values()].filter(g=>g.length>1);
  for(const group of duplicates){group.forEach(p=>duplicateIds.add(p.id));if(new Set(group.filter(p=>p.status!=='Retirado'&&!p.loan&&p.club!==null).map(p=>p.club)).size>1)group.forEach(p=>warn('players',p.id,'Possível identidade repetida em clubes diferentes; confirmar antes de fundir.'));}
  for(const c of data.competitions||[])if((c.participants||[]).some(id=>!clubIds.has(id))||new Set(c.participants||[]).size!==(c.participants||[]).length)warn('competitions',c.id,'Participantes inexistentes ou repetidos.');
  return {warnings,duplicates,duplicateIds};
 }
 function health(data){
  const reports=data.players.map(p=>completeness(p,data)),done=reports.reduce((a,r)=>a+r.done,0),total=reports.reduce((a,r)=>a+r.total,0),diagnostic=diagnostics(data);
  return {players:data.players.length,clubs:data.clubs.length,staff:data.staff.length,competitions:(data.competitions||[]).length,noPhoto:data.players.filter(p=>!p.photo).length,noBirth:data.players.filter(p=>!p.birthDate).length,noClub:data.players.filter(p=>p.club===null).length,noContract:data.players.filter(missingContract).length,unverified:data.players.filter(p=>verification(p)==='Por verificar').length,noLogo:data.clubs.filter(c=>!c.logo).length,percent:total?Math.round(done/total*100):0,...diagnostic};
 }
 function globalSearch(data,query='',type='all'){
  const tokens=normalize(query).split(' ').filter(Boolean),clubs=new Map(data.clubs.map(c=>[c.id,c]));
  return ['players','clubs','staff','competitions'].flatMap(kind=>type!=='all'&&kind!==type?[]:(data[kind]||[]).filter(r=>tokens.every(t=>normalize([r.name,r.fullName,r.shortName,r.officialName,r.city,r.role,r.nation,r.country,clubs.get(r.club)?.name].join(' ')).includes(t))).map(r=>({type:kind,id:r.id,name:r.name,detail:kind==='players'?[clubs.get(r.club)?.name||'Sem clube',r.position].join(' · '):kind==='staff'?[r.role,clubs.get(r.club)?.name].join(' · '):r.city||r.country||''})));
 }
 function timeline(p,data){
  const events=[],clubName=id=>id===null?'Sem clube':data.clubs.find(c=>c.id===id)?.name||'Clube por identificar';
  const add=(when,title,detail,kind)=>events.push({date:date(when)?when:null,title,detail,kind,order:events.length});
  for(const h of p.transferHistory||[])add(h.date,h.type||'Mudança de clube',clubName(h.fromClub)+' → '+clubName(h.toClub),'transfer');
  if(p.club!==undefined)add(null,'Situação actual',clubName(p.club)+(p.status?' · '+p.status:''),'current');
  if(p.contractStart||p.contractEnd){add(p.contractStart,'Contrato actual',clubName(p.club)+' · '+(p.contractStart||'Início por indicar')+' → '+(p.contractEnd||'Fim por indicar'),'contract');}
  for(const h of p.contractHistory||[])add(h.contractStart,'Contrato anterior',(h.clubName||clubName(h.club))+' · '+(h.contractStart||'Início por indicar')+' → '+(h.contractEnd||'Fim por indicar')+(h.recordedAt?' · Arquivado em '+h.recordedAt:''),'contract');
  if(p.loan)add(p.loan.startDate,'Empréstimo actual',clubName(p.loan.parentClub)+' → '+clubName(p.club)+' · Fim: '+(p.loan.endDate||'por indicar'),'loan');
  for(const r of international(p))add(r.startDate,(r.nation||'País por indicar')+' · '+(r.level||'Escalão por indicar'),(r.caps??'?')+' internacionalizações · '+(r.goals??'?')+' golos'+(r.endDate?' · Até '+r.endDate:''),'international');
  return {dated:events.filter(e=>e.date).sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order),undated:events.filter(e=>!e.date)};
 }
 const auditFields={name:'Nome',fullName:'Nome completo',birthDate:'Nascimento',birthPlace:'Naturalidade',nation:'Nacionalidade',secondNation:'Segunda nacionalidade',height:'Altura',weight:'Peso',position:'Posição',club:'Clube',status:'Estado',contractStart:'Início do contrato',contractEnd:'Fim do contrato',salary:'Salário',source:'Fonte principal',sourceUrl:'Referência principal',documentSources:'Fontes adicionais',verificationStatus:'Verificação',lastVerifiedAt:'Data de verificação',internationalRecords:'Internacionalizações',transferHistory:'Transferências anteriores',contractHistory:'Percurso / contratos anteriores',documentaryStats:'Estatísticas reais'};
 function recordChanges(old,next,data,at=new Date().toISOString()){
  if(!old)return;
  const value=(p,key)=>{if(key==='verificationStatus')return verification(p);if(key==='internationalRecords')return international(p);if(key==='documentSources'&&next.sourcesUnified){const copy={...p};unifySources(copy);return copy.documentSources||[];}return p[key]??null;};
  const label=(v,key)=>{if(key==='club')return v===null?'Sem clube':(data.clubs.find(c=>c.id===v)?.name||'Clube por identificar')+' [ID '+v+']';if(v===null||v==='')return 'Por indicar';const t=typeof v==='string'?v:JSON.stringify(v);return t.length>1900?t.slice(0,1900)+'… [resumo]':t;};
  const changes=Object.keys(auditFields).filter(key=>JSON.stringify(value(old,key))!==JSON.stringify(value(next,key))).map(field=>({field,before:label(value(old,field),field),after:label(value(next,field),field)}));
  if(changes.length)next.changeHistory=[...(next.changeHistory||[]),{at,changes}];
 }
 return {verification,unifySources,validateCatalog,validatePeriod,version,states,fields,normalize,date,safeUrl,sources,validatePlayer,international,isInternational,needsContract,missingContract,completeness,diagnostics,health,globalSearch,timeline,auditFields,recordChanges};
})();
if(typeof module!=='undefined')module.exports=Documentary;
