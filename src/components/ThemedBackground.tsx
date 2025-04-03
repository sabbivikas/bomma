
import React, { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeConfig } from '@/utils/themeConfig';
import GhibliAnimations from './GhibliAnimations';
import Cloud from './Cloud';

interface ThemedBackgroundProps {
  children: ReactNode;
}

const ThemedBackground: React.FC<ThemedBackgroundProps> = ({ children }) => {
  const { theme } = useTheme();
  const visualThemeConfig = getThemeConfig(theme.visualTheme);
  const seasonalThemeConfig = theme.seasonalTheme !== 'none' ? getThemeConfig(theme.seasonalTheme) : null;
  
  if (!visualThemeConfig) {
    // Fallback to default background if theme config not found
    return (
      <div className="min-h-screen flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E0F7FA] via-[#B3E5FC] to-[#D1C4E9] opacity-70 z-0"></div>
        {children}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Base visual theme background */}
      <div className={`absolute inset-0 ${visualThemeConfig.backgroundStyle} opacity-70 z-0`}></div>
      
      {/* Seasonal theme overlay if applicable */}
      {seasonalThemeConfig && seasonalThemeConfig.id !== 'none' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Seasonal elements like falling leaves, snowflakes, etc based on the theme */}
          {seasonalThemeConfig.id === 'autumn' && <AutumnElements />}
          {seasonalThemeConfig.id === 'winter' && <WinterElements />}
          {seasonalThemeConfig.id === 'spring' && <SpringElements />}
          {seasonalThemeConfig.id === 'summer' && <SummerElements />}
          {seasonalThemeConfig.id === 'halloween' && <HalloweenElements />}
          {seasonalThemeConfig.id === 'christmas' && <ChristmasElements />}
        </div>
      )}
      
      {/* Show Ghibli animations only for default or Ghibli theme */}
      {(theme.visualTheme === 'default' || theme.visualTheme === 'ghibli') && (
        <GhibliAnimations />
      )}
      
      {/* Show clouds only for light themes */}
      {(theme.visualTheme === 'default' || theme.visualTheme === 'ghibli' || 
        theme.visualTheme === 'minimal' || theme.visualTheme === 'spring') && (
        <Cloud />
      )}
      
      {/* Radial gradient overlay for light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_70%)] z-0"></div>
      
      {/* Content */}
      {children}
    </div>
  );
};

// Seasonal Elements Components
const AutumnElements = () => (
  <div className="autumn-elements">
    {/* Falling leaves animation would be here */}
    <style jsx>{`
      @keyframes fall {
        0% { transform: translateY(-10vh) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(360deg); }
      }
      
      .leaf {
        position: absolute;
        width: 15px;
        height: 15px;
        background-color: #D2691E;
        opacity: 0.7;
        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
        animation: fall linear forwards;
      }
    `}</style>
    
    {Array.from({ length: 20 }).map((_, i) => (
      <div 
        key={i}
        className="leaf" 
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#D2691E', '#8B4513', '#A0522D', '#CD853F'][Math.floor(Math.random() * 4)],
          animationDuration: `${Math.random() * 10 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);

const WinterElements = () => (
  <div className="winter-elements">
    {/* Snowflakes animation would be here */}
    <style jsx>{`
      @keyframes snow-fall {
        0% { transform: translateY(-10vh) translateX(0); }
        50% { transform: translateY(50vh) translateX(20px); }
        100% { transform: translateY(100vh) translateX(0); }
      }
      
      .snowflake {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        opacity: 0.8;
        animation: snow-fall linear infinite;
      }
    `}</style>
    
    {Array.from({ length: 30 }).map((_, i) => (
      <div 
        key={i}
        className="snowflake" 
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 10 + 5}s`,
          width: `${Math.random() * 5 + 3}px`,
          height: `${Math.random() * 5 + 3}px`,
          opacity: Math.random() * 0.7 + 0.3,
        }}
      />
    ))}
  </div>
);

