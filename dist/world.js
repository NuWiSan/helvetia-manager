/* One shared record schema. Master records are never referenced by a career snapshot. */
const World=(()=>{
 const E=typeof Engine!=='undefined'?Engine:require('./game.js');
 const defaults=()=>[
  {id:0,name:'Brack Super League',shortName:'Super League',country:'Suíça',kind:'Liga',format:'Liga',level:1,engineMode:'league',pointsWin:3,pointsDraw:1,pointsLoss:0,notes:'',logo:'',trophy:''},
  {id:1,name:'dieci Challenge League',shortName:'Challenge League',country:'Suíça',kind:'Liga',format:'Liga',level:2,engineMode:'league',pointsWin:3,pointsDraw:1,pointsLoss:0,notes:'',logo:'',trophy:''},
  {id:2,name:'Taça da Suíça',officialName:'Schweizer Cup',shortName:'Swiss Cup',country:'Suíça',kind:'Taça',format:'Eliminatórias',level:1,engineMode:'cup',pointsWin:3,pointsDraw:1,pointsLoss:0,participants:[],officialFirstRoundPairs:structuredClone(E.swissCupFirstRoundPairs),roundNames:[...E.swissCupRoundNames],roundDates:[...E.swissCupRoundDates],referenceSeason:2026,lowerTierHomeThroughSemi:true,avoidTopTierRound2:true,notes:'Formato oficial masculino: 64 clubes e seis eliminatórias. Na 1.ª ronda os clubes da Swiss Football League não se defrontam; na 2.ª ronda não há duelos entre clubes da Super League. A equipa de escalão inferior joga em casa até às meias-finais.',logo:'',trophy:''},
  {id:3,name:'Hoval Promotion League',shortName:'Promotion League',country:'Suíça',kind:'Liga',format:'Liga',level:3,engineMode:'feeder',pointsWin:3,pointsDraw:1,pointsLoss:0,notes:'Terceiro escalão nacional. As equipas U-21 não são elegíveis para subir à Challenge League.',logo:'',trophy:''}
 ];
 function extract(source){return structuredClone({...(source.documentaryClubs?{documentaryClubs:source.documentaryClubs}:{}),clubs:source.clubs,players:source.players,staff:source.staff,competitions:source.competitions||defaults()});}
 function context(master){const managed=master.clubs.find(c=>[0,1].includes(c.div))?.id??master.clubs[0]?.id??null;return {...master,round:0,managed,formation:'4-3-3',tactic:'Equilibrada',fixtures:E.fixtures(master.clubs),history:[]};}
 function validate(master){
  if(!master||master.kind!=='database'||typeof master.name!=='string'||!master.name.trim()||master.name.length>100||typeof master.notes!=='string'||master.notes.length>5000||!Array.isArray(master.competitions)||!Array.isArray(master.clubs)||['fixtures','round','history','managed','liveMatch'].some(k=>k in master))throw Error('Ficheiro de Base de Dados Mestre inválido.');
  E.validate(context(master),{documentaryOnly:true});return master;
 }
 function empty(year=2026){return {version:1,kind:'database',name:'Base de Dados Mestre',notes:'',year,clubs:[],players:[],staff:[],competitions:[]};}
 function fresh(){
  let seed=E.fresh(),competitions=defaults();
  const cup=competitions.find(c=>c.id===2);if(cup)cup.participants=[...new Set(E.swissCupFirstRoundPairs.flat())];
  return {version:1,kind:'database',name:'Base de Dados Mestre',notes:'',year:seed.year,clubs:structuredClone(seed.clubs),players:structuredClone(seed.players),staff:structuredClone(seed.staff),competitions};
 }
 function fromCareer(career){E.validate(career);let data=extract(career);for(const p of data.players){for(const k of ['stats','career','fatigue','injuryMatches','suspendedMatches'])delete p[k];}return validate({version:1,kind:'database',name:'Base a partir da carreira',notes:'',year:career.year,...data});}
 function createCareer(master,managed,name='Nova carreira'){
  validate(master);const chosen=master.clubs.find(c=>c.id===managed);if(!chosen||![0,1].includes(chosen.div))throw Error('Escolhe um clube da Super League ou Challenge League.');if(typeof name!=='string'||!name.trim()||name.length>100)throw Error('Indica um nome para a carreira.');
  const data=extract(master);for(const p of data.players){for(const k of ['stats','fatigue','injuryMatches','suspendedMatches'])delete p[k];}
  const career={version:1,kind:'career',name:name.trim(),sourceMaster:{name:master.name,year:master.year},year:master.year,round:0,managed,formation:'4-3-3',tactic:'Equilibrada',...data,fixtures:E.fixtures(data.clubs),history:[]};E.initializeCups(career);return E.validate(career);
 }
 function swapDivisions(master,a,b){validate(master);const x=master.clubs.find(c=>c.id===a),y=master.clubs.find(c=>c.id===b);if(!x||!y||x.div===y.div||![0,1].includes(x.div)||![0,1].includes(y.div))throw Error('Escolhe um clube de cada uma das duas ligas profissionais.');const candidate=structuredClone(master),cx=candidate.clubs.find(c=>c.id===a),cy=candidate.clubs.find(c=>c.id===b),xd=x.div,yd=y.div;cx.div=yd;cx.tier=yd+1;cy.div=xd;cy.tier=xd+1;validate(candidate);x.div=yd;x.tier=yd+1;y.div=xd;y.tier=xd+1;}
 return {defaults,extract,context,validate,empty,fresh,fromCareer,createCareer,swapDivisions};
})();
if(typeof module!=='undefined')module.exports=World;
