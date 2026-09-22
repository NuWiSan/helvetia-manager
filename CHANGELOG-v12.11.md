# Helvetia Manager v12.11

## Cromo
- Bandeiras simples e duplas com uma área comum de 52 × 36 px no cromo. Bandeiras simples preservam a proporção original.
- AVG à direita, alinhado verticalmente com o emblema de 58 px à esquerda.
- AVG com a mesma tipografia Barlow Condensed de 42 px usada na aba Simulação; cor da raridade mantida.
- Cabeçalho sobreposto à área da fotografia e barras inferiores mais compactas. A área da fotografia mantém 310 px, com os ajustes de zoom e posição existentes.
- Largura, conteúdo e imagens guardadas preservados; nomes compridos podem continuar a ocupar várias linhas.

## Base de Dados — continuação da fase C
- Importação CSV de estatísticas reais por época, com revisão e confirmação antes de aplicar à Mestre.
- Escolha entre importar jogadores existentes e estatísticas reais na mesma janela.
- `player_id` identifica o jogador; `index` actualiza uma linha exportada; `NOVO` acrescenta uma época.
- Campos vazios preservam dados existentes; zero é um valor explícito válido.
- Clubes externos de novas épocas podem ser registados por nome/país e ficam disponíveis no catálogo documental.
- Rejeição de IDs/índices inválidos, colunas desconhecidas, números inválidos e ficheiros de estatísticas da simulação. Nenhuma alteração é aplicada antes da confirmação.
- Não cria jogadores. Para mudar uma linha de clube interno para clube externo, usa a ficha individual.

## Testes
- Testes existentes executados, incluindo motor, carreiras, Swiss Cup e persistência.
- Novos testes: importação documental, adição/correcção, zeros, exportação/importação sem alterações, catálogo de clubes, confirmação e invalidação da revisão ao mudar de tipo de importação.
