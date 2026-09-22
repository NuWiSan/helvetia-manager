# Helvetia Manager v12.20

- Cor principal preservada em `club.color`; nova cor opcional em `club.secondaryColor`.
- Editor existente com selector e HEX para cada cor, amostras imediatas e opção de voltar à cor secundária automática.
- Aceita #RGB e #RRGGBB; normaliza cores editadas/importadas para #RRGGBB.
- Fallback visual previsível e função de contraste disponíveis no modelo, sem guardar cores automáticas.
- CSV de clubes inclui secondaryColor; ficheiros antigos e campos vazios continuam válidos. CSV vazio preserva dados existentes, como nas restantes colunas.
- JSON, backups e snapshots preservam a segunda cor sem alterar a estrutura de persistência.
- Testes de compatibilidade, importação, cancelamento, gravação, limpeza, recarregamento e isolamento de carreira.
- Não altera o desenho dos cartões nem o uso actual da cor principal.
