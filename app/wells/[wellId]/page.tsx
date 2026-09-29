import { getWellDossier } from '@/lib/wellDossiers';
import { WellDossierView } from '@/components/wells/WellDossierView';
import type { Metadata } from 'next';

interface WellPageProps {
  params: Promise<{
    wellId: string;
  }>;
}

export async function generateMetadata({ params }: WellPageProps): Promise<Metadata> {
  const { wellId } = await params;
  const dossier = getWellDossier(wellId);

  return {
    title: `${dossier.name} Digital Well Dossier | DRILLDEX eRTMAC-NWIS`,
    description: `Historical offset well drilling intelligence, geomechanics, and lessons learned for ${dossier.name} (${dossier.code}).`,
  };
}

export function generateStaticParams() {
  return [
    { wellId: 'WELL-A' },
    { wellId: 'WELL-B' },
    { wellId: 'WELL-C' },
    { wellId: 'WELL-D' },
    { wellId: 'WELL-E' },
    { wellId: 'WELL-F' },
    { wellId: 'WELL-NWIS-01' },
    { wellId: 'well-a' },
    { wellId: 'well-b' },
    { wellId: 'well-c' },
    { wellId: 'well-d' },
  ];
}

export default async function WellDetailPage({ params }: WellPageProps) {
  const { wellId } = await params;
  const dossier = getWellDossier(wellId);

  return <WellDossierView dossier={dossier} />;
}
