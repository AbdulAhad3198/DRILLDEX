'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { OffsetWell, ActiveWellState } from '@/lib/data';

interface NearbyWellsMapProps {
  activeWell: ActiveWellState;
  offsetWells: OffsetWell[];
  selectedWellId?: string;
  onSelectWell: (well: OffsetWell) => void;
  radiusKm?: number;
}

// Sub-component that imports react-leaflet on client only
const ClientLeafletMap = dynamic(
  () => import('./MapInner').then((mod) => mod.MapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full rounded-lg bg-[#070c17] border border-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Initializing Spatial Coordinate Engine...</span>
        </div>
      </div>
    ),
  }
);

export function NearbyWellsMap({
  activeWell,
  offsetWells,
  selectedWellId,
  onSelectWell,
  radiusKm = 10,
}: NearbyWellsMapProps) {
  return (
    <ClientLeafletMap 
      activeWell={activeWell}
      offsetWells={offsetWells}
      selectedWellId={selectedWellId}
      onSelectWell={onSelectWell}
      radiusKm={radiusKm}
    />
  );
}
