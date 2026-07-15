// Static substitute map: keyword -> list of alternative suggestions.
// In a production system this could be driven by a recommendation
// service, but a rule-based map is instant, free, and demo-ready.
export const SUBSTITUTES = {
  milk: ['Almond Milk', 'Oat Milk', 'Soy Milk'],
  bread: ['Gluten-Free Bread', 'Multigrain Bread'],
  sugar: ['Stevia Sweetener', 'Brown Sugar', 'Honey'],
  butter: ['Margarine', 'Vegan Butter'],
  coffee: ['Decaf Coffee', 'Green Tea'],
  rice: ['Quinoa', 'Brown Rice'],
  chips: ['Baked Chips', 'Roasted Nuts'],
  soda: ['Sparkling Water', 'Fresh Juice'],
}

export function getSubstitutes(itemName) {
  const lower = itemName.toLowerCase()
  for (const [keyword, subs] of Object.entries(SUBSTITUTES)) {
    if (lower.includes(keyword)) return subs
  }
  return []
}
