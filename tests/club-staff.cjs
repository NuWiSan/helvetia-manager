const assert=require('node:assert/strict'),E=require('../dist/game.js'),W=require('../dist/world.js');
const m=W.fresh(),s=W.context(m),c=m.clubs[0],p=m.staff.find(x=>x.club===c.id);
c.founded='1900-02-28';c.sponsors=[{name:'Parceiro teste',image:''}];c.kits=[{name:'Principal',image:'data:image/png;base64,AAAA'}];p.role='Treinador principal';p.qualification='UEFA Pro';E.validate(s);
const career=W.createCareer(m,12);c.sponsors[0].name='Alterado';assert.equal(career.clubs[0].sponsors[0].name,'Parceiro teste');
const other=m.staff.find(x=>x.club===c.id&&x.id!==p.id);other.role='Treinador principal';assert.throws(()=>E.validate(s),/treinador principal/);other.role='Analista de desempenho';other.simulationRole='Sem efeito na simulação';E.validate(s);
const q=E.strength(s,c.id);other.quality=99;assert.equal(E.strength(s,c.id),q);
c.founded='1900-02-30';assert.throws(()=>E.validate(s),/Data inválida/);c.founded='1900-02-28';E.validate(JSON.parse(JSON.stringify(s)));
console.log('PASS: club dates/media, arbitrary staff roles, unique coach, excluded simulation contribution and independent career snapshots.');
