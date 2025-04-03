
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { visualThemes, seasonalThemes } from '@/utils/themeConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Paintbrush, CalendarDays } from 'lucide-react';

const ThemeSelector = () => {
  const { theme, setVisualTheme, setSeasonalTheme } = useTheme();
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Customize Theme</h3>
      
      <Tabs defaultValue="visual">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            Visual Style
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Seasonal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="mt-2">
          <RadioGroup 
            value={theme.visualTheme} 
            onValueChange={(value) => setVisualTheme(value as any)}
            className="gap-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visualThemes.map((visualTheme) => (
                <div key={visualTheme.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={visualTheme.id} id={`visual-${visualTheme.id}`} />
                  <div className="grid gap-1.5">
                    <Label htmlFor={`visual-${visualTheme.id}`} className="font-medium">
                      {visualTheme.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {visualTheme.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </TabsContent>
        
        <TabsContent value="seasonal" className="mt-2">
          <RadioGroup 
            value={theme.seasonalTheme} 
            onValueChange={(value) => setSeasonalTheme(value as any)}
            className="gap-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seasonalThemes.map((seasonalTheme) => (
                <div key={seasonalTheme.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={seasonalTheme.id} id={`seasonal-${seasonalTheme.id}`} />
                  <div className="grid gap-1.5">
                    <Label htmlFor={`seasonal-${seasonalTheme.id}`} className="font-medium">
                      {seasonalTheme.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {seasonalTheme.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ThemeSelector;
