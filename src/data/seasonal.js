// Month index (0 = Jan ... 11 = Dec) -> seasonal / on-sale style picks.
// A real system would pull this from a retailer API; static data keeps
// the demo free and deterministic.
export const SEASONAL_BY_MONTH = {
  0: ['Oranges', 'Carrots', 'Spinach'],
  1: ['Strawberries', 'Broccoli', 'Cauliflower'],
  2: ['Peas', 'Spinach', 'Radish'],
  3: ['Mangoes', 'Cherries', 'Asparagus'],
  4: ['Mangoes', 'Watermelon', 'Cucumber'],
  5: ['Watermelon', 'Mangoes', 'Corn'],
  6: ['Berries', 'Melons', 'Tomatoes'],
  7: ['Peaches', 'Plums', 'Corn'],
  8: ['Apples', 'Grapes', 'Pumpkin'],
  9: ['Apples', 'Pumpkin', 'Sweet Potato'],
  10: ['Sweet Potato', 'Cranberries', 'Brussels Sprouts'],
  11: ['Oranges', 'Pomegranate', 'Cranberries'],
}

export function getSeasonalPicks(date = new Date()) {
  return SEASONAL_BY_MONTH[date.getMonth()] || []
}
