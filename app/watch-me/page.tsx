import type { Metadata } from 'next';
import { WatchExperience } from '@/components/watch/WatchExperience';
import './watch-me.css';

export const metadata: Metadata = {
  title: 'Watch Me | Mecanum Rover',
  description: 'The rover in motion: straight-line driving, stopping at a 30 cm obstacle threshold and autonomous obstacle avoidance around the house.',
};

export default function WatchPage() {
  return <WatchExperience />;
}
