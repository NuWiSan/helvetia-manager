# Match Engine v1 — mapping before implementation

## Existing implementation inspected
- `app.js` owns `s`, the whole career. Player editor commits to `s.players` through `Engine.updatePlayer`; clubs and staff share numeric club IDs.
- `game.js`: `lineup` selects by broad GR/DEF/MED/AV groups for 4-3-3, 4-4-2 or 3-5-2. `effective` weights 15 existing attributes. `strength` averages eleven slots plus staff quality.
- `advance` previously drew two Poisson scores per fixture, with fixed home advantage and managed-club mentality applied to both score rates. It then credited all starters with 90 minutes.
- Fixtures hold home/away IDs and scores. Two divisions have 22/18 rounds, with a shared 22-round season. `table` derives standings exclusively from finished scores. `nextSeason` archives player totals and league history, swaps promoted/relegated clubs, then rebuilds fixtures.
- Career JSON version 1 stores everything including optional images. No separate database or persistent player copy.

## Minimum compatible extensions selected
- Optional player attributes `gkReflexes`, `gkHandling`, `gkOneOnOne`, with existing attributes used as fallbacks.
- Optional player `fatigue` (0–100), `injuryMatches` and `suspendedMatches`; manual status and contracts still gate selection.
- Existing `stats` gains goal, assist, pass, recovery, shot, foul, card, save and injury counters. Previous appearances/minutes remain valid.
- Fixtures gain optional `report`; ongoing managed match lives in optional `s.liveMatch`. Both reference canonical player IDs. Runtime participant entries contain match counters only, not duplicate identities or attributes.
- Seeded PRNG state persists in the live match. Event generation is independent of rendering/timers. Same initial career, seed and decisions produce identical events.
- Full round commits once, after managed match completes; other fixtures use exactly the same minute engine. Result and stats updates are committed together. Existing results remain untouched.

## Implemented rules and model
- Pure seeded PRNG in each match; only `stepMatch` creates football events. Rendering and timer speed never draw random values.
- 90 discrete minutes, three possession sequences per minute, up to four build-up passes, then attack/shot/outcome. Event records carry minute, type, team/player IDs and relevant targets/assists. No 2D engine or rendering-driven outcomes.
- Position fit: exact/broad natural role 1.0, exact secondary .94, related natural .86, related secondary .8, out of position .55, emergency keeper .2. Eleven selected greedily by role score, stable ID tie-breaks. Keeper abilities use the three new attributes, falling back to agility/touch/anticipation.
- Attribute-based attack, defence and control are adjusted by formation, mentality, staff, active players and fatigue. Home multiplier 1.045. Offensive mentality boosts attack 16% and reduces defence 10%; defensive does the reverse. The general index supplies missing-attribute defaults; explicit attributes take precedence.
- Stamina and offensive intensity govern in-match fatigue. Weekly recovery removes 45 fatigue points. Fouls may produce yellow/direct red; second yellow dismisses. Red means one subsequent club match suspended. Simple injuries exclude the player for 1–3 shared league rounds, without overwriting manual injury status. No moral, training, weather or advanced tactical AI.
- Five replacements, no reentry and no replacing an expelled player. Opponent changes are a fixed simple rule: replace injured players when possible and tired outfielders at 60/70/80. Managed team replacements remain the user's decisions. Changing formation only reassigns remaining players; never restores dismissed players.
- Each minute is credited to those active at its start. A substitution at minute 30 gives the outgoing player 30 minutes, incoming player up to 60. There is no added time or extra time. A player injured during a minute receives that minute.
- Live playback pauses at halftime, managed injuries and managed red cards. Fast completion deliberately runs through these pauses. Live roster edits are blocked until completion to preserve referential consistency; export and resume remain available.
- `finishRound` applies all results, canonical player counters, injuries and suspension bookkeeping once. The fixture report retains the full event sequence and final force snapshot. `nextSeason` archives reports plus expanded individual totals while retaining existing promotion logic.

## Verification
`node tests/match-engine.cjs` covers same-seed determinism, mid-match JSON resume, pauses, tactics, substitutions and limits, invalid imports, cards/injuries, counter/event consistency across 40 seeds, goalkeeper ability, fatigue, a full season and promotions. `node tests/player-engine.cjs` retains the previous editor/contract/career regression checks. UI rendering and action wiring were exercised with DOM stubs; no browser visual QA was performed.
