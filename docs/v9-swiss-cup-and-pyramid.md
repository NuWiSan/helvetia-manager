# v9 — Swiss Cup e pirâmide de clubes

## Objectivo
A v9 deixa de tratar os 22 clubes das duas ligas profissionais como o universo inteiro do Helvetia. A base passa a distinguir:

- **div 0 / tier 1** — Super League (12 clubes)
- **div 1 / tier 2** — Challenge League (10 clubes)
- **div 2 / tier 3** — Promotion League (18 clubes)
- **div 3 / tier 4+** — clubes adicionais / futebol amador usados sobretudo pela Swiss Cup

No seed 2026/27 existem 74 clubes no total.

## Promoção à Challenge League
`promotionLeagueTable(state)` cria uma classificação de fundo para todos os clubes `div === 2`.

`promotionCandidate(state, table)` percorre essa classificação e escolhe o primeiro clube que:
- não seja `reserveTeam`;
- não tenha `promotionEligible === false`.

No `nextSeason()`:
1. o primeiro da Challenge sobe à Super League;
2. o último da Super League desce à Challenge;
3. o melhor elegível da Promotion League sobe à Challenge;
4. o último da Challenge desce à Promotion League.

Assim os dois escalões simulados continuam com 12 e 10 clubes, enquanto a Promotion League continua com 18.

## Swiss Cup
A competição ID 2 usa `engineMode: "cup"` e propriedades próprias das regras suíças:

- `officialFirstRoundPairs`
- `roundNames`
- `roundDates`
- `referenceSeason: 2026`
- `lowerTierHomeThroughSemi: true`
- `avoidTopTierRound2: true`

Uma carreira cria `cupStates` independentes da Base Mestre. A Swiss Cup começa com os 32 jogos oficiais da primeira ronda. As rondas seguintes são sorteadas pelo motor.

### Desempate
O jogo normal é produzido pelo Match Engine. Se terminar empatado:
- é gerado um prolongamento simplificado;
- persistindo o empate, é gerada uma série de penáltis;
- o `winner` é sempre definido.

O relatório do jogo regulamentar fica associado à eliminatória e pode ser consultado na interface.

## Taças personalizadas
Uma competição adicional pode usar `engineMode: "cup"`. O número de participantes tem de ser uma potência de dois entre 2 e 128.

As regras especiais da Swiss Cup não são aplicadas automaticamente a taças personalizadas; estas usam sorteio e mando de campo genéricos. Isto permite que o editor continue a servir competições criadas pelo utilizador sem assumir regras suíças.

## Limites da v9
A v9 não pretende ainda reproduzir todo o regulamento das ligas profissionais. Em particular, o calendário de Super/Challenge mantém o modelo simplificado anterior e o barrage SL/CL ainda não foi adicionado. A Promotion League é um motor alimentador de época, não uma terceira liga gerida jornada a jornada.
