# Guia CSV — Helvetia Manager v12.12

Na Base de Dados, abre **Importar CSV**, escolhe a categoria e descarrega o modelo. Também podes exportar registos existentes e trabalhar sobre essa exportação.

## Regras comuns

- UTF-8, com ou sem BOM. Separador vírgula ou ponto e vírgula; aspas e quebras de linha dentro de células são suportadas.
- Usa os nomes dos cabeçalhos exportados. Podes remover colunas que não vais alterar, conservando as chaves obrigatórias.
- Células vazias preservam valores existentes. Zero é um valor explícito. Não há eliminação de registos por CSV.
- Datas: AAAA-MM-DD. IDs são números, não nomes. Importa primeiro os clubes necessários, confirma e usa os IDs atribuídos nas importações seguintes.
- Máximo 5 MB, 5000 linhas e 200 registos principais/jogadores alterados por operação.
- A revisão apresenta as diferenças; só **Confirmar e guardar na Mestre** aplica a candidata. Se a Mestre mudar entretanto, é necessário rever novamente.
- O CSV não é um backup completo: fotografias, emblemas e outros dados não tabulares ficam no JSON.

| Categoria | Chaves | Novos registos |
| --- | --- | --- |
| Jogadores | id | NOVO em id; name e position obrigatórios; club opcional/SEM_CLUBE |
| Clubes | id | NOVO em id; name obrigatório; div 3, tier 4, budget 0 e cor cinzenta por omissão |
| Staff | id | NOVO em id; name, role e club obrigatórios |
| Competições | id | NOVO em id; name obrigatório; entra como catálogo |
| Contratos anteriores | player_id, index | NOVO em index; club ou clubName/clubCountry |
| Transferências anteriores | player_id, index | NOVO em index; fromClub/toClub diferentes |
| Internacionalizações | player_id, index | NOVO em index; nation; level predefinido Principal |
| Fontes | player_id, index | NOVO em index; title; field predefinido general; status Por verificar |
| Estatísticas reais | player_id, index | NOVO em index; season e club ou clubName/clubCountry |

## Exemplos

Criar um jogador livre (a qualidade inicial 60 é apenas um parâmetro do jogo; não constitui avaliação real):

```csv
id;name;position;nation
NOVO;Nome do jogador;MC;Suíça
```

Registar internacionalizações de um jogador existente com ID 123:

```csv
player_id;index;nation;level;caps;goals;startDate;endDate
123;NOVO;Suíça;Sub-21;5;0;2022-01-01;2024-06-30
```

Registar um contrato anterior num clube estrangeiro:

```csv
player_id;index;club;clubName;clubCountry;contractStart;contractEnd
123;NOVO;SEM_CLUBE;Nome do clube;Portugal;2020-07-01;2022-06-30
```

Neste contexto, SEM_CLUBE em club indica que a referência é pelo nome externo, não um clube jogável da lista. O clube actual do jogador não muda.

## Transferências e fontes

Transferências importadas são históricas: não executam uma transferência actual nem criam um empréstimo activo. Tipos: Transferência definitiva, Empréstimo, Fim de empréstimo, Contratação livre, Saída como jogador livre. A abreviatura Transferência é convertida em Transferência definitiva. Empréstimos históricos usam loan_parent_club e, opcionalmente, loan_start, loan_end, loan_fee, loan_purchase_type, loan_purchase_fee, loan_notes.

Fontes: title, field, url, consultedAt, notes, status. Estados Confirmado / Parcial / Por verificar. Referências antigas não navegáveis são preservadas em observações; novas URLs têm de usar HTTP(S). A coluna legacy, quando exportada, não é editável. Registos já unificados usam este CSV de Fontes em vez dos campos antigos source/sourceUrl no CSV de jogadores.

## Limites do modelo actual

Novos clubes não entram directamente nas ligas profissionais: a base preserva os 12 e 10 participantes dessas ligas. Novas competições não activam motores nem inscrevem equipas automaticamente. Uma equipa só pode ter um Treinador principal.

As estatísticas reais nunca são escritas em stats/career da simulação. A categoria Estatísticas do jogo continua apenas para exportação; os resultados e relatórios são restaurados por JSON de carreira.

Os índices das tabelas relacionadas correspondem à ordem exportada. Se editares/removeres entradas na aplicação depois de exportar, volta a exportar antes de preparar correcções por index.
