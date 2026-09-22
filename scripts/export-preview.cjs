/* A standalone, offline-testable copy of the exact static source. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist'),out=process.argv[2];
if(!out)throw Error('Indica o caminho do HTML de saída.');
const flags=Object.fromEntries(fs.readdirSync(path.join(root,'flags')).filter(f=>f.endsWith('.svg')).map(f=>[f.slice(0,-4),'data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'flags',f)).toString('base64')]));
const escapeScript=s=>s.replace(/<\/script/gi,'<\\/script');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,file)=>'<style>'+fs.readFileSync(path.join(root,file),'utf8').replace(/@import\s+url\([^;]+;/g,'')+'</style>');
html=html.replace('<script src="documentary.js">',()=>'<script>window.__HM_FLAG_DATA='+JSON.stringify(flags)+'</script><script src="documentary.js">');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>'<script>'+escapeScript(fs.readFileSync(path.join(root,file),'utf8'))+'</script>');
fs.writeFileSync(out,html);console.log(out);
