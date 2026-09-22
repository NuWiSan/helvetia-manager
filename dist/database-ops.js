const DatabaseOps=(()=>{
 const E=typeof Engine!=='undefined'?Engine:require('./game.js'),W=typeof World!=='undefined'?World:require('./world.js');
 function bulkPlan(master,ids,operation){
  if(master.kind!=='database')throw Error('A edição em massa só está disponível na Base Mestre.');
  if(!Array.isArray(ids)||!ids.length||ids.length>200||new Set(ids).size!==ids.length||!ids.every(id=>master.players.some(p=>p.id===id)))throw Error('Selecciona entre 1 e 200 jogadores válidos.');
  if(!['status','club','verification','source'].includes(operation.type))throw Error('Operação não permitida.');
  const candidate=structuredClone(master),state=W.context(candidate),summary=[];
  for(const id of ids){
   const p=state.players.find(x=>x.id===id),old=structuredClone(p);let patch;
   if(operation.type==='status'){
    if(!['Activo','Lesionado','Sem clube','Retirado'].includes(operation.value))throw Error('Estado inválido.');
    if(p.loan||p.status==='Emprestado')throw Error('Revê os jogadores emprestados individualmente antes de alterar o estado.');
    if(p.club===null&&['Activo','Lesionado'].includes(operation.value))throw Error('Atribui primeiro um clube aos jogadores livres.');
    patch={status:operation.value,...(operation.value==='Sem clube'?{club:null}:{})};
   }else if(operation.type==='club'){
    if(operation.value!==null&&!state.clubs.some(c=>c.id===operation.value))throw Error('Clube inválido.');
    if(p.loan||p.status==='Emprestado')throw Error('Transferências de jogadores emprestados devem ser editadas individualmente.');
    patch={club:operation.value};
   }else if(operation.type==='verification'){
    if(!['Por verificar','Parcial','Confirmado'].includes(operation.value))throw Error('Verificação inválida.');patch={verificationStatus:operation.value};if(p.sourcesUnified){if(!p.documentSources?.length)throw Error('Adiciona uma fonte antes de verificar este registo.');patch.documentSources=p.documentSources.map(r=>({...r,status:operation.value}));}
   }else patch={documentaryVersion:1,documentSources:[...(p.documentSources||[]),structuredClone(operation.source)]};
   E.updatePlayer(state,id,patch);
   const previousCount=old.changeHistory?.length||0,changes=(p.changeHistory||[]).slice(previousCount).flatMap(h=>h.changes);
   summary.push({id,name:p.name,changes});
  }
  W.validate(candidate);return {candidate,summary,baseline:JSON.stringify(master)};
 }
 function csvCell(value){let s=value===undefined||value===null?'':String(value);if(typeof value==='string'&&(/^[\t\r\n]/.test(s)||/^\s*[=+@-]/.test(s)))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
 function table(data,type){
  const pick=(rows,columns)=>({columns,rows:rows.map(r=>Object.fromEntries(columns.map(k=>[k,r[k]??''])))});
  if(type==='players')return pick(data.players,['id','name','fullName','birthDate','birthPlace','nation','secondNation','height','weight','position','number','club','status','contractStart','contractEnd','salary','theme','verificationStatus','source','sourceUrl']);
  if(type==='clubs')return pick(data.clubs,['id','name','fullName','city','div','tier','founded','stadium','stadiumCity','stadiumCapacity','stadiumYear','stadiumSurface','stadiumPhotoZoom','stadiumPhotoX','stadiumPhotoY','budget','color','secondaryColor']);
  if(type==='staff')return pick(data.staff,['id','name','role','club','nation','birthDate','age','qualification','contractEnd','salary']);
  if(type==='competitions')return pick(data.competitions,['id','name','shortName','country','kind','format','level','pointsWin','pointsDraw','pointsLoss','notes']);
  if(type==='contracts')return pick(data.players.flatMap(p=>(p.contractHistory||[]).map((h,index)=>({player_id:p.id,index,...h}))),['player_id','index','club','clubName','clubCountry','contractStart','contractEnd','salary','squadRole','releaseClause','agent','recordedAt']);
  if(type==='transfers')return pick(data.players.flatMap(p=>(p.transferHistory||[]).map((h,index)=>({player_id:p.id,index,...h,loan_parent_club:h.loan?.parentClub,loan_start:h.loan?.startDate,loan_end:h.loan?.endDate,loan_fee:h.loan?.fee,loan_purchase_type:h.loan?.purchaseType,loan_purchase_fee:h.loan?.purchaseFee,loan_notes:h.loan?.notes}))),['player_id','index','date','type','fromClub','toClub','fee','loan_parent_club','loan_start','loan_end','loan_fee','loan_purchase_type','loan_purchase_fee','loan_notes','notes']);
  if(type==='international')return pick(data.players.flatMap(p=>{const D=typeof Documentary!=='undefined'?Documentary:require('./documentary.js');return D.international(p).map((r,index)=>({player_id:p.id,index,...r}));}),['player_id','index','nation','level','caps','goals','startDate','endDate']);
  if(type==='sources')return pick(data.players.flatMap(p=>{const D=typeof Documentary!=='undefined'?Documentary:require('./documentary.js');return D.sources(p).map((r,index)=>({player_id:p.id,index,...r}));}),['player_id','index','title','field','url','consultedAt','verifiedAt','notes','status','legacy']);
  if(type==='documentaryStatistics')return pick(data.players.flatMap(p=>(p.documentaryStats||[]).map((h,index)=>({player_id:p.id,index,...h,origin:'documentary'}))),['player_id','index','season','club','clubName','clubCountry','competition','appearances','minutes','goals','assists','source','origin']);
  if(type==='statistics')return pick(data.players.flatMap(p=>[...(p.stats?[{player_id:p.id,year:data.year,club:p.club,period:'current',...p.stats,origin:'simulation'}]:[]),...(p.career||[]).map(h=>({player_id:p.id,...h,period:'completed',origin:'simulation'}))]),['player_id','year','club','period','origin','appearances','minutes','goals','assists','passes','shots','yellow','red']);
  throw Error('Tipo de exportação desconhecido.');
 }
 function exportCsv(data,type){const t=table(data,type);return '\ufeff'+[t.columns.map(csvCell).join(';'),...t.rows.map(r=>t.columns.map(k=>csvCell(r[k])).join(';'))].join('\r\n');}
 function parseCsv(input){
  if(typeof input!=='string'||input.length>5000000)throw Error('CSV demasiado grande (máximo 5 MB).');
  const text=input.replace(/^\ufeff/,''),counts={';':0,',':0};let quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){i++;continue;}quoted=!quoted;}if(!quoted){if(c==='\r'||c==='\n')break;if(c in counts)counts[c]++;}}
  const delimiter=counts[',']>counts[';']?',':';',rows=[];let row=[],cell='',inside=false,closed=false;
  const pushCell=()=>{row.push(cell);cell='';closed=false;};
  const pushRow=()=>{pushCell();if(!(row.length===1&&row[0]===''))rows.push(row);row=[];if(rows.length>5001)throw Error('Máximo de 5000 linhas de jogadores.');};
  for(let i=0;i<text.length;i++){
   const c=text[i];if(inside){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{inside=false;closed=true;}}else cell+=c;continue;}
   if(c===delimiter){pushCell();continue;}if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;pushRow();continue;}
   if(closed){if(c===' '||c==='\t')continue;throw Error('Caracteres inesperados depois das aspas.');}
   if(c==='"'){if(cell)throw Error('Aspas inválidas numa célula.');inside=true;}else cell+=c;
  }
  if(inside)throw Error('Aspas por fechar no CSV.');if(cell||row.length||closed)pushRow();
  if(!rows.length)throw Error('CSV vazio.');const columns=rows.shift().map(x=>x.trim());
  if(new Set(columns).size!==columns.length||columns.some(x=>!x))throw Error('Cabeçalhos vazios ou repetidos.');
  if(rows.some(r=>r.length!==columns.length))throw Error('Há linhas com um número de colunas diferente do cabeçalho.');
  return {columns,rows:rows.map(r=>Object.fromEntries(columns.map((k,i)=>[k,r[i]])))};
 }
 function importPlayersPlan(master,input){
  if(master.kind!=='database')throw Error('Importação disponível apenas na Base Mestre.');
  const parsed=parseCsv(input),allowed=table(master,'players').columns;
  if(!parsed.columns.includes('id')||parsed.columns.some(k=>!allowed.includes(k)))throw Error('Usa a coluna id e cabeçalhos do CSV de jogadores exportado pela aplicação.');
  if(!parsed.rows.length)throw Error('O CSV não contém jogadores.');
  const seen=new Set(),updates=[],numeric=['height','weight','number','salary'];
  for(const [i,row] of parsed.rows.entries()){
   if(!/^\d+$/.test(row.id.trim()))throw Error('Linha '+(i+2)+': ID inválido.');const id=Number(row.id),p=master.players.find(p=>p.id===id);
   if(!p||seen.has(id))throw Error('Linha '+(i+2)+': ID inexistente ou repetido.');seen.add(id);const patch={};
   for(const key of parsed.columns){if(key==='id')continue;if(row[key]===csvCell(p[key]).slice(1,-1).replace(/""/g,'"'))continue;let v=row[key].trim();if(!v)continue;
    if(key==='club'){if(['SEM_CLUBE','null'].includes(v))v=null;else{if(!/^\d+$/.test(v))throw Error('Linha '+(i+2)+': clube deve ser um ID ou SEM_CLUBE.');v=Number(v);}}
    else if(numeric.includes(key)){if(!/^\d+$/.test(v))throw Error('Linha '+(i+2)+': número inválido em '+key);v=Number(v);}
    else if(typeof p[key]==='string'&&v==="'"+p[key]&&/^\s*[=+@-]/.test(p[key]))v=p[key];
    if(v!==p[key])patch[key]=v;
   }
   if(p.sourcesUnified&&['verificationStatus','source','sourceUrl'].some(k=>k in patch))throw Error('Linha '+(i+2)+': altera as fontes e a verificação na ficha do jogador.');
   if(!Object.keys(patch).length)continue;
   if((p.loan||p.status==='Emprestado')&&('club' in patch||'status' in patch))throw Error('Linha '+(i+2)+': altera vínculos de jogadores emprestados na ficha individual.');
   if(patch.status==='Emprestado')throw Error('Linha '+(i+2)+': documenta o empréstimo na ficha individual.');
   if(patch.status==='Sem clube')patch.club=null;
   if(['Activo','Lesionado'].includes(patch.status)&&(patch.club===undefined?p.club:patch.club)===null)throw Error('Linha '+(i+2)+': atribui um clube antes deste estado.');
   updates.push({id,patch,line:i+2});
  }
  if(updates.length>200)throw Error('Máximo de 200 jogadores alterados por importação. Divide as alterações em vários ficheiros.');
  const candidate=structuredClone(master),state=W.context(candidate),summary=[];
  for(const item of updates){const p=state.players.find(p=>p.id===item.id),before={...p},count=p.changeHistory?.length||0;
   try{E.updatePlayer(state,item.id,item.patch);}catch(e){throw Error('Linha '+item.line+': '+e.message);}
   const changes=(p.changeHistory||[]).slice(count).flatMap(h=>h.changes);for(const key of ['number','theme'])if(before[key]!==p[key])changes.push({field:key,before:String(before[key]??'Por indicar'),after:String(p[key]??'Por indicar')});
   summary.push({id:p.id,name:p.name,changes});
  }
  W.validate(candidate);return {candidate,summary,baseline:JSON.stringify(master),read:parsed.rows.length};
 }
 function importDocumentaryStatsPlan(master,input){
  if(master.kind!=='database')throw Error('Importação disponível apenas na Base Mestre.');
  const parsed=parseCsv(input),allowed=table(master,'documentaryStatistics').columns;
  if(!['player_id','index'].every(k=>parsed.columns.includes(k))||parsed.columns.some(k=>!allowed.includes(k)))throw Error('Usa os cabeçalhos do CSV de estatísticas reais, incluindo player_id e index.');
  if(!parsed.rows.length)throw Error('CSV sem registos.');
  const candidate=structuredClone(master),state=W.context(candidate),updates=new Map(),seen=new Set(),catalog=[...(master.documentaryClubs||[])];
  for(const [i,r] of parsed.rows.entries()){
   const fail=message=>{throw Error('Linha '+(i+2)+': '+message);};
   if(!/^\d+$/.test(r.player_id.trim()))fail('ID do jogador inválido.');
   const id=Number(r.player_id),p=master.players.find(x=>x.id===id);if(!p)fail('Jogador inexistente.');
   const add=r.index.trim()==='NOVO';if(!add&&!/^\d+$/.test(r.index.trim()))fail('index deve ser o índice exportado ou NOVO.');
   const index=Number(r.index),old=add?{}:p.documentaryStats?.[index];if(!old)fail('Índice inexistente. Usa NOVO para adicionar uma época.');
   const key=id+':'+index;if(!add&&seen.has(key))fail('A mesma linha estatística aparece mais de uma vez.');if(!add)seen.add(key);
   if(r.origin&&r.origin.trim()!=='documentary')fail('Só são aceites estatísticas documentais, não resultados da simulação.');
   const row={...old};
   for(const k of parsed.columns){if(['player_id','index','origin'].includes(k))continue;
    const raw=r[k];if(raw===csvCell(old[k]).slice(1,-1).replace(/""/g,'"'))continue;let value=raw.trim();if(!value)continue;
    if(['appearances','minutes','goals','assists','club'].includes(k)){
     if(!/^\d+$/.test(value))fail('Valor numérico inválido em '+k);value=Number(value);
    }
    row[k]=value;
   }
   if(Number.isInteger(old.club)&&r.clubName?.trim()&&r.clubName!==old.clubName&&!r.club?.trim())fail('Para mudar de um clube existente para um externo, edita a entrada na ficha.');
   if(add&&Number.isInteger(row.club)&&row.clubName)fail('Indica apenas club ou clubName para identificar o clube.');
   if(Number.isInteger(row.club)){if(!master.clubs.some(c=>c.id===row.club))fail('Clube inexistente.');delete row.clubName;delete row.clubCountry;}
   else if(row.clubName){row.club=null;row.clubCountry=row.clubCountry||'';const ref={name:row.clubName,country:row.clubCountry};const D=typeof Documentary!=='undefined'?Documentary:require('./documentary.js');D.validateCatalog([ref]);if(!catalog.some(c=>D.normalize(c.name)===D.normalize(ref.name)&&D.normalize(c.country)===D.normalize(ref.country)))catalog.push(ref);}
   const rows=updates.get(id)||structuredClone(p.documentaryStats||[]);
   if(add){if(rows.some(x=>JSON.stringify(x)===JSON.stringify(row)))fail('Entrada idêntica já existente.');rows.push(row);}else rows[index]=row;
   if(JSON.stringify(rows)!==JSON.stringify(p.documentaryStats||[]))updates.set(id,rows);
  }
  if(updates.size>200)throw Error('Máximo de 200 jogadores alterados por importação.');
  const summary=[];
  for(const [id,rows] of updates){const p=state.players.find(x=>x.id===id),count=p.changeHistory?.length||0;E.updatePlayer(state,id,{documentaryStats:rows});summary.push({id,name:p.name,changes:(p.changeHistory||[]).slice(count).flatMap(h=>h.changes)});}
  if(updates.size&&catalog.length)candidate.documentaryClubs=catalog;
  W.validate(candidate);return {candidate,summary,baseline:JSON.stringify(master),read:parsed.rows.length};
 }
 return {bulkPlan,table,exportCsv,parseCsv,importPlayersPlan,importDocumentaryStatsPlan};
})();
if(typeof module!=='undefined')module.exports=DatabaseOps;
