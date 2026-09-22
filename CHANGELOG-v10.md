# Helvetia Manager v10

## Dados de jogador
- A idade deixou de ser um dado manual do jogador.
- A idade é calculada apenas quando existe uma data de nascimento.
- Sem data de nascimento, a idade aparece como “—” nas listas e é omitida do cromo.
- Bases antigas que ainda contenham `age` continuam compatíveis, mas o valor deixa de ser usado como fonte documental.

## Bandeiras
- As bandeiras no cromo deixaram de depender de ficheiros SVG externos.
- Passam a ser geradas localmente como emoji Unicode a partir da nacionalidade, evitando falhas de caminhos/hosting.

## Imagens e logótipos
- O carregamento de logótipos de clubes, imagens de estádio e imagens de competição passou a usar `FileReader`, a mesma abordagem robusta usada para a fotografia do jogador.
- Mantém normalização para PNG quando possível e tem fallback para PNG/JPEG/WebP em ambientes onde o canvas falhe.
- Mensagens de erro foram tornadas mais claras.

## Compatibilidade
- Mantida compatibilidade com ficheiros v7–v9.
- Match Engine, taças, Promotion League e snapshots de carreira não foram alterados.
