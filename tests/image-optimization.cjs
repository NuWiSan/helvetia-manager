const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let width=4000,height=3000,mode='webp',revoked=0,fail=false,cleared=0;
const canvas={width:0,height:0,getContext:()=>({clearRect(){cleared++;},drawImage(){}}),toDataURL(type,q){
 const size=mode==='small'?100:mode==='webp'&&type==='image/webp'?200000:canvas.width*canvas.height*4;
 return 'data:image/'+(mode==='fallback'?'png':type.split('/')[1])+';base64,'+'A'.repeat(size);
}};
const ctx=vm.createContext({Image:class{constructor(){this.naturalWidth=width;this.naturalHeight=height;}async decode(){if(fail)throw Error();}},document:{createElement:()=>canvas},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++}});
vm.runInContext(fs.readFileSync(__dirname+'/../dist/club-media.js','utf8'),ctx);
(async()=>{
 const result=await ctx.optimizeImage({size:30000000,type:'image/jpeg'},'portrait');
 assert(result.startsWith('data:image/webp'));assert(result.length<350000*4/3);
 assert.equal(canvas.width,768);assert.equal(canvas.height,576);
 mode='small';width=200;height=100;assert((await ctx.optimizeImage({size:2000000},'logo')).startsWith('data:image/png'));
 assert.equal(canvas.width,200,'Do not upscale small originals');
 mode='fallback';width=4000;height=3000;
 const png=await ctx.optimizeImage({size:12000000,type:'image/png'},'stadium');
 assert(png.startsWith('data:image/png'));assert(png.length<=500000*4/3);assert(canvas.width<1280);
 assert(cleared>0,'Canvas remains transparent; no opaque background is painted');
 fail=true;await assert.rejects(ctx.optimizeImage({size:100},'portrait'),/abrir/);
 assert.equal(revoked,4,'Release original object URLs on success and failure');
 console.log('PASS: originals above 10 MB, aspect ratio, no upscaling, WebP size target, transparent PNG fallback and decode failure cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1;});
