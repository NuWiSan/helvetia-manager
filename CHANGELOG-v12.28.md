# Helvetia Manager v12.28 beta

- Integração selectiva das experiências v12.26–v12.27.1 sobre a base v12.25; sem substituição da aplicação pelos HTML experimentais.
- Importação de jogadores até 5000 linhas / 5 MB, processada em lotes de 50, sem o limite anterior de 200 alterações de jogadores.
- Revisão de existentes, IDs desconhecidos, nomes correspondentes, identidades em conflito e linhas repetidas. Criar, associar por ID ou ignorar antes da confirmação.
- Revisão paginada de 25 registos e apresentação das diferenças antes de guardar.
- Normalização de datas DD/MM/AAAA e DD.MM.AAAA para AAAA-MM-DD, mantendo validação de datas reais. Equivalências de posição e estados preservadas.
- Gravação CSV através do mecanismo persistente já existente, com cópia protegida da Base Mestre anterior e rejeição de revisões desactualizadas.
- CSV de jogadores mantém exactamente as 20 colunas; fotografias, dados adicionais e carreiras são preservados.
- Não foram incorporados os preenchimentos presumidos das versões experimentais: 10 posições em falta no stage64 continuam a exigir verificação; o ficheiro de pesquisa não é substituído nem a Mestre existente é sobrescrita.
- Limites de outras categorias CSV e da edição em massa mantêm-se nesta versão.

## Validação

Testes novos: mais de 200 alterações, IDs desconhecidos/conflituosos, duplicados, normalização, revisão desactualizada, cancelamento e preservação de campos. Testes de interface adaptados à confirmação assíncrona e testes existentes executados antes da entrega.

## Próximas melhorias propostas

1. Identidade externa estável (origem + ID da pesquisa) associada ao ID interno, para actualizações sucessivas do stage64 sem repetir associações.
2. Representação explícita de posição, salário e avaliação desconhecidos, separando dados documentais de valores necessários à simulação.
3. Armazenamento de media separado dos registos, mantendo transparência, referências versionadas nos snapshots e exportação portátil com todas as imagens.

O stage64 é um conjunto de dados de jogadores, não uma versão da aplicação nem um backup completo de clubes, fotografias ou carreiras.
