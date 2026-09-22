const assert=require('node:assert/strict');
const E=require('../dist/game.js');
const s=E.fresh();E.validate(s);
const p=s.players.find(p=>p.club===12&&p.position==='AV');
const id=p.id,original=structuredClone(p),before=E.strength(s,12);
const baseline=Object.fromEntries(Object.keys(E.attributes).map(k=>[k,Math.round(p.quality/5)]));
E.updatePlayer(s,id,{attributes:baseline});assert.equal(E.strength(s,12),before,'Default attributes preserve existing balance');
const baseOverall=E.gameOverall(p);
E.updatePlayer(s,id,{position:'PL',attributes:Object.fromEntries(Object.keys(E.attributes).map(k=>[k,20]))});assert.equal(p.quality,E.gameOverall(p));assert.equal(E.effective(p),E.gameOverall(p));assert.equal(p.quality,99);assert.ok(E.strength(s,12)>before);
const lower={...p,attributes:{...p.attributes,finishing:5,composure:5,dribbling:5,pace:5,acceleration:5,touch:5,anticipation:5,heading:5}};assert.ok(E.gameOverall(lower)<E.gameOverall(p),'Game AVG is derived from skills relevant to the primary position');
const familiar={...p,position:'PL',positionFamiliarity:{PL:100,ED:90,DC:10}};assert.equal(E.fit(familiar,'PL'),1);assert.equal(E.fit(familiar,'ED'),.9);assert.equal(E.fit(familiar,'DC'),.35);assert.ok(E.roleQuality(familiar,'ED')>E.roleQuality(familiar,'DC'),'Position familiarity changes Match Engine role effectiveness');
for(const k of Object.keys(E.attributes).slice(0,15)){const modified={...original,position:'PL',attributes:{...baseline,[k]:20}};assert.ok(E.gameOverall(modified)>baseOverall,k+' affects game AVG');}
const transfersBefore=p.transferHistory?.length||0;E.updatePlayer(s,id,{club:13});assert.ok(!E.lineup(s,12).some(x=>x.id===id));assert.equal(s.players.find(x=>x.id===id),p,'Preserve object identity');assert.ok(E.lineup(s,13).some(x=>x.id===id));assert.equal(p.transferHistory.length,transfersBefore+1);assert.deepEqual(p.transferHistory.at(-1),{date:E.date(s),fromClub:12,toClub:13,type:'Transferência definitiva'});
E.updatePlayer(s,id,{club:null});assert.equal(p.club,null);assert.equal(p.status,'Sem clube');assert.equal(E.eligible(s,p),false);assert.ok(!E.lineup(s,13).some(x=>x.id===id));assert.deepEqual(p.transferHistory.at(-1),{date:E.date(s),fromClub:13,toClub:null,type:'Saída como jogador livre'});
E.updatePlayer(s,id,{club:13});assert.equal(p.status,'Activo');assert.ok(E.lineup(s,13).some(x=>x.id===id));assert.deepEqual(p.transferHistory.at(-1),{date:E.date(s),fromClub:null,toClub:13,type:'Contratação livre'});
const contractsBefore=p.contractHistory?.length||0;E.updatePlayer(s,id,{contractEnd:'2026-06-30'},{archiveContract:true});assert.equal(E.eligible(s,p),false);assert.ok(!E.lineup(s,13).some(x=>x.id===id));assert.equal(p.contractHistory.length,contractsBefore+1);
E.updatePlayer(s,id,{contractEnd:'2028-06-30',contractStart:'2026-08-01'});assert.equal(E.eligible(s,p),false);
E.updatePlayer(s,id,{contractStart:'2026-07-01',status:'Lesionado'});assert.equal(E.eligible(s,p),false);
E.updatePlayer(s,id,{status:'Activo',salary:12345,verificationStatus:'Confirmado',lastVerifiedAt:'2026-09-12'});assert.equal(E.eligible(s,p),true);assert.equal(E.payroll(s,13),s.players.filter(x=>x.club===13).reduce((n,p)=>n+p.salary,0));assert.equal(p.verificationStatus,'Confirmado');
// v11: transferências e empréstimos documentados.
E.updatePlayer(s,id,{club:14,status:'Emprestado'},{type:'Empréstimo',date:'2026-09-01',parentClub:13,loanStart:'2026-09-01',loanEnd:'2027-06-30',loanFee:250000,purchaseType:'Opção de compra',purchaseFee:1500000,notes:'Empréstimo de teste'});assert.equal(p.club,14);assert.equal(p.status,'Emprestado');assert.equal(p.loan.parentClub,13);assert.equal(p.loan.endDate,'2027-06-30');assert.equal(p.loan.purchaseType,'Opção de compra');assert.equal(p.loan.purchaseFee,1500000);assert.equal(p.transferHistory.at(-1).type,'Empréstimo');assert.equal(p.transferHistory.at(-1).loan.fee,250000);assert.ok(E.lineup(s,14).some(x=>x.id===id));assert.ok(!E.lineup(s,13).some(x=>x.id===id));
E.updatePlayer(s,id,{club:14,status:'Emprestado'},{type:'Empréstimo',parentClub:13,loanStart:'2026-09-01',loanEnd:'2027-05-31',purchaseType:'Obrigação de compra',purchaseFee:1800000});assert.equal(p.loan.endDate,'2027-05-31');assert.equal(p.loan.purchaseType,'Obrigação de compra');
E.updatePlayer(s,id,{club:13,status:'Activo'});assert.equal(p.club,13);assert.equal(p.status,'Activo');assert.equal(p.loan,undefined);assert.equal(p.transferHistory.at(-1).type,'Fim de empréstimo');assert.ok(E.lineup(s,13).some(x=>x.id===id));
let snapshot=JSON.stringify(s);assert.throws(()=>E.updatePlayer(s,id,{club:900}));assert.equal(JSON.stringify(s),snapshot,'Invalid edits are atomic');assert.throws(()=>E.updatePlayer(s,id,{attributes:{pace:25}}));assert.throws(()=>E.updatePlayer(s,id,{contractStart:'2030-01-01'}));assert.throws(()=>E.updatePlayer(s,id,{birthDate:'2000-02-31'}));assert.throws(()=>E.updatePlayer(s,id,{photo:'javascript:alert(1)'}));assert.throws(()=>E.updatePlayer(s,id,{verificationStatus:'Talvez'}));
const playersBeforeCreate=s.players.length;const added=E.updatePlayer(s,null,{...original,name:'Novo jogador',secondaryPositions:['MC']});assert.notEqual(added.id,id);assert.equal(s.players.length,playersBeforeCreate+1);
const free=E.updatePlayer(s,null,{...original,name:'Jogador livre',club:null,status:'Sem clube'});assert.equal(free.club,null);assert.equal(E.eligible(s,free),false);
E.advance(s,()=>.5);assert.equal(s.round,1);assert.equal(p.stats.appearances,1);assert.equal(p.stats.minutes,90);E.validate(s);
const restored=E.validate(JSON.parse(JSON.stringify(s)));assert.equal(restored.players.find(x=>x.id===id).salary,12345);assert.equal(restored.players.find(x=>x.id===id).transferHistory.length,p.transferHistory.length);
while(E.advance(s,()=>.5)){}E.validate(s);const up=E.table(s,1)[0].id,down=E.table(s,0).at(-1).id,challengeLast=E.table(s,1).at(-1).id,feederCandidate=E.promotionCandidate(s,E.promotionLeagueTable(s)).id;const result=E.nextSeason(s);assert.ok(result);assert.equal(s.clubs.find(x=>x.id===up).div,0);assert.equal(s.clubs.find(x=>x.id===down).div,1);assert.equal(s.clubs.find(x=>x.id===feederCandidate).div,1);assert.equal(s.clubs.find(x=>x.id===challengeLast).div,2);assert.equal(s.clubs.filter(x=>x.div===1).length,10);assert.equal(s.clubs.filter(x=>x.div===2).length,18);assert.equal(s.year,2027);assert.equal(p.career.length,1);assert.equal(p.stats.appearances,0);assert.equal(s.history.length,1);E.validate(s);
for(let i=0;i<22;i++)E.advance(s,()=>.5);E.nextSeason(s);E.validate(s);

// v10: idade é documental apenas quando existe data de nascimento.
let noDob=structuredClone(s.players[0]);delete noDob.birthDate;delete noDob.age;let noDobState=structuredClone(s);noDobState.players[0]=noDob;E.validate(noDobState);assert.equal(E.age(noDobState,noDob),undefined);
let withDob=structuredClone(noDob);withDob.birthDate='2000-01-15';let dobState=structuredClone(s);dobState.players[0]=withDob;E.validate(dobState);assert.ok(Number.isInteger(E.age(dobState,withDob)));

console.log('PASS: game-only AVG, attributes, transfers/free agents, contract history, verification, salary, atomic validation, create, round-trip, match stats, two seasons and promotions.');
