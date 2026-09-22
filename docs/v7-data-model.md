# v7 — separação documental / simulação

## AVG e skills

Os dados de identidade, clube, posição, medidas, nacionalidade, valor de mercado, contratos, media e fontes são tratados como dados documentais. O separador **Jogo** contém valores de simulação: AVG, potencial e skills 1–20.

`Engine.gameOverall(player)` calcula o AVG automaticamente a partir de todas as skills técnicas, mentais e físicas. As quatro skills nucleares do grupo da posição principal têm peso reforçado; nos guarda-redes, os três atributos específicos de GR têm peso reforçado. Os campos de perfil de simulação (consistência, profissionalismo, propensão a lesões, reputação e ambição) não entram directamente no AVG. A escala 1–20 é normalizada para 1–99. O AVG não é editável directamente. O campo legado `quality` continua no JSON para compatibilidade e é sincronizado com o AVG ao guardar um jogador com atributos.

O Match Engine não usa apenas o AVG: os eventos e perfis de ataque/defesa/controlo usam directamente os atributos adequados. O AVG é sobretudo um resumo visual e uma referência para ordenação quando necessário.

## Transferências e jogadores sem clube

Mudar o clube no Editor de Jogador altera o `club` canónico do jogador, pelo que ele deixa imediatamente um plantel e passa para o outro. Cada alteração fica registada em:

```json
"transferHistory": [
  {"date":"2026-07-01","fromClub":12,"toClub":13}
]
```

`fromClub` e `toClub` podem ser `null`. Na Base de Dados Mestre a data fica `null` (“Por indicar”), porque mudar o clube no editor não deve inventar uma data histórica. Numa carreira, a mudança usa a data corrente da simulação. `club: null` representa jogador sem clube; o estado é normalizado para `Sem clube` (excepto `Retirado`). Jogadores sem clube não são elegíveis para jogos nem entram numa massa salarial de clube.

## Histórico contratual

Quando um dos campos `contractStart`, `contractEnd`, `salary`, `squadRole`, `releaseClause` ou `agent` muda, a versão anterior é arquivada em `contractHistory` com a data de arquivo e o clube dessa altura. Isto conserva contexto sem alterar a estrutura principal usada pelo motor.

## Verificação documental

Campos opcionais:

- `verificationStatus`: `Por verificar`, `Parcial` ou `Confirmado`;
- `lastVerifiedAt`: data ISO `YYYY-MM-DD`.

Servem apenas para gestão da Base de Dados e não afectam a simulação.
