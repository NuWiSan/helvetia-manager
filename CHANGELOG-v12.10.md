# Helvetia Manager v12.10

## Percurso e contratos
- Percurso e Timeline reunidos na aba **Percurso**, com cronologia adicional e informação sem data separada.
- Contratos anteriores: adicionar clube, início e fim; editar e remover entradas existentes. O clube actual não é alterado.
- Clubes de outros países podem ser introduzidos pelo nome e país; ficam disponíveis para futuras escolhas após guardar o jogador.
- Pequenas correcções do contrato actual já não criam cópias automáticas. Uma renovação pode arquivar o contrato anterior através de uma opção explícita. Mudanças de clube continuam a preservar um contrato anterior datado, sem repetir um snapshot já existente.
- Transferências anteriores: edição da data/notas e remoção com confirmação, mantendo o vínculo actual. As operações de transferência/empréstimo actuais continuam disponíveis.

## Informação documental
- Estatísticas reais por época, clube e competição: jogos, minutos, golos, assistências e referência. Valores desconhecidos podem ficar em branco. Não alimentam nem substituem estatísticas da simulação.
- Internacionalizações: campos Desde/Até por país e escalão, usados na cronologia; os totais jovens e principais continuam separados.
- Fontes e verificação numa única secção. Fontes anteriores são adaptadas na ficha sem apagar os campos originais. Referências que não são URLs são preservadas como observações.
- Verificação calculada: todas as fontes confirmadas → Confirmado; todas por verificar ou nenhuma → Por verificar; combinação dos estados → Parcial. Não constitui confirmação automática da verdade dos dados.
- A completude documental passa a incluir a existência de histórico estatístico real; percentagens anteriores podem baixar.
- Exportação CSV adicional de estatísticas reais e períodos nas internacionalizações. Para jogadores com fontes unificadas, alterações de fontes/verificação são feitas na ficha (ou pela operação de verificação em massa); CSV escalar não substitui a lista de fontes.

## Ficha
- Dupla nacionalidade: duas bandeiras actuais recortadas na diagonal, num único espaço, no cabeçalho e no cromo. Imagens originais preservadas.
- Anterior/Seguinte no topo: navegação na lista, manutenção da aba e opção de guardar, descartar ou permanecer quando há alterações.
- Registo de edições com resumo dos campos alterados, remoção individual e limpeza com confirmação. Remover uma entrada não desfaz alterações do jogador. Novas correcções continuam registadas.

## Compatibilidade e testes
- Modelo partilhado e snapshots de carreira preservados; clubes documentais e estatísticas reais são copiados com a carreira.
- Não há deduplicação nem eliminação automática dos contratos antigos. Podem ser revistos manualmente.
- Testes existentes executados; novos testes cobrem contratos, fontes antigas, percurso, catálogo, persistência, estatísticas reais, períodos, navegação e cancelamento.
