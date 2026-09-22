# Helvetia Manager · v8

## Editor de competições

- O catálogo da Base de Dados Mestre deixa de estar limitado a apenas duas competições.
- Super League (ID 0) e Challenge League (ID 1) continuam protegidas como ligas estruturais do Match Engine v1.
- Nova Base Mestre inclui também **Swiss Cup** como competição de catálogo, inicialmente com os 22 clubes de demonstração.
- É possível criar e eliminar competições adicionais sem quebrar as duas ligas activas.
- Novos campos: nome curto, país, tipo, formato, nível opcional, participantes e notas.
- Logótipo da competição e imagem do troféu editáveis, convertidos para PNG e guardados no JSON.
- Participantes de competições de catálogo podem ser seleccionados clube a clube.
- As duas ligas continuam a obter os participantes directamente da divisão dos clubes.
- Carreira mostra as competições adicionais presentes no snapshot, mas assinala claramente que o Match Engine v1 ainda não lhes gera jogos.

## Jogadores / Match Engine

- Nova familiaridade posicional de jogo (0–100), separada dos dados documentais.
- Posição principal = 100.
- A familiaridade passa a influenciar `Engine.fit()` e, por consequência, o rendimento na posição.
- Ficheiros antigos sem este campo continuam compatíveis através da lógica anterior de posições principal/secundárias.

## Compatibilidade

- Bases v7 com apenas Super League e Challenge League continuam válidas.
- Carreiras existentes mantêm o snapshot das competições com que foram criadas.
- Não foram persistidas alterações de dados feitas apenas para testes.

## Testes

- `competition-model.cjs`
- `world.cjs`
- `player-engine.cjs`
- `match-engine.cjs`

Todos passam na v8.
