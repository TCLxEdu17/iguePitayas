# `POST /api/harvests` — mudança obrigatória

O cliente **não** envia mais `pricePerUnit` nem `totalRevenue`.
O servidor resolve o preço e calcula a receita:

```ts
const price = await prisma.productPrice.findUnique({
  where: { productType_unit: { productType: body.productType, unit: body.unit } },
})
const pricePerUnit = price?.price ?? 0

const harvest = await prisma.harvest.create({
  data: {
    ...rest,
    pricePerUnit,
    totalRevenue: body.quantity * pricePerUnit,
    syncStatus: 'SYNCED',
  },
})
```

Se o payload vier com `pricePerUnit`/`totalRevenue`, ignore os campos (não confie no cliente).
