# Stage64 e media — proposta de integração

O ficheiro helvetia-players-real-v2-stage64.csv contém 1943 registos de jogadores nas 20 colunas documentais existentes. Não inclui fotografias nem uma base completa de clubes ou carreiras. Os IDs de club devem referir os clubes correctos na Mestre de destino.

## Utilização como ponto de partida

Uma inicialização dedicada poderá criar a população de jogadores a partir deste conjunto, preservando os IDs de origem quando não houver conflitos e mantendo os outros dados da Mestre. Deve ser uma escolha explícita com revisão, backup e isolamento das carreiras. Não substituir silenciosamente jogadores já guardados quando se publica uma versão da aplicação.

O importador v12.28 permite rever o ficheiro completo: IDs desconhecidos exigem decisão; criações recebem IDs internos novos, indicados na revisão. Depois de uma importação, exportar o CSV da aplicação conserva esses IDs internos. A associação persistente entre ID de pesquisa e ID interno ainda não existe: importar novamente a lista externa exige nova revisão.

O stage64 tem 10 posições vazias. Devem ser verificadas ou essas linhas ignoradas nesta fase; não escolher MED por predefinição documental. Datas e estados equivalentes podem ser normalizados sem inventar informação. Os valores técnicos iniciais exigidos pelo jogo (qualidade e salário) não são confirmação de dados reais; é necessário evoluir a representação de desconhecidos antes de distribuir o stage64 como base inicial automática.

## Media: próxima etapa, não implementada nesta versão

- Escolha manual da imagem no editor; organização automática por tipo e identidade permanente da entidade, sem depender do clube onde o jogador joga.
- Validação e optimização com transparência preservada (WebP/PNG), sem remover fundos brancos que fazem parte da imagem original.
- Blobs de imagem no IndexedDB, separados dos registos. Referências estáveis/versionadas; uma fotografia alterada na Mestre não deve alterar uma carreira já iniciada.
- Migração compatível das imagens actuais e manutenção dos seus enquadramentos.
- Pacote portátil com dados, manifesto e media; um CSV sozinho nunca é um backup completo.
- Limpeza de imagens apenas após verificar referências da Mestre, carreiras e backups.
- Armazenamento local não é sincronização entre dispositivos. Uma galeria partilhada entre dispositivos requer uma etapa de armazenamento remoto com controlo de acesso.

GitHub guarda o código, não deve receber automaticamente fotografias ou backups da base do utilizador.
