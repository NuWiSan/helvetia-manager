# v11 — movimentos de jogadores e bandeiras

## Modelo de empréstimo

O campo canónico `players[].club` identifica sempre o clube **onde o jogador joga**.

Quando o jogador está emprestado, existe adicionalmente:

```js
player.loan = {
  parentClub,      // ID do clube proprietário
  startDate,       // opcional YYYY-MM-DD
  endDate,         // opcional YYYY-MM-DD
  fee,             // taxa de empréstimo, opcional
  purchaseType,    // Sem opção | Opção de compra | Obrigação de compra
  purchaseFee,     // opcional
  notes            // opcional
}
```

O estado do jogador é `Emprestado`. O Match Engine usa o `club` actual para plantel e elegibilidade; o proprietário é documental e fica disponível para a futura lógica de mercado.

## Histórico de movimentos

Cada alteração de clube pode criar uma entrada em `transferHistory`:

```js
{
  date,
  type,
  fromClub,
  toClub,
  fee,
  notes,
  loan // snapshot das condições, quando aplicável
}
```

Entradas antigas contendo apenas `date`, `fromClub` e `toClub` continuam válidas.

## Bandeiras

As nacionalidades continuam guardadas como texto compatível com versões anteriores. `resolveCountry()` transforma nomes/códigos em código ISO usado para a bandeira.

Na aplicação normal, `countryFlag()` aponta para `flags/<codigo>.svg`. Estes SVG já fazem parte do pacote `dist/flags` e o respectivo `LICENSE.txt` é mantido.

A preview autónoma injecta as mesmas imagens como data URLs antes de carregar `countries.js`, evitando a diferença entre um HTML isolado e o Site publicado.