const SpringElements = () => (
  <div className="spring-elements">
    {/* Floating petals animation would be here */}
    <style jsx>{`
      @keyframes float-petal {
        0% { transform: translateY(0) translateX(0) rotate(0deg); }
        33% { transform: translateY(-30px) translateX(20px) rotate(120deg); }
        66% { transform: translateY(10px) translateX(-15px) rotate(240deg); }
        100% { transform: translateY(0) translateX(0) rotate(360deg); }
      }
      
      .petal {
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: #FFB7C5;
        border-radius: 100% 0% 55% 50% / 55% 0% 100% 50%;
        opacity: 0.7;
        animation: float-petal ease-in-out infinite;
      }
    `}</style>
    
    {Array.from({ length: 15 }).map((_, i) => (
      <div 
        key={i}
        className="petal" 
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: ['#FFB7C5', '#FFC0CB', '#FFD1DC', '#FB607F'][Math.floor(Math.random() * 4)],
          animationDuration: `${Math.random() * 10 + 10}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
      />
    ))}
  </div>
);

const SummerElements = () => (
  <div className="summer-elements">
    {/* Sun rays and heat waves */}
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-64 bg-gradient-to-b from-yellow-200 to-transparent opacity-20"></div>
    
    <style jsx>{`
      @keyframes shimmer {
        0% { opacity: 0.1; }
        50% { opacity: 0.3; }
        100% { opacity: 0.1; }
      }
      
      .heat-wave {
        position: absolute;
        height: 50px;
        left: 0;
        right: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          rgba(255, 255, 255, 0.1) 2px,
          transparent 4px
        );
        animation: shimmer 3s infinite;
      }
    `}</style>
    
    {Array.from({ length: 5 }).map((_, i) => (
      <div 
        key={i}
        className="heat-wave" 
        style={{
          top: `${20 + i * 15}%`,
          animationDelay: `${i * 0.5}s`,
        }}
      />
    ))}
  </div>
);

const HalloweenElements = () => (
  <div className="halloween-elements">
    {/* Bats and spooky elements */}
    <style jsx>{`
      @keyframes fly {
        0% { transform: translateY(0) translateX(0) scale(1); }
        25% { transform: translateY(-40px) translateX(20px) scale(1.1); }
        50% { transform: translateY(-20px) translateX(40px) scale(0.9); }
        75% { transform: translateY(-30px) translateX(10px) scale(1.1); }
        100% { transform: translateY(0) translateX(0) scale(1); }
      }
      
      .bat {
        position: absolute;
        width: 20px;
        height: 10px;
        background-color: black;
        border-radius: 50% 50% 0 0;
        animation: fly ease-in-out infinite;
      }
      
      .bat:before, .bat:after {
        content: '';
        position: absolute;
        width: 10px;
        height: 15px;
        background-color: black;
        border-radius: 50% 50% 0 50%;
        top: -5px;
      }
      
      .bat:before {
        left: -5px;
        transform: rotate(-20deg);
      }
      
      .bat:after {
        right: -5px;
        transform: rotate(20deg);
      }
    `}</style>
    
    {Array.from({ length: 8 }).map((_, i) => (
      <div 
        key={i}
        className="bat" 
        style={{
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 50 + 10}%`,
          animationDuration: `${Math.random() * 5 + 8}s`,
          opacity: 0.7,
        }}
      />
    ))}
  </div>
);

const ChristmasElements = () => (
  <div className="christmas-elements">
    {/* Falling snow and decorative elements */}
    <style jsx>{`
      @keyframes snow-fall {
        0% { transform: translateY(-10vh) translateX(0); }
        50% { transform: translateY(50vh) translateX(20px); }
        100% { transform: translateY(100vh) translateX(0); }
      }
      
      .snow {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        opacity: 0.8;
        animation: snow-fall linear infinite;
      }
    `}</style>
    
    {Array.from({ length: 30 }).map((_, i) => (
      <div 
        key={i}
        className="snow" 
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 10 + 5}s`,
          width: `${Math.random() * 5 + 3}px`,
          height: `${Math.random() * 5 + 3}px`,
          opacity: Math.random() * 0.7 + 0.3,
        }}
      />
    ))}
  </div>
);

export default ThemedBackground;
