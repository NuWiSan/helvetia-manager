const PlayerSearch=(()=>{
 const D=typeof Documentary!=='undefined'?Documentary:require('./documentary.js');
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function age(player,year){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(player.birthDate||''))return null;
  const [y,m,d]=player.birthDate.split('-').map(Number);
  return year-y-(m>7||(m===7&&d>1)?1:0);
 }
 function find(data,filters={},resolve=value=>normalize(value)){
  const clubs=new Map(data.clubs.map(c=>[c.id,c])),tokens=normalize(filters.query).split(/\s+/).filter(Boolean);
  let result=data.players.filter(p=>{
   const text=normalize([p.name,p.fullName,clubs.get(p.club)?.name,clubs.get(p.club)?.fullName].join(' '));
   if(!tokens.every(t=>text.includes(t)))return false;
   if(filters.club&&filters.club!=='all'&&(filters.club==='free'?p.club!==null:p.club!==Number(filters.club)))return false;
   if(filters.position&&filters.position!=='all'&&p.position!==filters.position&&!(p.secondaryPositions||[]).includes(filters.position))return false;
   if(filters.nation&&filters.nation!=='all'&&![p.nation,p.secondNation].some(n=>(resolve(n)||normalize(n))===filters.nation))return false;
   if(filters.verification&&filters.verification!=='all'&&D.verification(p)!==filters.verification)return false;
   const years=age(p,data.year);
   if(filters.minAge!==undefined&&filters.minAge!==''&&(years===null||years<Number(filters.minAge)))return false;
   if(filters.maxAge!==undefined&&filters.maxAge!==''&&(years===null||years>Number(filters.maxAge)))return false;
   if(filters.photo==='missing'&&p.photo)return false;
   if(filters.photo==='present'&&!p.photo)return false;
   if(filters.birth==='missing'&&p.birthDate)return false;
   if(filters.birth==='present'&&!p.birthDate)return false;
   if(filters.contract==='missing'&&!D.missingContract(p))return false;
   if(filters.contract==='present'&&(!D.needsContract(p)||D.missingContract(p)))return false;
   if(filters.status&&filters.status!=='all'&&p.status!==filters.status)return false;
   if(filters.international==='senior'&&!D.isInternational(p,'senior'))return false;
   if(filters.international==='youth'&&!D.isInternational(p,'youth'))return false;
   if(filters.international==='both'&&!(D.isInternational(p,'senior')&&D.isInternational(p,'youth')))return false;
   if(filters.theme&&filters.theme!=='all'&&(p.theme||'base')!==filters.theme)return false;
   if(filters.completeness==='complete'&&D.completeness(p,data).percent!==100)return false;
   if(filters.completeness==='incomplete'&&D.completeness(p,data).percent===100)return false;
   return true;
  });
  const compareName=(a,b)=>String(a.name).localeCompare(String(b.name),'pt');
  result.sort((a,b)=>{
   if(filters.sort==='club')return String(clubs.get(a.club)?.name||'').localeCompare(String(clubs.get(b.club)?.name||''),'pt')||compareName(a,b);
   if(filters.sort==='age')return (age(a,data.year)??999)-(age(b,data.year)??999)||compareName(a,b);
   if(filters.sort==='verified')return String(b.lastVerifiedAt||'').localeCompare(String(a.lastVerifiedAt||''))||compareName(a,b);
   return compareName(a,b);
  });return result;
 }
 return {find,age,normalize};
})();
if(typeof module!=='undefined')module.exports=PlayerSearch;
