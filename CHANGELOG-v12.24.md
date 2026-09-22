# Helvetia Manager v12.24 beta

- Recuperação obrigatória quando a Mestre guardada é inválida: os dados de demonstração deixam de aparecer como se fossem a base do utilizador. A cópia original permanece guardada e exportável.
- Recuperação mostra o local de armazenamento, contagens de registos e o motivo de validação. O site e um HTML local não partilham necessariamente os mesmos dados.
- Backups protegidos, conservados para além das cinco cópias automáticas rotativas. Botão para criar backup protegido e solicitar download JSON.
- Substituir uma Mestre por JSON guarda o backup e a nova base na mesma transacção; falhas de armazenamento ou conflitos bloqueiam a substituição.
- Limpar Base Mestre exige backup protegido, confirmação de download e a palavra APAGAR. Remove todos os registos da Mestre; preserva carreiras e backups.
- A validação documental aceita uma Mestre vazia ou com ligas incompletas. A criação de carreiras conserva a validação estrita da composição das ligas. O motor de simulação não foi alterado.
- Removido o botão duplicado de exportar JSON no painel; a exportação permanece no cabeçalho.
- Versão identificada como beta no ecrã inicial e na barra lateral.
- Testes de recuperação, limpeza, backup, rotação, falha atómica, recarregamento, importação numa base vazia e isolamento de carreiras.

## Limitações e próximos passos

- A causa concreta dos dados em falta no navegador do utilizador ainda depende da análise da sua cópia JSON. Não foi efectuada qualquer limpeza nos dados do utilizador.
- O navegador decide a pasta de download. A aplicação indica o nome do ficheiro, mas não pode comprovar que o download terminou; exige confirmação do utilizador antes de apagar.
- O limite CSV de 200 registos alterados e a correspondência por ID interno mantêm-se. Reconciliação de IDs externos e importações maiores ficam para uma alteração própria, com revisão de conflitos.
- Ligação GitHub confirmada, mas sem repositórios acessíveis nem operação de criação de repositórios exposta. Ainda não foi criada uma cópia no GitHub do utilizador.
- Verificação automatizada; sem inspecção visual num navegador nesta passagem.
