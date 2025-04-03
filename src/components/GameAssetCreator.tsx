
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import DrawingCanvas from '@/components/DrawingCanvas';
import { GameAsset, GameAssetType } from '@/types/game';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface GameAssetCreatorProps {
  onSave: (asset: GameAsset) => void;
  existingAssets: GameAsset[];
}

const GameAssetCreator: React.FC<GameAssetCreatorProps> = ({ onSave, existingAssets }) => {
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<GameAssetType>('player');
  const [assetImage, setAssetImage] = useState<string | null>(null);
  const [speed, setSpeed] = useState([5]);
  const [health, setHealth] = useState([3]);
  const [damage, setDamage] = useState([1]);
  const [behavior, setBehavior] = useState<'straight' | 'zigzag' | 'seeking'>('straight');

  const handleSaveAsset = (canvas: HTMLCanvasElement) => {
    const imageUrl = canvas.toDataURL('image/png');
    setAssetImage(imageUrl);
  };

  const handleCreateAsset = () => {
    if (!assetName.trim() || !assetImage) return;

    const newAsset: GameAsset = {
      id: uuidv4(),
      name: assetName,
      type: assetType,
      imageUrl: assetImage,
      properties: {
        speed: speed[0],
        health: health[0],
        damage: damage[0],
        behavior: behavior
      }
    };

    onSave(newAsset);
    resetForm();
  };

  const resetForm = () => {
    setAssetName('');
    setAssetImage(null);
    setAssetType('player');
    setSpeed([5]);
    setHealth([3]);
    setDamage([1]);
    setBehavior('straight');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div>
            <Label htmlFor="assetName">Asset Name</Label>
            <Input 
              id="assetName" 
              value={assetName} 
              onChange={(e) => setAssetName(e.target.value)} 
              placeholder="Player Ship" 
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="assetType">Asset Type</Label>
            <Select 
              value={assetType} 
              onValueChange={(value) => setAssetType(value as GameAssetType)}
            >
              <SelectTrigger id="assetType" className="mt-1">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player Ship</SelectItem>
                <SelectItem value="enemy">Enemy</SelectItem>
                <SelectItem value="projectile">Projectile</SelectItem>
                <SelectItem value="powerup">Power-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Speed: {speed[0]}</Label>
            <Slider 
              value={speed} 
              onValueChange={setSpeed} 
              min={1} 
              max={10} 
              step={1} 
            />
          </div>

          <div className="space-y-2">
            <Label>Health: {health[0]}</Label>
            <Slider 
              value={health} 
              onValueChange={setHealth} 
              min={1} 
              max={10} 
              step={1} 
            />
          </div>

          <div className="space-y-2">
            <Label>Damage: {damage[0]}</Label>
            <Slider 
              value={damage} 
              onValueChange={setDamage} 
              min={1} 
              max={10} 
              step={1} 
            />
          </div>

          {assetType === 'enemy' && (
            <div className="space-y-2">
              <Label>Movement Pattern</Label>
              <RadioGroup 
                value={behavior} 
                onValueChange={(value) => setBehavior(value as 'straight' | 'zigzag' | 'seeking')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="straight" id="straight" />
                  <Label htmlFor="straight">Straight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zigzag" id="zigzag" />
                  <Label htmlFor="zigzag">Zig-zag</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seeking" id="seeking" />
                  <Label htmlFor="seeking">Seeking</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button 
            onClick={handleCreateAsset}
            disabled={!assetName.trim() || !assetImage}
            className="w-full mt-4"
          >
            Create Asset
          </Button>
        </div>
        
        <div className="lg:col-span-2">
          <Label>Draw Asset</Label>
          <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
            <DrawingCanvas 
              onSave={handleSaveAsset} 
              prompt={`Draw a ${assetType === 'player' ? 'spaceship' : 
                assetType === 'enemy' ? 'space enemy' : 
                assetType === 'projectile' ? 'laser or bullet' : 'power-up item'}`} 
            />
          </div>
        </div>
      </div>

      {existingAssets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Created Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingAssets.map(asset => (
              <Card key={asset.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{asset.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    <img src={asset.imageUrl} alt={asset.name} className="max-h-full object-contain" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between text-xs text-gray-500">
                  <div>Type: {asset.type}</div>
                  <div>Speed: {asset.properties.speed}</div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameAssetCreator;
