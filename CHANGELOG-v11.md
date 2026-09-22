# Helvetia Manager v11

## Bandeiras de nacionalidade
- O cromo voltou a usar bandeiras SVG reais, incluídas localmente em `dist/flags/`.
- A aplicação publicada não depende da Internet para mostrar bandeiras.
- A pré-visualização autónoma inclui as mesmas bandeiras como `data:` URLs, para que o resultado seja igual mesmo fora do hosting do Site.
- O editor mostra agora uma pequena pré-visualização da bandeira junto da nacionalidade principal e secundária.
- Mantém-se um fallback Unicode caso um recurso de bandeira falhe.

## Transferências e empréstimos
- Os movimentos de clube podem ter tipo, data, valor e notas.
- Tipos suportados: transferência definitiva, empréstimo, fim de empréstimo, contratação livre e saída como jogador livre.
- Empréstimos podem guardar clube proprietário, início/fim, taxa, opção ou obrigação de compra e respectivo valor.
- O clube do jogador continua a representar o clube onde joga; durante um empréstimo o proprietário fica em `player.loan.parentClub`.
- O histórico de movimentos mantém compatibilidade com entradas antigas, que não tinham tipo ou detalhes.
- Regresso ao clube proprietário após empréstimo é reconhecido automaticamente como `Fim de empréstimo`.

## Editor de jogador
- A aba Carreira ganhou a área “Movimento a registar”.
- O histórico passou a mostrar tipo, valor e detalhes do empréstimo.
- O resumo do jogador identifica o clube proprietário quando existe um empréstimo activo.

## Testes
- Actualizado `tests/player-engine.cjs` para cobrir transferências livres, empréstimos, alteração de condições e regresso ao proprietário.
- Adicionado `tests/countries.cjs` para resolução de nacionalidades e caminhos das bandeiras locais.
