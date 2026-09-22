# Fase C — operações documentais

## Compatibilidade e histórico

O formato principal continua version: 1. A extensão opcional players[].changeHistory
é validada pelo módulo documental. As bases sem o campo são aceites sem alterações.
Uma entrada tem `at` (instante ISO da edição) e `changes` (field, before, after).
Os valores são resumos textuais, não cópias integrais de imagens/fontes. Listas
longas são explicitamente abreviadas a 1900 caracteres; o conteúdo canónico não
é reduzido. Limite de 1000 entradas por jogador, sem descarte automático.

Engine.updatePlayer calcula o histórico após as regras existentes de vínculo e
contrato, mas antes de validar o candidato. Só aplica o candidato após validação;
assim, uma edição inválida não cria histórico. Não há histórico de jogos/skills
nem reconstrução retroactiva. A simples adaptação de selecções antigas não é
considerada alteração factual. Importações e restauros JSON preservam o histórico
do ficheiro; não geram uma entrada fictícia por cada jogador importado.

## Edição em massa

DatabaseOps.bulkPlan clona a Mestre, usa World.context e Engine.updatePlayer para
cada jogador e valida o resultado inteiro. Não altera a Mestre recebida. A revisão
mostra as diferenças derivadas, incluindo mudanças de estado e clube. A aplicação
final requer confirmação e uma Mestre igual à usada na revisão; alterações
intermédias obrigam a rever de novo. Os snapshots de carreira são independentes.
AutoSave continua a guardar a Mestre aplicada e a detectar conflitos entre abas.

Operações permitidas: status, club, verification e source. Máximo de 200 jogadores.
Estado Sem clube também liberta o jogador; alterar para Activo/Lesionado exige
clube. Jogadores emprestados não aceitam alterações colectivas de clube/estado.
Retirado altera o estado sem apagar silenciosamente o clube; o diagnóstico pode
assinalar a associação restante para revisão. Fontes são acrescentadas, nunca
substituídas. Não existe operação colectiva de skills.

Selecção por jogador ou página, preservada entre páginas. Alterar filtros limpa
a selecção para evitar operações sobre resultados escondidos. Só a tabela permite
seleccionar; vista e colunas continuam a ser preferências de sessão.

## CSV e importação futura

DatabaseOps.table disponibiliza colunas explícitas e linhas escalares para cada
categoria. Jogadores, clubes e staff mantêm id; filhos usam player_id e index.
Transferências incluem IDs de origem/destino e campos de empréstimo. Selecções
mantêm país/escalão separados. Estatísticas têm origin=simulation e period.
Não há datas inventadas nem estatísticas reais inferidas de resultados do jogo.

DatabaseOps.exportCsv usa BOM UTF-8, CRLF e delimitador ponto e vírgula. Escapa
aspas, delimitadores e quebras de linha. Prefixa com apóstrofo textos que possam
ser interpretados como fórmulas por folhas de cálculo. Não inclui imagens base64.
Portanto, CSV destina-se a análise/intercâmbio e não substitui backup JSON.

Importadores futuros devem interpretar estes cabeçalhos, converter tipos,
resolver IDs e construir uma revisão validada antes de aplicar. Não podem
sobrescrever a Mestre directamente a partir de linhas de texto nem fabricar IDs
de clubes em falta. Ainda não há importação CSV nesta versão.

## v12.9 — Importação e enquadramento

`DatabaseOps.importPlayersPlan(master, csv)` devolve uma candidata validada e diferenças, sem modificar a Mestre. Aceita os cabeçalhos da exportação de jogadores (id obrigatório), UTF-8/BOM, vírgula ou ponto e vírgula, aspas escapadas e células com várias linhas. Limites: 5 MB, 5000 linhas, 200 registos alterados. Células vazias preservam valores. O ciclo exportar/importar sem alterações preserva também os valores protegidos contra fórmulas de folhas de cálculo.

A confirmação verifica a baseline antes de substituir a Mestre. Engine.updatePlayer trata as alterações de clube, contratos e auditoria; não há uma base paralela. Empréstimos exigem edição individual. Importação não disponível em modo carreira.

Campos opcionais do jogador: photoZoom (inteiro 80–200, predefinição 100), photoX e photoY (inteiros −50–50, predefinição 0). O renderer partilhado aplica-os só ao cromo. A ausência dos campos continua válida. O snapshot e o backup JSON preservam-nos naturalmente; não se modifica o bitmap armazenado.

## v12.11 — estatísticas reais por CSV

`importDocumentaryStatsPlan` trabalha com os cabeçalhos de `documentaryStatistics`. Exige `player_id` e `index`; `NOVO` em index acrescenta uma linha. Índices existentes referem-se às posições originais do CSV exportado. Células vazias preservam valores. Novas linhas exigem época e clube, e passam pelo mesmo validador documental usado pelo editor. Limites: 5 MB, 5000 linhas e 200 jogadores alterados.

As alterações são agrupadas por jogador numa candidata clonada e validadas antes da revisão. A confirmação exige que a Mestre ainda corresponda à baseline. Não modifica `stats` nem `career` da simulação. O catálogo externo é incluído na mesma candidata. Os restantes importadores continuam por implementar.
