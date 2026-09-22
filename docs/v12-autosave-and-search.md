# Trabalhar com a v12

A Base de Dados continua totalmente independente da carreira. O botão
“Todos os jogadores” permite pesquisar e editar sem iniciar qualquer jogo.

## Guardar

“Guardar alterações” aplica uma ficha. A gravação automática guarda depois esse
registo no navegador; aguarda a indicação “Guardado neste navegador” antes de
fechar. Texto ainda não aplicado num editor não é guardado automaticamente.
“Cancelar”, × e Escape mantêm o comportamento anterior de descartar o rascunho.

“Exportar base de dados” e “Exportar carreira” descarregam ficheiros JSON.
Estas cópias permitem mudar de navegador ou computador. A gravação automática
pertence ao endereço e ao perfil do navegador utilizados. Apagar os dados desse
endereço também remove estas gravações. A aplicação não sincroniza com a nuvem.

Ao abrir, a última Mestre e a última carreira guardadas são carregadas no ecrã
inicial. Não é necessário carregar nem criar uma carreira para abrir a Mestre.
Uma partida em curso fica em pausa.

## Recuperação

O botão Recuperação está disponível nos dois modos e no ecrã inicial.
São conservadas até cinco cópias anteriores por modo, a intervalos de cinco
minutos quando há alterações, e antes das substituições/restauros.
Um restauro conserva a versão anterior e afecta apenas o modo seleccionado.
Não há uma cópia por cada tecla ou por cada registo editado.

Se outra janela tiver gravado uma versão mais recente, esta janela deixa de
sobrescrever os dados. Exporta a sessão se quiseres conservá-la e recarrega para
abrir a versão guardada. Dados inválidos são conservados para exportação e
recuperação; não são apagados nem substituídos silenciosamente por demonstrações.

## Implementação

- save-store.js: duas object stores IndexedDB, heads e backups; transacções
  atómicas e comparação de revisão para impedir gravações desactualizadas.
- autosave.js: grava apenas master e career canónicos. Não grava o contexto
  temporário World.context nem rascunhos dos editores.
- player-search.js: pesquisa pura sem mutar os registos.
- database-browser.js: filtros e paginação, com ligação aos editores existentes.
- Não há uma base de jogadores paralela. O snapshot de carreira continua em World.
- As dependências de package.json são apenas de testes; a aplicação continua
  HTML/CSS/JavaScript estático, sem compilação nem dependências de produção.

Testes: npm ci e npm test. Para apenas os testes novos: npm run test:v12.
