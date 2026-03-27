import Dexie, { type Table } from 'dexie'

export interface LocalActivity {
  localId:     string
  plotId:      string
  userId:      string
  date:        string   // ISO string
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

class OfflineDatabase extends Dexie {
  activities!: Table<LocalActivity>
  harvests!:   Table<LocalHarvest>

  constructor() {
    super('iguebananas-offline')
    this.version(1).stores({
      activities: 'localId, plotId, date, syncStatus',
      harvests:   'localId, plotId, date, syncStatus',
    })
  }
}

export const offlineDb = new OfflineDatabase()
