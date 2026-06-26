/** کلاینت — تست برخورد (همسان با سرویس) */
export function hitTestSpot(spots, nx, ny, foundIds = new Set()) {
  for (const spot of spots) {
    if (foundIds.has(spot.id)) continue
    const dx = nx - spot.centerX
    const dy = ny - spot.centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= (spot.radius || 0.07)) return spot
  }
  return null
}
