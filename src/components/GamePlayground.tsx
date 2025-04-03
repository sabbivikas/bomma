
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GameAsset, GameConfig } from '@/types/game';
import GamePlayer from '@/components/GamePlayer';

interface GamePlaygroundProps {
  gameAssets: GameAsset[];
  gameConfig: GameConfig;
  updateGameConfig: (config: Partial<GameConfig>) => void;
}

const GamePlayground: React.FC<GamePlaygroundProps> = ({ 
  gameAssets, 
  gameConfig, 
  updateGameConfig 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerAsset = gameAssets.find(asset => asset.type === 'player');
  const enemyAssets = gameAssets.filter(asset => asset.type === 'enemy');

  const togglePlayPreview = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-lg font-medium">Game Settings</h3>
          
          <div>
            <Label htmlFor="gameName">Game Name</Label>
            <Input 
              id="gameName" 
              value={gameConfig.name} 
              onChange={(e) => updateGameConfig({ name: e.target.value })} 
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={gameConfig.difficulty} 
              onValueChange={(value) => updateGameConfig({ difficulty: value as 'easy' | 'medium' | 'hard' })}
            >
              <SelectTrigger id="difficulty" className="mt-1">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Game Speed: {gameConfig.gameSpeed}</Label>
            <Slider 
              value={[gameConfig.gameSpeed]} 
              onValueChange={([value]) => updateGameConfig({ gameSpeed: value })} 
              min={0.5} 
              max={2} 
              step={0.1} 
            />
          </div>

          <div className="space-y-2">
            <Label>Player Lives: {gameConfig.playerHealth}</Label>
            <Slider 
              value={[gameConfig.playerHealth]} 
              onValueChange={([value]) => updateGameConfig({ playerHealth: value })} 
              min={1} 
              max={5} 
              step={1} 
            />
          </div>
          
          <div>
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex mt-1">
              <Input 
                id="bgColor" 
                type="color" 
                value={gameConfig.backgroundColor} 
                onChange={(e) => updateGameConfig({ backgroundColor: e.target.value })} 
                className="w-16 p-1 h-10"
              />
              <Input 
                value={gameConfig.backgroundColor} 
                onChange={(e) => updateGameConfig({ backgroundColor: e.target.value })} 
                className="flex-1 ml-2"
              />
            </div>
          </div>

          <Button 
            onClick={togglePlayPreview} 
            className="w-full mt-4" 
            disabled={!playerAsset || enemyAssets.length === 0}
          >
            {isPlaying ? 'Stop Preview' : 'Play Preview'}
          </Button>
        </div>
        
        <div className="lg:col-span-2">
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-800 aspect-video relative">
            {isPlaying ? (
              <GamePlayer 
                gameAssets={gameAssets} 
                config={gameConfig} 
                isPreview={true}
                onGameOver={() => setIsPlaying(false)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <p className="text-lg mb-2">Game Preview</p>
                <p className="text-sm opacity-70">
                  {!playerAsset ? "Create a player ship first" : 
                   enemyAssets.length === 0 ? "Create at least one enemy" : 
                   "Click 'Play Preview' to test your game"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Game Assets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {gameAssets.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-4">
              No assets created yet. Go to the Assets tab to create some!
            </p>
          ) : (
            gameAssets.map(asset => (
              <div 
                key={asset.id}
                className="border rounded-md p-2 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-md mb-1 flex items-center justify-center">
                  <img src={asset.imageUrl} alt={asset.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xs font-medium">{asset.name}</span>
                <span className="text-xs text-gray-500">{asset.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlayground;
