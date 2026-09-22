/* Browser persistence of the canonical records; no player model lives here. */
const SaveStore=(()=>{
 const name='helvetia-manager',limit=5,interval=5*60*1000;
 function conflict(){const e=Error('Os dados foram guardados noutra janela. Exporta esta sessão antes de a substituir.');e.code='conflict';return e;}
 function plan(previous,data,key,expected,force=false,now=Date.now()){
  if((previous?.revision||0)!==expected)throw conflict();
  const checkpoint=!!previous&&(force||!previous.checkpointAt||now-previous.checkpointAt>=interval);
  return {
   head:{key,data,revision:expected+1,savedAt:now,checkpointAt:checkpoint?now:previous?.checkpointAt||0},
   backup:checkpoint?{id:key+'-'+previous.revision,key,data:previous.data,savedAt:previous.savedAt,revision:previous.revision}:null
  };
 }
 async function open(factory=globalThis.indexedDB){
  if(!factory)throw Error('A gravação automática não está disponível neste navegador. Exporta os dados para ficheiro.');
  const db=await new Promise((resolve,reject)=>{
   const request=factory.open(name,1);
   request.onupgradeneeded=()=>{const d=request.result;d.createObjectStore('heads',{keyPath:'key'});d.createObjectStore('backups',{keyPath:'id'});};
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
   request.onblocked=()=>reject(Error('Fecha as outras janelas do Helvetia Manager e tenta novamente.'));
  });
  db.onversionchange=()=>db.close();
  return {
   read(){return new Promise((resolve,reject)=>{
    const tx=db.transaction(['heads','backups'],'readonly');
    const heads=tx.objectStore('heads').getAll(),backups=tx.objectStore('backups').getAll();
    tx.oncomplete=()=>resolve({heads:heads.result,backups:backups.result.sort((a,b)=>b.savedAt-a.savedAt)});
    tx.onabort=()=>reject(tx.error||Error('Não foi possível ler os dados guardados.'));
    tx.onerror=()=>{};
   });},
   commit(key,data,expected,{force=false,protectedBackup=false,now=Date.now()}={}){
    return new Promise((resolve,reject)=>{
     const tx=db.transaction(['heads','backups'],'readwrite'),heads=tx.objectStore('heads'),backups=tx.objectStore('backups');
     let result,error;
     tx.oncomplete=()=>resolve(result);
     tx.onabort=()=>reject(error||tx.error||Error('Não foi possível guardar os dados.'));
     tx.onerror=()=>{};
     const request=heads.get(key);
     request.onsuccess=()=>{
      try{
       const next=plan(request.result,data,key,expected,force||protectedBackup,now);result=next.head;
       heads.put(next.head);
       if(next.backup){
        if(protectedBackup)next.backup.protected=true;
        backups.put(next.backup);
        const all=backups.getAll();
        all.onsuccess=()=>all.result.filter(b=>b.key===key&&!b.protected).sort((a,b)=>b.revision-a.revision).slice(limit).forEach(b=>backups.delete(b.id));
       }
      }catch(e){error=e;tx.abort();}
     };
    });
   }
  };
 }
 return {open,plan,limit};
})();
if(typeof module!=='undefined')module.exports=SaveStore;
