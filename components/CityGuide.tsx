import React, { useState } from 'react';
import { Navigation, Trash2, Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';

interface Waypoint {
  name: string;
  address: string;
}

const InteractiveMap: React.FC = () => (
    <div className="w-full h-full bg-dark-bg flex items-center justify-center text-white/50">
        <div className="text-center">
            <Navigation className="w-16 h-16 mx-auto mb-4 text-secondary/50" />
            <p>Interactive map is available after production map integration.</p>
        </div>
    </div>
);

export const CityGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [journeyPoints, setJourneyPoints] = useState<Waypoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  const removeWaypoint = (index: number) => {
      setJourneyPoints(points => points.filter((_, i) => i !== index));
  };

  const handleGenerateJourney = () => {
      if (!searchQuery.trim()) return;
      setError('AI journey generation is disabled in production build.');
      setJourneyPoints([]);
  };

  return (
    <section className="py-16 bg-dark-bg">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('cityGuide.title')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="overflow-hidden h-[600px] shadow-soft p-0">
              <InteractiveMap />
            </GlassCard>
          </div>
          <div className="space-y-4">
            <GlassCard className="p-6 text-start rtl:text-right">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Navigation className="w-5 h-5 text-secondary" /> {t('cityGuide.planJourney')}</h3>
              <div className="relative mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('cityGuide.searchPlaces')} className="w-full pl-4 pr-24 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-primary transition-colors" />
                <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button onClick={handleGenerateJourney} className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('cityGuide.generateJourney')}</span>
                    </button>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 text-start rtl:text-right">{t('cityGuide.yourJourney')}</h3>
              {error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-red-400 text-sm font-medium mb-1">{t('cityGuide.errorTitle') || 'Generation Failed'}</p>
                  <p className="text-white/40 text-xs px-4">{error}</p>
                </div>
              )}

              {!error && journeyPoints.length === 0 && (
                  <p className="text-white/60 text-sm text-center py-8">{t('cityGuide.addWaypoints')}</p>
              )}

              {!error && journeyPoints.length > 0 && (
                <div className="space-y-3">
                  {journeyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-xl bg-white/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                      <div className="flex-1 text-start rtl:text-right"><p className="text-white font-medium text-sm truncate">{point.name}</p><p className="text-white/60 text-xs truncate">{point.address}</p></div>
                      <button onClick={() => removeWaypoint(index)} className="w-8 h-8 rounded-full backdrop-blur-xl bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-all flex-shrink-0"><Trash2 className="w-4 h-4 text-white/70" /></button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};
