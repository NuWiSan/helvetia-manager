# Competições na v8

## Dois níveis de suporte

A v8 separa **registo da competição** de **simulação da competição**.

### Ligas estruturais

- ID 0 — Super League
- ID 1 — Challenge League

São as duas competições actualmente usadas pelo Match Engine v1 para calendário, classificação e promoção/despromoção. O editor permite mudar nome, identidade visual e pontuação, mas estes IDs não podem ser apagados.

### Competições de catálogo

Qualquer outra competição tem `engineMode: "catalogue"`. Pode guardar:

- nome e nome curto;
- país / território;
- tipo (Liga, Taça, Supertaça, Continental, Internacional, Outro);
- formato (Liga, Eliminatórias, Grupos + eliminatórias, Misto, Outro);
- nível opcional;
- participantes;
- notas;
- logótipo;
- imagem do troféu.

Estas competições são copiadas da Base Mestre para a nova carreira juntamente com os restantes dados. Nesta versão ainda não geram jogos. Essa separação permite construir uma base documental completa sem acoplar prematuramente todos os formatos a um motor que actualmente só implementa duas ligas.

## Imagens

O logótipo e o troféu usam o mesmo pipeline do logótipo dos clubes: o navegador lê a imagem, redimensiona-a para um máximo de 512 px e guarda PNG no próprio ficheiro JSON.

## Próximo passo natural

A arquitectura fica preparada para um **Cup Engine** separado: sorteio, eliminatórias a uma ou duas mãos, prolongamento, penáltis e encaixe no calendário da carreira. Esse motor pode consumir directamente os registos `catalogue` sem alterar o editor criado na v8.
