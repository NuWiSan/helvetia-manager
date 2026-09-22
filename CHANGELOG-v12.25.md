# Helvetia Manager v12.25 beta

- Corrigida a ordem das camadas: nome, liga e metadados dos clubes ficam acima das imagens e texturas.
- Ícones de fundação, localidade e estádio limitados a 20 × 20 px. A dimensão implícita dos SVG provocava cartões e fichas excessivamente altos.
- Ficha do clube com largura de 1120 px no desktop, limitada ao ecrã, e cabeçalho com altura mínima controlada. Adaptação a ecrãs pequenos preservada.
- Ondas, emblemas, imagens, cores, enquadramento e dados existentes preservados.
- Teste de regressão para camadas do texto, tamanho dos ícones e largura da ficha.
- Código completo disponibilizado no repositório GitHub criado pelo utilizador; backups e dados do navegador não são enviados.

Importação completa com reconciliação de IDs continua pendente. Não é necessário fornecer um JSON de testes para desenvolver esta funcionalidade: a futura revisão pode comparar com a Mestre aberta. O importador desta versão mantém o limite de 200 alterações e exige NOVO para novos registos.

Verificação: testes automatizados; sem captura visual de navegador nesta passagem.
