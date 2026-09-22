# Helvetia Manager v12.8 — operações da Base de Dados e ficha do clube

- Nome da liga/escalão num rectângulo simples com contorno branco. Linha branca
  parte do centro da borda direita e prolonga-se até ao limite do grupo.
- Ficha do clube organizada em Clube, Estádio, Patrocinadores/Equipamentos,
  Plantel, Equipa técnica e Notas. Listas com a mesma proporção para as miniaturas,
  reservando espaço também quando ainda não existe fotografia.
- Histórico simples de alterações relevantes do jogador, disponível na aba
  Alterações. Regista data real da edição, campo, valor anterior e novo valor.
  Não cria entradas para gravações sem mudanças nem para alterações rejeitadas.
- Edição em massa na tabela: estado, clube, verificação ou fonte adicional.
  Selecção de até 200 jogadores, revisão das diferenças e confirmação final.
  O lote é validado numa cópia; erros não aplicam alterações parciais.
- Mudanças colectivas de clube usam a função existente de transferências.
  Empréstimos exigem edição individual. Skills não são editáveis em massa.
- Exportação CSV de jogadores, clubes, staff, transferências, internacionalizações,
  fontes e estatísticas do jogo. UTF-8, ponto e vírgula, relações por ID.
  Imagens continuam no JSON; estatísticas simuladas são explicitamente marcadas.
- v12.8 visível na aplicação. Código-fonte, HTML autónomo e changelog incluídos.

Compatibilidade: changeHistory é opcional; bases anteriores não precisam de ser
reescritas. Não se inventa um histórico anterior à actualização. Fontes antigas,
carreiras e snapshots mantêm-se. Fórmulas e regras do motor/Swiss Cup inalteradas.

Limites: o histórico é um resumo documental, não um sistema de reversão; textos
longos são abreviados no histórico, mantendo os dados originais na ficha. Até
1000 gravações com alterações por jogador. A importação CSV ainda não está
implementada; a importação/exportação JSON continua a preservar a base completa.

Validação: suite existente e novos testes de auditoria, lotes atómicos, confirmação,
cancelamento, transferências, CSV, alinhamento estrutural da ficha e HTML autónomo.
Não realizada inspecção visual num navegador real.
