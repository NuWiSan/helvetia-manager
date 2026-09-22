# Helvetia Manager v12.22 — integrar a maquete aprovada

- Substituída a onda simplificada da v12.21 pelas cinco camadas SVG do exemplo enviado: cor, suavização, brilho, linha e onda secundária.
- Novo módulo partilhado `card-identity.js`: o mesmo fundo, textura e emblema grande em marca de água nos clubes sem estádio, jogadores e staff.
- A janela do clube e o cartão da lista usam a mesma apresentação, com a mesma escolha de cores e imagem.
- Fotografia do estádio ocupa o cartão e conserva o enquadramento guardado; ondas e emblema de fundo são usados apenas quando não existe fotografia do estádio. Fotografias dos jogadores e staff continuam sobre o fundo comum.
- Moldura fina em degradé, identidade cromática principal/secundária, emblema maior e metadados alinhados. Ano de fundação sob o nome, quando preenchido.
- Preservadas as proporções dos cromos, raridades, AVG, internacionalizações, bandeiras de nacionalidade e enquadramento das fotografias.
- Não adicionadas bandeiras decorativas do país do clube.
- Eliminada a implementação anterior da onda em máscara CSS; camadas explícitas impedem que o fundo tape as ondas.
- Modelo de dados, persistência, carreira, importadores e motor do jogo sem alterações.

Validação: suite existente e teste de integração para clubes com/sem fotografia e emblema, ficha do clube, cromos da lista/editor e staff. Pré-visualização HTML autónoma inclui o módulo e os estilos. Sem validação visual num navegador nesta sessão.
