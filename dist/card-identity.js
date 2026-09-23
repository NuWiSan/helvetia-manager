/* Shared, presentation-only collectible artwork. No writes to club/player records. */
function cardIdentityStyle(club){
 const primary=Engine.normalizeClubColor(club?.color)||'#46515D',secondary=Engine.getClubSecondaryColor(club||{color:primary});
 return `--club-accent:${primary};--club-secondary:${secondary};--card-primary:${primary};--card-secondary:${secondary};--card-ink:${Engine.getContrastColor(primary)}`;
}
function cardIdentityArtwork(club,{stadium=false,lazy=false}={}){
 const photo=stadium&&club?.stadiumPhoto;
 const waves=`<svg class="premium-waves" viewBox="0 0 600 430" preserveAspectRatio="none" aria-hidden="true"><path class="wave-glow" d="M-80 165 C100 -25 260 340 410 155 S640 40 700 155"/><path class="wave-colour" d="M-80 145 C100 -45 260 320 410 135 S640 20 700 135 L700 210 C620 95 555 110 420 208 S100 35 -80 220 Z"/><path class="wave-soft" d="M-80 170 C100 -20 260 345 410 160 S640 45 700 160 L700 218 C620 115 555 135 420 230 S100 60 -80 240 Z"/><path class="wave-line" d="M-80 145 C100 -45 260 320 410 135 S640 20 700 135"/><path class="wave-secondary" d="M-50 340 C130 205 260 415 440 320 S625 190 690 230"/></svg>`;
 return `<div class="premium-surface ${photo?'premium-photo':'premium-empty'}" aria-hidden="true"><div class="premium-art">${photo?`<img class="club-stadium-cover" style="${clubStadiumFramingStyle(club)}" src="${esc(photo)}" alt="" ${lazy?'loading="lazy"':''}>`:waves}</div>${!photo&&club?.logo?`<img class="premium-watermark" src="${esc(club.logo)}" alt="" loading="lazy">`:''}<div class="premium-grain"></div><div class="premium-shade"></div><div class="premium-edge"></div></div>`;
}
function clubFoundationMarkup(c){
 const year=String(c.founded||'').match(/^\d{4}/)?.[0];
 return year?`<span title="Fundação: ${esc(c.founded)}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/></svg>${year}</span>`:'';
}
function clubNameMarkup(c){
 const name=String(c.name||'').trim(),split=name.search(/\s/);
 return `<span class="club-name-accent">${esc(split<0?name:name.slice(0,split))}</span>${split<0?'':' '+esc(name.slice(split).trim())}`;
}
function clubActionIcon(action){
 return `<svg class="club-action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${action==='view'?'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>':'<path d="m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0 0-3l-1-1a2 2 0 0 0-3 0L4 16l-1 5Z"/>'}</svg>`;
}
function clubLowerWave(){
 return '<svg class="club-lower-wave" viewBox="0 0 800 240" preserveAspectRatio="none" aria-hidden="true"><path class="club-wave-bed" d="M0 34 C155 5 265 170 450 145 S665 65 800 78 V240 H0Z"/><path class="club-wave-tint" d="M0 34 C155 5 265 170 450 145 S665 65 800 78 L800 103 C650 93 585 193 430 170 S135 36 0 68Z"/><path class="club-wave-contour" d="M0 34 C155 5 265 170 450 145 S665 65 800 78"/><path class="club-wave-echo" d="M0 73 C170 46 275 200 455 174 S670 102 800 117"/></svg>';
}
