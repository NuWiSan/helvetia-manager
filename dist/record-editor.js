function clubColorFields(c){
 return `<fieldset class="club-colors-editor wide"><legend>Cores do clube</legend><div class="club-colors-grid">${[['color','Cor principal'],['secondaryColor','Cor secundária']].map(([key,label])=>`<div><label for="club-${key}-hex">${label}</label><div class="club-color-controls"><input type="color" id="club-${key}-picker" aria-label="Seleccionar ${label.toLowerCase()}" value="${Engine.normalizeClubColor(c[key])||(key==='secondaryColor'?Engine.getClubSecondaryColor(c):'#263B45')}"><input type="text" name="${key}" id="club-${key}-hex" aria-label="${label} em hexadecimal" value="${esc(c[key]||'')}" placeholder="${key==='secondaryColor'?'Automática':'#RRGGBB'}" maxlength="7" spellcheck="false" ${key==='color'?'required':''}></div></div>`).join('')}</div><button type="button" id="club-secondary-auto">Usar cor secundária automática</button><p class="muted" id="club-color-status">HEX: #RGB ou #RRGGBB. A cor automática não é guardada.</p><div class="club-color-preview"><span id="club-color-swatch">Principal</span><span id="club-secondaryColor-swatch">Secundária</span></div></fieldset>`;
}
function setupClubColors(){
 const primary=$('club-color-hex'),secondary=$('club-secondaryColor-hex');
 const draw=()=>{
  for(const input of [primary,secondary])input.setCustomValidity(input.value.trim()===''&&input===secondary||Engine.normalizeClubColor(input.value)?'':'Indica uma cor HEX válida: #RGB ou #RRGGBB.');
  const p=Engine.normalizeClubColor(primary.value)||Engine.normalizeClubColor(editTarget.item.color)||'#263B45';
  const colors={color:p,secondaryColor:Engine.getClubSecondaryColor({color:p,secondaryColor:secondary.value})};
  for(const [key,value]of Object.entries(colors)){$('club-'+key+'-picker').value=value;const swatch=$('club-'+key+'-swatch');swatch.style.backgroundColor=value;swatch.style.color=Engine.getContrastColor(value);swatch.textContent=(key==='color'?'Principal':'Secundária')+' · '+value;}
  $('club-color-status').textContent=secondary.value.trim()?'HEX: #RGB ou #RRGGBB. As duas cores serão guardadas.':'Cor secundária automática · apenas pré-visualização, não será guardada.';
 };
 for(const key of ['color','secondaryColor']){$('club-'+key+'-hex').oninput=draw;$('club-'+key+'-picker').oninput=e=>{$('club-'+key+'-hex').value=e.target.value.toUpperCase();draw();};}
 $('club-secondary-auto').onclick=()=>{secondary.value='';draw();};draw();
}
function readClubColors(data){
 const primary=Engine.normalizeClubColor(data.color);if(!primary)throw Error('Cor principal inválida: usa #RGB ou #RRGGBB.');
 if(data.color!==editTarget.item.color)data.color=primary;
 if(data.secondaryColor?.trim()){const secondary=Engine.normalizeClubColor(data.secondaryColor);if(!secondary)throw Error('Cor secundária inválida: usa #RGB ou #RRGGBB.');data.secondaryColor=secondary;}else delete data.secondaryColor;
}
function countrySelect(name,value=''){
 const code=resolveCountry(value),current=code?countryName(code):value;
 const names=countryCodes.map(countryName).sort((a,b)=>a.localeCompare(b,'pt'));
 if(current&&!names.includes(current))names.unshift(current);
 return `<select name="${name}"><option value="">Escolher país…</option>${options(names,current)}</select>`;
}
function setupRecordImage(key,label){
 const target=editTarget;
 $('fields').insertAdjacentHTML('beforeend',`<section class="record-image"><label>${label}<input id="image-${key}" type="file" accept="image/*,.bmp,.dib,.ico,.avif,.svg"></label><div id="preview-${key}" class="club-logo-preview"></div><button type="button" id="remove-${key}">Remover imagem</button><p class="muted">PNG com transparência, JPEG, BMP e outros formatos suportados pelo navegador. Redução automática e transparência preservada.</p></section>`);
 const preview=()=>{$('preview-'+key).innerHTML=target.draft[key]?`<img src="${esc(target.draft[key])}" alt="${label}">`:'Sem imagem';};preview();
 let request=0;
 $('image-'+key).onchange=async e=>{
 const file=e.target.files[0];if(!file)return;const token=++request;target.busy++;
 $('editForm').querySelector('[type="submit"]').disabled=true;
 try{const data=await optimizeImage(file,key==='stadiumPhoto'?'stadium':key==='photo'?'portrait':'logo');if(editTarget!==target||token!==request||!$('modal').open)return;target.draft[key]=data;preview();$('recordError').textContent='';}
 catch(err){if(editTarget===target)$('recordError').textContent='Não foi possível abrir a imagem. '+err.message;}
 finally{target.busy--;if(editTarget===target)$('editForm').querySelector('[type="submit"]').disabled=target.busy>0;}
 };
 $('remove-'+key).onclick=()=>{request++;target.draft[key]='';$('image-'+key).value='';preview();};
}
function clubStadiumFramingStyle(c){
 const numeric=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
 const x=numeric(c?.stadiumPhotoX,0),y=numeric(c?.stadiumPhotoY,0),zoom=numeric(c?.stadiumPhotoZoom,100);
 const posX=Math.max(0,Math.min(100,50+x)),posY=Math.max(0,Math.min(100,50+y)),scale=Math.max(1,Math.min(1.8,zoom/100));
 return `--club-stadium-pos-x:${posX}%;--club-stadium-pos-y:${posY}%;--club-stadium-zoom:${scale}`;
}
function setupClubStadiumFraming(){
 const target=editTarget;
 $('fields').insertAdjacentHTML('beforeend',`<fieldset class="photo-framing club-photo-framing"><legend>Enquadramento da fotografia do estádio</legend><div id="stadiumFramePreview" class="stadium-frame-preview" aria-label="Pré-visualização do enquadramento"></div>${[['stadiumPhotoZoom','Zoom',100,180,100],['stadiumPhotoX','Posição horizontal',-35,35,0],['stadiumPhotoY','Posição vertical',-35,35,0]].map(([key,label,min,max,def])=>`<label>${label} <output id="${key}Value">${target.draft[key]??def}%</output><input type="range" name="${key}" min="${min}" max="${max}" step="1" value="${target.draft[key]??def}"></label>`).join('')}<button type="button" id="resetStadiumFrame">Repor enquadramento</button><p class="muted">Algumas fotografias de estádio precisam de um corte diferente. Estes ajustes afectam o cartão e a ficha do clube.</p></fieldset>`);
 const draw=()=>{const box=$('stadiumFramePreview');if(!box)return;box.style.cssText=clubStadiumFramingStyle(target.draft);box.innerHTML=target.draft.stadiumPhoto?`<img src="${esc(target.draft.stadiumPhoto)}" alt="Pré-visualização da fotografia do estádio">`:'<span>Adiciona uma imagem do estádio para pré-visualizar o enquadramento.</span>';};
 const sync=()=>{for(const key of ['stadiumPhotoZoom','stadiumPhotoX','stadiumPhotoY']){const el=$('editForm').elements[key];if(!el)continue;target.draft[key]=Number(el.value);$(key+'Value').value=el.value+'%';}draw();};
 ['stadiumPhotoZoom','stadiumPhotoX','stadiumPhotoY'].forEach(key=>{const el=$('editForm').elements[key];if(el)el.oninput=sync;});
 $('resetStadiumFrame').onclick=()=>{for(const [key,val] of [['stadiumPhotoZoom',100],['stadiumPhotoX',0],['stadiumPhotoY',0]]){const el=$('editForm').elements[key];if(el)el.value=val;target.draft[key]=val;$(key+'Value').value=val+'%';}draw();};
 const imagePreview=$('preview-stadiumPhoto');if(imagePreview){const observer=new MutationObserver(draw);observer.observe(imagePreview,{childList:true,subtree:true});$('modal').addEventListener('close',()=>observer.disconnect(),{once:true});}
 draw();
}
function clubVisual(c,detail=false){
 const meta=`${clubFoundationMarkup(c)}<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z"/><circle cx="12" cy="9" r="2"/></svg>${esc(c.city||'Localidade por indicar')}</span><span><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="7" rx="10" ry="4"/><path d="M2 7v10c0 5 20 5 20 0V7M7 11v8m10-8v8"/></svg>${esc(c.stadium||'Estádio por indicar')}</span>`;
 return `<div class="club-visual ${detail?'club-visual-large':''} ${c.stadiumPhoto?'':'club-visual-empty'}" style="${cardIdentityStyle(c)}">${cardIdentityArtwork(c,{stadium:true,lazy:!detail})}<div class="club-visual-identity">${badge(c)}<div><span class="eyebrow">${esc(divisionLabel(c))}</span><${detail?'h2':'h3'}>${esc(c.name)}</${detail?'h2':'h3'}><div class="${detail?'club-detail-meta':'club-card-meta'}">${meta}</div></div></div></div>`;
}
function showClub(id){
 const c=club(id),dialog=$('clubDetails');
 const players=s.players.filter(p=>p.club===id),staff=s.staff.filter(p=>p.club===id),coach=headCoach(id);
 dialog.innerHTML=`<div class="dialog-head"><h2>Ficha do clube</h2><button type="button" id="clubDetailsClose" aria-label="Fechar ficha">×</button></div>${clubVisual(c,true)}<div class="club-facts-grid"><section class="club-info-section"><h3>Clube</h3><dl><dt>Nome completo</dt><dd>${esc(c.fullName||c.name)}</dd><dt>Localidade</dt><dd>${esc(c.city||'Por indicar')}</dd><dt>Liga / escalão</dt><dd>${esc(clubLeagueTitle(c))}</dd><dt>Fundação</dt><dd>${esc(c.founded||'Por indicar')}</dd><dt>Treinador principal</dt><dd>${coach?`<button class="player-name" data-staff="${coach.id}">${esc(coach.name)}</button>`:'Por atribuir'}</dd><dt>Orçamento</dt><dd>${money(c.budget)}</dd></dl></section><section class="club-info-section"><h3>Estádio</h3><dl><dt>Nome</dt><dd>${esc(c.stadium||'Por indicar')}</dd><dt>Localidade</dt><dd>${esc(c.stadiumCity||c.city||'Por indicar')}</dd><dt>Lotação</dt><dd>${c.stadiumCapacity??'Por indicar'}</dd><dt>Inauguração</dt><dd>${c.stadiumYear??'Por indicar'}</dd><dt>Relvado</dt><dd>${esc(c.stadiumSurface||'Por indicar')}</dd></dl></section></div>${clubCollection(c,'sponsors','Patrocinadores')}${clubCollection(c,'kits','Equipamentos')}<section class="club-info-section"><h3>Plantel <small>· ${players.length} jogadores</small></h3>${clubPeople(players,'player')}</section><section class="club-info-section"><h3>Equipa técnica <small>· ${staff.length} membros</small></h3>${clubPeople(staff.slice().sort((a,b)=>Number(b.role==='Treinador principal')-Number(a.role==='Treinador principal')),'staff')}</section>${c.notes?`<section class="club-info-section"><h3>Notas</h3><p class="record-notes">${esc(c.notes)}</p></section>`:''}<div class="record-actions"><button type="button" id="clubDetailsDone">Fechar</button><button type="button" id="clubDetailsEdit" ${s.liveMatch?'disabled':''}>Editar clube</button></div>`;
 $('clubDetailsClose').onclick=$('clubDetailsDone').onclick=()=>dialog.close();
 $('clubDetailsEdit').onclick=()=>{dialog.close();edit('clubs',id);};
 dialog.querySelectorAll('[data-player]').forEach(b=>b.onclick=()=>{if(s.liveMatch){message('Termina o jogo em curso antes de abrir o editor.');return;}dialog.close();openPlayer(+b.dataset.player);});
 dialog.querySelectorAll('[data-staff]').forEach(b=>b.onclick=()=>{dialog.close();edit('staff',+b.dataset.staff);});
 dialog.showModal();
}
function headCoach(id){return s.staff.find(p=>p.club===id&&p.role==='Treinador principal');}
function clubCollection(c,key,title){const rows=c[key]||[];return rows.length?`<section class="panel"><h3>${title}</h3><div class="club-gallery">${rows.map(x=>`<figure>${x.image?`<img src="${esc(x.image)}" alt="${esc(x.name||title)}">`:''}${x.name?`<figcaption>${esc(x.name)}</figcaption>`:''}</figure>`).join('')}</div></section>`:'';}
function setupClubCollection(key,title){
 const target=editTarget;target.draft[key]||=[];
 $('fields').insertAdjacentHTML('beforeend',`<section class="record-image"><h3>${title}</h3><div id="collection-${key}"></div><button type="button" id="add-${key}">Adicionar ${key==='kits'?'equipamento':'patrocinador'}</button></section>`);
 const draw=()=>{
 $('collection-'+key).innerHTML=target.draft[key].map((x,i)=>`<div class="collection-row"><label>Nome / legenda (opcional)<input name="collection-${key}-${i}" value="${esc(x.name)}" maxlength="200"></label>${x.image?`<img src="${esc(x.image)}" alt="">`:''}<label>Imagem<input type="file" accept="image/*" data-upload="${i}"></label><button type="button" data-remove-image="${i}">Retirar imagem</button><button type="button" data-remove="${i}">Remover linha</button></div>`).join('');
 const root=$('collection-'+key);
 root.querySelectorAll('input[name]').forEach((el,i)=>el.oninput=()=>target.draft[key][i].name=el.value);
 root.querySelectorAll('[data-remove]').forEach(el=>el.onclick=()=>{if(target.busy)return;target.draft[key].splice(+el.dataset.remove,1);draw();});
 root.querySelectorAll('[data-remove-image]').forEach(el=>el.onclick=()=>{if(target.busy)return;target.draft[key][+el.dataset.removeImage].image='';draw();});
 root.querySelectorAll('[data-upload]').forEach(el=>el.onchange=async()=>{const file=el.files[0];if(!file)return;const row=target.draft[key][+el.dataset.upload];target.busy++;$('editForm').querySelector('[type=submit]').disabled=true;try{const image=await optimizeImage(file,key==='kits'?'portrait':'logo');if(editTarget!==target)return;row.image=image;draw();}catch(e){if(editTarget===target)$('recordError').textContent=e.message;}finally{target.busy--;if(editTarget===target)$('editForm').querySelector('[type=submit]').disabled=target.busy>0;}});
 };draw();$('add-'+key).onclick=()=>{if(target.busy)return;if(target.draft[key].length>=30){$('recordError').textContent='Máximo de 30 entradas por secção.';return;}target.draft[key].push({name:'',image:''});draw();};
}
function readClubCollections(data){for(const key of ['sponsors','kits'])data[key]=(data[key]||[]).map(x=>({name:x.name.trim(),image:x.image||''})).filter(x=>x.name||x.image);}
function setupStaffCard(){
 $('fields').insertAdjacentHTML('afterbegin','<div id="staffCard" class="staff-card"></div>');
 const target=editTarget,draw=()=>{if(editTarget!==target)return;const f=$('editForm'),name=f.elements.name.value,role=f.elements.role.value,c=club(+f.elements.club.value);$('staffCard').style.cssText=cardIdentityStyle(c);$('staffCard').innerHTML=`${cardIdentityArtwork(c)}<div class="staff-card-top">${badge(c)}<span>HELVETIA<br>EQUIPA TÉCNICA</span></div>${target.draft.photo?`<img class="staff-card-photo" src="${esc(target.draft.photo)}" alt="${esc(name)}">`:'<div class="staff-card-placeholder">Sem fotografia</div>'}<div class="staff-card-name"><p class="staff-function">${esc(role)}</p><h2>${esc(name)}</h2></div><p>${esc(c.name)} · ${esc(f.elements.nation.value||'Nacionalidade por indicar')}</p>`;};
 $('fields').addEventListener('input',draw);const observer=new MutationObserver(draw);observer.observe($('preview-photo'),{childList:true});$('modal').addEventListener('close',()=>{observer.disconnect();$('fields').removeEventListener('input',draw);},{once:true});draw();
}

function clubLeagueLogo(c){const comp=s.competitions.find(x=>x.id===[0,1,3][c.div]);return comp?.logo?`<img class="club-league-logo" src="${esc(comp.logo)}" alt="">`:'';}
function clubLeagueKey(c){return c.div<3?'division-'+c.div:'tier-'+(c.tier||4);}
function clubLeagueTitle(c){if(c.div<3)return s.competitions.find(x=>x.id===[0,1,3][c.div])?.name||divisionLabel(c);return 'Futebol amador · nível '+(c.tier||4);}

function personAvatar(p){return `<span class="person-avatar" aria-hidden="true">${p.photo?`<img class="staff-thumb" src="${esc(p.photo)}" alt="" loading="lazy">`:'<span>—</span>'}</span>`;}
function clubPeople(rows,type){return rows.length?`<div class="club-people-grid">${rows.map(p=>`<button type="button" class="person-row" data-${type}="${p.id}">${personAvatar(p)}<span class="person-text"><b>${esc(p.name)}</b><small>${esc(type==='player'?p.position:p.role)}</small></span></button>`).join('')}</div>`:'<p class="muted">Sem registos.</p>';}
