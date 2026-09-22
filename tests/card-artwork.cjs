const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
const root=path.resolve(__dirname,'../dist');
(async()=>{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://artwork.test/',runScripts:'outside-only'}),w=dom.window,d=w.document;
 try{
 w.indexedDB=new IDBFactory();w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 const run=code=>vm.runInContext(code,dom.getInternalVMContext());
 for(const tag of d.querySelectorAll('script'))run(fs.readFileSync(path.join(root,tag.getAttribute('src')),'utf8'));
 for(let i=0;i<300&&d.body.classList.contains('storage-loading');i++)await new Promise(r=>setTimeout(r,10));
 assert(!d.body.classList.contains('storage-loading'));await run('AutoSave.settle()');run('enterDatabase()');
 run(`master.clubs[0].logo='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E';master.clubs[0].secondaryColor='#FFFFFF';master.clubs[0].founded='1898';master.clubs[0].stadiumPhoto='';`);
 const before=run('JSON.stringify(master)'),c=run('master.clubs[0].id'),p=run('master.players.find(p=>p.club===master.clubs[0].id).id'),staff=run('master.staff.find(p=>p.club===master.clubs[0].id).id');
 const box=d.createElement('div');box.innerHTML=run('clubVisual(master.clubs[0])');assert(box.querySelector('.premium-waves'));assert(box.querySelector('.premium-watermark'));assert(!box.querySelector('.club-stadium-cover'));assert(box.textContent.includes('1898'));
 const styles=d.createElement('style');styles.textContent=fs.readFileSync(path.join(root,'style.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'identity.css'),'utf8');d.head.append(styles);
 run(`showClub(${c})`);assert(d.querySelector('#clubDetails .premium-waves'));assert(d.querySelector('#clubDetails .premium-watermark'));
 const identity=d.querySelector('#clubDetails .club-visual-identity'),art=d.querySelector('#clubDetails .premium-surface');
 assert.equal(w.getComputedStyle(identity).position,'relative');assert(+w.getComputedStyle(identity).zIndex>+w.getComputedStyle(art).zIndex,'Club text must be above the decorative layer');
 for(const icon of d.querySelectorAll('#clubDetails .club-detail-meta svg')){assert.equal(w.getComputedStyle(icon).width,'20px');assert.equal(w.getComputedStyle(icon).height,'20px');}
 assert.equal(w.getComputedStyle(d.getElementById('clubDetails')).width,'1120px');
 d.getElementById('clubDetailsClose').click();
 run(`openPlayer(${p})`);const editor=d.querySelector('#playerEditor .sticker');assert(editor.querySelector('.premium-waves'));assert(editor.querySelector('.premium-watermark'));const list=d.createElement('div');list.innerHTML=run(`playerStickerMarkup(master.players.find(p=>p.id===${p}),master)`);assert.equal(editor.querySelector('.premium-surface').outerHTML,list.querySelector('.premium-surface').outerHTML);assert(editor.querySelector('.sticker-country'));assert(!editor.querySelector('.club-water'));d.getElementById('playerCancel').click();
 run(`edit('staff',${staff})`);assert(d.querySelector('#staffCard .premium-waves'));assert(d.querySelector('#staffCard .premium-watermark'));d.getElementById('recordCancel').click();assert.equal(run('JSON.stringify(master)'),before);
 box.innerHTML=run(`clubVisual({...master.clubs[0],stadiumPhoto:'data:image/png;base64,AAAA'},true)`);assert(box.querySelector('.club-stadium-cover'));assert(!box.querySelector('.premium-watermark'));assert(!box.querySelector('.premium-waves'));
 box.innerHTML=run('clubVisual({...master.clubs[0],logo:""})');assert(box.querySelector('.premium-waves'));assert(!box.querySelector('.premium-watermark'));
 assert(!d.querySelector('.flag-ribbon'));await run('AutoSave.settle()');console.log('PASS: shared waves/crest in club detail, player list/editor and staff; photo/fallback variants; original records and player nationalities preserved.');
 }finally{w.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
