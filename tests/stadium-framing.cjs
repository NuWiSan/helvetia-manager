const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../dist/game.js'),W=require('../dist/world.js'),C=require('../dist/csv-import.js'),O=require('../dist/database-ops.js');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
const root=path.resolve(__dirname,'../dist'),windows=[];
async function open(factory){
 const d=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://colors.test/',runScripts:'outside-only'}),w=d.window;windows.push(w);
 w.indexedDB=factory;w.structuredClone=structuredClone;w.confirm=()=>true;w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 const run=s=>vm.runInContext(s,d.getInternalVMContext()),$=id=>w.document.getElementById(id);
 for(const tag of w.document.querySelectorAll('script'))run(fs.readFileSync(path.join(root,tag.getAttribute('src')),'utf8'));
 for(let i=0;i<300&&w.document.body.classList.contains('storage-loading');i++)await new Promise(r=>setTimeout(r,10));
 await run('AutoSave.settle()');run('enterDatabase()');return {w,run,$};
}
async function main(){
 const old=W.fresh(),before=JSON.stringify(old);
 const plan=C.plan(old,'clubs','id;stadiumPhotoZoom;stadiumPhotoX;stadiumPhotoY\n0;140;-20;10');
 assert.equal(JSON.stringify(old),before);
 assert.equal(plan.candidate.clubs[0].stadiumPhotoX,-20);
 assert.equal(C.plan(plan.candidate,'clubs',O.exportCsv(plan.candidate,'clubs')).summary.length,0);
 for(const row of ['181;0;0','100;-36;0','100;0;36','110.5;0;0'])assert.throws(()=>C.plan(old,'clubs','id;stadiumPhotoZoom;stadiumPhotoX;stadiumPhotoY\n0;'+row));
 const career=W.createCareer(plan.candidate,12);plan.candidate.clubs[0].stadiumPhotoZoom=100;assert.equal(career.clubs[0].stadiumPhotoZoom,140);
 const factory=new IDBFactory(),a=await open(factory);
 a.run('edit("clubs",master.clubs[0].id)');
 const set=(key,val)=>{const el=a.$('editForm').elements[key];el.value=val;el.dispatchEvent(new a.w.Event('input'));};
 set('stadiumPhotoZoom',150);set('stadiumPhotoX',-20);
 assert.match(a.$('stadiumFramePreview').style.cssText,/1.5/);
 assert.equal(a.run('master.clubs[0].stadiumPhotoZoom'),undefined);
 a.$('recordCancel').click();assert.equal(a.run('master.clubs[0].stadiumPhotoZoom'),undefined);
 a.run('edit("clubs",master.clubs[0].id)');set('stadiumPhotoZoom',140);set('stadiumPhotoX',-20);set('stadiumPhotoY',10);
 a.$('editForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));
 assert.equal(a.run('master.clubs[0].stadiumPhotoZoom'),140);assert.equal(a.run('master.clubs[0].secondaryColor'),undefined);
 await a.run('AutoSave.settle()');const b=await open(factory);assert.equal(b.run('master.clubs[0].stadiumPhotoX'),-20);
 for(const detail of [true,false]){const html=b.run(`clubVisual({...master.clubs[0],stadiumPhoto:'data:image/png;base64,AAAA'},${detail})`);assert.match(html,/--club-stadium-zoom:1.4/);assert.match(html,/--club-stadium-pos-x:30%/);}
 b.run('edit("clubs",master.clubs[0].id)');b.$('resetStadiumFrame').click();b.$('editForm').dispatchEvent(new b.w.Event('submit',{cancelable:true}));assert.equal(b.run('master.clubs[0].stadiumPhotoZoom'),100);assert.equal(b.run('master.clubs[0].stadiumPhotoX'),0);
 await b.run('AutoSave.settle()');console.log('PASS: stadium framing CSV bounds, signed positions, cancellation, save/reset, reload, card/detail and snapshot isolation.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>windows.forEach(w=>w.close()));
