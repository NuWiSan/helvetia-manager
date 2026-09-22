const assert=require('node:assert/strict'),D=require('../dist/documentary.js'),E=require('../dist/game.js'),W=require('../dist/world.js'),Search=require('../dist/player-search.js');
const base=W.fresh(),s=W.context(base),p=base.players[0];
p.source='Fonte anterior';p.sourceUrl='referência antiga sem URL';p.verificationStatus='Parcial';p.lastVerifiedAt='2026-09-13';
const before=JSON.stringify(base);W.validate(base);assert.equal(JSON.stringify(base),before,'Reading old databases must not rewrite them');
assert.equal(D.sources(p)[0].title,'Fonte anterior');assert(D.sources(p)[0].legacy);
const source={title:'SFL',url:'https://example.org/player',consultedAt:'2026-09-13',notes:'Nascimento confirmado no perfil.',field:'birthDate',status:'Confirmado'};
E.updatePlayer(s,p.id,{documentaryVersion:1,documentSources:[source]});assert.equal(D.sources(p).length,2);assert.equal(p.source,'Fonte anterior');assert.equal(p.verificationStatus,'Parcial');
const career=W.createCareer(base,12);p.documentSources[0].title='Alterada';assert.equal(career.players[0].documentSources[0].title,'SFL');
const reload=JSON.parse(JSON.stringify(base));W.validate(reload);assert.deepEqual(reload.players[0].documentSources,p.documentSources);
for(const bad of [{...source,url:'javascript:alert(1)'},{...source,url:'data:text/html,a'},{...source,consultedAt:'2026-02-30'},{...source,status:'Certo'},{...source,field:'__proto__'},{...source,title:''}]){
 const unchanged=JSON.stringify(p);assert.throws(()=>E.updatePlayer(s,p.id,{documentSources:[bad]}));assert.equal(JSON.stringify(p),unchanged);
}
assert.throws(()=>D.validatePlayer({documentaryVersion:2}));assert.equal(D.safeUrl('javascript:alert(1)'),'');
const doc={id:999,name:'João Exemplo',fullName:'João Exemplo',birthDate:'2000-01-02',nation:'Suíça',height:181,weight:75,position:'MC',photo:'photo',club:null,status:'Sem clube',source:'Arquivo',documentaryStats:[{season:'2025/26',club:0,appearances:10}]};
assert.equal(D.completeness(doc,base).percent,100);const score=D.completeness(doc,base).percent;assert.equal(D.completeness({...doc,quality:1,potential:1,attributes:{},stats:{minutes:900}},base).percent,score);
assert.equal(D.completeness({...doc,club:0,status:'Activo'},base).checks.find(x=>x.key==='contract').ok,false);
const intl={...doc,internationalRecords:[{nation:'Suíça',level:'Principal',caps:11,goals:0},{nation:'Suíça',level:'Sub-21',caps:5,goals:1}]};
assert(D.completeness(intl,base).percent<100);intl.documentSources=[{...source,field:'international'}];assert.equal(D.completeness(intl,base).percent,100);
const sample={...base,players:[{...intl,theme:'gold'},{...doc,id:1000,name:'Outro',photo:'',birthDate:''}]};
assert.equal(Search.find(sample,{query:'Joao',club:'free',international:'both',theme:'gold',completeness:'complete'}).length,1);
assert.equal(Search.find(sample,{photo:'missing',birth:'missing',completeness:'incomplete'}).length,1);
assert.equal(Search.find(sample,{contract:'missing'}).length,0,'Free players do not require an active contract');
assert.equal(Search.find(sample,{minAge:20}).length,1,'Unknown birth dates are excluded from age ranges');
for(const type of ['players','clubs','staff','competitions'])assert(D.globalSearch(base,'',type).every(r=>r.type===type));
assert(D.globalSearch(sample,'joao').some(r=>r.id===999));
const broken={...base,players:[{...doc,club:0,status:'Activo'},{...doc,id:1001,club:1,status:'Activo'},{...doc,id:1002,name:'Retirado',birthDate:'',club:0,status:'Retirado',nation:'',contractStart:'2026-12-01',contractEnd:'2026-01-01',internationalRecords:[{level:'Principal',caps:-1}],transferHistory:[{fromClub:50000,toClub:50000}]}],competitions:[{id:5,name:'Taça',participants:[9999,9999]}]};
const immutable=JSON.stringify(broken),health=D.health(broken);assert.equal(health.duplicateIds.size,2);assert(health.warnings.some(x=>x.type==='competitions'));assert(health.warnings.length>=7);assert.equal(JSON.stringify(broken),immutable,'Diagnostics never fix records');
console.log('PASS: documentary compatibility, source validation and atomicity, independent snapshots, explicit completeness, combined filters, global search and non-destructive diagnostics.');

const timelineInput={...doc,contractStart:'2025-01-01',contractEnd:'2028-06-30',transferHistory:[{date:'2026-01-01',fromClub:0,toClub:1,type:'Transferência'},{date:'2024-01-01',fromClub:null,toClub:0,type:'Contratação'}],internationalRecords:[{nation:'Suíça',level:'Sub-19',caps:3,goals:0}]};
const timelineBefore=JSON.stringify(timelineInput),timeline=D.timeline(timelineInput,base);assert.deepEqual(timeline.dated.map(x=>x.date),['2024-01-01','2025-01-01','2026-01-01']);assert(timeline.undated.some(x=>x.kind==='international'&&x.date===null));assert.equal(JSON.stringify(timelineInput),timelineBefore);

const warningPlayer={...doc,verificationStatus:'Confirmado',source:undefined,sourceUrl:undefined,club:0,contractStart:'1990-01-01',loan:{parentClub:1,startDate:'2026-12-01',endDate:'2026-01-01'},internationalRecords:[{nation:'Suíça',level:'Principal',caps:0,goals:1},{nation:'Suíça',level:'Principal',caps:0,goals:0}],transferHistory:[{date:'2026-01-01',fromClub:0,toClub:1},{date:'2025-01-01',fromClub:2,toClub:0}]};
const warningTexts=D.diagnostics({...base,players:[warningPlayer]}).warnings.map(x=>x.message).join(' ');for(const expected of ['repetidos','sem internacionalizações','antes do nascimento','fim anterior','sem fonte','fora de sequência','em falta'])assert(warningTexts.includes(expected),expected);
