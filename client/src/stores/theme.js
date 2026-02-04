import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// Theme definitions with their CSS variable values
export const themes = {
  // Default theme - Deep Purple/Indigo (current styling)
  default: {
    name: 'Default',
    description: 'Deep purple and indigo tones',
    preview: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    // Primary colors
    '--primary-50': '#f5f3ff',
    '--primary-100': '#ede9fe',
    '--primary-200': '#ddd6fe',
    '--primary-300': '#c4b5fd',
    '--primary-400': '#a78bfa',
    '--primary-500': '#8b5cf6',
    '--primary-600': '#7c3aed',
    '--primary-700': '#6d28d9',
    '--primary-800': '#5b21b6',
    '--primary-900': '#4c1d95',
    // Accent colors
    '--accent-cyan': '#06b6d4',
    '--accent-pink': '#ec4899',
    '--accent-amber': '#f59e0b',
    '--accent-emerald': '#10b981',
    '--accent-rose': '#f43f5e',
    // Gray scale
    '--gray-50': '#fafafa',
    '--gray-100': '#f4f4f5',
    '--gray-200': '#e4e4e7',
    '--gray-300': '#d4d4d8',
    '--gray-400': '#a1a1aa',
    '--gray-500': '#71717a',
    '--gray-600': '#52525b',
    '--gray-700': '#3f3f46',
    '--gray-800': '#27272a',
    '--gray-900': '#18181b',
    // Semantic colors - Dark mode (default for this theme)
    '--bg-primary': '#0f0f13',
    '--bg-secondary': '#18181c',
    '--bg-tertiary': '#232329',
    '--bg-elevated': '#2a2a32',
    '--text-primary': '#fafafa',
    '--text-secondary': '#a1a1aa',
    '--text-tertiary': '#71717a',
    '--border-subtle': 'rgba(255, 255, 255, 0.06)',
    '--border-default': 'rgba(255, 255, 255, 0.1)',
    '--border-strong': 'rgba(255, 255, 255, 0.15)',
    // Shadows
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    '--shadow-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
    // Alpha colors for components
    '--primary-500-alpha-05': 'rgba(139, 92, 246, 0.05)',
    '--primary-500-alpha-10': 'rgba(139, 92, 246, 0.1)',
    '--primary-500-alpha-15': 'rgba(139, 92, 246, 0.15)',
    '--primary-500-alpha-20': 'rgba(139, 92, 246, 0.2)',
    '--primary-500-alpha-30': 'rgba(139, 92, 246, 0.3)',
    '--accent-cyan-alpha-10': 'rgba(6, 182, 212, 0.1)',
    '--accent-cyan-alpha-15': 'rgba(6, 182, 212, 0.15)',
    '--accent-emerald-alpha-08': 'rgba(16, 185, 129, 0.08)',
    '--accent-emerald-alpha-15': 'rgba(16, 185, 129, 0.15)',
    '--accent-emerald-alpha-60': 'rgba(16, 185, 129, 0.6)',
    '--accent-amber-alpha-15': 'rgba(245, 158, 11, 0.15)',
    '--accent-rose-alpha-05': 'rgba(244, 63, 94, 0.05)',
    '--accent-rose-alpha-10': 'rgba(244, 63, 94, 0.1)',
    '--accent-rose-alpha-15': 'rgba(244, 63, 94, 0.15)',
    '--error-border': 'rgba(244, 63, 94, 0.2)',
    '--spinner-track': 'rgba(255, 255, 255, 0.3)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.6)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.4)',
    '--bg-muted': 'rgba(0, 0, 0, 0.2)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.1)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.4)',
    '--text-shadow': 'rgba(0, 0, 0, 0.3)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.3)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.5)',
    // Additional alpha variations for timeline
    '--primary-500-alpha-50': 'rgba(139, 92, 246, 0.5)',
    '--primary-500-alpha-70': 'rgba(139, 92, 246, 0.7)',
    '--primary-500-alpha-90': 'rgba(139, 92, 246, 0.9)',
    '--accent-emerald-alpha-50': 'rgba(16, 185, 129, 0.5)',
    '--accent-emerald-alpha-70': 'rgba(16, 185, 129, 0.7)',
    '--accent-emerald-alpha-90': 'rgba(16, 185, 129, 0.9)',
    '--accent-amber-alpha-50': 'rgba(245, 158, 11, 0.5)',
    '--accent-amber-alpha-70': 'rgba(245, 158, 11, 0.7)',
    '--accent-amber-alpha-90': 'rgba(245, 158, 11, 0.9)',
    '--accent-rose-alpha-50': 'rgba(244, 63, 94, 0.5)',
    '--accent-rose-alpha-70': 'rgba(244, 63, 94, 0.7)',
    '--accent-rose-alpha-90': 'rgba(244, 63, 94, 0.9)',
  },

  // Ocean theme - Deep blues and teals
  ocean: {
    name: 'Ocean',
    description: 'Calming deep blue and teal gradients',
    preview: 'linear-gradient(135deg, #0ea5e9, #1e40af)',
    // Primary colors - Ocean blues
    '--primary-50': '#f0f9ff',
    '--primary-100': '#e0f2fe',
    '--primary-200': '#bae6fd',
    '--primary-300': '#7dd3fc',
    '--primary-400': '#38bdf8',
    '--primary-500': '#0ea5e9',
    '--primary-600': '#0284c7',
    '--primary-700': '#0369a1',
    '--primary-800': '#075985',
    '--primary-900': '#0c4a6e',
    // Accent colors
    '--accent-cyan': '#22d3ee',
    '--accent-pink': '#f472b6',
    '--accent-amber': '#fbbf24',
    '--accent-emerald': '#34d399',
    '--accent-rose': '#fb7185',
    // Gray scale - slightly cooler
    '--gray-50': '#f8fafc',
    '--gray-100': '#f1f5f9',
    '--gray-200': '#e2e8f0',
    '--gray-300': '#cbd5e1',
    '--gray-400': '#94a3b8',
    '--gray-500': '#64748b',
    '--gray-600': '#475569',
    '--gray-700': '#334155',
    '--gray-800': '#1e293b',
    '--gray-900': '#0f172a',
    // Semantic colors - Dark mode
    '--bg-primary': '#0a0f1a',
    '--bg-secondary': '#0f172a',
    '--bg-tertiary': '#1e293b',
    '--bg-elevated': '#27354f',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--text-tertiary': '#64748b',
    '--border-subtle': 'rgba(255, 255, 255, 0.06)',
    '--border-default': 'rgba(255, 255, 255, 0.1)',
    '--border-strong': 'rgba(255, 255, 255, 0.15)',
    // Shadows - blue tinted
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    '--shadow-glow': '0 0 20px rgba(14, 165, 233, 0.3)',
    // Alpha colors for components
    '--primary-500-alpha-05': 'rgba(14, 165, 233, 0.05)',
    '--primary-500-alpha-10': 'rgba(14, 165, 233, 0.1)',
    '--primary-500-alpha-15': 'rgba(14, 165, 233, 0.15)',
    '--primary-500-alpha-20': 'rgba(14, 165, 233, 0.2)',
    '--primary-500-alpha-30': 'rgba(14, 165, 233, 0.3)',
    '--accent-cyan-alpha-10': 'rgba(34, 211, 238, 0.1)',
    '--accent-cyan-alpha-15': 'rgba(34, 211, 238, 0.15)',
    '--accent-emerald-alpha-08': 'rgba(52, 211, 153, 0.08)',
    '--accent-emerald-alpha-15': 'rgba(52, 211, 153, 0.15)',
    '--accent-emerald-alpha-60': 'rgba(52, 211, 153, 0.6)',
    '--accent-amber-alpha-15': 'rgba(251, 191, 36, 0.15)',
    '--accent-rose-alpha-05': 'rgba(251, 113, 133, 0.05)',
    '--accent-rose-alpha-10': 'rgba(251, 113, 133, 0.1)',
    '--accent-rose-alpha-15': 'rgba(251, 113, 133, 0.15)',
    '--error-border': 'rgba(251, 113, 133, 0.2)',
    '--spinner-track': 'rgba(255, 255, 255, 0.3)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.6)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.4)',
    '--bg-muted': 'rgba(0, 0, 0, 0.2)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.1)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.4)',
    '--text-shadow': 'rgba(0, 0, 0, 0.3)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.3)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.5)',
    // Additional alpha variations for timeline
    '--primary-500-alpha-50': 'rgba(14, 165, 233, 0.5)',
    '--primary-500-alpha-70': 'rgba(14, 165, 233, 0.7)',
    '--primary-500-alpha-90': 'rgba(14, 165, 233, 0.9)',
    '--accent-emerald-alpha-50': 'rgba(52, 211, 153, 0.5)',
    '--accent-emerald-alpha-70': 'rgba(52, 211, 153, 0.7)',
    '--accent-emerald-alpha-90': 'rgba(52, 211, 153, 0.9)',
    '--accent-amber-alpha-50': 'rgba(251, 191, 36, 0.5)',
    '--accent-amber-alpha-70': 'rgba(251, 191, 36, 0.7)',
    '--accent-amber-alpha-90': 'rgba(251, 191, 36, 0.9)',
    '--accent-rose-alpha-50': 'rgba(251, 113, 133, 0.5)',
    '--accent-rose-alpha-70': 'rgba(251, 113, 133, 0.7)',
    '--accent-rose-alpha-90': 'rgba(251, 113, 133, 0.9)',
  },

  // Forest theme - Natural greens and earth tones
  forest: {
    name: 'Forest',
    description: 'Natural greens and earthy colors',
    preview: 'linear-gradient(135deg, #22c55e, #166534)',
    // Primary colors - Forest greens
    '--primary-50': '#f0fdf4',
    '--primary-100': '#dcfce7',
    '--primary-200': '#bbf7d0',
    '--primary-300': '#86efac',
    '--primary-400': '#4ade80',
    '--primary-500': '#22c55e',
    '--primary-600': '#16a34a',
    '--primary-700': '#15803d',
    '--primary-800': '#166534',
    '--primary-900': '#14532d',
    // Accent colors
    '--accent-cyan': '#2dd4bf',
    '--accent-pink': '#e879f9',
    '--accent-amber': '#facc15',
    '--accent-emerald': '#10b981',
    '--accent-rose': '#f43f5e',
    // Gray scale - warmer earth tones
    '--gray-50': '#fafaf9',
    '--gray-100': '#f5f5f4',
    '--gray-200': '#e7e5e4',
    '--gray-300': '#d6d3d1',
    '--gray-400': '#a8a29e',
    '--gray-500': '#78716c',
    '--gray-600': '#57534e',
    '--gray-700': '#44403c',
    '--gray-800': '#292524',
    '--gray-900': '#1c1917',
    // Semantic colors - Dark mode
    '--bg-primary': '#0c0a09',
    '--bg-secondary': '#1c1917',
    '--bg-tertiary': '#292524',
    '--bg-elevated': '#3f3b36',
    '--text-primary': '#fafaf9',
    '--text-secondary': '#a8a29e',
    '--text-tertiary': '#78716c',
    '--border-subtle': 'rgba(255, 255, 255, 0.06)',
    '--border-default': 'rgba(255, 255, 255, 0.1)',
    '--border-strong': 'rgba(255, 255, 255, 0.15)',
    // Shadows - green tinted
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    '--shadow-glow': '0 0 20px rgba(34, 197, 94, 0.3)',
    // Alpha colors for components
    '--primary-500-alpha-05': 'rgba(34, 197, 94, 0.05)',
    '--primary-500-alpha-10': 'rgba(34, 197, 94, 0.1)',
    '--primary-500-alpha-15': 'rgba(34, 197, 94, 0.15)',
    '--primary-500-alpha-20': 'rgba(34, 197, 94, 0.2)',
    '--primary-500-alpha-30': 'rgba(34, 197, 94, 0.3)',
    '--accent-cyan-alpha-10': 'rgba(45, 212, 191, 0.1)',
    '--accent-cyan-alpha-15': 'rgba(45, 212, 191, 0.15)',
    '--accent-emerald-alpha-08': 'rgba(16, 185, 129, 0.08)',
    '--accent-emerald-alpha-15': 'rgba(16, 185, 129, 0.15)',
    '--accent-emerald-alpha-60': 'rgba(16, 185, 129, 0.6)',
    '--accent-amber-alpha-15': 'rgba(250, 204, 21, 0.15)',
    '--accent-rose-alpha-05': 'rgba(244, 63, 94, 0.05)',
    '--accent-rose-alpha-10': 'rgba(244, 63, 94, 0.1)',
    '--accent-rose-alpha-15': 'rgba(244, 63, 94, 0.15)',
    '--error-border': 'rgba(244, 63, 94, 0.2)',
    '--spinner-track': 'rgba(255, 255, 255, 0.3)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.6)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.4)',
    '--bg-muted': 'rgba(0, 0, 0, 0.2)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.1)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.4)',
    '--text-shadow': 'rgba(0, 0, 0, 0.3)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.3)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.5)',
    // Additional alpha variations for timeline
    '--primary-500-alpha-50': 'rgba(34, 197, 94, 0.5)',
    '--primary-500-alpha-70': 'rgba(34, 197, 94, 0.7)',
    '--primary-500-alpha-90': 'rgba(34, 197, 94, 0.9)',
    '--accent-emerald-alpha-50': 'rgba(16, 185, 129, 0.5)',
    '--accent-emerald-alpha-70': 'rgba(16, 185, 129, 0.7)',
    '--accent-emerald-alpha-90': 'rgba(16, 185, 129, 0.9)',
    '--accent-amber-alpha-50': 'rgba(250, 204, 21, 0.5)',
    '--accent-amber-alpha-70': 'rgba(250, 204, 21, 0.7)',
    '--accent-amber-alpha-90': 'rgba(250, 204, 21, 0.9)',
    '--accent-rose-alpha-50': 'rgba(244, 63, 94, 0.5)',
    '--accent-rose-alpha-70': 'rgba(244, 63, 94, 0.7)',
    '--accent-rose-alpha-90': 'rgba(244, 63, 94, 0.9)',
  },

  // Sunset theme - Warm oranges and pinks
  sunset: {
    name: 'Sunset',
    description: 'Warm oranges, pinks, and coral tones',
    preview: 'linear-gradient(135deg, #f97316, #db2777)',
    // Primary colors - Warm orange/coral
    '--primary-50': '#fff7ed',
    '--primary-100': '#ffedd5',
    '--primary-200': '#fed7aa',
    '--primary-300': '#fdba74',
    '--primary-400': '#fb923c',
    '--primary-500': '#f97316',
    '--primary-600': '#ea580c',
    '--primary-700': '#c2410c',
    '--primary-800': '#9a3412',
    '--primary-900': '#7c2d12',
    // Accent colors
    '--accent-cyan': '#38bdf8',
    '--accent-pink': '#ec4899',
    '--accent-amber': '#fbbf24',
    '--accent-emerald': '#4ade80',
    '--accent-rose': '#fb7185',
    // Gray scale - warm
    '--gray-50': '#fafaf9',
    '--gray-100': '#f5f5f4',
    '--gray-200': '#e7e5e4',
    '--gray-300': '#d6d3d1',
    '--gray-400': '#a8a29e',
    '--gray-500': '#78716c',
    '--gray-600': '#57534e',
    '--gray-700': '#44403c',
    '--gray-800': '#292524',
    '--gray-900': '#1c1917',
    // Semantic colors - Dark mode
    '--bg-primary': '#0f0a08',
    '--bg-secondary': '#1c1917',
    '--bg-tertiary': '#29231f',
    '--bg-elevated': '#3d332c',
    '--text-primary': '#fafaf9',
    '--text-secondary': '#a8a29e',
    '--text-tertiary': '#78716c',
    '--border-subtle': 'rgba(255, 255, 255, 0.06)',
    '--border-default': 'rgba(255, 255, 255, 0.1)',
    '--border-strong': 'rgba(255, 255, 255, 0.15)',
    // Shadows - orange tinted
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    '--shadow-glow': '0 0 20px rgba(249, 115, 22, 0.3)',
    // Alpha colors for components
    '--primary-500-alpha-05': 'rgba(249, 115, 22, 0.05)',
    '--primary-500-alpha-10': 'rgba(249, 115, 22, 0.1)',
    '--primary-500-alpha-15': 'rgba(249, 115, 22, 0.15)',
    '--primary-500-alpha-20': 'rgba(249, 115, 22, 0.2)',
    '--primary-500-alpha-30': 'rgba(249, 115, 22, 0.3)',
    '--accent-cyan-alpha-10': 'rgba(56, 189, 248, 0.1)',
    '--accent-cyan-alpha-15': 'rgba(56, 189, 248, 0.15)',
    '--accent-emerald-alpha-08': 'rgba(74, 222, 128, 0.08)',
    '--accent-emerald-alpha-15': 'rgba(74, 222, 128, 0.15)',
    '--accent-emerald-alpha-60': 'rgba(74, 222, 128, 0.6)',
    '--accent-amber-alpha-15': 'rgba(251, 191, 36, 0.15)',
    '--accent-rose-alpha-05': 'rgba(251, 113, 133, 0.05)',
    '--accent-rose-alpha-10': 'rgba(251, 113, 133, 0.1)',
    '--accent-rose-alpha-15': 'rgba(251, 113, 133, 0.15)',
    '--error-border': 'rgba(251, 113, 133, 0.2)',
    '--spinner-track': 'rgba(255, 255, 255, 0.3)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.6)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.4)',
    '--bg-muted': 'rgba(0, 0, 0, 0.2)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.1)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.4)',
    '--text-shadow': 'rgba(0, 0, 0, 0.3)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.3)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.5)',
    // Additional alpha variations for timeline
    '--primary-500-alpha-50': 'rgba(249, 115, 22, 0.5)',
    '--primary-500-alpha-70': 'rgba(249, 115, 22, 0.7)',
    '--primary-500-alpha-90': 'rgba(249, 115, 22, 0.9)',
    '--accent-emerald-alpha-50': 'rgba(74, 222, 128, 0.5)',
    '--accent-emerald-alpha-70': 'rgba(74, 222, 128, 0.7)',
    '--accent-emerald-alpha-90': 'rgba(74, 222, 128, 0.9)',
    '--accent-amber-alpha-50': 'rgba(251, 191, 36, 0.5)',
    '--accent-amber-alpha-70': 'rgba(251, 191, 36, 0.7)',
    '--accent-amber-alpha-90': 'rgba(251, 191, 36, 0.9)',
    '--accent-rose-alpha-50': 'rgba(251, 113, 133, 0.5)',
    '--accent-rose-alpha-70': 'rgba(251, 113, 133, 0.7)',
    '--accent-rose-alpha-90': 'rgba(251, 113, 133, 0.9)',
  }
}

