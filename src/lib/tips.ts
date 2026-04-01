export type Tip = {
  tipo:        'banana' | 'pitaya'
  titulo:      string
  dica:        string
  curiosidade: string
}

export const TIPS: Tip[] = [
  // === BANANA (20 dicas) ===
  {
    tipo: 'banana',
    titulo: 'Irrigação na seca',
    dica: 'Irrigue a cada 3–4 dias em períodos sem chuva. A banana precisa de 25–30 mm de água por semana para produção plena.',
    curiosidade: 'A bananeira absorve água principalmente pelas raízes superficiais, que chegam a 30 cm de profundidade.',
  },
  {
    tipo: 'banana',
    titulo: 'Desbaste de filhotes',
    dica: 'Mantenha apenas 1 filhote por planta-mãe. Retire os excedentes com facão no nível do solo para não esgotar a touceira.',
    curiosidade: 'Uma touceira bem manejada produz por décadas. O filhote correto é o "chifre", de folha lanceolada estreita.',
  },
  {
    tipo: 'banana',
    titulo: 'Adubação nitrogenada',
    dica: 'Aplique 200–300 g de ureia por planta a cada 2 meses, enterrada a 20 cm de profundidade e a 30 cm do pseudocaule.',
    curiosidade: 'O nitrogênio é o nutriente mais exigido pela bananeira — responsável pelo crescimento vigoroso das folhas e do cacho.',
  },
  {
    tipo: 'banana',
    titulo: 'Cobertura morta',
    dica: 'Coloque palha ou folhas secas ao redor da planta para conservar umidade e reduzir capinas. Camada de 10 cm é suficiente.',
    curiosidade: 'A cobertura morta pode reduzir a evapotranspiração em até 40%, economizando água de irrigação.',
  },
  {
    tipo: 'banana',
    titulo: 'Controle do Mal-do-Panamá',
    dica: 'Não replante banana em área onde o Mal-do-Panamá já ocorreu. Use mudas certificadas livres de Fusarium oxysporum.',
    curiosidade: 'O fungo Fusarium pode sobreviver no solo por mais de 30 anos, tornando o terreno inviável para bananicultura convencional.',
  },
  {
    tipo: 'banana',
    titulo: 'Escoramento do cacho',
    dica: 'Quando o cacho estiver se formando, use bambu ou estacas para apoiar o pseudocaule. Evita tombamento com vento.',
    curiosidade: 'Um cacho de banana Prata pode pesar de 15 a 35 kg. O peso concentrado no topo exige suporte em solos úmidos.',
  },
  {
    tipo: 'banana',
    titulo: 'Poda de folhas secas',
    dica: 'Retire folhas secas ou danificadas semanalmente. Elas são focos de doenças fúngicas como a Sigatoka.',
    curiosidade: 'A Sigatoka Negra pode destruir até 50% da capacidade fotossintética da planta se as folhas infectadas não forem removidas.',
  },
  {
    tipo: 'banana',
    titulo: 'Época de plantio',
    dica: 'Plante no início da estação chuvosa (outubro–novembro no Centro-Oeste). O pegamento é melhor com solo úmido.',
    curiosidade: 'A bananeira leva de 9 a 15 meses para produzir o primeiro cacho, dependendo da variedade e clima.',
  },
  {
    tipo: 'banana',
    titulo: 'Espaçamento para Prata',
    dica: 'Use espaçamento 3×2 m (3 m entre linhas, 2 m entre plantas) para Banana Prata. Isso permite 1.666 plantas/hectare.',
    curiosidade: 'O espaçamento adequado melhora a circulação de ar, reduzindo a incidência de fungos e facilitando a colheita.',
  },
  {
    tipo: 'banana',
    titulo: 'Colheita no ponto certo',
    dica: 'Colha quando as quinas dos dedos começarem a se arredondar. Não espere amarelecer — a banana amadurece após a colheita.',
    curiosidade: 'A banana libera etileno naturalmente durante o amadurecimento, o que acelera o processo das frutas ao redor.',
  },
  {
    tipo: 'banana',
    titulo: 'Potássio para qualidade',
    dica: 'Aplique 300–400 g de cloreto de potássio por planta ao ano. O potássio melhora tamanho, sabor e resistência dos frutos.',
    curiosidade: 'A banana é uma das melhores fontes alimentares de potássio: um dedo médio tem cerca de 422 mg do mineral.',
  },
  {
    tipo: 'banana',
    titulo: 'pH do solo ideal',
    dica: 'Mantenha o pH do solo entre 5,5 e 7,0. Aplique calcário dolomítico se o pH estiver abaixo de 5,5.',
    curiosidade: 'Solo ácido demais reduz a absorção de fósforo e cálcio, prejudicando o desenvolvimento do sistema radicular.',
  },
  {
    tipo: 'banana',
    titulo: 'Proteção contra vento',
    dica: 'Plante quebra-ventos (como bambu ou cana) nas bordas do talhão. Ventos acima de 50 km/h tombam plantas pesadas.',
    curiosidade: 'O pseudocaule da bananeira não é um caule verdadeiro — é formado pelas bainhas das folhas sobrepostas, sendo frágil a ventos fortes.',
  },
  {
    tipo: 'banana',
    titulo: 'Ensacamento do cacho',
    dica: 'Ensaque o cacho com saco plástico perfurado ou tnt azul logo após a "irmã" (última penca) se abrir. Protege de insetos e frio.',
    curiosidade: 'O ensacamento pode aumentar o peso do cacho em até 10% e melhorar a uniformidade da coloração dos dedos.',
  },
  {
    tipo: 'banana',
    titulo: 'Desfolha seletiva',
    dica: 'Retire as folhas que ensombram o cacho. Luz direta no cacho acelera o desenvolvimento e uniformiza as pencas.',
    curiosidade: 'Cada folha produzida pela bananeira está diretamente ligada ao número de pencas que o cacho terá.',
  },
  {
    tipo: 'banana',
    titulo: 'Monitoramento da Sigatoka',
    dica: 'Inspecione as folhas semanalmente. Manchas amarelas com bordas marrons = Sigatoka Amarela; manchas negras = Sigatoka Negra. Aplique fungicida preventivo.',
    curiosidade: 'A Sigatoka Negra chegou ao Brasil em 1998 e hoje é a principal doença fúngica da bananicultura nacional.',
  },
  {
    tipo: 'banana',
    titulo: 'Retirada da coração',
    dica: 'Retire o "coração" (inflorescência masculina) após a última penca se abrir. Evita drenagem de energia da planta para o cacho.',
    curiosidade: 'O coração da bananeira é comestível e muito apreciado na culinária nordestina do Brasil.',
  },
  {
    tipo: 'banana',
    titulo: 'Banana Nanica vs Prata',
    dica: 'Nanica exige mais água e tem ciclo mais curto (9–11 meses). Prata tolera períodos de seca e produz cachos maiores.',
    curiosidade: 'A Banana Prata é a variedade mais consumida no Brasil, responsável por mais de 50% da produção nacional.',
  },
  {
    tipo: 'banana',
    titulo: 'Análise de solo anual',
    dica: 'Faça análise de solo a cada 12 meses. Corrija deficiências antes que apareçam sintomas visuais nas plantas.',
    curiosidade: 'A bananeira extrai cerca de 600 kg de potássio, 100 kg de nitrogênio e 50 kg de fósforo por hectare ao ano.',
  },
  {
    tipo: 'banana',
    titulo: 'Controle de Moko',
    dica: 'Se uma planta murchar repentinamente sem motivo aparente, suspeite do Moko (Ralstonia). Isole e elimine imediatamente com cal.',
    curiosidade: 'O Moko é uma das doenças bacterianas mais devastadoras da banana — não tem cura e se espalha por ferramentas contaminadas.',
  },

  // === PITAYA (20 dicas) ===
  {
    tipo: 'pitaya',
    titulo: 'Suporte adequado',
    dica: 'Use mourões de concreto ou eucalipto de 2 m de altura com disco de pneu no topo. Cada planta precisa de suporte firme para subir.',
    curiosidade: 'A pitaya é um cacto trepador. Na natureza, sobe em árvores e rochas usando raízes aéreas.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Irrigação na floração',
    dica: 'Aumente a irrigação 45 dias antes da floração desejada (geralmente setembro). A diferença de temperatura noite/dia estimula o florescimento.',
    curiosidade: 'A flor da pitaya abre apenas à noite e dura menos de 24 horas. A polinização é feita por morcegos e mariposas.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Poda de formação',
    dica: 'Deixe apenas 3–4 ramos primários por planta no primeiro ano. Cada ramo primário gera os secundários que vão frutificar.',
    curiosidade: 'Uma pitaya bem podada pode produzir de 20 a 40 frutos por planta por ciclo, com peso médio de 300 g cada.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Adubação orgânica',
    dica: 'Aplique 5–10 kg de esterco curtido por planta aos 6 meses. A pitaya responde muito bem à matéria orgânica no solo.',
    curiosidade: 'A pitaya armazena água em seus cladódios (ramos achatados), o que a torna resistente a até 3 semanas sem chuva.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Drenagem do solo',
    dica: 'Plante em solo bem drenado. A pitaya é sensível ao encharcamento — raízes ficam apodrecidas em solo compactado úmido.',
    curiosidade: 'Sendo um cacto, a pitaya prefere solo arenoso ou areno-argiloso com boa permeabilidade.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Polinização manual',
    dica: 'Para aumentar o pegamento de frutos, faça polinização manual das flores à noite: use pincel para transferir pólen entre flores.',
    curiosidade: 'A pitaya vermelha (Hylocereus undatus) é autoincompatível — precisa de pólen de outra planta para frutificar bem.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Espaçamento ideal',
    dica: 'Plante com 3×3 m (1.100 plantas/hectare) para boa circulação de ar e entrada de luz. Espaçamento menor dificulta a colheita.',
    curiosidade: 'O Brasil é o maior produtor mundial de pitaya vermelha de polpa vermelha (Hylocereus costaricensis).',
  },
  {
    tipo: 'pitaya',
    titulo: 'Controle de antracnose',
    dica: 'Aplique fungicida cúprico preventivo no início das chuvas. A antracnose aparece como manchas escuras e encharcadas nos cladódios.',
    curiosidade: 'A antracnose pode causar perda de 30–40% da produção se não controlada, especialmente em anos com muita chuva.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Colheita no ponto',
    dica: 'Colha 30–35 dias após a floração, quando a casca estiver completamente colorida e as brácteas (escamas) ainda firmes.',
    curiosidade: 'A pitaya não amadurece após a colheita. Se colhida verde, permanece sem sabor.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Calagem do solo',
    dica: 'Mantenha pH entre 6,0 e 7,0. A pitaya é sensível à acidez — aplique calcário dolomítico 60 dias antes do plantio.',
    curiosidade: 'O cálcio é fundamental para a pitaya: além do pH, fortalece a estrutura dos cladódios e reduz rachaduras nos frutos.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Proteção contra cochonilha',
    dica: 'Monitore semanalmente a base dos cladódios. Manchas brancas algodonosas = cochonilha. Trate com óleo mineral + detergente neutro.',
    curiosidade: 'A cochonilha da pitaya pode ser vetora do vírus da podridão-de-cladódio, que não tem cura.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Indução de floração',
    dica: 'Reduza a irrigação por 15 dias, depois irrigue abundantemente. O estresse hídrico controlado pode induzir floração fora de época.',
    curiosidade: 'A pitaya pode produzir de 4 a 6 safras por ano em regiões tropicais com manejo correto de irrigação.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Raleio de frutos',
    dica: 'Deixe no máximo 3–4 frutos por ramo. O raleio aumenta o peso individual dos frutos e melhora a qualidade.',
    curiosidade: 'Frutos raleados chegam facilmente a 500–700 g, quase o dobro do peso de frutos sem raleio.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Luminosidade necessária',
    dica: 'A pitaya precisa de pleno sol (6+ horas). Sombra reduz a floração e favorece o desenvolvimento de fungos.',
    curiosidade: 'Apesar de ser um cacto, a pitaya pode se queimar em dias com temperatura acima de 38 °C sem adaptação gradual.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Pitaya amarela',
    dica: 'A pitaya amarela (Selenicereus megalanthus) produz menos mas tem polpa mais doce. Exige suporte mais robusto — ramos são maiores.',
    curiosidade: 'A pitaya amarela é autofértil — uma única planta produz sem precisar de polinização cruzada.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Adubação com potássio',
    dica: 'Aplique 150–200 g de cloreto de potássio por planta por safra. O potássio melhora a coloração e o teor de açúcar dos frutos.',
    curiosidade: 'O alto teor de betalaínas da pitaya vermelha (pigmento natural) é potencializado pela adubação potássica adequada.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Poda de renovação',
    dica: 'A cada 3–4 anos, realize poda severa (renovação). Corte os ramos mais velhos rente ao tronco para estimular novos brotamentos.',
    curiosidade: 'Uma pitaya bem manejada pode produzir por 20 a 30 anos no mesmo local.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Armazenamento pós-colheita',
    dica: 'Armazene a pitaya entre 8–10 °C com umidade relativa de 85–90%. Conserva por até 14 dias sem perda de qualidade.',
    curiosidade: 'A pitaya não deve ser armazenada abaixo de 5 °C — temperaturas muito baixas causam escurecimento da casca.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Plantio por estacas',
    dica: 'Use estacas de 40–60 cm do cladódio mais maduro. Deixe secar por 5–7 dias antes de plantar para evitar podridão.',
    curiosidade: 'A taxa de pegamento de estacas de pitaya pode chegar a 95% quando o corte é feito no nó do cladódio.',
  },
  {
    tipo: 'pitaya',
    titulo: 'Marcação da floração',
    dica: 'Marque com fitilho os botões florais que aparecerem. O fruto colhido no 30° dia após o botão visível terá qualidade máxima.',
    curiosidade: 'Em uma única noite, uma planta pode abrir de 10 a 15 flores. Cada flor tem apenas 1 chance de ser polinizada.',
  },
]

export function getTipOfTheDay(): Tip {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % TIPS.length
  return TIPS[dayIndex]
}
