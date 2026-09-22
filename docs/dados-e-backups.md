# Dados, backups e actualizações — beta

## Se os dados parecerem desaparecer

Abra o mesmo endereço, navegador e perfil em que fez as edições. O ficheiro HTML descarregado é uma aplicação local e não deve ser usado como se partilhasse automaticamente os dados do site. A actualização do código não transporta os dados entre dispositivos.

Abra **Recuperação**. Consulte as contagens e exporte **a cópia guardada**, mesmo que a aplicação diga que não a consegue abrir. Consulte também as cópias anteriores. Não limpe os dados do navegador para tentar resolver este problema. Envie a cópia JSON para diagnóstico se continuar sem conseguir recuperá-la.

## Backup completo

JSON contém a Mestre e as imagens. CSV é uma ferramenta de edição/importação; não é um backup completo. Carreiras têm exportação própria.

Em Recuperação, **Criar backup protegido e descarregar** guarda uma cópia que não entra na rotação das cinco cópias automáticas. O download é solicitado separadamente. Confirme o ficheiro na pasta definida pelo navegador. Uma cópia apenas no navegador desaparece se apagar o armazenamento desse navegador.

**Limpar Base Mestre** exige este backup e uma confirmação explícita. Não apaga carreiras nem backups. Uma base vazia pode receber clubes e jogadores por CSV. Enquanto as ligas estiverem incompletas, a criação de carreira é recusada. A importação de novos clubes continua a colocá-los fora das ligas profissionais; a configuração de uma carreira é uma operação separada.

## Listas CSV actualizadas

Exporte os IDs da própria base e conserve-os entre actualizações. Os IDs de outra base não são automaticamente equivalentes. A importação de jogadores apresenta existentes, novos/IDs desconhecidos, duvidosos e inválidos. Escolha criar, associar a um ID da Mestre ou ignorar. Conflitos e repetições exigem decisão. Depois reveja as diferenças e confirme a gravação. Campos vazios preservam informação existente; a omissão de uma linha não elimina registos.

Jogadores: até 5000 linhas e 5 MB, processados em lotes de 50 e revistos em páginas de 25, sem o limite anterior de 200 alterações. Outras categorias CSV e edição em massa mantêm os seus limites. Datas DD/MM/AAAA e DD.MM.AAAA são normalizadas e validadas. A confirmação guarda uma cópia protegida da Mestre anterior em Recuperação, neste navegador; não é um download automático.

A associação persistente de origem + ID externo ao ID interno estável ainda é uma evolução prevista. Até lá, um novo registo recebe o ID interno mostrado na revisão: exporte depois o CSV da aplicação para conservar esses IDs. Nomes correspondentes são apenas sugestões: pode haver homónimos. Fotografias e informação manual fora do CSV são preservadas. Importar regularmente listas é uma boa estratégia com identificação estável, validação e backup.

## GitHub

Código e dados são coisas distintas. GitHub permite consultar o código, versões e alterações. Não guarda automaticamente os dados que editou no navegador.

O repositório https://github.com/NuWiSan/helvetia-manager foi criado pelo utilizador como público. Contém o código beta. As alterações no GitHub não são publicadas automaticamente no site. Não colocar backups pessoais, credenciais, node_modules ou bases reais no repositório por defeito. O ZIP inclui o código completo e testes; dist contém a aplicação estática, sem compilação. npm ci e npm test permitem verificar o código.

Se a base contém apenas testes descartáveis, não é necessário enviar um backup para desenvolver o importador. A revisão compara o CSV com a Mestre aberta no próprio navegador. A protecção automática antes de limpar continua activa. Consulte também [stage64 e media](stage64-e-media.md).
