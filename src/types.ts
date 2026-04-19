export type RawChallenge = {
  completed: boolean
  endDate?: string
  games?: Array<{ gameRefId: number }>
  name: string
  startDate?: string
  type: number
  value1?: number
  value2?: number
}

export type RawGame = {
  bggId?: number
  copies?: RawGameCopy[]
  id: number
  name: string
  minPlayerCount: number
  maxPlayerCount: number
  minPlayTime: number
  maxPlayTime: number
  rating: number
  tags?: Array<{ tagRefId: number }>
  urlImage?: string
  urlThumb?: string
}

export type RawGameCopy = {
  metaData?: string
  statusOwned?: number
}

export type RawLocation = {
  id: number
  name: string
}

export type RawPlayer = {
  id: number
  isAnonymous: boolean
  name: string
}

export type RawPlayPlayer = {
  playerRefId: number
  rank?: number
  score?: string
  winner?: boolean
}

export type RawPlay = {
  comments?: string
  durationMin: number
  gameRefId: number
  locationRefId?: number
  playDate: string
  playDateYmd: number
  playerScores?: RawPlayPlayer[]
}

export type RawTag = {
  id: number
  name: string
}

export type RawData = {
  challenges: RawChallenge[]
  games: RawGame[]
  locations: RawLocation[]
  players: RawPlayer[]
  plays: RawPlay[]
  tags: RawTag[]
}

export type FilterState = {
  endDate: string
  gameId: number | null
  locationId: number | null
  playerCount: number | null
  playerId: number | null
  startDate: string
  tagId: number | null
}

export type EnrichedPlayPlayer = {
  id: number
  name: string
  rank: number | null
  score: string
  winner: boolean
}

export type EnrichedPlay = {
  comments: string
  durationMin: number
  gameId: number
  gameName: string
  locationId: number | null
  locationName: string
  monthKey: string
  playerCount: number
  players: EnrichedPlayPlayer[]
  playDate: string
  playDateYmd: number
  tagIds: number[]
  tagNames: string[]
  year: number
}

export type NormalizedData = {
  challenges: RawChallenge[]
  enrichedPlays: EnrichedPlay[]
  games: RawGame[]
  ownedGames: OwnedGame[]
  locations: RawLocation[]
  players: RawPlayer[]
  tags: RawTag[]
}

export type CountDatum = {
  label: string
  value: number
}

export type XYDatum = {
  x: number
  y: number
  z: number
  label: string
}

export type PairingDatum = {
  playerA: string
  playerB: string
  value: number
}

export type GameRow = {
  averageGroupSize: number
  averagePlayTime: number
  coverImageUrl: string
  hoursPlayed: number
  name: string
  playCount: number
  playerRange: string
  pricePaid: number
  tagNames: string[]
  thumbnailUrl: string
  valueScore: number
}

export type OwnedGame = {
  acquisitionDate: string
  acquisitionYear: string
  bggId: number | null
  coverImageUrl: string
  name: string
  pricePaid: number
  rating: number
  tagNames: string[]
  thumbnailUrl: string
}

export type PlayerInsight = {
  favoriteGames: CountDatum[]
  mostCommonPartners: CountDatum[]
  monthlyActivity: CountDatum[]
  playerName: string
  plays: number
  preferredTags: CountDatum[]
  venueMix: CountDatum[]
  winRate: number
  wins: number
}

export type ChallengeInsight = {
  completionRatio: number
  name: string
  progress: number
  startDate: string
  endDate: string
  target: number
  status: string
}

export type HeatmapCell = {
  count: number
  intensity: number
  label: string
}

export type HeatmapRow = {
  cells: HeatmapCell[]
  label: string
}

export type RecurringTable = {
  players: string[]
  value: number
}

export type NetworkNode = {
  id: string
  value: number
  x: number
  y: number
}

export type NetworkEdge = {
  source: string
  target: string
  value: number
}

export type Recommendation = {
  averageGroupSize: number
  coverImageUrl: string
  fitScore: number
  name: string
  playCount: number
  reasons: string[]
  thumbnailUrl: string
}

export type GroupRecommendation = {
  fitScore: number
  games: CountDatum[]
  players: string[]
  value: number
}

export type CollectionInsight = {
  acquisitionDate: string
  bggId: number | null
  coverImageUrl: string
  costPerHour: number | null
  costPerPlay: number | null
  daysToFirstPlay: number | null
  firstPlayDate: string
  hoursPlayed: number
  name: string
  playCount: number
  pricePaid: number
  rating: number
  thumbnailUrl: string
  valueScore: number
}

export type YearlyDiversityDatum = {
  label: string
  plays: number
  uniqueGames: number
}

export type CalendarDay = {
  count: number
  date: string
  intensity: number
  week: number
  weekday: number
}

export type CalendarYear = {
  days: CalendarDay[]
  label: string
  months: Array<{ label: string; week: number }>
}

export type CollectionEconomicsDatum = {
  costPerPlay: number
  hours: number
  label: string
  plays: number
  spend: number
}

export type DashboardMetrics = {
  calendarHeatmap: CalendarYear[]
  challengeInsights: ChallengeInsight[]
  collectionCallouts: Array<{ label: string; note: string; value: string }>
  collectionInsights: CollectionInsight[]
  collectionRoiByYear: CollectionEconomicsDatum[]
  collectionStats: Array<{ label: string; value: string; note: string }>
  durationBuckets: CountDatum[]
  filteredPlays: EnrichedPlay[]
  gameRows: GameRow[]
  gameScatter: XYDatum[]
  interestingFacts: string[]
  keyStats: Array<{ label: string; value: string; note: string }>
  monthlyHeatmap: HeatmapRow[]
  monthlyActivity: CountDatum[]
  networkEdges: NetworkEdge[]
  networkNodes: NetworkNode[]
  pairings: PairingDatum[]
  playerGroupSizes: CountDatum[]
  playerInsights: PlayerInsight[]
  priceByYear: CountDatum[]
  recommendations: Recommendation[]
  recurringTables: RecurringTable[]
  recurringTableGameMix: GroupRecommendation[]
  spendByTag: CountDatum[]
  tagBreakdown: CountDatum[]
  topGames: CountDatum[]
  topLocations: CountDatum[]
  topPlayers: CountDatum[]
  venueShare: CountDatum[]
  weekdayActivity: CountDatum[]
  yearlyDiversity: YearlyDiversityDatum[]
  yearlyActivity: CountDatum[]
}
