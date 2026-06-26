/** کلید و مسیر پوشه صدای هر بازی در public/worksheets/ */

export const GAME_SOUND_KEYS = {
  BE_PHONICS: 'be-phonics',
  SPOT_DIFFERENCE: 'spot-difference',
  MATCHING: 'matching',
}

export function getGameSoundSrc(gameKey, fileName) {
  return `/worksheets/${gameKey}/sounds/${fileName}`
}

export function getGameCorrectSoundSrc(gameKey) {
  return getGameSoundSrc(gameKey, 'correct.mp3')
}

export function getGameWrongSoundSrc(gameKey) {
  return getGameSoundSrc(gameKey, 'wrong.mp3')
}
