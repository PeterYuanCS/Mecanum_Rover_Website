import type { Metadata } from 'next';
import { BuildGallery } from '@/components/proof-of-concept/BuildGallery';
import './proof-of-concept.css';

export const metadata: Metadata = {
  title: 'Engineering | Mecanum Rover',
  description: 'The physical build of the mecanum rover, documented through six stages and 28 photographs, from the first solder joint to the assembled car.',
};

export default function ProofOfConceptPage() {
  return <BuildGallery />;
}