// Light mode overrides for each theme - Enhanced for better contrast and aesthetics
export const lightModeOverrides = {
  default: {
    // Background layers - warmer white with subtle purple tint
    '--bg-primary': '#faf9fb',
    '--bg-secondary': '#f5f3f8',
    '--bg-tertiary': '#ede9f5',
    '--bg-elevated': '#ffffff',
    // Text colors - high contrast
    '--text-primary': '#1a1625',
    '--text-secondary': '#4a4458',
    '--text-tertiary': '#6b6575',
    // Borders - subtle but visible
    '--border-subtle': 'rgba(124, 58, 237, 0.08)',
    '--border-default': 'rgba(124, 58, 237, 0.15)',
    '--border-strong': 'rgba(124, 58, 237, 0.25)',
    // Shadows - softer, colored tint
    '--shadow-sm': '0 1px 2px 0 rgba(124, 58, 237, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(124, 58, 237, 0.08), 0 2px 4px -2px rgba(124, 58, 237, 0.04)',
    '--shadow-lg': '0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -4px rgba(124, 58, 237, 0.05)',
    '--shadow-glow': '0 0 20px rgba(139, 92, 246, 0.15)',
    // Alpha colors for light mode
    '--primary-500-alpha-05': 'rgba(139, 92, 246, 0.05)',
    '--primary-500-alpha-10': 'rgba(139, 92, 246, 0.08)',
    '--primary-500-alpha-15': 'rgba(139, 92, 246, 0.12)',
    '--primary-500-alpha-20': 'rgba(139, 92, 246, 0.18)',
    '--primary-500-alpha-30': 'rgba(139, 92, 246, 0.25)',
    '--accent-cyan-alpha-10': 'rgba(6, 182, 212, 0.08)',
    '--accent-cyan-alpha-15': 'rgba(6, 182, 212, 0.12)',
    '--accent-emerald-alpha-08': 'rgba(16, 185, 129, 0.06)',
    '--accent-emerald-alpha-15': 'rgba(16, 185, 129, 0.12)',
    '--accent-emerald-alpha-60': 'rgba(16, 185, 129, 0.5)',
    '--accent-amber-alpha-15': 'rgba(245, 158, 11, 0.12)',
    '--accent-rose-alpha-05': 'rgba(244, 63, 94, 0.05)',
    '--accent-rose-alpha-10': 'rgba(244, 63, 94, 0.08)',
    '--accent-rose-alpha-15': 'rgba(244, 63, 94, 0.12)',
    '--error-border': 'rgba(244, 63, 94, 0.15)',
    '--spinner-track': 'rgba(0, 0, 0, 0.1)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.4)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.3)',
    '--bg-muted': 'rgba(0, 0, 0, 0.05)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.03)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.3)',
    '--text-shadow': 'rgba(0, 0, 0, 0.2)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.5)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.7)',
    // Additional alpha variations for light mode
    '--primary-500-alpha-50': 'rgba(139, 92, 246, 0.4)',
    '--primary-500-alpha-70': 'rgba(139, 92, 246, 0.6)',
    '--primary-500-alpha-90': 'rgba(139, 92, 246, 0.8)',
    '--accent-emerald-alpha-50': 'rgba(16, 185, 129, 0.4)',
    '--accent-emerald-alpha-70': 'rgba(16, 185, 129, 0.6)',
    '--accent-emerald-alpha-90': 'rgba(16, 185, 129, 0.8)',
    '--accent-amber-alpha-50': 'rgba(245, 158, 11, 0.4)',
    '--accent-amber-alpha-70': 'rgba(245, 158, 11, 0.6)',
    '--accent-amber-alpha-90': 'rgba(245, 158, 11, 0.8)',
    '--accent-rose-alpha-50': 'rgba(244, 63, 94, 0.4)',
    '--accent-rose-alpha-70': 'rgba(244, 63, 94, 0.6)',
    '--accent-rose-alpha-90': 'rgba(244, 63, 94, 0.8)',
  },
  ocean: {
    // Background layers - cool white with blue tint
    '--bg-primary': '#f8fafc',
    '--bg-secondary': '#f1f5f9',
    '--bg-tertiary': '#e2e8f0',
    '--bg-elevated': '#ffffff',
    // Text colors
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--text-tertiary': '#64748b',
    // Borders - blue tinted
    '--border-subtle': 'rgba(2, 132, 199, 0.08)',
    '--border-default': 'rgba(2, 132, 199, 0.15)',
    '--border-strong': 'rgba(2, 132, 199, 0.25)',
    // Shadows - blue tinted
    '--shadow-sm': '0 1px 2px 0 rgba(2, 132, 199, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(2, 132, 199, 0.08), 0 2px 4px -2px rgba(2, 132, 199, 0.04)',
    '--shadow-lg': '0 10px 15px -3px rgba(2, 132, 199, 0.1), 0 4px 6px -4px rgba(2, 132, 199, 0.05)',
    '--shadow-glow': '0 0 20px rgba(14, 165, 233, 0.15)',
    // Alpha colors for light mode
    '--primary-500-alpha-05': 'rgba(14, 165, 233, 0.05)',
    '--primary-500-alpha-10': 'rgba(14, 165, 233, 0.08)',
    '--primary-500-alpha-15': 'rgba(14, 165, 233, 0.12)',
    '--primary-500-alpha-20': 'rgba(14, 165, 233, 0.18)',
    '--primary-500-alpha-30': 'rgba(14, 165, 233, 0.25)',
    '--accent-cyan-alpha-10': 'rgba(34, 211, 238, 0.08)',
    '--accent-cyan-alpha-15': 'rgba(34, 211, 238, 0.12)',
    '--accent-emerald-alpha-08': 'rgba(52, 211, 153, 0.06)',
    '--accent-emerald-alpha-15': 'rgba(52, 211, 153, 0.12)',
    '--accent-emerald-alpha-60': 'rgba(52, 211, 153, 0.5)',
    '--accent-amber-alpha-15': 'rgba(251, 191, 36, 0.12)',
    '--accent-rose-alpha-05': 'rgba(251, 113, 133, 0.05)',
    '--accent-rose-alpha-10': 'rgba(251, 113, 133, 0.08)',
    '--accent-rose-alpha-15': 'rgba(251, 113, 133, 0.12)',
    '--error-border': 'rgba(251, 113, 133, 0.15)',
    '--spinner-track': 'rgba(0, 0, 0, 0.1)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.4)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.3)',
    '--bg-muted': 'rgba(0, 0, 0, 0.05)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.03)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.3)',
    '--text-shadow': 'rgba(0, 0, 0, 0.2)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.5)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.7)',
    // Additional alpha variations for light mode
    '--primary-500-alpha-50': 'rgba(14, 165, 233, 0.4)',
    '--primary-500-alpha-70': 'rgba(14, 165, 233, 0.6)',
    '--primary-500-alpha-90': 'rgba(14, 165, 233, 0.8)',
    '--accent-emerald-alpha-50': 'rgba(52, 211, 153, 0.4)',
    '--accent-emerald-alpha-70': 'rgba(52, 211, 153, 0.6)',
    '--accent-emerald-alpha-90': 'rgba(52, 211, 153, 0.8)',
    '--accent-amber-alpha-50': 'rgba(251, 191, 36, 0.4)',
    '--accent-amber-alpha-70': 'rgba(251, 191, 36, 0.6)',
    '--accent-amber-alpha-90': 'rgba(251, 191, 36, 0.8)',
    '--accent-rose-alpha-50': 'rgba(251, 113, 133, 0.4)',
    '--accent-rose-alpha-70': 'rgba(251, 113, 133, 0.6)',
    '--accent-rose-alpha-90': 'rgba(251, 113, 133, 0.8)',
  },
  forest: {
    // Background layers - warm white with green tint
    '--bg-primary': '#fafaf9',
    '--bg-secondary': '#f5f5f0',
    '--bg-tertiary': '#e8e6e1',
    '--bg-elevated': '#ffffff',
    // Text colors
    '--text-primary': '#1c1917',
    '--text-secondary': '#44403c',
    '--text-tertiary': '#78716c',
    // Borders - green tinted
    '--border-subtle': 'rgba(22, 163, 74, 0.08)',
    '--border-default': 'rgba(22, 163, 74, 0.15)',
    '--border-strong': 'rgba(22, 163, 74, 0.25)',
    // Shadows - green tinted
    '--shadow-sm': '0 1px 2px 0 rgba(22, 163, 74, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(22, 163, 74, 0.08), 0 2px 4px -2px rgba(22, 163, 74, 0.04)',
    '--shadow-lg': '0 10px 15px -3px rgba(22, 163, 74, 0.1), 0 4px 6px -4px rgba(22, 163, 74, 0.05)',
    '--shadow-glow': '0 0 20px rgba(34, 197, 94, 0.15)',
    // Alpha colors for light mode
    '--primary-500-alpha-05': 'rgba(34, 197, 94, 0.05)',
    '--primary-500-alpha-10': 'rgba(34, 197, 94, 0.08)',
    '--primary-500-alpha-15': 'rgba(34, 197, 94, 0.12)',
    '--primary-500-alpha-20': 'rgba(34, 197, 94, 0.18)',
    '--primary-500-alpha-30': 'rgba(34, 197, 94, 0.25)',
    '--accent-cyan-alpha-10': 'rgba(45, 212, 191, 0.08)',
    '--accent-cyan-alpha-15': 'rgba(45, 212, 191, 0.12)',
    '--accent-emerald-alpha-08': 'rgba(16, 185, 129, 0.06)',
    '--accent-emerald-alpha-15': 'rgba(16, 185, 129, 0.12)',
    '--accent-emerald-alpha-60': 'rgba(16, 185, 129, 0.5)',
    '--accent-amber-alpha-15': 'rgba(250, 204, 21, 0.12)',
    '--accent-rose-alpha-05': 'rgba(244, 63, 94, 0.05)',
    '--accent-rose-alpha-10': 'rgba(244, 63, 94, 0.08)',
    '--accent-rose-alpha-15': 'rgba(244, 63, 94, 0.12)',
    '--error-border': 'rgba(244, 63, 94, 0.15)',
    '--spinner-track': 'rgba(0, 0, 0, 0.1)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.4)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.3)',
    '--bg-muted': 'rgba(0, 0, 0, 0.05)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.03)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.3)',
    '--text-shadow': 'rgba(0, 0, 0, 0.2)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.5)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.7)',
    // Additional alpha variations for light mode
    '--primary-500-alpha-50': 'rgba(34, 197, 94, 0.4)',
    '--primary-500-alpha-70': 'rgba(34, 197, 94, 0.6)',
    '--primary-500-alpha-90': 'rgba(34, 197, 94, 0.8)',
    '--accent-emerald-alpha-50': 'rgba(16, 185, 129, 0.4)',
    '--accent-emerald-alpha-70': 'rgba(16, 185, 129, 0.6)',
    '--accent-emerald-alpha-90': 'rgba(16, 185, 129, 0.8)',
    '--accent-amber-alpha-50': 'rgba(250, 204, 21, 0.4)',
    '--accent-amber-alpha-70': 'rgba(250, 204, 21, 0.6)',
    '--accent-amber-alpha-90': 'rgba(250, 204, 21, 0.8)',
    '--accent-rose-alpha-50': 'rgba(244, 63, 94, 0.4)',
    '--accent-rose-alpha-70': 'rgba(244, 63, 94, 0.6)',
    '--accent-rose-alpha-90': 'rgba(244, 63, 94, 0.8)',
  },
  sunset: {
    // Background layers - warm cream with orange tint
    '--bg-primary': '#fffaf5',
    '--bg-secondary': '#fff5eb',
    '--bg-tertiary': '#ffe8d6',
    '--bg-elevated': '#ffffff',
    // Text colors
    '--text-primary': '#2d2118',
    '--text-secondary': '#5c4d3c',
    '--text-tertiary': '#8b7355',
    // Borders - orange tinted
    '--border-subtle': 'rgba(234, 88, 12, 0.08)',
    '--border-default': 'rgba(234, 88, 12, 0.15)',
    '--border-strong': 'rgba(234, 88, 12, 0.25)',
    // Shadows - orange tinted
    '--shadow-sm': '0 1px 2px 0 rgba(234, 88, 12, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(234, 88, 12, 0.08), 0 2px 4px -2px rgba(234, 88, 12, 0.04)',
    '--shadow-lg': '0 10px 15px -3px rgba(234, 88, 12, 0.1), 0 4px 6px -4px rgba(234, 88, 12, 0.05)',
    '--shadow-glow': '0 0 20px rgba(249, 115, 22, 0.15)',
    // Alpha colors for light mode
    '--primary-500-alpha-05': 'rgba(249, 115, 22, 0.05)',
    '--primary-500-alpha-10': 'rgba(249, 115, 22, 0.08)',
    '--primary-500-alpha-15': 'rgba(249, 115, 22, 0.12)',
    '--primary-500-alpha-20': 'rgba(249, 115, 22, 0.18)',
    '--primary-500-alpha-30': 'rgba(249, 115, 22, 0.25)',
    '--accent-cyan-alpha-10': 'rgba(56, 189, 248, 0.08)',
    '--accent-cyan-alpha-15': 'rgba(56, 189, 248, 0.12)',
    '--accent-emerald-alpha-08': 'rgba(74, 222, 128, 0.06)',
    '--accent-emerald-alpha-15': 'rgba(74, 222, 128, 0.12)',
    '--accent-emerald-alpha-60': 'rgba(74, 222, 128, 0.5)',
    '--accent-amber-alpha-15': 'rgba(251, 191, 36, 0.12)',
    '--accent-rose-alpha-05': 'rgba(251, 113, 133, 0.05)',
    '--accent-rose-alpha-10': 'rgba(251, 113, 133, 0.08)',
    '--accent-rose-alpha-15': 'rgba(251, 113, 133, 0.12)',
    '--error-border': 'rgba(251, 113, 133, 0.15)',
    '--spinner-track': 'rgba(0, 0, 0, 0.1)',
    '--overlay-bg': 'rgba(0, 0, 0, 0.4)',
    '--overlay-bg-light': 'rgba(0, 0, 0, 0.3)',
    '--bg-muted': 'rgba(0, 0, 0, 0.05)',
    '--bg-subtle': 'rgba(0, 0, 0, 0.03)',
    '--shadow-color-heavy': 'rgba(0, 0, 0, 0.3)',
    '--text-shadow': 'rgba(0, 0, 0, 0.2)',
    '--white-alpha-30': 'rgba(255, 255, 255, 0.5)',
    '--white-alpha-50': 'rgba(255, 255, 255, 0.7)',
    // Additional alpha variations for light mode
    '--primary-500-alpha-50': 'rgba(249, 115, 22, 0.4)',
    '--primary-500-alpha-70': 'rgba(249, 115, 22, 0.6)',
    '--primary-500-alpha-90': 'rgba(249, 115, 22, 0.8)',
    '--accent-emerald-alpha-50': 'rgba(74, 222, 128, 0.4)',
    '--accent-emerald-alpha-70': 'rgba(74, 222, 128, 0.6)',
    '--accent-emerald-alpha-90': 'rgba(74, 222, 128, 0.8)',
    '--accent-amber-alpha-50': 'rgba(251, 191, 36, 0.4)',
    '--accent-amber-alpha-70': 'rgba(251, 191, 36, 0.6)',
    '--accent-amber-alpha-90': 'rgba(251, 191, 36, 0.8)',
    '--accent-rose-alpha-50': 'rgba(251, 113, 133, 0.4)',
    '--accent-rose-alpha-70': 'rgba(251, 113, 133, 0.6)',
    '--accent-rose-alpha-90': 'rgba(251, 113, 133, 0.8)',
  }
}

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref(localStorage.getItem('theme') || 'default')
  const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false') // Default to dark

  // Getters
  const availableThemes = computed(() => {
    return Object.entries(themes).map(([key, value]) => ({
      key,
      name: value.name,
      description: value.description,
      preview: value.preview
    }))
  })

  const currentThemeData = computed(() => themes[currentTheme.value] || themes.default)

  // Actions
  function setTheme(themeKey) {
    if (themes[themeKey]) {
      currentTheme.value = themeKey
      localStorage.setItem('theme', themeKey)
      applyTheme()
    }
  }

  function setDarkMode(value) {
    isDarkMode.value = value
    localStorage.setItem('darkMode', value)
    applyTheme()
  }

  function toggleDarkMode() {
    setDarkMode(!isDarkMode.value)
  }

  function applyTheme() {
    const root = document.documentElement
    const theme = themes[currentTheme.value] || themes.default
    
    // Apply base theme colors
    Object.entries(theme).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        root.style.setProperty(key, value)
      }
    })

    // Apply light mode overrides if in light mode
    if (!isDarkMode.value) {
      const overrides = lightModeOverrides[currentTheme.value] || lightModeOverrides.default
      Object.entries(overrides).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  }

  function initializeTheme() {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme')
    const savedDarkMode = localStorage.getItem('darkMode')
    
    if (savedTheme && themes[savedTheme]) {
      currentTheme.value = savedTheme
    }
    
    if (savedDarkMode !== null) {
      isDarkMode.value = savedDarkMode === 'true'
    }
    
    applyTheme()
  }

  // Watch for changes and apply
  watch([currentTheme, isDarkMode], () => {
    applyTheme()
  }, { immediate: true })

  return {
    currentTheme,
    isDarkMode,
    availableThemes,
    currentThemeData,
    setTheme,
    setDarkMode,
    toggleDarkMode,
    applyTheme,
    initializeTheme
  }
})
