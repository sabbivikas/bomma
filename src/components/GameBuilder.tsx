
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameAssetCreator from '@/components/GameAssetCreator';
import GamePlayground from '@/components/GamePlayground';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { GameAsset, GameConfig } from '@/types/game';
import { useNavigate } from 'react-router-dom';

const GameBuilder = () => {
  const [gameAssets, setGameAssets] = useState<GameAsset[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    name: 'My Space Game',
    difficulty: 'medium',
    backgroundColor: '#111827', // dark blue for space
    gameSpeed: 1,
    playerHealth: 3
  });
  
  const navigate = useNavigate();

  const addGameAsset = (asset: GameAsset) => {
    setGameAssets(prev => [...prev, asset]);
    toast({
      title: "Asset added",
      description: `${asset.name} has been added to your game`,
      variant: "success",
    });
  };

  const removeGameAsset = (assetId: string) => {
    setGameAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  const updateGameConfig = (config: Partial<GameConfig>) => {
    setGameConfig(prev => ({ ...prev, ...config }));
  };

  const saveGame = () => {
    // In a real implementation, we would save the game to a database
    // For now, we'll just show a success message
    if (gameAssets.length < 2) {
      toast({
        title: "More assets needed",
        description: "Please create at least a player ship and one enemy",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Game saved!",
      description: "Your game has been saved successfully",
      variant: "success",
    });
    
    navigate('/game-player');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Action Game</h2>
        <p className="text-gray-600">
          Design your own space shooter game by creating custom assets and setting game rules
        </p>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="assets">Assets Creation</TabsTrigger>
          <TabsTrigger value="playground">Game Playground</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <GameAssetCreator onSave={addGameAsset} existingAssets={gameAssets} />
        </TabsContent>

        <TabsContent value="playground">
          <GamePlayground 
            gameAssets={gameAssets}
            gameConfig={gameConfig}
            updateGameConfig={updateGameConfig}
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={saveGame} className="bg-purple-600 hover:bg-purple-700">
              Save & Play Game
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameBuilder;
