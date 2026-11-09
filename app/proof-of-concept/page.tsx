import type { Metadata } from 'next';
import { BuildGallery } from '@/components/proof-of-concept/BuildGallery';
import './proof-of-concept.css';

export const metadata: Metadata = {
  title: 'Engineering | Mecanum Rover',
  description: 'Seven stages and 35 photographs follow the mecanum rover from its first solder joint to ultrasonic sensing and independent battery power, followed by a film of the rover in motion.',
};

export default function ProofOfConceptPage() {
  return <BuildGallery />;
}
