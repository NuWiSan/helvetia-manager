const assert=require('node:assert/strict'),E=require('../dist/game.js'),W=require('../dist/world.js');
const master=W.fresh(),s=W.context(master),p=master.players[0];
const rows=[{nation:'Suíça',level:'Sub-19',caps:3,goals:1},{nation:'Suíça',level:'Sub-21',caps:5,goals:0},{nation:'Suíça',level:'Principal',caps:11,goals:2}];
E.updatePlayer(s,p.id,{internationalRecords:rows});
assert.equal(E.internationalTotals(p).senior.caps,11);
assert.equal(E.internationalTotals(p).youth.caps,8);
assert.equal(E.internationalTotals(p).all.caps,19);
assert.equal(E.internationalTotals(p).all.goals,3);
W.validate(JSON.parse(JSON.stringify(master)));
const career=W.createCareer(master,12);
p.internationalRecords[0].caps=4;
assert.equal(E.internationalTotals(career.players[0]).all.caps,19);
const saved=JSON.stringify(p);
for(const bad of [[...rows,rows[0]],[{...rows[0],caps:-1}],[{...rows[0],goals:1.5}],[{...rows[0],level:'wrong'}]]){
 assert.throws(()=>E.updatePlayer(s,p.id,{internationalRecords:bad}));
 assert.equal(JSON.stringify(p),saved,'Invalid updates must be atomic');
}
const old={representedNation:'Portugal',internationalLevel:'Sub-21',caps:5,internationalGoals:1};
assert.equal(E.internationalRows(old)[0].caps,5);
assert.equal(E.internationalTotals(old).senior.rows,0,'Youth caps are not senior caps');
assert.equal(E.internationalRows({}).length,0);
assert.equal(E.internationalRows({...old,internationalRecords:[]}).length,0,'Removing all rows must not resurrect legacy totals');
assert(E.internationalTotals({internationalRecords:[{nation:'',level:'Sub-19',caps:null,goals:null}]}).all.capsUnknown);
console.log('PASS: separate youth/senior totals, legacy single record, unknown values, no double counting, validation, export and career isolation.');
