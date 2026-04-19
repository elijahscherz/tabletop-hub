import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_FILE = 'boardgame_data.json'
const USERNAME_KEYS = new Set(['bgaUsername', 'bggUsername', 'yucataUsername'])
const NAME_SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v'])

function sanitizePlayerName(name, isAnonymous = false) {
  if (typeof name !== 'string') {
    return name
  }

  const trimmed = name.trim().replace(/\s+/g, ' ')

  if (!trimmed || isAnonymous) {
    return trimmed
  }

  const parts = trimmed.split(' ')

  if (parts.length < 2) {
    return trimmed
  }

  const firstName = parts[0]
  const lastName = [...parts]
    .reverse()
    .find((part) => /[A-Za-z]/.test(part) && !NAME_SUFFIXES.has(part.toLowerCase()))

  if (!lastName || lastName === firstName) {
    return trimmed
  }

  const initialMatch = lastName.match(/[A-Za-z]/)

  if (!initialMatch) {
    return trimmed
  }

  return `${firstName} ${initialMatch[0].toUpperCase()}.`
}

function sanitizeMetaData(metaData) {
  if (typeof metaData !== 'string' || metaData.trim() === '') {
    return metaData
  }

  try {
    const parsed = JSON.parse(metaData)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return metaData
    }

    let changed = false

    for (const key of USERNAME_KEYS) {
      if (key in parsed && parsed[key] !== '') {
        parsed[key] = ''
        changed = true
      }
    }

    return changed ? JSON.stringify(parsed) : metaData
  } catch {
    return metaData
  }
}

function sanitizeUsernames(value) {
  if (Array.isArray(value)) {
    return value.reduce((count, item) => count + sanitizeUsernames(item), 0)
  }

  if (!value || typeof value !== 'object') {
    return 0
  }

  let changedCount = 0

  for (const [key, child] of Object.entries(value)) {
    if (USERNAME_KEYS.has(key) && typeof child === 'string' && child !== '') {
      value[key] = ''
      changedCount += 1
      continue
    }

    changedCount += sanitizeUsernames(child)
  }

  return changedCount
}

function sanitizePlayers(players) {
  if (!Array.isArray(players)) {
    return 0
  }

  let changedCount = 0

  for (const player of players) {
    if (!player || typeof player !== 'object') {
      continue
    }

    const nextName = sanitizePlayerName(player.name, player.isAnonymous)
    if (nextName !== player.name) {
      player.name = nextName
      changedCount += 1
    }

    if (typeof player.bggUsername === 'string' && player.bggUsername !== '') {
      player.bggUsername = ''
      changedCount += 1
    }

    const nextMetaData = sanitizeMetaData(player.metaData)
    if (nextMetaData !== player.metaData) {
      player.metaData = nextMetaData
      changedCount += 1
    }
  }

  return changedCount
}

function main() {
  const targetPath = resolve(process.cwd(), process.argv[2] ?? DEFAULT_FILE)
  const source = readFileSync(targetPath, 'utf8')
  const data = JSON.parse(source)
  const changedCount = sanitizePlayers(data.players) + sanitizeUsernames(data)

  writeFileSync(targetPath, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`Sanitized ${changedCount} identifying fields in ${targetPath}`)
}

main()
