import { motion } from 'framer-motion';
import { Palette, Check, Image as ImageIcon, Layout, Grid, Sparkles, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const ACCENT_COLORS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Slate', value: '#475569' },
  { name: 'Orange', value: '#f97316' },
];

const GRADIENTS = [
  { name: 'Ocean', value: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)' },
  { name: 'Mint', value: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' },
  { name: 'Lavender', value: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' },
];

const PATTERNS = [
  { name: 'Dots', value: 'https://www.transparenttextures.com/patterns/cubes.png' },
  { name: 'Grid', value: 'https://www.transparenttextures.com/patterns/graphy.png' },
  { name: 'Doodles', value: 'https://www.transparenttextures.com/patterns/skulls.png' }, // Placeholder for doodles
  { name: 'Subtle', value: 'https://www.transparenttextures.com/patterns/subtle-white-feathers.png' },
];

const IMAGES = [
  { name: 'Library', value: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000' },
  { name: 'Nature', value: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000' },
  { name: 'Abstract', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000' },
  { name: 'Campus', value: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2000' },
];

export default function ThemePanel() {
  const { theme, updateTheme, resetTheme } = useTheme();

  return (
    <div className="space-y-12">
      {/* Accent Colors */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Accent Color</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Choose the primary color for your interface</p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateTheme({ accentColor: color.value })}
              className={cn(
                "w-full aspect-square rounded-2xl transition-all duration-300 flex items-center justify-center relative group",
                theme.accentColor === color.value ? "ring-4 ring-offset-4 ring-slate-900 dark:ring-white dark:ring-offset-slate-950 scale-110" : "hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
            >
              {theme.accentColor === color.value && (
                <Check className="w-6 h-6 text-white drop-shadow-md" strokeWidth={3} />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Background Themes */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Background Theme</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Personalize your workspace background</p>
            </div>
          </div>
          <button 
            onClick={resetTheme}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Reset to Default
          </button>
        </div>

        <div className="space-y-10">
          {/* Solid Colors */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Grid className="w-3 h-3" /> Solid Backgrounds
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <button
                onClick={() => updateTheme({ backgroundType: 'solid', backgroundValue: 'transparent' })}
                className={cn(
                  "h-20 rounded-2xl border-2 transition-all flex items-center justify-center font-black text-[10px] uppercase tracking-widest",
                  theme.backgroundType === 'solid' && theme.backgroundValue === 'transparent'
                    ? "border-slate-900 bg-white shadow-lg scale-105"
                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                )}
              >
                Default
              </button>
              {['#f8fafc', '#f1f5f9', '#f0f9ff', '#fdf2f8', '#fffbeb'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ backgroundType: 'solid', backgroundValue: color })}
                  className={cn(
                    "h-20 rounded-2xl border-2 transition-all relative overflow-hidden",
                    theme.backgroundType === 'solid' && theme.backgroundValue === color
                      ? "border-slate-900 shadow-lg scale-105"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {theme.backgroundType === 'solid' && theme.backgroundValue === color && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                      <Check className="w-5 h-5 text-slate-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Subtle Gradients
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {GRADIENTS.map((grad) => (
                <button
                  key={grad.name}
                  onClick={() => updateTheme({ backgroundType: 'gradient', backgroundValue: grad.value })}
                  className={cn(
                    "h-24 rounded-2xl border-2 transition-all relative group overflow-hidden",
                    theme.backgroundType === 'gradient' && theme.backgroundValue === grad.value
                      ? "border-slate-900 shadow-lg scale-105"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                  style={{ backgroundImage: grad.value }}
                >
                  <span className="absolute bottom-2 left-3 text-[8px] font-black uppercase tracking-widest text-slate-600">
                    {grad.name}
                  </span>
                  {theme.backgroundType === 'gradient' && theme.backgroundValue === grad.value && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-slate-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Patterns */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Texture Patterns
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PATTERNS.map((pattern) => (
                <button
                  key={pattern.name}
                  onClick={() => updateTheme({ backgroundType: 'pattern', backgroundValue: pattern.value })}
                  className={cn(
                    "h-28 rounded-2xl border-2 transition-all relative group overflow-hidden bg-white",
                    theme.backgroundType === 'pattern' && theme.backgroundValue === pattern.value
                      ? "border-slate-900 shadow-lg scale-105"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `url("${pattern.value}")`, backgroundRepeat: 'repeat' }}
                  />
                  <span className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-widest text-slate-900">
                    {pattern.name}
                  </span>
                  {theme.backgroundType === 'pattern' && theme.backgroundValue === pattern.value && (
                    <div className="absolute top-3 right-4">
                      <Check className="w-5 h-5 text-slate-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Immersive Backgrounds
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {IMAGES.map((img) => (
                <button
                  key={img.name}
                  onClick={() => updateTheme({ backgroundType: 'image', backgroundValue: img.value })}
                  className={cn(
                    "h-32 rounded-2xl border-2 transition-all relative group overflow-hidden",
                    theme.backgroundType === 'image' && theme.backgroundValue === img.value
                      ? "border-slate-900 shadow-xl scale-105"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <img 
                    src={img.value} 
                    alt={img.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-widest text-white">
                    {img.name}
                  </span>
                  {theme.backgroundType === 'image' && theme.backgroundValue === img.value && (
                    <div className="absolute top-3 right-4 bg-white rounded-full p-1 shadow-lg">
                      <Check className="w-4 h-4 text-slate-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
