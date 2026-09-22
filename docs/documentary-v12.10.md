# Extensões documentais v12.10

## Modelo e compatibilidade

- `contractHistory` continua a ser o histórico contratual existente. Linhas manuais usam os mesmos `club`, `contractStart`, `contractEnd`; `recordedAt` pode estar ausente. Clubes externos usam `club:null`, `clubName`, `clubCountry`. Isso não altera `player.club`, que continua a identificar o clube jogável.
- `documentaryClubs` é um catálogo opcional de nomes/países reutilizáveis na mesma base. É incluído em `World.extract`, backups e snapshots; não cria clubes jogáveis nem participantes de ligas. A entrada fica em rascunho até guardar.
- `documentaryStats` é uma lista opcional com `season`, `club` ou `clubName/clubCountry`, `competition`, `appearances`, `minutes`, `goals`, `assists`, `source`. Inteiros não negativos ou nulos para contagens desconhecidas. Não se converte nem se soma com `stats`/`career` do motor.
- `internationalRecords` recebe `startDate`/`endDate` opcionais. Não se inferem datas. Mantém uma linha e um total por país/escalão.
- `sourcesUnified` é opcional. A abertura do editor adapta fontes antigas somente no rascunho; guardar confirma a representação unificada. `source`/`sourceUrl` originais ficam preservados para compatibilidade, mas deixam de gerar uma segunda fonte na apresentação. URLs não navegáveis são guardadas como referência em notas. A antiga data de verificação é identificada como tal, não como data de consulta.
- `verificationStatus` mantém-se como projecção compatível com filtros/exportações, calculada a partir das fontes unificadas. Edição em massa actualiza o estado das fontes existentes; sem fonte, exige primeiro documentá-la. CSV rejeita mudanças escalares de fonte/verificação de registos unificados para não prometer uma alteração ignorada pela lista.

## Escritas e auditoria

`Engine.updatePlayer` continua a validar antes de aplicar. Correcções contratuais não arquivam automaticamente. `movement.archiveContract` permite arquivar uma renovação; mudanças de clube preservam contratos com datas. Uma comparação dos campos contratuais evita repetir um snapshot idêntico. Entradas antigas não são eliminadas automaticamente.

O histórico editável fornecido pelo rascunho é respeitado. O registo de edições usa a lista de auditoria do rascunho e acrescenta apenas diferenças relevantes, sem recuperar entradas removidas. Remover o registo não desfaz os dados.

A interface impede perder uma entrada em edição, protege a navegação durante a optimização de fotografias e solicita guardar/descartar alterações antes de mudar de jogador. Cancelar a ficha não modifica a Mestre nem o catálogo.
