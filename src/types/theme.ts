
// Define the theme types and interfaces
export type VisualTheme = 
  | 'white'
  | 'default'
  | 'ghibli'
  | 'darkFantasy'
  | 'vintage'
  | 'minimal'
  | 'comic';

export type SeasonalTheme =
  | 'none'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'halloween'
  | 'christmas';

export interface ThemeConfig {
  id: VisualTheme | SeasonalTheme;
  name: string;
  description: string;
  category: 'visual' | 'seasonal';
  backgroundStyle: string;
  textStyle: string;
  accentColor: string;
  borderStyle: string;
  iconSet?: string;
}

export interface ThemeState {
  visualTheme: VisualTheme;
  seasonalTheme: SeasonalTheme;
}
