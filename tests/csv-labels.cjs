const assert=require('node:assert/strict'),W=require('../dist/world'),C=require('../dist/csv-import');
const m=W.fresh(),id=m.players[0].id,before=JSON.stringify(m);
const csv=`id;name;fullName;birthDate;birthPlace;nation;secondNation;height;weight;position;number;club;status;contractStart;contractEnd;salary;theme;verificationStatus;source;sourceUrl\n${id};Samuel Essende;Samuel Emmanuel Essende Mbongu;1998-01-23;Montfermeil;RD Congo;França;193;88;AVA;99;0;active;2026-02-16;2029-06-30;;gold;verified;Fonte de teste;https://example.org`;
const plan=C.plan(m,'players',csv),p=plan.candidate.players.find(p=>p.id===id);assert.equal(p.position,'AV');assert.equal(p.status,'Activo');assert.equal(p.verificationStatus,'Confirmado');assert.equal(p.fullName,'Samuel Emmanuel Essende Mbongu');assert.equal(p.salary,m.players[0].salary);assert.equal(JSON.stringify(m),before);
for(const [status,expected] of [['ativo','Activo'],['Reformado','Retirado']])assert.equal(C.plan(m,'players',`id;status\n${id};${status}`).candidate.players[0].status,expected);
assert.throws(()=>C.plan(m,'players',`id;position\n${id};INVALID`),/Linha 2: Posição inválida: INVALID/);
assert.throws(()=>C.plan(m,'players','id;name\n999999;Nome'),/ID 999999 inexistente/);
assert.throws(()=>C.plan(m,'players',`id;position\n${id};AVA\n${m.players[1].id};INVALID`),/Linha 3/);assert.equal(JSON.stringify(m),before);
console.log('PASS: AVA, external status/verification labels, blank preservation, actionable errors and atomic rejection.');
