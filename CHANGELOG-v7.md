# Helvetia Manager v7

- Separação clara no Editor de Jogador entre dados documentais e valores de jogo.
- Novo separador **Jogo** para AVG, potencial e skills.
- AVG 1–99 calculado automaticamente a partir das skills relevantes para a posição principal.
- Cromo e tabela de plantel passam a mostrar **AVG JOGO**, não um índice factual.
- Transferências entre clubes ficam registadas em `transferHistory`.
- Suporte a jogadores **Sem clube** (`club: null`) e vista própria no plantel.
- Alterações contratuais arquivam o contrato anterior em `contractHistory`.
- Estado de verificação documental e data da última verificação.
- Menu inicial actualizado para:
  - **BASE DE DADOS** — Explorar e editar o mundo do futebol.
  - **CARREIRA** — Transformar os dados numa história.
- Testes de regressão ampliados para AVG, transferências, free agents, contratos e verificação.
