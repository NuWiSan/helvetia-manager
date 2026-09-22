# Helvetia Manager v12.12

- Cabeçalho do jogador inspirado no exemplo: emblema e clube, nacionalidades e posições acima do nome.
- Clube clicável abre a lista de jogadores do clube; cada nacionalidade abre o filtro correspondente, incluindo nacionalidade principal ou secundária.
- Na Base Mestre, utiliza os filtros existentes. Em carreira, a lista é limitada ao snapshot da carreira.
- AVG e potencial juntos no cabeçalho, actualizados a partir dos mesmos valores da simulação; potencial desconhecido apresentado como travessão.
- Links protegem alterações pendentes: guardar, descartar ou permanecer na ficha.
- Mantidos o cromo, dupla bandeira, indicadores documentais, avisos e navegação Anterior/Seguinte.
- Testes existentes executados; novos testes de valores no cabeçalho, filtros, alterações pendentes e isolamento da carreira.

## CSV — conclusão das categorias documentais previstas

- Importação e exportação de jogadores, clubes, staff, competições, contratos anteriores, transferências anteriores, internacionalizações, fontes e estatísticas reais.
- Criação de jogadores, clubes, staff e competições com `NOVO` na coluna `id`. Os IDs atribuídos são apresentados antes da confirmação.
- Adição de linhas relacionadas com `NOVO` em `index`; actualização das existentes por `player_id` + `index`.
- Modelos CSV descarregáveis por categoria; ajuda específica na janela de importação.
- Criação de jogadores/staff usa qualidade inicial 60 exclusiva da simulação. Novos jogadores sem salário indicado usam 0 CHF; não são inventadas datas nem nacionalidades.
- Novos clubes entram fora das duas ligas profissionais; novas competições entram no catálogo. A estrutura das ligas e a activação de motores continuam a ser configuradas pelos editores.
- Importação de transferências/contratos anteriores só altera o histórico; o clube actual continua a ser alterado pela ficha ou pelo CSV de jogadores.
- Validação integral e revisão antes de guardar. Campos vazios preservam os existentes. Fotografias, emblemas e cópias completas continuam no JSON.
- Estatísticas geradas pelo jogo continuam apenas exportáveis; não são confundidas com estatísticas reais importadas.
