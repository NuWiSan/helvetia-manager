# v12.1 — Optimização automática de imagens

- Removida a rejeição de fotos de jogadores acima de 1 MB.
- Fotografias, logótipos, estádios e troféus usam o mesmo optimizador.
- Não há limite de bytes imposto ao original; a imagem tem de ser descodificável
  pelo navegador. Protecção de memória: até 80 megapíxeis.
- Retratos: até 768 px no lado maior, objectivo de 350 KB.
- Logótipos/troféus: até 512 px, objectivo de 180 KB.
- Estádios: até 1280 px, objectivo de 500 KB.
- PNG pequeno conservado sem perdas; fotografias maiores comprimidas em WebP.
  A transparência é preservada; se não houver codificação WebP, reduz-se o PNG.
- Proporção original mantida e imagens pequenas não são ampliadas.
- Os objectivos de tamanho dizem respeito à imagem binária; a representação
  base64 na base de dados ocupa aproximadamente mais um terço.
- Guardar fica bloqueado enquanto a foto está a ser preparada. Remover ou
  substituir uma foto invalida carregamentos anteriores ainda em curso.
- As imagens já guardadas e as funcionalidades da v12 são preservadas.

Verificação: node tests/image-optimization.cjs e npm run test:v12.
