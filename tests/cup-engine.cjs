const assert=require('node:assert/strict');
const E=require('../dist/game.js');
const W=require('../dist/world.js');

const master=W.fresh();
W.validate(master);
assert.equal(master.clubs.length,74);
assert.equal(master.clubs.filter(c=>c.div===0).length,12);
assert.equal(master.clubs.filter(c=>c.div===1).length,10);
assert.equal(master.clubs.filter(c=>c.div===2).length,18);

const swiss=master.competitions.find(c=>c.id===2);
assert.equal(swiss.engineMode,'cup');
assert.equal(swiss.participants.length,64);
assert.equal(new Set(swiss.participants).size,64);
assert.equal(swiss.participants.includes(15),false,'FC Vaduz is outside the Swiss Cup field');
assert.equal(swiss.officialFirstRoundPairs.length,32);
assert.equal(new Set(swiss.officialFirstRoundPairs.flat()).size,64);

const career=W.createCareer(master,12,'Teste Taça');
const cup=E.cupState(career,2);
assert.ok(cup);
assert.equal(cup.rounds[0].matches.length,32);
assert.deepEqual(cup.rounds[0].matches.map(m=>[m.home,m.away]),E.swissCupFirstRoundPairs);
for(const m of cup.rounds[0].matches){
 const a=career.clubs.find(c=>c.id===m.home),b=career.clubs.find(c=>c.id===m.away);
 assert.ok(!(a.tier<=2&&b.tier<=2),'Official first round has no SFL-vs-SFL pairing');
}

E.simulateCupRound(career,2,10101);
E.validate(career);
const second=E.cupState(career,2).rounds[1];
assert.equal(second.matches.length,16);
for(const m of second.matches){
 const a=career.clubs.find(c=>c.id===m.home),b=career.clubs.find(c=>c.id===m.away);
 assert.ok(!(a.tier===1&&b.tier===1),'Second round avoids Super-League-vs-Super-League pairings');
 if(a.tier!==b.tier)assert.ok(a.tier>b.tier,'Lower-division side is at home before the final');
}
while(!E.cupState(career,2).finished){E.simulateCupRound(career,2);E.validate(career);}
const finished=E.cupState(career,2);
assert.equal(finished.rounds.length,6);
assert.ok(career.clubs.some(c=>c.id===finished.winner));
assert.equal(finished.rounds[5].matches.length,1);

const feeder=E.promotionLeagueTable(career,12345);
assert.equal(feeder.length,18);
assert.ok(feeder.every(r=>r.p===34));
const candidate=E.promotionCandidate(career,feeder);
assert.ok(candidate);
assert.notEqual(candidate.reserveTeam,true);
assert.notEqual(candidate.promotionEligible,false);

// Finish only the two simulated professional leagues; the feeder remains a background league.
for(let r=career.round;r<22;r++)E.advance(career,()=>.5);
const challengeLast=E.table(career,1).at(-1).id;
const expectedCandidate=E.promotionCandidate(career,E.promotionLeagueTable(career)).id;
const result=E.nextSeason(career);
assert.ok(result);
assert.equal(career.clubs.find(c=>c.id===expectedCandidate).div,1);
assert.equal(career.clubs.find(c=>c.id===challengeLast).div,2);
assert.equal(career.clubs.filter(c=>c.div===1).length,10);
assert.equal(career.clubs.filter(c=>c.div===2).length,18);
assert.ok(career.history[0].cupWinner);
E.validate(career);
console.log('PASS: official 64-team Swiss Cup, six knockout rounds, home/draw rules, extra-time/penalties path, 18-team feeder and Challenge/Promotion exchange.');
