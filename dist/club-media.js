function clubMark(c){return c.logo?`<img class="club-logo" src="${esc(c.logo)}" alt="Logótipo de ${esc(c.name)}">`:esc(c.name.replace(/FC |AC /g,'').slice(0,2).toUpperCase());}
async function optimizeImage(file,kind='portrait'){
 const presets={portrait:[768,350000],logo:[512,180000],stadium:[1280,500000]};
 const [edge,target]=presets[kind]||presets.portrait;
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;
  try{await img.decode();}catch{throw Error('Não foi possível abrir a imagem. Usa um formato suportado pelo navegador, como PNG, JPEG, WebP ou BMP.');}
  if(!img.naturalWidth||!img.naturalHeight)throw Error('A imagem não tem dimensões válidas.');
  if(img.naturalWidth*img.naturalHeight>80000000)throw Error('A imagem ultrapassa 80 megapíxeis. Reduz a resolução do original e tenta novamente.');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error('O navegador não conseguiu preparar a imagem.');
  let scale=Math.min(1,edge/Math.max(img.naturalWidth,img.naturalHeight));
  for(let attempt=0;attempt<7;attempt++){
   canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   // Small PNGs stay lossless; WebP preserves alpha while compressing large photos.
   const png=canvas.toDataURL('image/png');
   if(png.length<=target*4/3)return png;
   for(const quality of [.88,.80,.72]){
    const data=canvas.toDataURL('image/webp',quality);
    if(data.startsWith('data:image/webp;')&&data.length<=target*4/3)return data;
   }
   // Browsers without WebP encoding use a smaller PNG, never an opaque JPEG.
   scale*=.8;
  }
  throw Error('Não foi possível optimizar esta imagem. Experimenta outro ficheiro.');
 }finally{URL.revokeObjectURL(url);}
}
async function readClubLogo(file){return optimizeImage(file,'logo');}
function setupClubLogo(){
 const target=editTarget;target.logo=target.item.logo||'';target.logoBusy=false;target.logoRequest=0;
 $('fields').insertAdjacentHTML('beforeend',`<div class="club-logo-editor"><label>Logótipo do clube<input id="clubLogoFile" type="file" accept="image/*,.bmp,.dib,.ico,.avif,.svg"></label><div id="clubLogoPreview" class="club-logo-preview"></div><button type="button" id="removeClubLogo">Remover logótipo</button><p class="muted">PNG com transparência recomendado. Também JPEG, BMP, WebP, GIF, SVG e outros formatos que o navegador consiga abrir. Redução automática; imagens animadas ficam estáticas.</p><p id="clubLogoError" role="alert"></p></div>`);
 const preview=()=>{$('clubLogoPreview').innerHTML=target.logo?`<img src="${esc(target.logo)}" alt="Pré-visualização do logótipo">`:'<span>Sem logótipo · serão usadas as iniciais</span>';};preview();
 const submit=$('editForm').querySelector('[type="submit"]');submit.disabled=false;
 $('clubLogoFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;const request=++target.logoRequest;target.logoBusy=true;submit.disabled=true;$('clubLogoError').textContent='A preparar o logótipo…';try{const logo=await readClubLogo(f);if(editTarget!==target||request!==target.logoRequest||!$('modal').open)return;target.logo=logo;preview();$('clubLogoError').textContent='';}catch(err){if(editTarget===target&&request===target.logoRequest)$('clubLogoError').textContent='Não foi possível preparar a imagem. '+err.message;}finally{if(editTarget===target&&request===target.logoRequest){target.logoBusy=false;submit.disabled=false;}}};
 $('removeClubLogo').onclick=()=>{target.logoRequest++;target.logoBusy=false;target.logo='';submit.disabled=false;$('clubLogoFile').value='';$('clubLogoError').textContent='';preview();};
}
