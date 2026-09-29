'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { OffsetWell, ActiveWellState } from '@/lib/data';
import { AlertTriangle, ShieldCheck, ChevronRight, FileText, Info } from 'lucide-react';

interface MapInnerProps {
  activeWell: ActiveWellState;
  offsetWells: OffsetWell[];
  selectedWellId?: string;
  onSelectWell: (well: OffsetWell) => void;
  radiusKm?: number;
}

// Current well marker: Highlighted Orange Marker (Prompt requirement)
function createCurrentWellIcon() {
  return L.divIcon({
    className: 'custom-current-well-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
        <span style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(249, 115, 22, 0.3); border: 2px solid #f97316; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #f97316; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(249, 115, 22, 1);">
          <span style="color: #ffffff; font-size: 13px; font-weight: bold; font-family: monospace;">⏚</span>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

// Historical offset wells: Color-coded by Risk/History (Prompt requirement)
// Red: Significant historical events
// Amber: Moderate historical events
// Green: No major historical incidents
function createHistoricalWellIcon(well: OffsetWell, isSelected: boolean) {
  let bgColor = '#10b981'; // Green: No major incidents
  if (well.riskCategory === 'Significant') {
    bgColor = '#ef4444'; // Red: Significant events
  } else if (well.riskCategory === 'Moderate') {
    bgColor = '#f59e0b'; // Amber: Moderate events
  }

  const borderColor = isSelected ? '#38bdf8' : '#ffffff';
  const size = isSelected ? 32 : 26;

  return L.divIcon({
    className: 'custom-historical-well-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; width: ${size + 24}px; cursor: pointer;">
        <div style="
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          background: ${bgColor}; 
          border: 2px solid ${borderColor}; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 0 ${isSelected ? '12px rgba(56, 189, 248, 0.9)' : '6px rgba(0,0,0,0.8)'};
          font-family: monospace;
          font-size: 11px;
          font-weight: bold;
          color: #ffffff;
          transition: transform 0.2s ease;
        ">
          ${well.name.replace('Well ', '')}
        </div>
        <span style="
          margin-top: 2px;
          background: rgba(10, 16, 30, 0.92); 
          color: #e2e8f0; 
          font-size: 9px; 
          font-family: monospace; 
          padding: 1px 4px; 
          border-radius: 3px; 
          border: 1px solid rgba(148, 163, 184, 0.3);
          white-space: nowrap;
        ">
          ${well.distanceKm.toFixed(1)} km
        </span>
      </div>
    `,
    iconSize: [size + 24, size + 16],
    iconAnchor: [(size + 24) / 2, size / 2],
  });
}

export function MapInner({
  activeWell,
  offsetWells,
  selectedWellId,
  onSelectWell,
  radiusKm = 10,
}: MapInnerProps) {
  const center: [number, number] = [activeWell.lat, activeWell.lng];

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-slate-800 bg-[#070c17]">
      <MapContainer
        center={center}
        zoom={radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 10}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ minHeight: '340px' }}
      >
        {/* Dark CartoDB Matter tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> | Oil India Ltd GIS'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Selected Search Radius Circle */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#f97316',
            weight: 1.5,
            dashArray: '4, 6',
            fillColor: '#f97316',
            fillOpacity: 0.04,
          }}
        />

        {/* Inner 3 km buffer for visual reference if radius > 5km */}
        {radiusKm > 5 && (
          <Circle
            center={center}
            radius={3000}
            pathOptions={{
              color: '#38bdf8',
              weight: 1,
              dashArray: '3, 8',
              fillColor: '#0284c7',
              fillOpacity: 0.02,
            }}
          />
        )}

        {/* Current Well Marker (WELL-NWIS-01): Orange Marker */}
        <Marker position={center} icon={createCurrentWellIcon()}>
          <Popup>
            <div className="p-1 space-y-1.5 text-xs min-w-[200px]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                <span className="font-bold text-orange-400 font-mono">{activeWell.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-950 text-orange-300 border border-orange-700">
                  CURRENT WELL
                </span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <p>Field: <strong className="text-white">{activeWell.field}</strong></p>
                <p>Current Depth: <strong className="font-mono text-cyan-400">{activeWell.parameters.depth} m</strong></p>
                <p>Formation: <span className="font-mono text-slate-200">{activeWell.currentFormation}</span></p>
                <p>Active Status: <span className="text-emerald-400 font-bold uppercase">{activeWell.status}</span></p>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Historical Wells (Well A, Well B, Well C, Well D, etc.) */}
        {offsetWells.map((well) => {
          const isSelected = selectedWellId === well.id;
          return (
            <Marker
              key={well.id}
              position={[well.lat, well.lng]}
              icon={createHistoricalWellIcon(well, isSelected)}
              eventHandlers={{
                click: () => onSelectWell(well),
              }}
            >
              <Popup>
                <div className="p-1.5 space-y-2 text-xs min-w-[220px]">
                  {/* Well Name & Distance */}
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-white text-sm font-sans">{well.name}</span>
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">
                      {well.distanceKm.toFixed(1)} km
                    </span>
                  </div>

                  {/* Attributes: Formation, Total Depth, Events */}
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Formation:</span>
                      <strong className="text-white font-mono">{well.formation}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Total Depth:</span>
                      <span className="font-mono text-cyan-300">{well.totalDepth.toLocaleString()} m</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Critical Depth:</span>
                      <span className="font-mono text-rose-300 font-bold">{well.criticalDepth.toLocaleString()} m</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Similarity:</span>
                      <strong className="text-cyan-400 font-mono">{well.similarityScore}%</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Historical Events:</span>
                      <strong className={`font-mono ${
                        well.riskCategory === 'Significant' ? 'text-rose-400' : well.riskCategory === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {well.historicalEventsList.join(', ')}
                      </strong>
                    </p>
                  </div>

                  {/* Risk History */}
                  <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300">
                    <span className="text-slate-400 font-mono uppercase block text-[9px] font-bold">Risk History:</span>
                    <p className="mt-0.5 leading-tight">{well.riskHistory}</p>
                  </div>

                  <button
                    onClick={() => onSelectWell(well)}
                    className="w-full py-1.5 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Inspect Well Intelligence</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Header Overlay */}
      <div className="absolute top-2.5 left-2.5 z-[1000] px-2.5 py-1.5 rounded-md bg-[#080d19]/90 border border-slate-800/80 backdrop-blur-sm pointer-events-none">
        <p className="text-xs font-bold text-white flex items-center gap-1.5">
          <span>Nearby Wells GIS Radar</span>
          <span className="text-[10px] font-mono text-cyan-400">{radiusKm} km search radius</span>
        </p>
      </div>

      {/* Legend (Prompt requirement: Green / Amber / Red / Orange) */}
      <div className="absolute bottom-2.5 left-2.5 z-[1000] p-2.5 rounded-md bg-[#080d19]/95 border border-slate-800/90 backdrop-blur-sm pointer-events-none text-[10px] space-y-1.5 shadow-xl">
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/30" />
          <span className="text-slate-200 font-bold">Current Well (WELL-NWIS-01)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-slate-300">Red: Significant Historical Events</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-slate-300">Amber: Moderate Historical Events</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-300">Green: No Major Historical Incidents</span>
        </div>
      </div>
    </div>
  );
}
