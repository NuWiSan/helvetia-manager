# Helvetia Manager v12 — Base de Dados

Ponto de partida: o ZIP v11 fornecido pelo utilizador, integrado na íntegra.
Mantêm-se os editores, cromos, bandeiras SVG, transferências, empréstimos,
familiaridade de posições, taças, pirâmide e motor existentes.

## Gravação automática
- Guarda a Base de Dados Mestre e a carreira separadamente no navegador.
- Recupera os dados ao abrir a aplicação. Jogos em curso são reabertos em pausa.
- Só guarda dados aplicados nos editores. Cancelar descarta o rascunho.
- Estado visível: recuperação inicial, alterações por guardar, guardado ou erro.
- Sem armazenamento disponível, os editores e a exportação manual continuam disponíveis.
- Uma escrita desactualizada de outra janela é recusada, conservando a versão guardada.

## Recuperação
- Até cinco cópias anteriores para a Mestre e cinco para a carreira.
- Cópias periódicas com alterações, a intervalos de cinco minutos.
- Cópia anterior também conservada antes de substituir ou restaurar dados.
- Restaurar a Mestre não restaura nem modifica a carreira, e vice-versa.
- Permite exportar a sessão, a cópia guardada e as cópias anteriores.
- Uma cópia inválida não é substituída automaticamente por dados de demonstração.

## Pesquisa global
- Novo ecrã “Todos os jogadores”, exclusivo da Base de Dados independente.
- Pesquisa por nome conhecido, nome completo ou clube, tolerando acentos.
- Filtros combináveis por clube, posição principal/secundária, nacionalidades,
  intervalo de idades, fotografia e estado de verificação.
- Ordenação por nome, clube, idade e data de verificação; páginas de 50 registos.
- Abre os editores existentes e conserva os filtros ao regressar.
- Idades calculadas em 1 de Julho do ano de referência; datas desconhecidas não são inventadas.

## Âmbito
Não há migrações novas de ficheiros antigos, conforme indicado pelo utilizador.
Não há sincronização entre computadores, conta remota ou alteração do Match Engine.
O calendário unificado e a evolução da gestão desportiva continuam para etapas seguintes.

## Verificação
Testes da persistência com IndexedDB simulado e da interface com DOM simulado:
gravação, reabertura, cancelamento, pesquisa, backups, restauro isolado, conflitos,
dados inválidos, falta de armazenamento e carreira pausada.
Mantidos os seis conjuntos de testes da v11.
