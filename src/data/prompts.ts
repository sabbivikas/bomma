
// 100 drawing prompts for inspiration
export const drawingPrompts = [
  "A day at the beach",
  "Your favorite animal wearing a hat",
  "A magical tree house",
  "A robot learning to dance",
  "Your dream vacation spot",
  "A superhero with an unusual power",
  "Your favorite food with a face",
  "A mythical creature in the modern world",
  "What happiness looks like",
  "An alien's first day on Earth",
  "A haunted house",
  "Your favorite cartoon character in real life",
  "The perfect treehouse",
  "What courage looks like",
  "A friendly monster under the bed",
  "A city in the sky",
  "Your pet's secret life",
  "A futuristic vehicle",
  "A day in the life of a raindrop",
  "What music looks like",
  "Your dream home",
  "A character from a book you love",
  "A day at the zoo from an animal's perspective",
  "The world's silliest invention",
  "Your favorite season as a person",
  "A dragon's day off",
  "What peace looks like",
  "A pirate's treasure",
  "A sandwich that can grant wishes",
  "Your favorite holiday tradition",
  "An underwater city",
  "A time machine",
  "The last unicorn",
  "Your favorite dessert coming to life",
  "What lies at the end of a rainbow",
  "A day in the life of your shoe",
  "A secret garden",
  "What love looks like",
  "An astronaut discovering something unexpected",
  "A castle in the clouds",
  "Your mood today as a weather pattern",
  "A fairytale character in the wrong story",
  "What courage looks like",
  "A tea party for unexpected guests",
  "Your dream superpower",
  "An enchanted forest",
  "What would your pet look like as a human?",
  "A monster having a bad day",
  "Your favorite place as a tiny world",
  "What does freedom look like?",
  "A wizard's workbench",
  "The world's most comfortable chair",
  "A letter from your future self",
  "A house that can walk",
  "Your breakfast as a cityscape",
  "What would Thursday look like as a person?",
  "A fish out of water",
  "The world's most unusual pet",
  "A door to another dimension",
  "What does kindness look like?",
  "The moon's day off",
  "Your favorite song as a landscape",
  "A day in the life of your favorite object",
  "What does hope look like?",
  "A friendly ghost's home",
  "Your dream job as a fantastical scene",
  "What would happen if cats ruled the world?",
  "A flower that grants wishes",
  "Your favorite memory as a scene",
  "What would your name look like as a creature?",
  "A library in a tree",
  "The world's most elaborate hat",
  "What does joy look like?",
  "A conversation between the sun and moon",
  "Your favorite book as a place",
  "What would happen if shadows came to life?",
  "The world's tiniest adventure",
  "Your favorite word as an object",
  "A plant that can think",
  "What does curiosity look like?",
  "A planet made entirely of one thing",
  "Your ideal day represented by symbols",
  "What does patience look like?",
  "A secret message in an unexpected place",
  "Your mood today as a creature",
  "What does wisdom look like?",
  "A machine that captures dreams",
  "Your favorite color as a character",
  "What does creativity look like?",
  "A map to buried treasure",
  "Your ideal Saturday morning",
  "What does courage look like?",
  "The world's most unusual restaurant",
  "Your personality as a landscape",
  "What does gratitude look like?",
  "A conversation between two unlikely objects"
];

// Function to get a random prompt
export function getRandomPrompt(): string {
  const randomIndex = Math.floor(Math.random() * drawingPrompts.length);
  return drawingPrompts[randomIndex];
}

// Function to get a specific prompt by index
export function getPromptByIndex(index: number): string {
  const safeIndex = ((index % drawingPrompts.length) + drawingPrompts.length) % drawingPrompts.length;
  return drawingPrompts[safeIndex];
}

// Function to get today's prompt based on date
export function getTodaysPrompt(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return getPromptByIndex(dayOfYear);
}
