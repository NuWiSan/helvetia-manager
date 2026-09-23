# Helvetia Manager v12.29 beta

Cartões e ficha do clube com onda suave, nome em duas cores e botões com ícones. Ver [CHANGELOG-v12.29.md](CHANGELOG-v12.29.md) e [dados e backups](docs/dados-e-backups.md). Todas as versões são beta até indicação em contrário.

# Helvetia Manager v12.11

Cromo mais compacto, bandeiras maiores, AVG alinhado e importação CSV de estatísticas reais. Ver [CHANGELOG-v12.11.md](CHANGELOG-v12.11.md).

# Helvetia Manager v12.10

Percurso documental unificado, contratos editáveis, fontes simplificadas, estatísticas reais e navegação na ficha. Ver [CHANGELOG-v12.10.md](CHANGELOG-v12.10.md) e [modelo documental](docs/documentary-v12.10.md).

# Helvetia Manager v12.9

Fotografia maior no cromo, enquadramento ajustável e importação CSV de jogadores com revisão. Ver [CHANGELOG-v12.9.md](CHANGELOG-v12.9.md).

# Helvetia Manager v12.8

Histórico documental, edição em massa com revisão, exportação CSV e organização da ficha do clube. Ver [CHANGELOG-v12.8.md](CHANGELOG-v12.8.md) e [operações documentais](docs/database-operations.md).

# Helvetia Manager v12.7

Fase B: tabela/cromos, cabeçalho, timeline, diagnósticos e separação visual de ligas. Ver [CHANGELOG-v12.7.md](CHANGELOG-v12.7.md).

# Helvetia Manager v12.6

Fase A: saúde documental, pesquisa global, filtros, fontes por informação e completude. Ver [CHANGELOG-v12.6.md](CHANGELOG-v12.6.md) e [compatibilidade documental](docs/documentary-v1.md).

Para gerar uma pré-visualização num HTML único: `node scripts/export-preview.cjs /caminho/helvetia-preview.html`.

# Helvetia Manager — v12.3

A v12.3 apresenta os registos internacionais numa tabela compacta e utiliza as fotografias dos estádios nos cartões e fichas dos clubes. Ver [alterações da v12.3](CHANGELOG-v12.3.md).

A v12.2 acrescenta internacionalizações por país e escalão, com totais separados da principal e dos jovens. Ver [alterações da v12.2](CHANGELOG-v12.2.md).

A v12.1 optimiza automaticamente as imagens carregadas, mantendo transparência e proporções. Ver [limites e funcionamento](CHANGELOG-v12.1.md).

A versão actual parte do ZIP v11 fornecido pelo utilizador. A Base de Dados é autónoma: não é necessário criar uma carreira para editar, pesquisar ou recuperar os dados.

A v12 acrescenta gravação automática neste navegador, recuperação separada da Mestre e da carreira e pesquisa global de jogadores. Consulta [as instruções da v12](docs/v12-autosave-and-search.md) e o [registo de alterações](CHANGELOG-v12.md).

Para experimentar, abre `dist/index.html` num navegador moderno ou usa o site publicado. Para editar, trabalha nos ficheiros de `dist/`. A aplicação não precisa de instalação de pacotes nem de compilação. Os pacotes de desenvolvimento servem apenas para `npm ci` e `npm test`.

As secções seguintes documentam a evolução do projecto; quando uma descrição antiga diferir do comportamento actual, prevalecem as notas da v12.


The start screen offers an independent master database editor and career mode. New careers snapshot the master through the shared `World` record model. See [master/career architecture and file workflows](docs/master-and-career.md). Applied master/career changes are saved automatically in this browser; JSON export remains available for external backups. Run `node tests/world.cjs` for snapshot isolation checks.

Existing static Site. `dist/` is the authored and deployed application; no build step.

## Shared career data

`app.js` owns `s`, the sole career state. `s.players[].club` and staff club reference `s.clubs[].id`; `s.managed` identifies the managed club. Fixtures reference those same club IDs. Promotion changes division on clubs and regenerates next season's fixtures, preserving player IDs and club membership. Export/import serializes the whole career. There is no server database or separate player localStorage. V12 persists the canonical master/career in IndexedDB.

`player-editor.js` opens an isolated draft for editing, not separate persistence. Save calls `Engine.updatePlayer`, validating a candidate career before mutating the existing player object. Cancel discards it. The card derives entirely from the draft. Images are validated raster data URLs included with the player in career export; no prototype demo records are imported.

## Match Engine v1

See [the architecture mapping and rules](docs/match-engine-v1.md). The existing Engine now simulates each fixture minute by minute from canonical player attributes. Its structured events feed scores, individual/team statistics and career history. The match dialog controls pause, substitutions, formation and mentality without producing results itself.

Carreira export includes ongoing matches, seed state and all reports; old version-1 careers remain accepted. Original played scores are preserved. Live player/club/staff editing is disabled until the active match is completed. Match management remains available while paused.

## Checks

- `node tests/match-engine.cjs`
- `node tests/player-engine.cjs`

