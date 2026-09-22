# Helvetia Manager v12.23

- Corrigida a incompatibilidade na linha 14 do CSV enviado: AVA é convertido para a posição canónica AV durante a importação.
- Aceites equivalências de estado (active/ativo → Activo; Reformado → Retirado) e verificação (verified/verificado → Confirmado).
- Mensagens específicas para posição inválida e ID desconhecido, com orientação no importador.
- O ficheiro original, as 20 colunas e os IDs não são alterados. Campos vazios continuam a preservar dados existentes. A revisão e confirmação continuam obrigatórias.
- Mantidas as protecções de empréstimos, fontes unificadas e o máximo de 200 alterações por lote. O CSV tem 1926 jogadores; a correspondência com a Base Mestre do utilizador continua necessária. Na base inicial de demonstração existem 612 IDs do ficheiro que não estão presentes; não são criados nem remapeados automaticamente.
- Cromo comum com moldura e faixa mate escuras. Prata com reflexos em tons de aço e branco; ouro com reflexos dourados mais marcados. Mesmas dimensões, fotografias e fundos.

Validação: erro original reproduzido; primeiras 15 linhas do ficheiro original aceites depois da correcção; regressões para etiquetas, campos vazios e rejeição atómica; suite existente completa. Sem verificação visual num navegador nesta sessão.
