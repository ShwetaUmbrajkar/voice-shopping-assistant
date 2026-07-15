// Simple, fast, rule-based categorizer.
// Maps a keyword (substring of the item name) -> category.
// This avoids needing a paid NLP/ML classification service.
export const CATEGORY_KEYWORDS = {
  milk: 'Dairy',
  cheese: 'Dairy',
  butter: 'Dairy',
  yogurt: 'Dairy',
  curd: 'Dairy',
  egg: 'Dairy',
  paneer: 'Dairy',

  apple: 'Produce',
  banana: 'Produce',
  orange: 'Produce',
  tomato: 'Produce',
  onion: 'Produce',
  potato: 'Produce',
  vegetable: 'Produce',
  fruit: 'Produce',
  spinach: 'Produce',
  carrot: 'Produce',

  bread: 'Bakery',
  bun: 'Bakery',
  cake: 'Bakery',
  bagel: 'Bakery',

  chips: 'Snacks',
  cookie: 'Snacks',
  biscuit: 'Snacks',
  nuts: 'Snacks',
  chocolate: 'Snacks',

  water: 'Beverages',
  juice: 'Beverages',
  coffee: 'Beverages',
  tea: 'Beverages',
  soda: 'Beverages',

  sugar: 'Pantry',
  salt: 'Pantry',
  rice: 'Pantry',
  pasta: 'Pantry',
  flour: 'Pantry',
  oil: 'Pantry',

  soap: 'Household',
  detergent: 'Household',
  tissue: 'Household',
  'paper towel': 'Household',

  toothpaste: 'Personal Care',
  shampoo: 'Personal Care',
  lotion: 'Personal Care',
}

export function categorize(itemName) {
  const lower = itemName.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) return category
  }
  return 'Other'
}
