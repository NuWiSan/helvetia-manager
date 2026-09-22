# v12.2 — Internacionalizações por escalão

- A aba Internacional permite adicionar várias linhas por país e escalão.
- Cada linha guarda internacionalizações e golos separadamente.
- Escalões: Principal, Sub-15 a Sub-23, Olímpica, B e Por indicar.
- Resumo na aba e junto ao cromo: principal, jovens, outros (quando existem)
  e total acumulado. O total jovem nunca substitui o total da selecção principal.
- Exemplo: Sub-19 3 + Sub-21 5 + Principal 11 = Jovens 8, Principal 11, Total 19.
- Valores em branco são desconhecidos, não zero; o resumo indica “+ ?”.
- Um país pode ser diferente nos jovens e na principal.
- O registo anterior de um único escalão aparece como uma linha quando se abre
  a ficha. Ao guardar, internationalRecords passa a ser a única estrutura activa.
- Os registos ficam no jogador canónico, na gravação automática, nas exportações
  e no snapshot das novas carreiras. Cancelar não altera os dados existentes.
- Não há simulação de selecções nem alteração do Match Engine.
- Mantidas as funcionalidades da v12.1, incluindo optimização de imagens.

Testes: node tests/international-records.cjs e npm run test:v12.
