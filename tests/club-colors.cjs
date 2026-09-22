const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../dist/game.js'),W=require('../dist/world.js'),C=require('../dist/csv-import.js'),O=require('../dist/database-ops.js');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
assert.equal(E.normalizeClubColor('#aBc'),'#AABBCC');assert.equal(E.normalizeClubColor(' #12aBcF '),'#12ABCF');
for(const x of ['red','#ab','#1234','#GGGGGG',null,42])assert.equal(E.normalizeClubColor(x),null);
assert.equal(E.getContrastColor('#fff'),'#111111');assert.equal(E.getContrastColor('#000'),'#FFFFFF');
const old=W.fresh(),id=old.clubs[0].id,original=JSON.stringify(old);
const automatic=E.getClubSecondaryColor(old.clubs[0]);assert.match(automatic,/^#[0-9A-F]{6}$/);assert.equal(JSON.stringify(old),original);
assert.equal(E.getClubSecondaryColor({color:'#ff0',secondaryColor:'#abc'}),'#AABBCC');
W.validate(old);
const plan=C.plan(old,'clubs',`id;color;secondaryColor\n${id};#fD0;#123`);
const c=plan.candidate.clubs[0];assert.equal(c.color,'#FFDD00');assert.equal(c.secondaryColor,'#112233');
assert.equal(JSON.stringify(old),original);
const table=O.table(plan.candidate,'clubs');assert(table.columns.includes('secondaryColor'));assert.equal(table.rows[0].secondaryColor,'#112233');
const roundTrip=C.plan(old,'clubs',O.exportCsv(plan.candidate,'clubs'));assert.equal(roundTrip.candidate.clubs[0].secondaryColor,'#112233');
const json=JSON.parse(JSON.stringify(plan.candidate));W.validate(json);assert.equal(json.clubs[0].secondaryColor,c.secondaryColor);
const career=W.createCareer(json,12);json.clubs[0].secondaryColor='#FFFFFF';assert.equal(career.clubs[0].secondaryColor,'#112233');
const blank=C.plan(plan.candidate,'clubs',`id;secondaryColor\n${id};`);assert.equal(blank.candidate.clubs[0].secondaryColor,'#112233');
const legacy=C.plan(old,'clubs',`id;name\n${id};Clube teste`);assert.equal(legacy.candidate.clubs[0].secondaryColor,undefined);
for(const val of ['#GGG','#12','blue'])assert.throws(()=>C.plan(old,'clubs',`id;secondaryColor\n${id};${val}`),/Cor inválida/);
for(const val of [undefined,'',null]){const m=structuredClone(old);m.clubs[0].secondaryColor=val;W.validate(m);}
const invalid=structuredClone(old);invalid.clubs[0].secondaryColor='red';assert.throws(()=>W.validate(invalid),/Clubes inválidos/);
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
 const factory=new IDBFactory(),a=await open(factory),before=a.run('master.clubs[0].color');
 a.run('edit("clubs",master.clubs[0].id)');assert.equal(a.$('club-secondaryColor-hex').value,'');
 const input=a.$('club-secondaryColor-hex');input.value='#aBc';input.dispatchEvent(new a.w.Event('input'));
 assert.match(a.$('club-secondaryColor-swatch').textContent,/#AABBCC/);assert.equal(a.run('master.clubs[0].secondaryColor'),undefined);
 a.$('recordCancel').click();assert.equal(a.run('master.clubs[0].secondaryColor'),undefined);
 a.run('edit("clubs",master.clubs[0].id)');a.$('club-secondaryColor-hex').value='#xyz';a.$('club-secondaryColor-hex').dispatchEvent(new a.w.Event('input'));assert(!a.$('editForm').checkValidity());
 a.$('club-secondaryColor-hex').value='#aBc';a.$('club-secondaryColor-hex').dispatchEvent(new a.w.Event('input'));assert(a.$('editForm').checkValidity());
 a.$('editForm').dispatchEvent(new a.w.Event('submit',{cancelable:true}));assert.equal(a.run('master.clubs[0].secondaryColor'),'#AABBCC');assert.equal(a.run('master.clubs[0].color'),before);
 await a.run('AutoSave.settle()');const b=await open(factory);assert.equal(b.run('master.clubs[0].secondaryColor'),'#AABBCC');
 b.run('edit("clubs",master.clubs[0].id)');b.$('club-secondary-auto').click();b.$('editForm').dispatchEvent(new b.w.Event('submit',{cancelable:true}));assert.equal(b.run('master.clubs[0].secondaryColor'),undefined);
 await b.run('AutoSave.settle()');
 console.log('PASS: colour validation, optional fallback, CSV/JSON, snapshot isolation, live preview, invalid HEX, cancel/save/clear and IndexedDB reload.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>windows.forEach(w=>w.close()));
