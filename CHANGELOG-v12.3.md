# v12.3 — Registos internacionais e fotografias dos estádios

- Uma única linha de introdução/edição na aba Internacional.
- Adicionar escalão e Aplicar edição colocam o registo numa tabela compacta.
- Registos já introduzidos mostram país, escalão, jogos e golos, com Editar/Remover.
- Cancelar edição descarta apenas a alteração da linha. Guardar alterações
  aplica também uma linha modificada ainda pendente, validando duplicados.
- Cancelar a ficha mantém todos os dados canónicos anteriores.
- Mantidos os totais de jovens, principal e acumulado e os dados da v12.2.
- Cartões de clubes com fotografia do estádio e acesso directo à ficha.
- Ficha do clube com imagem panorâmica, logótipo e nome sobre fundo sombreado.
- Sem fotografia, o cartão utiliza a cor e o logótipo existentes; não há imagens fictícias.
- Os dados do estádio, orçamento, plantel e staff continuam disponíveis.
- Mantidas a gravação automática, recuperação, pesquisa, empréstimos, cromos
  e restantes funcionalidades anteriores.

Testes: node tests/international-records.cjs e npm run test:v12.
