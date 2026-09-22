const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const W=require('../dist/world.js'),E=require('../dist/game.js'),C=require('../dist/csv-import.js');
const master=W.fresh(),id=master.clubs[0].id;
for(const value of ['1899','1900-02-28']){
 const plan=C.plan(master,'clubs',`id;founded\n${id};${value}`);
 assert.equal(plan.candidate.clubs[0].founded,value);W.validate(plan.candidate);
 const career=W.createCareer(plan.candidate,12);assert.equal(career.clubs[0].founded,value);
}
for(const value of ['0000','189','1900-02-30','1899-13-01'])assert.throws(()=>C.plan(master,'clubs',`id;founded\n${id};${value}`),/Data inválida/);
assert.equal(master.clubs[0].founded,undefined);
const dom=new JSDOM('<dialog id="csvImportDialog"></dialog>');
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
const ctx=vm.createContext({$:id=>dom.window.document.getElementById(id),CsvImport:C,esc:String,console});
vm.runInContext(fs.readFileSync(require.resolve('../dist/database-ops-ui.js'),'utf8'),ctx);
for(const type of Object.keys(C.types)){
 vm.runInContext(`openCsvImport('${type}')`,ctx);
 assert.equal(ctx.$('csvImportType').value,type);assert.equal(ctx.$('csvImportType').parentElement.hidden,true);
 assert.ok(ctx.$('csvImportDialog').querySelector('h2').textContent.includes(C.types[type]));
}
vm.runInContext('openCsvImport()',ctx);assert.equal(ctx.$('csvImportType').parentElement.hidden,false);
dom.window.close();console.log('PASS: year-only/full foundation dates, invalid dates, career preservation and all CSV category shortcuts.');
