
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GamePlayer from '@/components/GamePlayer';
import ThemedBackground from '@/components/ThemedBackground';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// In a real app, these would be loaded from a database
// For this prototype, we'll use static demo data
const DEMO_GAME_ASSETS = [
  {
    id: 'player-ship',
    name: 'Player Ship',
    type: 'player' as const,
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDpvbXRwdG09ImFkb2JlOm5zOm1ldGEvIiB4OnhpbXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpeG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTAyLTA2VDIxOjAzOjQxLTA3OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wMi0wNlQyMTowNjoxMi0wNzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wMi0wNlQyMTowNjoxMi0wNzowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MDRkZGYyZC00OWZlLTk1NGQtYWI4My03MzEzZjQzNTBmM2EiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpmNWY3NjgzMi0xOTgwLWExMTgtYTDiMi0xNDM0MDNjMzg2MjYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxYzc3MTE0NC0yYWFlLTkxNGItODRmMi1iODUzNjQ5M2ZmMTUiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcSB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxYzc3MTE0NC0yYWFlLTkxNGItODRmMi1iODUzNjQ5M2ZmMTUiIHN0RXZ0OndoZW49IjIwMTgtMDItMDZUMjE6MDM6NDEtMDc6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg3ZWMzMGNiLWE5NzQtODA0My1hNjU1LTlkYmU5MmU4OWRlZSIgc3RFdnQ6d2hlbj0iMjAxOC0wMi0wNlQyMTowNjoxMi0wNzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NzA0ZGRmMmQtNDlmZS05NTRkLWFiODMtNzMxM2Y0MzUwZjNhIiBzdEV2dDp3aGVuPSIyMDE4LTAyLTA2VDIxOjA2OjEyLTA3OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N2VjMzBjYi1hOTc0LTgwNDMtYTY1NS05ZGJlOTJlODlkZWUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MWM3NzExNDQtMmFhZS05MTRiLTg0ZjItYjg1MzY0OTNmZjE1IiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MWM3NzExNDQtMmFhZS05MTRiLTg0ZjItYjg1MzY0OTNmZjE1Ii8+IDwveG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtVXCgcAAAKHSURBVGiB7ZRPaBNBFMa/2Sx2N5uNbdNYRIMmJaXQKkXBg3jQsxfx5MmLeBKE9lRbT0WR4NGToO1JUFEEqbQHexNsQ4QqGGhDiEQbM9lk/00yHnZLYppkd+ukIJIPXmbezDe/eW/eG4Y7Ppi6hFMGPckAYMMb1lZz18CdB3g8k0G+8hlbK59gVde9CxLrhynGkLw0iz7Vgakk4VbLcKtlCEnBnYj0c5FJ7YsrKJ04DWKthxhb0XVBkb0DEpHYlSS2zywAMf6+kalleUJuCvCQyc2LMyC6hHcK7iIQGsCN0xzN9UU4lQ0YL+dR+rxbSA8M4p4yhQy3YKo/Eczqu5NWKWB4X9b/BP9+0dwD5sFJwCEIJnvArz+G0zcCGE+AOAnYpQKswlfIQ2N+TESXfSZSAja9R3r0JLO4BMPIwzS24FRKcGs1sBQHicn++9g/QKo2mcP1CTR+WnQdoISAWGbvgLb8GUhM9k+gaQeiiuS5q9Biy2jYL1HZ+Q4ODBBvonmwud0ETGsrZLO1n8jPkHkZVrUCIiqxcqXL1N48vpE+HNy/tLC1ra8lJG7qhMT8RQXjGfjwGIjFQPt6oQyPg48MgVeTmJgOdA+LfwMfHkD67AWWUBLdUvpG6lkDXf3n5W6bsYY4KsnPGgBxp5HoTrNDYdglxncnYEix8GcRiTvKlGvazR47GCA1fTcGx19+7cRMI0DCAJ+Y6kRn6UMriCSw3DMykihrrWS2VAiqwzZY7pl5TxfHTbrjT8RpLKQZ+gaoMWRqE6wjzra6vH9AN4z4lL2UaGxXCtNaTj1M7/02VvRbvWgAYBiStz7SDMMwpNr/3XtSDnOSA/wG5fL07MwNlNQAAAAASUVORK5CYII=',
    properties: {
      speed: 5,
      health: 3,
      damage: 1,
      behavior: 'straight'
    }
  },
  {
    id: 'enemy-ship',
    name: 'Enemy Ship',
    type: 'enemy' as const,
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0wMi0wNlQyMTozNzowMi0wNzowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTgtMDItMDZUMjE6Mzc6NDMtMDc6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDItMDZUMjE6Mzc6NDMtMDc6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MWRhMWQwZDktYzJkMS05YzQ2LWI5NzMtNmM3ZjUzMDZkNjZiIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFkYTFkMGQ5LWMyZDEtOWM0Ni1iOTczLTZjN2Y1MzA2ZDY2YiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjFkYTFkMGQ5LWMyZDEtOWM0Ni1iOTczLTZjN2Y1MzA2ZDY2YiI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MWRhMWQwZDktYzJkMS05YzQ2LWI5NzMtNmM3ZjUzMDZkNjZiIiBzdEV2dDp3aGVuPSIyMDE4LTAyLTA2VDIxOjM3OjAyLTA3OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PocdwxoAAAN8SURBVGiB7djLa1xVFMfxzz6TPE1MO0mbpJK0sRVfFQVBV7pwoQsR3Lnzf3HlQoQu3bQIgmI3YGuaRpqYxEzzTm7uY+/jYubO3JnMTG5uJtJIfdBN5t5zf3t/z+tMMj0E+9OOh+3AP4AAEAAIIAAQQADI82v+Nvl9c/cePSktXbrAZpJlVJJkaK7FlEbJMtIsYzFNuZ1lQcnbN4CYKPNx3XUpieLAt5nv/U1c2nuSlBOTIxzNPFtjMa2VK3rAGEQwwQeIUWOMAJgYQ6XnaKoM0ewBnU6bYepxRFd5A+E78EwQG0AW47ooEUAcCr0OiLHAS9QYzgmCAEEegjgQBgmJnXeTNvxC2Iy/3W5r0o1Zs9mIoXsMUAYQYyhSbQlGQCSIEmKdQSdAQZzPXb8p1+qDyMEX/1cajZrfbrfCdrtNrVZDv9+/+wBlx5hueyCuqiFGERVkAWIUc0oBDSBdQjuFXrs2KIyLaSwJw1BtbKzJc1t3ICZRjPP8jbE7gLJIHZP5XdQ4NASMKgblj0adMj7Pxyvmyj2G8OXno5AQVFRbO+7nJ7FwAGWHGEEKrBiZCpMogwlrpTXGxRhpWCvvZxTFMcZofu38Y1F5GUC+EsURy86OGATbRXIv04QwGgavp0nO/Yqv2QviCEMMKPsKCKbjcJZG7FQkaTEej8liDrB5a533P906w3kTXrn85M0bd29R1kbGQVfiG+05ixbS7wesPnk+DTfvHtmLb75nd3X9T1nslfvvbO9u/grsxJn7+NIKly59yPnzL9JqrmAaSzzzzIusra3zxfXPePub71Kmzy8sACBGMadn/+CV5x7l3NMPcGpnkyPvKB99vHbx6tWf3ogjfS+J+CELuO6XAGRZShhGmwA/f5294WeZIooC3FbA2no5PdXAq+K2YtLUgnVH4UPuOB+g90HZ+bO3rpaw1d7l3G34qVSkMQYThyQXXh98tf0AfBhgHB5eAOVUS6WWahqz1mr/wE+N0zTDd6tE7hQEBDHCMYcgClEkIkJZM4dsMX8LoJwL455LswwnEbZrceKejQYDUesD9AiKc1HsWnoxpcvlcXsybEE/nwr01qeOnsGx1ulTJ1aT1Vdubm//0ksSxfO8Xf/oQxxt5dV9+IYYoSIdikBvYPf29ocvn3lz86cm695HV1azOB68jeV1+59AACAAEAAIAEQYjf8AlQw4JziOe1UAAAAASUVORK5CYII=',
    properties: {
      speed: 3,
      health: 2,
      damage: 1,
      behavior: 'zigzag'
    }
  },
  {
    id: 'projectile',
    name: 'Laser Beam',
    type: 'projectile' as const,
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAQCAYAAAAvf+5AAAAACXBIWXMAAAsTAAALEwEAmpwYAAABEklEQVQoz4WSsUrDUBSGvxPSpE1KbLFgQYeCVEQQunRw7ObQxaGbDyD4Fi7i4NCxj+BTdHBx6VS6FEFodShVaWxMbm7uudehdyiID/zDOfB95/8PByYEZ7e1cnrdBMDzfbHZaqqqms9lkmGx3mytNBqb2c779cyMaapdVzRabCUepmbLfnp5Ph0TDjrd5manie/78XfDiY2Zlt16c+i6ot5urbrum8Da0Y/Q1PzKziFs+b7f7XUHJ5UIqEY9XZ46v2okSQpDd7vmOC4AkiThqPN4fpN9O7j4TVpqOXB9X1SWZsAEQBQZu54vEibgBcFoiJFldbN38Xm0fzBc/6vMpY37+FdBmOD5/miWVDX5D6RhEicB8A19sjBPwBJ6EQAAAABJRU5ErkJggg==',
    properties: {
      speed: 8,
      health: 1,
      damage: 1,
      behavior: 'straight'
    }
  }
];

const DEMO_GAME_CONFIG = {
  name: 'Space Invaders Demo',
  difficulty: 'medium' as const,
  backgroundColor: '#111827',
  gameSpeed: 1,
  playerHealth: 3
};

const GamePlayerPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Play Game";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);

  const handleGameOver = () => {
    // In a real app, we'd save the score, etc.
    // For now, just offer to play again
  };

  return (
    <ThemedBackground>
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{DEMO_GAME_CONFIG.name}</h2>
                <p className="text-gray-600">
                  Use arrow keys to move and space to shoot
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/create-game')}
              >
                Create New Game
              </Button>
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-800 aspect-video">
              <GamePlayer 
                gameAssets={DEMO_GAME_ASSETS} 
                config={DEMO_GAME_CONFIG}
                onGameOver={handleGameOver}
              />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">Controls:</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="font-medium">Keyboard</p>
                  <p>Arrow keys to move</p>
                  <p>Space to shoot</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-md">
                  <p className="font-medium">Mobile</p>
                  <p>Touch and drag to move</p>
                  <p>Tap to shoot</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemedBackground>
  );
};

export default GamePlayerPage;
