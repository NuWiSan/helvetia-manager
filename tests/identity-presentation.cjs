const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),badge:()=>'<span class="badge"></span>',divisionLabel:()=> 'Liga'});
ctx.Engine=require('../dist/game.js');
vm.runInContext(fs.readFileSync(require.resolve('../dist/card-identity.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'dist/record-editor.js'),'utf8'),ctx);
ctx.c={name:'Clube',city:'Cidade',stadium:'Estádio',color:'#aa0000',secondaryColor:'#ffffff',stadiumPhoto:'',stadiumPhotoZoom:125,stadiumPhotoX:10,stadiumPhotoY:-5};
const before=JSON.stringify(ctx.c);let html=vm.runInContext('clubVisual(c)',ctx);
assert.match(html,/club-visual-empty/);assert.match(html,/--club-secondary:#FFFFFF/);assert.match(html,/class="club-lower-wave"/);assert.equal((html.match(/<svg /g)||[]).length,4);assert(!html.includes('club-stadium-cover'));assert.equal(JSON.stringify(ctx.c),before);
ctx.c.stadiumPhoto='data:image/png;base64,AAAA';html=vm.runInContext('clubVisual(c,true)',ctx);assert(!html.includes('club-visual-empty'));assert.match(html,/--club-stadium-zoom:1.25/);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'helvetia-preview-'));try{const out=path.join(tmp,'preview.html');execFileSync(process.execPath,[path.join(root,'scripts/export-preview.cjs'),out]);const preview=fs.readFileSync(out,'utf8');assert(preview.includes('--radius-card:18px'));assert(!/<link rel="stylesheet" href="(?:style|identity)\.css">/.test(preview));assert(!/<script src=/.test(preview));}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log('PASS: shared card/detail colour and image variants, immutable records, framing and self-contained styled preview.');
