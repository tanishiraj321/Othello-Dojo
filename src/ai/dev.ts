'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/real-time-decision-visualization.ts';
import '@/ai/flows/game-analysis.ts';
import '@/ai/flows/rate-move.ts';
