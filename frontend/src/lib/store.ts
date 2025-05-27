'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Portfolio, INITIAL_PORTFOLIO } from './types';

interface PortfolioState {
  portfolio: Portfolio;
  updatePortfolio: (portfolio: Partial<Portfolio>) => void;
  updateSocials: (socials: Portfolio['socials']) => void;
  updateExperience: (experience: Portfolio['experience']) => void;
  resetPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      portfolio: INITIAL_PORTFOLIO,
      updatePortfolio: (updatedPortfolio) =>
        set((state) => ({
          portfolio: { ...state.portfolio, ...updatedPortfolio },
        })),
      updateSocials: (socials) =>
        set((state) => ({
          portfolio: { ...state.portfolio, socials },
        })),
      updateExperience: (experience) =>
        set((state) => ({
          portfolio: { ...state.portfolio, experience },
        })),
      resetPortfolio: () => set({ portfolio: INITIAL_PORTFOLIO }),
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        // Exclude large Base64 media from storage
        portfolio: {
          ...state.portfolio,
          projects: state.portfolio.projects.map(({ media, ...proj }) => proj),
        },
      }),
    }
  )
);
