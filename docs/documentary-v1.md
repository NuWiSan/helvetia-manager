# Extensão documental v1 — compatibilidade e Fase A

## Estrutura preservada

Base Mestre e carreira mantêm `version: 1`, os IDs e o modelo de registos partilhado.
`World.extract/createCareer` clona os registos completos. `AutoSave` continua a
guardar exclusivamente a Mestre e a carreira aplicadas em IndexedDB, com backups
e detecção de conflitos. Os formulários continuam a trabalhar em rascunhos.
Transferências, empréstimos, contratos, internacionalizações e estatísticas do
motor não mudam de formato nem de comportamento.

## Compatibilidade antes da escrita

`Documentary.sources(player)` é o adaptador de leitura das fontes antigas
`source`, `sourceUrl`, `verificationStatus`, `lastVerifiedAt`. Não muda o jogador,
não elimina texto antigo e não converte referências livres em URLs. A fonte
principal continua editável nos campos existentes. As referências adicionais
ficam num campo distinto, evitando duplicar ou substituir a fonte antiga.

A extensão é opcional. Uma base anterior, sem estes campos, é lida, validada e
guardada sem migração destrutiva. Na primeira adição de fontes escrevem-se:

```js
player.documentaryVersion = 1;
player.documentSources = [{
  title: 'Site oficial do clube',
  field: 'height',
  url: 'https://example.org/jogador',
  consultedAt: '2026-09-13',
  notes: 'Altura indicada no perfil.',
  status: 'Confirmado'
}];
```

Título obrigatório; URL, data de consulta e observações podem estar vazias.
Campos permitidos em `Documentary.fields`; estados em `Documentary.states`.
Até 100 fontes adicionais, título até 200 caracteres, URL/observações até 2000.
URLs novas só HTTP(S); links externos usam `noopener noreferrer`. A verificação
da fonte não confirma automaticamente o jogador nem altera os dados citados.
Uma versão documental futura desconhecida é rejeitada sem apagar o original.

`Engine.validate` só recebe a chamada adicional à validação documental; não há
alteração às fórmulas, calendário, Swiss Cup, transferências ou resultados.
O mesmo percurso protege importação JSON, gravação, restauro e snapshots.

## Completude

Critérios: nome, nascimento, nacionalidade, posição, altura+peso, fotografia,
situação de clube, datas de contrato, presença de fonte e fonte específica de
internacionalizações. Contrato só é aplicável com clube e sem estado Retirado;
fonte de internacionalizações só é aplicável quando existem registos de selecção.
Sem clube é uma situação válida, não uma falha. A nota de cada jogador é o número
de critérios preenchidos dividido pelo número de critérios aplicáveis.

O painel agrega os critérios cumpridos/aplicáveis dos jogadores. Não avalia a
completude de clubes, staff ou competições, nem a verdade dos dados. Mostra os
respectivos totais e clubes sem logótipo separadamente. Estatísticas documentais
ainda não têm editor próprio: não são inferidas de `stats`/`career` nem entram na
percentagem. Skills, AVG e potencial também não contam.

## Diagnósticos e pesquisa

Os relatórios são calculados na leitura e não são persistidos. Duplicados exigem
nome completo (ou conhecido) normalizado e nascimento iguais. Não há fusão.
Avisos básicos abrangem clube/nacionalidade, empréstimo, contrato, retirados,
contagens internacionais, transferências e participantes. As validações antigas
continuam a impedir a importação de estruturas inválidas; o painel não as contorna.
Dois clubes só podem ser suspeitados através de fichas possivelmente repetidas,
pois uma ficha tem um único `club`. Nenhuma suspeita é apresentada como certeza.

Pesquisa global usa os registos canónicos e abre os editores existentes. Os
filtros de jogadores são combinados por AND; Internacional A/jovem exige caps > 0.
Idades usam o ano de referência da Mestre, em 1 de Julho. A limpeza repõe todos
os filtros. A pesquisa e o diagnóstico paginam em grupos de 50.

## Preparação para fases seguintes

CSV deverá manter relações por ID: tabelas de jogadores/clubes/staff, e linhas
filhas com player_id para transferências, selecções e fontes. `documentSources`
contém valores escalares e não acopla dados à interface. Fotos devem ter política
de media própria, sem meter imagens base64 em colunas CSV por defeito.

Não incluídos nesta versão: vista de cromos, colunas configuráveis, novo cabeçalho,
timeline, auditoria de alterações, edição em massa e importadores/exportadores CSV.
Continuam previstas nas fases B e C autorizadas pelo plano do utilizador.

## Pré-visualização local

`node scripts/export-preview.cjs /caminho/helvetia-preview.html` inclui JS, CSS e
bandeiras num HTML único. É a mesma aplicação; não importa automaticamente os
dados do site publicado. A persistência local depende do navegador/origem.
Exportar/carregar JSON continua disponível. Para testes de ficheiro, recomenda-se
conservar uma cópia JSON dos dados pretendidos. A preview não publica alterações.
