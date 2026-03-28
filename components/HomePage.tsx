import React from 'react';
import { HeroSection } from './HeroSection';
import { StoriesRing } from './StoriesRing';
import { CategoriesSection } from './CategoriesSection';
import { BusinessGridSection } from './BusinessGridSection';
import { SearchSection } from './SearchSection';
import { FeaturedSection } from './FeaturedSection';
import { PersonalizedEvents } from './PersonalizedEvents';
import { DealsMarketplace } from './DealsMarketplace';
import { CommunityStories } from './CommunityStories';
import { CityGuide } from './CityGuide';
import { InclusiveFeatures } from './InclusiveFeatures';
import { FooterSection } from './FooterSection';
import { useTranslations } from '../hooks/useTranslations';
import type { Post, Category, User } from '../types';

interface HomePageProps {
  posts: Post[];
  isSocialLoading: boolean;
  isLoggedIn: boolean;
  onCategoryClick: (category: Category) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onSearch: (query: string) => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  currentUser: User | null;
  onRequestAuth: (preferredRole?: 'user' | 'owner') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  isSocialLoading,
  isLoggedIn,
  onCategoryClick,
  currentPage,
  setCurrentPage,
  onSearch,
  selectedGovernorate,
  onGovernorateChange,
  highContrast,
  setHighContrast,
  currentUser,
  onRequestAuth,
}) => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white">
      <HeroSection onRequestAuth={onRequestAuth} />
      <div id="stories">
        <StoriesRing selectedGovernorate={selectedGovernorate} />
      </div>
      
      <CategoriesSection 
        onCategoryClick={onCategoryClick} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="container mx-auto px-4 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <BusinessGridSection 
                posts={posts} 
                isLoading={isSocialLoading} 
                isLoggedIn={isLoggedIn} 
                currentUser={currentUser}
                onRequestAuth={onRequestAuth}
              />
              
              <SearchSection 
                onSearch={onSearch} 
                selectedGovernorate={selectedGovernorate}
                onGovernorateChange={onGovernorateChange}
              />
          </div>
      </div>

      <div id="businesses">
        <FeaturedSection selectedGovernorate={selectedGovernorate} />
      </div>
      
      <div className="space-y-32 py-24">
        <div id="trending"><PersonalizedEvents selectedGovernorate={selectedGovernorate} /></div>
        <DealsMarketplace selectedGovernorate={selectedGovernorate} />
        <CommunityStories selectedGovernorate={selectedGovernorate} />
        <CityGuide />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />
      
      <FooterSection />
    </div>
  );
};
