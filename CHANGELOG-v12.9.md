# Helvetia Manager v12.9

- Área da fotografia do jogador ampliada de 230 para 310 px, com margens laterais menores.
- Aba Imagem / Cromo: zoom, posição horizontal/vertical e reposição do enquadramento. Ajustes usados na ficha e na vista de cromos; miniaturas e imagem armazenada não são alteradas.
- Importação CSV na Base de Dados: actualização de jogadores existentes pelo ID, com diferenças apresentadas antes da confirmação.
- Células vazias preservam os valores existentes. SEM_CLUBE na coluna club liberta o jogador. Clubes usam IDs; datas usam AAAA-MM-DD.
- Validação integral antes de guardar: cabeçalhos, IDs, valores, empréstimos e limite de 200 jogadores alterados. Uma linha inválida impede toda a aplicação. Uma mudança da Mestre invalida a revisão anterior.
- Transferências, contratos e histórico documental usam as operações existentes. Carreiras em andamento mantêm os seus snapshots.
- Campos de enquadramento opcionais; bases anteriores continuam a abrir sem conversão destrutiva.
- Testes existentes executados, incluindo motor, Swiss Cup, carreiras e persistência. Novos testes cobrem CSV, revisão/cancelamento/confirmação, conflitos e enquadramento.

## Âmbito desta fase

Importação apenas de jogadores já existentes, com campos documentais presentes no CSV exportado. Não cria jogadores, não importa fotografias/skills e não substitui o backup JSON. Importadores de clubes, staff e tabelas relacionadas ficam para uma próxima fase; a exportação dessas categorias continua disponível.
