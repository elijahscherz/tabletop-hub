import rawData from '../../boardgame_data.json'
import type {
  CalendarYear,
  CollectionEconomicsDatum,
  CollectionInsight,
  DashboardMetrics,
  EnrichedPlay,
  FilterState,
  GameRow,
  GroupRecommendation,
  HeatmapRow,
  NetworkEdge,
  NetworkNode,
  NormalizedData,
  OwnedGame,
  PairingDatum,
  PlayerInsight,
  RawChallenge,
  RawData,
  Recommendation,
  RecurringTable,
  XYDatum,
} from '../types'

const data = rawData as RawData

export const defaultFilters: FilterState = {
  endDate: '',
  gameId: null,
  locationId: null,
  playerCount: null,
  playerId: null,
  startDate: '',
  tagId: null,
}

function toMonthKey(playDateYmd: number) {
  const raw = String(playDateYmd)
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}`
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function sortCountData(map: Map<string, number>, limit?: number) {
  const values = [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label, value]) => ({ label, value }))

  return typeof limit === 'number' ? values.slice(0, limit) : values
}

function parsePlayDate(playDateYmd: number) {
  const raw = String(playDateYmd)
  const year = Number(raw.slice(0, 4))
  const monthIndex = Number(raw.slice(4, 6)) - 1
  const day = Number(raw.slice(6, 8))
  return new Date(Date.UTC(year, monthIndex, day))
}

function parseJsonRecord(value?: string) {
  if (!value) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function parsePrice(value: unknown) {
  if (typeof value !== 'string' || value.trim() === '') {
    return 0
  }

  const price = Number.parseFloat(value)
  return Number.isFinite(price) ? price : 0
}

function differenceInDays(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) {
    return null
  }

  const from = new Date(`${fromDate}T00:00:00Z`)
  const to = new Date(`${toDate.slice(0, 10)}T00:00:00Z`)
  const diffMs = to.getTime() - from.getTime()

  if (!Number.isFinite(diffMs)) {
    return null
  }

  return Math.max(0, Math.round(diffMs / 86400000))
}

function buildMonthlyHeatmap(monthMap: Map<string, number>) {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const years = [...new Set([...monthMap.keys()].map((key) => key.slice(0, 4)))].sort()
  const maxValue = Math.max(...monthMap.values(), 1)

  return years.map<HeatmapRow>((year) => ({
    cells: monthLabels.map((monthLabel, index) => {
      const key = `${year}-${String(index + 1).padStart(2, '0')}`
      const count = monthMap.get(key) ?? 0
      return {
        count,
        intensity: maxValue === 0 ? 0 : Math.round((count / maxValue) * 100),
        label: `${monthLabel} ${year}`,
      }
    }),
    label: year,
  }))
}

function buildCalendarHeatmap(plays: EnrichedPlay[]) {
  const byDate = new Map<string, number>()

  for (const play of plays) {
    const date = play.playDate.slice(0, 10)
    byDate.set(date, (byDate.get(date) ?? 0) + 1)
  }

  const years = [...new Set([...byDate.keys()].map((date) => date.slice(0, 4)))].sort()
  const maxCount = Math.max(...byDate.values(), 1)

  return years.map<CalendarYear>((year) => {
    const start = new Date(`${year}-01-01T00:00:00Z`)
    const end = new Date(`${year}-12-31T00:00:00Z`)
    const days = []

    for (let current = new Date(start); current <= end; current.setUTCDate(current.getUTCDate() + 1)) {
      const date = current.toISOString().slice(0, 10)
      const count = byDate.get(date) ?? 0
      const week = Math.floor((current.getTime() - start.getTime()) / 86400000 / 7)

      days.push({
        count,
        date,
        intensity: maxCount === 0 ? 0 : Math.round((count / maxCount) * 100),
        week,
        weekday: current.getUTCDay(),
      })
    }

    return { days, label: year }
  })
}

function buildChallengeInsight(challenge: RawChallenge, plays: EnrichedPlay[]) {
  const scopedPlays = plays.filter((play) => {
    if (challenge.startDate) {
      const start = Number(challenge.startDate.slice(0, 10).replaceAll('-', ''))
      if (play.playDateYmd < start) {
        return false
      }
    }

    if (challenge.endDate) {
      const end = Number(challenge.endDate.slice(0, 10).replaceAll('-', ''))
      if (play.playDateYmd > end) {
        return false
      }
    }

    if (challenge.games && challenge.games.length > 0) {
      const allowedGameIds = new Set(challenge.games.map((game) => game.gameRefId))
      return allowedGameIds.has(play.gameId)
    }

    return true
  })

  const target = challenge.value2 ?? challenge.games?.length ?? 0
  const progress = scopedPlays.length
  const status = challenge.completed
    ? 'Completed'
    : target > 0
      ? `${progress}/${target}`
      : `${progress} plays tracked`

  return {
    completionRatio: target > 0 ? progress / target : 0,
    name: challenge.name,
    progress,
    startDate: challenge.startDate?.slice(0, 10) ?? 'Unknown',
    endDate: challenge.endDate?.slice(0, 10) ?? 'Open ended',
    target,
    status,
  }
}

export function normalizeData(): NormalizedData {
  const gameNames = new Map(data.games.map((game) => [game.id, game.name]))
  const locationNames = new Map(data.locations.map((location) => [location.id, location.name]))
  const playerNames = new Map(data.players.map((player) => [player.id, player.name]))
  const tagNames = new Map(data.tags.map((tag) => [tag.id, tag.name]))
  const gameTags = new Map(
    data.games.map((game) => [
      game.id,
      (game.tags ?? []).map((tag) => tag.tagRefId).filter((tagId) => tagNames.has(tagId)),
    ]),
  )

  const enrichedPlays = data.plays.map<EnrichedPlay>((play) => {
    const year = Number(String(play.playDateYmd).slice(0, 4))
    const tagIds = gameTags.get(play.gameRefId) ?? []

    return {
      comments: play.comments ?? '',
      durationMin: play.durationMin,
      gameId: play.gameRefId,
      gameName: gameNames.get(play.gameRefId) ?? 'Unknown game',
      locationId: play.locationRefId ?? null,
      locationName: locationNames.get(play.locationRefId ?? -1) ?? 'Unknown location',
      monthKey: toMonthKey(play.playDateYmd),
      playerCount: play.playerScores?.length ?? 0,
      players: (play.playerScores ?? []).map((player) => ({
        id: player.playerRefId,
        name: playerNames.get(player.playerRefId) ?? 'Unknown player',
        rank: player.rank ?? null,
        score: player.score ?? '',
        winner: Boolean(player.winner),
      })),
      playDate: play.playDate,
      playDateYmd: play.playDateYmd,
      tagIds,
      tagNames: tagIds.map((tagId) => tagNames.get(tagId) ?? 'Unknown tag'),
      year,
    }
  })

  const ownedGames: OwnedGame[] = data.games
    .map((game) => {
      const copyMeta = (game.copies ?? []).map((copy) => ({
        meta: parseJsonRecord(copy.metaData),
        owned: copy.statusOwned === 1,
      }))
      const ownedCopies = copyMeta.filter((copy) => copy.owned)
      const pricePaid = ownedCopies.reduce((sum, copy) => sum + parsePrice(copy.meta.PricePaid), 0)
      const acquisitionDate = ownedCopies
        .map((copy) => (typeof copy.meta.AcquisitionDate === 'string' ? copy.meta.AcquisitionDate : ''))
        .find(Boolean) ?? ''

      return {
        acquisitionDate,
        acquisitionYear: acquisitionDate ? acquisitionDate.slice(0, 4) : 'Unknown',
        coverImageUrl: game.urlImage ?? game.urlThumb ?? '',
        name: game.name,
        pricePaid,
        rating: game.rating,
        tagNames: (game.tags ?? []).map((tag) => tagNames.get(tag.tagRefId) ?? 'Unknown tag'),
        thumbnailUrl: game.urlThumb ?? game.urlImage ?? '',
      }
    })
    .filter((game) => game.pricePaid > 0)

  return {
    challenges: data.challenges,
    enrichedPlays,
    games: data.games,
    ownedGames,
    locations: data.locations,
    players: data.players,
    tags: data.tags,
  }
}

export function applyFilters(plays: EnrichedPlay[], filters: FilterState) {
  const startDate = filters.startDate ? Number(filters.startDate.replaceAll('-', '')) : null
  const endDate = filters.endDate ? Number(filters.endDate.replaceAll('-', '')) : null

  return plays.filter((play) => {
    if (startDate !== null && play.playDateYmd < startDate) {
      return false
    }

    if (endDate !== null && play.playDateYmd > endDate) {
      return false
    }

    if (filters.gameId !== null && play.gameId !== filters.gameId) {
      return false
    }

    if (filters.locationId !== null && play.locationId !== filters.locationId) {
      return false
    }

    if (filters.playerCount !== null && play.playerCount !== filters.playerCount) {
      return false
    }

    if (filters.playerId !== null && !play.players.some((player) => player.id === filters.playerId)) {
      return false
    }

    if (filters.tagId !== null && !play.tagIds.includes(filters.tagId)) {
      return false
    }

    return true
  })
}

export function buildMetrics(normalized: NormalizedData, filters: FilterState): DashboardMetrics {
  const filteredPlays = applyFilters(normalized.enrichedPlays, filters)
  const gamesById = new Map(normalized.games.map((game) => [game.id, game]))
  const firstPlayByGame = new Map<string, string>()
  const spendByTagMap = new Map<string, number>()

  for (const play of normalized.enrichedPlays) {
    const existing = firstPlayByGame.get(play.gameName)
    if (!existing || play.playDate < existing) {
      firstPlayByGame.set(play.gameName, play.playDate)
    }
  }

  const topGamesMap = new Map<string, number>()
  const topLocationsMap = new Map<string, number>()
  const topPlayersMap = new Map<string, number>()
  const tagMap = new Map<string, number>()
  const monthMap = new Map<string, number>()
  const yearMap = new Map<string, number>()
  const playerCountMap = new Map<string, number>()
  const weekdayMap = new Map<string, number>([
    ['Sun', 0],
    ['Mon', 0],
    ['Tue', 0],
    ['Wed', 0],
    ['Thu', 0],
    ['Fri', 0],
    ['Sat', 0],
  ])
  const durationMap = new Map<string, number>([
    ['No duration', 0],
    ['0-30 min', 0],
    ['31-60 min', 0],
    ['61-90 min', 0],
    ['91-150 min', 0],
    ['151+ min', 0],
  ])
  const pairingMap = new Map<string, { players: [string, string]; value: number }>()
  const tableMap = new Map<string, RecurringTable>()
  const tableGameMap = new Map<string, Map<string, number>>()
  const priceByYearMap = new Map<string, number>()
  const perGame = new Map<
    string,
    {
      coverImageUrl: string
      groupSizes: number[]
      plays: number
      totalDurationMinutes: number
      tagNames: string[]
      thumbnailUrl: string
      durations: number[]
      pricePaid: number
    }
  >()
  const diversityMap = new Map<string, Set<number>>()
  const perPlayer = new Map<
    string,
    {
      favoriteGames: Map<string, number>
      tags: Map<string, number>
      locations: Map<string, number>
      partners: Map<string, number>
      monthly: Map<string, number>
      plays: number
      wins: number
    }
  >()

  for (const ownedGame of normalized.ownedGames) {
    priceByYearMap.set(ownedGame.acquisitionYear, (priceByYearMap.get(ownedGame.acquisitionYear) ?? 0) + ownedGame.pricePaid)
    for (const tagName of ownedGame.tagNames) {
      spendByTagMap.set(tagName, (spendByTagMap.get(tagName) ?? 0) + ownedGame.pricePaid)
    }
  }

  for (const play of filteredPlays) {
    topGamesMap.set(play.gameName, (topGamesMap.get(play.gameName) ?? 0) + 1)
    topLocationsMap.set(play.locationName, (topLocationsMap.get(play.locationName) ?? 0) + 1)
    monthMap.set(play.monthKey, (monthMap.get(play.monthKey) ?? 0) + 1)
    yearMap.set(String(play.year), (yearMap.get(String(play.year)) ?? 0) + 1)
    playerCountMap.set(`${play.playerCount} players`, (playerCountMap.get(`${play.playerCount} players`) ?? 0) + 1)
    diversityMap.set(String(play.year), (diversityMap.get(String(play.year)) ?? new Set<number>()).add(play.gameId))

    const weekday = parsePlayDate(play.playDateYmd).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
    })
    weekdayMap.set(weekday, (weekdayMap.get(weekday) ?? 0) + 1)

    if (play.durationMin === 0) {
      durationMap.set('No duration', (durationMap.get('No duration') ?? 0) + 1)
    } else if (play.durationMin <= 30) {
      durationMap.set('0-30 min', (durationMap.get('0-30 min') ?? 0) + 1)
    } else if (play.durationMin <= 60) {
      durationMap.set('31-60 min', (durationMap.get('31-60 min') ?? 0) + 1)
    } else if (play.durationMin <= 90) {
      durationMap.set('61-90 min', (durationMap.get('61-90 min') ?? 0) + 1)
    } else if (play.durationMin <= 150) {
      durationMap.set('91-150 min', (durationMap.get('91-150 min') ?? 0) + 1)
    } else {
      durationMap.set('151+ min', (durationMap.get('151+ min') ?? 0) + 1)
    }

    for (const tagName of play.tagNames) {
      tagMap.set(tagName, (tagMap.get(tagName) ?? 0) + 1)
    }

    const sourceGame = gamesById.get(play.gameId)
    const gameStats = perGame.get(play.gameName) ?? {
      groupSizes: [],
      plays: 0,
      totalDurationMinutes: 0,
      coverImageUrl: sourceGame?.urlImage ?? sourceGame?.urlThumb ?? '',
      tagNames: play.tagNames,
      thumbnailUrl: sourceGame?.urlThumb ?? sourceGame?.urlImage ?? '',
      durations: [],
      pricePaid: normalized.ownedGames.find((game) => game.name === play.gameName)?.pricePaid ?? 0,
    }

    gameStats.groupSizes.push(play.playerCount)
    gameStats.plays += 1
    gameStats.totalDurationMinutes += play.durationMin
    if (play.durationMin > 0) {
      gameStats.durations.push(play.durationMin)
    }
    perGame.set(play.gameName, gameStats)

    for (const player of play.players) {
      topPlayersMap.set(player.name, (topPlayersMap.get(player.name) ?? 0) + 1)

      const playerStats = perPlayer.get(player.name) ?? {
        favoriteGames: new Map<string, number>(),
        locations: new Map<string, number>(),
        monthly: new Map<string, number>(),
        partners: new Map<string, number>(),
        plays: 0,
        tags: new Map<string, number>(),
        wins: 0,
      }

      playerStats.favoriteGames.set(play.gameName, (playerStats.favoriteGames.get(play.gameName) ?? 0) + 1)
      playerStats.locations.set(play.locationName, (playerStats.locations.get(play.locationName) ?? 0) + 1)
      playerStats.monthly.set(play.monthKey, (playerStats.monthly.get(play.monthKey) ?? 0) + 1)
      playerStats.plays += 1
      for (const tagName of play.tagNames) {
        playerStats.tags.set(tagName, (playerStats.tags.get(tagName) ?? 0) + 1)
      }
      if (player.winner) {
        playerStats.wins += 1
      }

      for (const partner of play.players) {
        if (partner.name === player.name) {
          continue
        }
        playerStats.partners.set(partner.name, (playerStats.partners.get(partner.name) ?? 0) + 1)
      }

      perPlayer.set(player.name, playerStats)
    }

    const sortedNames = [...play.players.map((player) => player.name)].sort((left, right) => left.localeCompare(right))
    for (let index = 0; index < sortedNames.length; index += 1) {
      for (let nestedIndex = index + 1; nestedIndex < sortedNames.length; nestedIndex += 1) {
        const playerA = sortedNames[index]!
        const playerB = sortedNames[nestedIndex]!
        const key = `${playerA}:::${playerB}`
        const current = pairingMap.get(key)

        pairingMap.set(key, {
          players: [playerA, playerB],
          value: (current?.value ?? 0) + 1,
        })
      }
    }

    const tablePlayers = [...new Set(play.players.map((player) => player.name))].sort((left, right) => left.localeCompare(right))
    if (tablePlayers.length >= 3) {
      const key = tablePlayers.join(' ::: ')
      const currentTable = tableMap.get(key)
      tableMap.set(key, {
        players: tablePlayers,
        value: (currentTable?.value ?? 0) + 1,
      })

      const gamesForTable = tableGameMap.get(key) ?? new Map<string, number>()
      gamesForTable.set(play.gameName, (gamesForTable.get(play.gameName) ?? 0) + 1)
      tableGameMap.set(key, gamesForTable)
    }
  }

  const topGames = sortCountData(topGamesMap, 10)
  const topLocations = sortCountData(topLocationsMap, 8)
  const topPlayers = sortCountData(topPlayersMap, 10)

  const pairings: PairingDatum[] = [...pairingMap.values()]
    .sort((left, right) => right.value - left.value)
    .slice(0, 12)
    .map((pairing) => ({
      playerA: pairing.players[0],
      playerB: pairing.players[1],
      value: pairing.value,
    }))

  const monthlyActivity = [...monthMap.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({ label, value }))

  const yearlyActivity = [...yearMap.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({ label, value }))

  const yearlyDiversity = [...yearMap.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({
      label,
      plays: value,
      uniqueGames: diversityMap.get(label)?.size ?? 0,
    }))

  const playerGroupSizes = [...playerCountMap.entries()]
    .sort((left, right) => Number.parseInt(left[0], 10) - Number.parseInt(right[0], 10))
    .map(([label, value]) => ({ label, value }))

  const weekdayActivity = [...weekdayMap.entries()].map(([label, value]) => ({ label, value }))
  const durationBuckets = [...durationMap.entries()].map(([label, value]) => ({ label, value }))
  const tagBreakdown = sortCountData(tagMap, 8)
  const venueShare = sortCountData(topLocationsMap, 6)
  const monthlyHeatmap = buildMonthlyHeatmap(monthMap)
  const calendarHeatmap = buildCalendarHeatmap(filteredPlays)
  const recurringTables = [...tableMap.values()]
    .sort((left, right) => right.value - left.value)
    .slice(0, 8)

  const recurringTableGameMix: GroupRecommendation[] = [...tableMap.entries()]
    .map(([key, table]) => ({
      fitScore: table.value,
      games: sortCountData(tableGameMap.get(key) ?? new Map<string, number>(), 3),
      players: table.players,
      value: table.value,
    }))
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, 6)

  const priceByYear = [...priceByYearMap.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }))
  const spendByTag = sortCountData(spendByTagMap, 8).map((entry) => ({
    label: entry.label,
    value: Number(entry.value.toFixed(2)),
  }))

  const gameRows: GameRow[] = [...perGame.entries()]
    .map(([name, stats]) => ({
      averageGroupSize: Number(average(stats.groupSizes).toFixed(1)),
      averagePlayTime: Number(average(stats.durations).toFixed(0)),
      coverImageUrl: stats.coverImageUrl,
      hoursPlayed: Number((stats.totalDurationMinutes / 60).toFixed(1)),
      name,
      playCount: stats.plays,
      playerRange: `${Math.min(...stats.groupSizes)}-${Math.max(...stats.groupSizes)}`,
      pricePaid: Number(stats.pricePaid.toFixed(2)),
      tagNames: stats.tagNames,
      thumbnailUrl: stats.thumbnailUrl,
      valueScore: stats.pricePaid > 0 ? Number((stats.plays / stats.pricePaid).toFixed(2)) : stats.plays,
    }))
    .sort((left, right) => right.playCount - left.playCount)

  const gameScatter: XYDatum[] = gameRows.slice(0, 40).map((game) => ({
    x: game.averageGroupSize,
    y: game.playCount,
    z: Math.max(game.averagePlayTime, 12),
    label: game.name,
  }))

  const playerInsights: PlayerInsight[] = [...perPlayer.entries()]
    .map(([playerName, stats]) => ({
      favoriteGames: [...stats.favoriteGames.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([label, value]) => ({ label, value })),
      monthlyActivity: [...stats.monthly.entries()]
        .sort((left, right) => left[0].localeCompare(right[0]))
        .slice(-6)
        .map(([label, value]) => ({ label, value })),
      mostCommonPartners: [...stats.partners.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([label, value]) => ({ label, value })),
      playerName,
      plays: stats.plays,
      preferredTags: [...stats.tags.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([label, value]) => ({ label, value })),
      venueMix: [...stats.locations.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([label, value]) => ({ label, value })),
      winRate: stats.plays > 0 ? Number(((stats.wins / stats.plays) * 100).toFixed(1)) : 0,
      wins: stats.wins,
    }))
    .sort((left, right) => right.plays - left.plays)

  const visibleOwnedGames = normalized.ownedGames
    .map((ownedGame) => {
      const matching = gameRows.find((game) => game.name === ownedGame.name)
      const hoursPlayed = matching?.hoursPlayed ?? 0
      const playCount = matching?.playCount ?? 0
      const firstPlayDate = firstPlayByGame.get(ownedGame.name)?.slice(0, 10) ?? ''
      const daysToFirstPlay = differenceInDays(ownedGame.acquisitionDate, firstPlayDate)
      const costPerPlay = playCount > 0 ? Number((ownedGame.pricePaid / playCount).toFixed(2)) : null
      const costPerHour = hoursPlayed > 0 ? Number((ownedGame.pricePaid / hoursPlayed).toFixed(2)) : null
      const valueScore = ownedGame.pricePaid > 0 ? Number((((hoursPlayed * 2) + playCount) / ownedGame.pricePaid).toFixed(2)) : 0

      return {
        acquisitionDate: ownedGame.acquisitionDate,
        coverImageUrl: ownedGame.coverImageUrl,
        costPerPlay,
        costPerHour,
        daysToFirstPlay,
        firstPlayDate,
        hoursPlayed,
        name: ownedGame.name,
        playCount,
        pricePaid: ownedGame.pricePaid,
        rating: ownedGame.rating,
        thumbnailUrl: ownedGame.thumbnailUrl,
        valueScore,
      }
    })
    .sort((left, right) => right.valueScore - left.valueScore)

  const collectionInsights: CollectionInsight[] = visibleOwnedGames
  const collectionRoiByYear: CollectionEconomicsDatum[] = [...priceByYearMap.entries()]
    .map(([label, spend]) => {
      const gamesForYear = visibleOwnedGames.filter((game) => (game.acquisitionDate ? game.acquisitionDate.slice(0, 4) : 'Unknown') === label)
      const plays = gamesForYear.reduce((sum, game) => sum + game.playCount, 0)
      const hours = gamesForYear.reduce((sum, game) => sum + game.hoursPlayed, 0)

      return {
        costPerPlay: plays > 0 ? Number((spend / plays).toFixed(2)) : 0,
        hours: Number(hours.toFixed(1)),
        label,
        plays,
        spend: Number(spend.toFixed(2)),
      }
    })
    .sort((left, right) => left.label.localeCompare(right.label))

  const totalSpent = visibleOwnedGames.reduce((sum, game) => sum + game.pricePaid, 0)
  const totalHoursPlayed = visibleOwnedGames.reduce((sum, game) => sum + game.hoursPlayed, 0)
  const averageCostPerHour = totalHoursPlayed > 0 ? totalSpent / totalHoursPlayed : 0
  const neverPlayedOwned = visibleOwnedGames.filter((game) => game.playCount === 0).length
  const bestValueGame = visibleOwnedGames.find((game) => game.playCount > 0)
  const mostExpensiveUnplayed = [...visibleOwnedGames]
    .filter((game) => game.playCount === 0)
    .sort((left, right) => right.pricePaid - left.pricePaid)[0]
  const slowestToTable = [...visibleOwnedGames]
    .filter((game) => game.daysToFirstPlay !== null)
    .sort((left, right) => (right.daysToFirstPlay ?? 0) - (left.daysToFirstPlay ?? 0))[0]

  const networkNodes: NetworkNode[] = topPlayers.slice(0, 12).map((player, index, array) => {
    const angle = (index / Math.max(array.length, 1)) * Math.PI * 2
    const radius = 42
    return {
      id: player.label,
      value: player.value,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    }
  })

  const visibleNodeIds = new Set(networkNodes.map((node) => node.id))
  const networkEdges: NetworkEdge[] = pairings
    .filter((pairing) => visibleNodeIds.has(pairing.playerA) && visibleNodeIds.has(pairing.playerB))
    .slice(0, 18)
    .map((pairing) => ({ source: pairing.playerA, target: pairing.playerB, value: pairing.value }))

  const selectedPlayerName =
    filters.playerId !== null ? normalized.players.find((player) => player.id === filters.playerId)?.name ?? null : null
  const selectedGroupSize = filters.playerCount
  const selectedTagName = filters.tagId !== null ? normalized.tags.find((tag) => tag.id === filters.tagId)?.name ?? null : null

  const recommendations: Recommendation[] = gameRows
    .filter((game) => {
      if (filters.gameId !== null && game.name !== normalized.games.find((value) => value.id === filters.gameId)?.name) {
        return false
      }

      return true
    })
    .map((game) => {
      const reasons: string[] = []
      let fitScore = game.playCount

      if (selectedGroupSize !== null) {
        const distance = Math.abs(game.averageGroupSize - selectedGroupSize)
        fitScore += Math.max(0, 8 - distance * 3)
        if (distance <= 1) {
          reasons.push(`Historically lands well around ${selectedGroupSize} players`)
        }
      }

      if (selectedTagName && game.tagNames.includes(selectedTagName)) {
        fitScore += 10
        reasons.push(`Matches the ${selectedTagName} tag filter`)
      }

      if (selectedPlayerName) {
        const playerProfile = playerInsights.find((player) => player.playerName === selectedPlayerName)
        const favorite = playerProfile?.favoriteGames.find((favoriteGame) => favoriteGame.label === game.name)
        if (favorite) {
          fitScore += favorite.value * 2
          reasons.push(`${selectedPlayerName} already plays this often`)
        }

        const recurringMatch = recurringTableGameMix.find(
          (table) => table.players.includes(selectedPlayerName) && table.games.some((candidate) => candidate.label === game.name),
        )
        if (recurringMatch) {
          fitScore += recurringMatch.value * 1.5
          reasons.push(`Shows up with ${selectedPlayerName}'s recurring table`)
        }
      }

      if (selectedGroupSize !== null) {
        const trioMatch = recurringTableGameMix.find(
          (table) => table.players.length === selectedGroupSize && table.games.some((candidate) => candidate.label === game.name),
        )
        if (trioMatch) {
          fitScore += trioMatch.value
          reasons.push(`Recurring ${selectedGroupSize}p group already gravitates to it`)
        }
      }

      if (reasons.length === 0) {
        reasons.push('Strong repeat-play signal in the historical data')
      }

      return {
        averageGroupSize: game.averageGroupSize,
        coverImageUrl: game.coverImageUrl,
        fitScore: Number(fitScore.toFixed(1)),
        name: game.name,
        playCount: game.playCount,
        reasons: reasons.slice(0, 2),
        thumbnailUrl: game.thumbnailUrl,
      }
    })
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, 6)

  const uniqueGames = new Set(filteredPlays.map((play) => play.gameId)).size
  const uniquePlayers = new Set(filteredPlays.flatMap((play) => play.players.map((player) => player.id))).size
  const busiestMonth = monthlyActivity.reduce(
    (best, current) => (current.value > best.value ? current : best),
    monthlyActivity[0] ?? { label: 'N/A', value: 0 },
  )
  const strongestYear = yearlyActivity.reduce(
    (best, current) => (current.value > best.value ? current : best),
    yearlyActivity[0] ?? { label: 'N/A', value: 0 },
  )
  const mostPlayedTag = tagBreakdown[0]
  const hottestWeekday = weekdayActivity.reduce(
    (best, current) => (current.value > best.value ? current : best),
    weekdayActivity[0] ?? { label: 'N/A', value: 0 },
  )

  const interestingFacts = [
    `${uniqueGames} distinct games made it to the table in the current view.`,
    `${pairings[0]?.playerA ?? 'No pairing'} and ${pairings[0]?.playerB ?? 'yet'} are the most common duo so far.`,
    `${busiestMonth.label} is the busiest month in the current slice with ${busiestMonth.value} logged plays.`,
    `${strongestYear.label} is the densest year in view at ${strongestYear.value} plays.`,
    `${mostPlayedTag?.label ?? 'No tag'} is the strongest tag signal in the current selection.`,
    `${hottestWeekday.label} is the most active day of the week right now.`,
  ]

  return {
    challengeInsights: normalized.challenges
      .map((challenge) => buildChallengeInsight(challenge, filteredPlays))
      .sort((left, right) => right.progress - left.progress),
    collectionCallouts: [
      {
        label: 'Best value buy',
        note: bestValueGame ? `${bestValueGame.playCount} plays and ${bestValueGame.hoursPlayed.toFixed(1)} hours` : 'No played priced games yet',
        value: bestValueGame?.name ?? 'N/A',
      },
      {
        label: 'Priciest shelf-sitter',
        note: mostExpensiveUnplayed ? `$${mostExpensiveUnplayed.pricePaid.toFixed(2)} with zero plays` : 'Everything priced has been played',
        value: mostExpensiveUnplayed?.name ?? 'N/A',
      },
      {
        label: 'Longest to first play',
        note: slowestToTable?.daysToFirstPlay !== null ? `${slowestToTable?.daysToFirstPlay} days before first play` : 'Not enough acquisition data',
        value: slowestToTable?.name ?? 'N/A',
      },
    ],
    calendarHeatmap,
    collectionInsights,
    collectionRoiByYear,
    collectionStats: [
      {
        label: 'Tracked spend',
        note: 'Owned games with recorded purchase price',
        value: `$${totalSpent.toFixed(2)}`,
      },
      {
        label: 'Hours played',
        note: 'Across priced owned games',
        value: totalHoursPlayed.toFixed(1),
      },
      {
        label: 'Avg cost / hour',
        note: 'Spend divided by logged hours',
        value: `$${averageCostPerHour.toFixed(2)}`,
      },
      {
        label: 'Owned, unplayed',
        note: 'Priced games with zero plays in the data',
        value: neverPlayedOwned.toString(),
      },
    ],
    durationBuckets,
    filteredPlays,
    gameRows,
    gameScatter,
    interestingFacts,
    keyStats: [
      {
        label: 'Plays tracked',
        note: 'Filtered total play logs',
        value: filteredPlays.length.toLocaleString(),
      },
      {
        label: 'Games played',
        note: 'Distinct titles in view',
        value: uniqueGames.toLocaleString(),
      },
      {
        label: 'Players active',
        note: 'People appearing in the view',
        value: uniquePlayers.toLocaleString(),
      },
      {
        label: 'Busiest month',
        note: 'Peak activity slice',
        value: busiestMonth.label,
      },
    ],
    monthlyHeatmap,
    monthlyActivity,
    networkEdges,
    networkNodes,
    pairings,
    playerGroupSizes,
    playerInsights,
    priceByYear,
    recommendations,
    recurringTables,
    recurringTableGameMix,
    spendByTag,
    tagBreakdown,
    topGames,
    topLocations,
    topPlayers,
    venueShare,
    weekdayActivity,
    yearlyDiversity,
    yearlyActivity,
  }
}