Deterministic and resumable simulation, card/injury/substitution rules, statistic consistency, complete seasons, promotion and editor compatibility are covered. UI action wiring was checked using DOM stubs; no browser visual QA performed.

## Club logos and collectible presentation

Club logos are optional `clubs[].logo` PNG data URLs, included in career export/import. The editor decodes browser-supported image formats and normalizes them to a maximum 512 px PNG via transparent canvas. Draft upload/removal is only committed on save. All badges and player cards resolve the current club logo by club ID. The simulation is unchanged.

Silver and gold use plain coloured borders over the club colour. Market value remains in the player form and summary, outside the card. Nationality remains a backwards-compatible string, resolved from multilingual names, codes or flag emoji. The editor suggests Portuguese country names and the player card renders the bundled SVG flags with a Unicode fallback. Unrecognised values show a neutral dash instead of a guessed flag.

## v7 · documentary data vs game simulation values

The player editor now separates factual/documentary fields from simulation-only values. `AVG`, potential and skills live in the **Jogo** tab and are explicitly labelled as game-balancing values, not objective evaluations of real players. `Engine.gameOverall(player)` derives the displayed 1–99 AVG automatically from position-relevant skills; the persisted legacy `quality` field is synchronized on player save for backwards compatibility. Match actions continue to use the detailed canonical attributes directly.

Changing `players[].club` through the editor is a real transfer between canonical squads. From v7, each club change is also appended to `players[].transferHistory`; `club: null` is supported for free agents/retired players and a dedicated “Sem clube” list is available in Plantel e staff. Contract edits archive the prior values in `players[].contractHistory`. Optional `verificationStatus` and `lastVerifiedAt` fields distinguish documented data from records still being researched.

The start screen copy is:
- **BASE DE DADOS** — “Explorar e editar o mundo do futebol.”
- **CARREIRA** — “Transformar os dados numa história.”

## v8 · extensible competitions and position familiarity

The Master Database competition catalogue is no longer limited to exactly two records. IDs `0` and `1` remain the structural Super League / Challenge League competitions used by Match Engine v1, while additional competition records can be created, edited and removed without changing the league simulation. A fresh Master now also includes a Swiss Cup catalogue record with all 22 demonstration clubs as initial participants.

Competition records support name/short name, country, type, format, optional level, participants, points rules for the two active leagues, notes, a competition logo and a trophy image. Uploaded competition media is normalized to PNG using the same safe browser image pipeline as club media and is serialized inside Master/career JSON snapshots. Extra competitions are visible in Career mode but explicitly marked as not yet simulated; this avoids pretending that cup/continental formats are already implemented by the engine.

The player **Jogo** tab also gains `positionFamiliarity` (0–100) values. These are simulation-only, alongside AVG and skills. The primary position is fixed at 100; Match Engine role effectiveness uses the stored familiarity when present and falls back to the original primary/secondary-position rules for old files.

Checks:
- `node tests/competition-model.cjs`
- `node tests/world.cjs`
- `node tests/player-engine.cjs`
- `node tests/match-engine.cjs`

## v9 — Swiss Cup e pirâmide alargada

A v9 aumenta a base de demonstração para **74 clubes**: 12 Super League, 10 Challenge League, 18 Promotion League e clubes adicionais necessários para o quadro inicial de 64 equipas da Swiss Cup 2026/27.

A Swiss Cup passa a ser jogável em carreira, com seis eliminatórias, primeira ronda oficial de referência, prolongamento/penáltis e regras próprias de mando/sorteio. A Promotion League funciona como escalão alimentador: o melhor clube elegível sobe à Challenge League e o último da Challenge desce. Equipas U-21 são mantidas na competição, mas não podem subir.

O Editor de Competições continua aberto a novas competições e permite criar taças eliminatórias jogáveis com 2, 4, 8, 16, 32, 64 ou 128 participantes, incluindo logótipo e imagem de troféu.

> Nota: as ligas profissionais continuam a usar, nesta fase, o calendário simplificado do protótipo. O barrage oficial entre Super League e Challenge League ainda não faz parte do motor.

Ver `docs/v9-swiss-cup-and-pyramid.md` e `CHANGELOG-v9.md`.


## v10
Ver `CHANGELOG-v10.md` para as alterações de idade, bandeiras e uploads de media.

## v11 — transferências, empréstimos e bandeiras SVG

A ficha do jogador documenta movimentos com tipo, data, valor e notas. Empréstimos distinguem o clube onde o jogador actua (`player.club`) do clube proprietário (`player.loan.parentClub`) e podem guardar datas, taxa, opção/obrigação de compra e valor. Ver `docs/v11-transfers-and-flags.md` e `CHANGELOG-v11.md`.

As bandeiras de nacionalidade voltam a usar os SVG locais de `dist/flags/`. A preview autónoma incorpora os mesmos SVG como data URLs para evitar diferenças de renderização de emoji entre sistemas operativos ou entre preview e hosting.

Código disponível em https://github.com/NuWiSan/helvetia-manager . Este repositório contém código e testes, não os dados introduzidos no navegador. A publicação do site continua a ser feita separadamente.
