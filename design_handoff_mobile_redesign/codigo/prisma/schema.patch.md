# Patch do schema

```prisma
enum Unit {
  KG
  CAIXA
  CACHO
  PENCA
  DUZIA
  UNIDADE
  SACO
  TONELADA
}

enum ActivityType {
  PULVERIZACAO
  ADUBACAO
  ROCAGEM
  DESFOLHA
  DESBASTE
  ENSACAMENTO
  ESCORA
  IRRIGACAO
  RETIRADA_BANANA
  RETIRADA_CAIXAS
  PLANTIO
  OUTRO
}
```

Migration de dados (os registros antigos só usavam CAIXA/UNIDADE, então nada a converter).

Novo campo, para o operador não ver preço mas a receita continuar sendo calculada:

```prisma
model ProductPrice {
  id          String      @id @default(cuid())
  productType ProductType
  unit        Unit
  price       Float
  updatedAt   DateTime    @updatedAt

  @@unique([productType, unit])
}
```

Em `Harvest`, `pricePerUnit` e `totalRevenue` passam a ser preenchidos no servidor
(a partir de `ProductPrice`) e nunca vêm do cliente quando o papel é OPERATOR.
