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
