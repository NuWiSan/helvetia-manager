const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
const Store=require('../dist/save-store.js'),Search=require('../dist/player-search.js');
const root=path.join(__dirname,'../dist'),windows=[];
async function until(check){for(let i=0;i<200;i++){if(check())return;await new Promise(r=>setTimeout(r,10));}throw Error('Timed out');}
async function application(factory){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://helvetia.test/',runScripts:'outside-only'});
 windows.push(dom.window);const w=dom.window,ctx=dom.getInternalVMContext();
 w.indexedDB=factory;w.structuredClone=structuredClone;w.confirm=()=>true;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const run=code=>vm.runInContext(code,ctx);
 for(const tag of w.document.querySelectorAll('script[src]'))run(fs.readFileSync(path.join(root,tag.getAttribute('src')),'utf8'));
 await until(()=>!w.document.body.classList.contains('storage-loading'));
 await run('AutoSave.settle()');
 return {w,run,$:id=>w.document.getElementById(id)};
}
async function main(){
 const ui=await application(new IDBFactory());ui.run('enterDatabase();openPlayer(master.players[0].id)');assert.equal(ui.$('playerEditor').querySelector('.sticker-tools'),null);const gold=ui.$('playerForm').querySelector('[name=theme][value=gold]');gold.checked=true;gold.dispatchEvent(new ui.w.Event('change',{bubbles:true}));assert(ui.$('playerSticker').querySelector('.edition-gold'));ui.$('playerForm').dispatchEvent(new ui.w.Event('submit',{cancelable:true}));assert.equal(ui.run('master.players[0].theme'),'gold');ui.run('enterDatabase();edit("staff",s.staff[0].id)');
 assert(ui.$('staffCard'));assert.equal(ui.$('editForm').elements.simulationRole,undefined);assert(ui.$('fields').querySelector('details:not([open])')); ui.$('editForm').elements.role.value='Treinador principal';ui.$('editForm').dispatchEvent(new ui.w.Event('submit',{cancelable:true}));assert.equal(ui.run('s.staff[0].role'),'Treinador principal');
 ui.run('edit("clubs",s.clubs[0].id)');ui.$('editForm').elements.founded.value='1900-01-01';ui.$('add-sponsors').click();const sponsor=ui.$('fields').querySelector('[name="collection-sponsors-0"]');sponsor.value='Parceiro';sponsor.dispatchEvent(new ui.w.Event('input'));ui.$('editForm').dispatchEvent(new ui.w.Event('submit',{cancelable:true}));assert.equal(ui.run('s.clubs[0].sponsors[0].name'),'Parceiro');ui.run('showClub(s.clubs[0].id)');assert.match(ui.$('clubDetails').textContent,/Parceiro/);await ui.run('AutoSave.settle()');

 const factory=new IDBFactory(),store=await Store.open(factory);
 let head=await store.commit('master',{name:'First'},0,{now:1});
 for(let i=0;i<8;i++)head=await store.commit('master',{name:'Base '+i},head.revision,{now:2+i*300001});
 let saved=await store.read();assert.equal(saved.backups.length,5);
 const revision=head.revision;
 await assert.rejects(store.commit('master',{name:'Stale'},revision-1),e=>e.code==='conflict');
 assert.equal((await store.read()).heads[0].revision,revision);
 assert.equal((await store.read()).heads[0].data.name,'Base 7');
 await assert.rejects(store.commit('master',{name:'Broken write',uncloneable:()=>{}},revision));
 assert.equal((await store.read()).heads[0].data.name,'Base 7','Failed transaction retains the last successful save');
 await store.commit('career',{name:'Career'},0);
 await store.commit('master',{name:'Restored'},revision,{force:true});
 assert.equal((await store.read()).heads.find(h=>h.key==='career').data.name,'Career');
 let protectedHead=(await store.read()).heads.find(h=>h.key==='master');
 protectedHead=await store.commit('master',{name:'After protected'},protectedHead.revision,{protectedBackup:true});
 for(let i=0;i<8;i++)protectedHead=await store.commit('master',{name:'Rotation '+i},protectedHead.revision,{force:true});
 const protectedData=await store.read();assert(protectedData.backups.some(b=>b.protected&&b.data.name==='Restored'));assert.equal(protectedData.backups.filter(b=>b.key==='master'&&!b.protected).length,5);
 await assert.rejects(store.commit('master',{bad:()=>{}},protectedHead.revision,{protectedBackup:true}));assert.equal((await store.read()).heads.find(h=>h.key==='master').revision,protectedHead.revision);


 const data={year:2026,clubs:[{id:1,name:'FC Zürich',fullName:'Fussballclub Zürich'}],players:[
 {id:1,name:'João Silva',fullName:'João Pedro Silva',club:1,position:'MC',secondaryPositions:['MDC'],birthDate:'2000-07-02',nation:'Portugal',verificationStatus:'Confirmado',photo:'photo'},
 {id:2,name:'Ana Costa',club:null,position:'GR',nation:'Suíça'},
 {id:3,name:'Luis Silva',club:1,position:'AV',secondNation:'Portugal',birthDate:'1990-01-01'}
 ]};
 assert.equal(Search.find(data,{query:'joao zurich'})[0].id,1);
 assert.equal(Search.find(data,{club:'free'})[0].id,2);
 assert.equal(Search.find(data,{position:'MDC'})[0].id,1);
 assert.equal(Search.find(data,{nation:'portugal'}).length,2);
 assert.equal(Search.find(data,{minAge:'0'}).length,2,'Unknown ages are not invented');
 assert.equal(Search.find(data,{verification:'Por verificar'}).length,2);
 assert.equal(Search.find(data,{photo:'missing'}).length,2);
 assert.equal(Search.age(data.players[0],2026),25);

 const shared=new IDBFactory(),a=await application(shared),db=await Store.open(shared);
 assert.equal(a.run('career'),null,'Standalone database does not require a career');
 a.run('enterDatabase();view="Todos os jogadores";render();');
 assert(a.$('search-query'));assert(a.$('advance').hidden);
 a.run('view="Plantel e staff";render()');
 assert(a.w.document.querySelector('#nav [data-view="Todos os jogadores"]'));
 a.run('view="Todos os jogadores";render()');
 assert(a.$('searchCount').textContent.includes('1332'));
 a.run('view="Editor de clubes";render();');
 assert.equal(a.w.document.querySelectorAll('.club-photo-card').length,74);
 assert(!a.w.document.querySelector('.club-stadium-cover'),'No invented stadium photos');
 a.run('master.clubs[0].stadiumPhoto="data:image/png;base64,AAAA";render();showClub(0);');
 assert(a.$('clubDetails').querySelector('.club-visual-large .club-stadium-cover'));
 assert(a.w.document.querySelector('.club-photo-card .club-stadium-cover'));
 a.$('clubDetailsClose').click();
 a.run('view="Todos os jogadores";render()');
 const initialName=a.run('master.players[0].name');
 a.run('openPlayer(master.players[0].id)');
 a.$('playerForm').elements.name.value='Cancelled draft';
 a.$('playerCancel').click();
 await a.run('AutoSave.settle()');
 assert.equal((await db.read()).heads.find(h=>h.key==='master').data.players[0].name,initialName);
 a.run('openPlayer(master.players[0].id)');
 a.$('playerForm').elements.name.value='João de Teste';
 a.$('playerForm').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(a.run('master.players[0].name'),'João de Teste');
 // Several international levels coexist in the real player form and autosave.
 a.run('openPlayer(master.players[0].id)');
 for(const [i,level,caps] of [[0,'Sub-19',3],[1,'Sub-21',5],[2,'Principal',11]]){
  a.$('playerForm').elements.namedItem('intl-entry-nation').value='Suíça';
  a.$('playerForm').elements.namedItem('intl-entry-level').value=level;
  a.$('playerForm').elements.namedItem('intl-entry-caps').value=caps;
  a.$('playerForm').elements.namedItem('intl-entry-goals').value=0;
  a.$('internationalAdd').click();
 }
 a.$('playerForm').dispatchEvent(new a.w.Event('input',{bubbles:true}));
 assert.match(a.$('internationalTotals').textContent,/19 jogos/);
 assert.equal(a.$('internationalRows').querySelectorAll('select').length,2,'Only one entry form, not one per record');
 assert.equal(a.$('internationalRows').querySelectorAll('tbody tr').length,3);
 a.w.document.querySelector('[data-international-edit="1"]').click();
 a.$('playerForm').elements.namedItem('intl-entry-caps').value=7;
 a.$('internationalReset').click();
 assert.equal(a.run('Engine.internationalTotals(playerDraft).youth.caps'),8,'Cancel inline edit keeps the committed draft rows');
 a.w.document.querySelector('[data-international-edit="1"]').click();
 a.$('playerForm').elements.namedItem('intl-entry-caps').value=6;
 a.$('internationalAdd').click();
 assert.equal(a.run('Engine.internationalTotals(playerDraft).youth.caps'),9);
 a.w.document.querySelector('[data-international-edit="1"]').click();
 a.$('playerForm').elements.namedItem('intl-entry-caps').value=5;
 a.$('internationalAdd').click();
 a.$('playerForm').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(a.run('Engine.internationalTotals(master.players[0]).senior.caps'),11);
 assert.equal(a.run('Engine.internationalTotals(master.players[0]).youth.caps'),8);
 await a.run('AutoSave.settle()');
 saved=await db.read();const masterHead=saved.heads.find(h=>h.key==='master');
 assert.equal(masterHead.data.players[0].name,'João de Teste');
 assert.equal(masterHead.data.players[0].internationalRecords.length,3);
 assert(!('fixtures' in masterHead.data));assert(!saved.heads.some(h=>h.key==='career'));
 assert(saved.backups.some(b=>b.key==='master'&&b.data.players[0].name===initialName));
 a.$('search-query').value='Joao de Teste';
 a.$('search-query').dispatchEvent(new a.w.Event('input'));
 assert(a.$('searchCount').textContent.startsWith('1 de'));
 assert.equal(a.$('searchResults').querySelectorAll('[data-search-player]').length,1);
 a.run('career=World.createCareer(master,12,"Carreira teste");continueCareer();Engine.startRound(s,42);s.liveMatch.paused=false;Engine.stepMatch(s,s.liveMatch);pauseMatch();render();');
 await a.run('AutoSave.settle()');
 const minute=a.run('career.liveMatch.minute');assert.equal(minute,1);
 a.run('enterDatabase();master.players[0].name="Nome apenas da Mestre";render();');
 await a.run('AutoSave.settle()');
 assert.equal(a.run('career.players[0].name'),'João de Teste');
 const b=await application(shared);
 assert.equal(b.run('master.players[0].name'),'Nome apenas da Mestre');
 assert.equal(b.run('career.players[0].name'),'João de Teste');
 assert.equal(b.run('career.liveMatch.minute'),minute);assert(b.run('career.liveMatch.paused'));
 assert.equal(b.run('mode'),'home');
 // Restoring only the master preserves the current career and backs up replaced data.
 b.run('enterDatabase()');await b.$('saveHistory').onclick();
 const restore=b.$('saveRecovery').querySelector('[data-restore^="master-"]');
 assert(restore);await restore.onclick();
 assert.equal(b.run('master.players[0].name'),initialName);
 assert.equal(b.run('career.players[0].name'),'João de Teste');
 assert((await db.read()).backups.some(h=>h.key==='master'&&h.data.players[0].name==='Nome apenas da Mestre'));
 // A now-stale window must not overwrite the restored master.
 a.run('master.players[0].name="Stale window";render();');await a.run('AutoSave.settle()');
 assert.match(a.$('saveStatus').textContent,/outra janela/);
 assert.equal((await db.read()).heads.find(h=>h.key==='master').data.players[0].name,initialName);
 // Invalid persisted data is retained and can be exported/recovered, never replaced by seed.
 const current=(await db.read()).heads.find(h=>h.key==='master');
 await db.commit('master',{name:'Invalid data'},current.revision,{force:true});
 const c=await application(shared);
 assert.match(c.$('saveStatus').textContent,/não pôde ser aberta/);
 assert.equal((await db.read()).heads.find(h=>h.key==='master').data.name,'Invalid data');
 assert(c.$('openRecovery'));assert(!c.$('openDatabase'));c.run('enterDatabase()');assert(c.$('openRecovery'));
 await assert.rejects(c.run('AutoSave.replaceMaster(World.fresh())'));
 assert.equal((await db.read()).heads.find(h=>h.key==='master').data.name,'Invalid data');
 await c.$('saveHistory').onclick();
 const validBackup=c.$('saveRecovery').querySelector('[data-restore^="master-"]');
 assert(!validBackup.disabled);await validBackup.onclick();
 assert.equal(c.run('master.players[0].name'),initialName);
 assert(!(await db.read()).heads.find(h=>h.key==='master').data.players.some(p=>p.name==='Stale window'));
 // No browser storage: manual export and independent editing still remain available.
 const unavailable=await application(null);
 assert.match(unavailable.$('saveStatus').textContent,/não está disponível/);
 unavailable.run('enterDatabase()');assert(unavailable.$('modeSave'));
 // Reset must be backed up, explicitly confirmed and preserve careers.
 const resetFactory=new IDBFactory(),reset=await application(resetFactory),resetStore=await Store.open(resetFactory);
 reset.run('career=World.createCareer(master,12,"Preservada");enterDatabase()');await reset.run('AutoSave.settle()');
 reset.run('downloadData=(data,name)=>{window.lastDownload={data:structuredClone(data),name}}');
 await reset.$('clearMaster').onclick();await reset.$('resetCommit').onclick();assert(reset.run('master.players.length')>0);
 await reset.$('resetBackup').onclick();assert(reset.w.lastDownload.data.players.length>0);
 reset.$('resetDownloaded').checked=true;reset.$('resetPhrase').value='APAGAR';await reset.$('resetCommit').onclick();
 assert.equal(reset.run('master.players.length'),0);assert.equal(reset.run('master.clubs.length'),0);assert.equal(reset.run('master.competitions.length'),0);
 assert.equal(reset.run('career.name'),'Preservada');assert((await resetStore.read()).backups.some(b=>b.protected&&b.data.players.length>0));
 for(const view of ['Todos os jogadores','Plantel e staff','Editor de clubes','Editor de competições','Pesquisa global'])reset.run('view='+JSON.stringify(view)+';render()');
 reset.run('master=CsvImport.plan(master,"clubs","id;name\\nNOVO;Clube novo").candidate;s=World.context(master);enterDatabase()');
 reset.run('master=CsvImport.plan(master,"players","id;name;position;club\\nNOVO;Pessoa nova;GR;0").candidate;s=World.context(master);render()');
 await reset.run('AutoSave.settle()');assert.equal(reset.run('master.players.length'),1);
 const reload=await application(resetFactory);assert.equal(reload.run('master.players.length'),1);assert.equal(reload.run('career.name'),'Preservada');
 await ui.run('AutoSave.protect(\'master\')');
 assert(!ui.$('saveMaster'),'Only the header export action remains');
 console.log('PASS: IndexedDB transactions, five backups, stale-write protection, master-only editing, draft cancellation, player search, reload, paused career, isolated restore, corrupt-save recovery and unavailable-storage fallback.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>windows.forEach(w=>w.close()));
