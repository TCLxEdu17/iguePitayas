import Dexie, { type Table } from 'dexie'

export interface LocalActivity {
  localId:     string
  plotId:      string
  userId:      string
  date:        string
  type:        string
  responsible: string
  quantity?:   number
  unit?:       string
  cost?:       number
  notes?:      string
  confirmed:   boolean
  syncStatus:  'PENDING' | 'SYNCED' | 'CONFLICT'
  createdAt:   string
}

export interface LocalHarvest {
  localId:      string
  plotId:       string
  userId:       string
  date:         string
  quantity:     number
  unit:         string
  pricePerUnit: number
  totalRevenue: number
  notes?:       string
  syncStatus:   'PENDING' | 'SYNCED' | 'CONFLICT'
  createdAt:    string
}

export interface LocalPlot {
  id:          string
  siteId:      string | null
  farmId:      string
  code:        string
  name:        string
  area:        number | null
  productType: string | null
  status:      string
  polygon:     { x: number; y: number }[] | null
  notes:       string | null
}

export interface LocalSite {
  id:          string
  farmId:      string
  name:        string
  mapImageUrl: string | null
  plots:       LocalPlot[]
  cachedAt:    number
}

class OfflineDatabase extends Dexie {
  activities!: Table<LocalActivity>
  harvests!:   Table<LocalHarvest>
  sites!:      Table<LocalSite>

  constructor() {
    super('iguebananas-offline')
    this.version(1).stores({
      activities: 'localId, plotId, date, syncStatus',
      harvests:   'localId, plotId, date, syncStatus',
    })
    this.version(2).stores({
      activities: 'localId, plotId, date, syncStatus',
      harvests:   'localId, plotId, date, syncStatus',
      sites:      'id, farmId',
    })
  }
}

export const offlineDb = new OfflineDatabase()
