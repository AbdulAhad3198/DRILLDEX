'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';

// Data Hooks & Models
import { useActiveWell } from '@/hooks/useActiveWell';
import { useNearbyWells } from '@/hooks/useNearbyWells';
import { useRiskAnalysis } from '@/hooks/useRiskAnalysis';
import { useRealtimeDrilling } from '@/hooks/useRealtimeDrilling';
import { OffsetWell, RealTimeParameters } from '@/types';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

// Dashboard Components
import { MetricCardsBar } from '@/components/dashboard/MetricCardsBar';
import { NearbyWellsMap } from '@/components/dashboard/NearbyWellsMap';
import { CriticalRiskPanel } from '@/components/dashboard/CriticalRiskPanel';
import { DrillingDepthCharts } from '@/components/dashboard/DrillingDepthCharts';
import { HistoricalEventsTimeline } from '@/components/dashboard/HistoricalEventsTimeline';
import { AIInsightsStrip } from '@/components/dashboard/AIInsightsStrip';

// Dedicated Views
import { RiskAnalysisView } from '@/components/views/RiskAnalysisView';
import { AlertCenterView } from '@/components/views/AlertCenterView';
import { NearbyWellsView } from '@/components/views/NearbyWellsView';
import { DocumentIntelligenceView } from '@/components/views/DocumentIntelligenceView';
import { WellComparisonView } from '@/components/views/WellComparisonView';
import { KnowledgeBaseView } from '@/components/views/KnowledgeBaseView';
import { LiveMonitoringView } from '@/components/views/LiveMonitoringView';
import { AIAssistantView } from '@/components/views/AIAssistantView';
import { SettingsView } from '@/components/views/SettingsView';

// Modals & Drawers
import { SimulationDepthModal } from '@/components/modals/SimulationDepthModal';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';

import { Footer } from '@/components/Footer';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Icons
import { Compass, ExternalLink } from 'lucide-react';

export default function Home() {
  const { activeWell, updateDepth } = useActiveWell();
  const { wells: offsetWells } = useNearbyWells();
  const { primaryAlert } = useRiskAnalysis();

  const [currentDepth, setCurrentDepth] = useState<number>(activeWell?.parameters?.depth || 4980);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedWellState, setSelectedWellState] = useState<OffsetWell | null>(null);

  const selectedWell = selectedWellState || (offsetWells.length > 0 ? offsetWells[0] : null);

  // Depth update handler
  const handleUpdateDepth = useCallback((newDepth: number) => {
    setCurrentDepth(newDepth);
    updateDepth(newDepth);
  }, [updateDepth]);

  // Subscribe to real-time WebSocket telemetry if enabled
  useRealtimeDrilling(useCallback((updatedParams: Partial<RealTimeParameters>) => {
    if (updatedParams.depth) {
      handleUpdateDepth(updatedParams.depth);
    }
  }, [handleUpdateDepth]));

  // Modals state
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<unknown | null>(null);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string | undefined>(undefined);
  const [unreadAlertCount] = useState(3);

  // Well selection handler
  const handleSelectWell = (well: OffsetWell) => {
    setSelectedWellState(well);
  };

  const handleSelectWellById = (wellId: string) => {
    const found = offsetWells.find((w) => w.id === wellId);
    if (found) setSelectedWellState(found);
  };

  // Open Document Modal
  const handleOpenDoc = (docName: string) => {
    setSelectedDocId(docName);
  };

  // Open Event Modal
  const handleViewEvent = (eventData: unknown) => {
    setSelectedEventDetails(eventData);
  };

  // Open Assistant with query
  const handleOpenAssistantWithQuery = (query?: string) => {
    setAssistantInitialQuery(query);
    setActiveView('ai-assistant');
  };

  if (!activeWell) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-[#060a14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          alertCount={unreadAlertCount}
        />

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top Header */}
          <Header
            well={activeWell}
            currentDepth={currentDepth}
            onOpenDepthSimulator={() => setIsDepthModalOpen(true)}
            activeView={activeView}
            setActiveView={setActiveView}
            unreadAlertCount={unreadAlertCount}
          />

          {/* Primary Page Content */}
          <main className="flex-1 p-4 md:p-5 max-w-[1720px] w-full mx-auto">
            {/* MAIN OPERATIONS DASHBOARD */}
            {activeView === 'dashboard' && (
              <div className="space-y-3.5 pb-8 animate-in fade-in duration-200">
                {/* TOP METRIC ROW (Technical Cards) */}
                <MetricCardsBar
                  parameters={activeWell.parameters}
                  currentDepth={currentDepth}
                />

                {/* MAIN GRID: LEFT/CENTER (GIS Map & Well Inspector) & RIGHT (Risk & Intelligence Panel) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                  {/* LEFT / CENTER: GIS MAP + SELECTED WELL INSPECTOR (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col space-y-3">
                    {/* GIS Leaflet Map with subtle radius */}
                    <div className="h-[380px] rounded-lg overflow-hidden border border-slate-800 shadow-md">
                      <NearbyWellsMap
                        activeWell={activeWell}
                        offsetWells={offsetWells}
                        selectedWellId={selectedWell?.id}
                        onSelectWell={handleSelectWell}
                        radiusKm={10}
                      />
                    </div>

                    {/* Selected Well Information Card */}
                    {selectedWell && (
                      <div className="p-3.5 rounded-lg bg-[#0b1324] border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <Compass className="h-4 w-4 text-cyan-400" />
                            <span className="font-bold text-white text-xs">
                              Selected Offset Well: <strong className="text-cyan-300 font-mono">{selectedWell.name}</strong>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({selectedWell.code})
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {selectedWell.distanceKm.toFixed(1)} km from {activeWell.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-sans block">Formation</span>
                            <strong className="text-white text-xs">{selectedWell.formation}</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                            <span className="text-[10px] text-slate-400 font-sans block">Total Depth</span>
                            <strong className="text-cyan-300 text-xs">{selectedWell.totalDepth.toLocaleString()} m</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 col-span-2">
                            <span className="text-[10px] text-slate-400 font-sans block">Historical Events</span>
                            <strong className="text-rose-300 text-xs truncate block">
                              {selectedWell.incidents.length > 0
                                ? `${selectedWell.incidents[0].type} @ ${selectedWell.incidents[0].depth} m (${selectedWell.incidents[0].mitigation.slice(0, 38)}...)`
                                : 'Normal drilling / No severe loss logged'}
                            </strong>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-900/40 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                          <div>
                            <strong className="text-slate-400 font-mono text-[10px] uppercase">Risk History: </strong>
                            <span>{selectedWell.riskHistory}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <Link
                              href={`/wells/${selectedWell.id}`}
                              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Dossier</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <button
                              onClick={() => setActiveView('well-comparison')}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Compare</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: CRITICAL RISK & EVIDENCE PANEL (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col">
                    <CriticalRiskPanel
                      alert={primaryAlert as unknown as Parameters<typeof CriticalRiskPanel>[0]['alert']}
                      currentDepth={currentDepth}
                      onSelectWell={handleSelectWellById}
                      onOpenDoc={handleOpenDoc}
                      onViewEvent={handleViewEvent}
                      onViewFullAnalysis={() => setActiveView('risk-analysis')}
                    />
                  </div>
                </div>

                {/* BOTTOM: DRILLING CHARTS + HISTORICAL EVENTS TIMELINE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                  {/* Drilling Charts (Recharts) (7 cols) */}
                  <div className="lg:col-span-7 h-[280px]">
                    <DrillingDepthCharts currentDepth={currentDepth} />
                  </div>

                  {/* Historical Events Timeline (5 cols) */}
                  <div className="lg:col-span-5 h-[280px]">
                    <HistoricalEventsTimeline
                      currentDepth={currentDepth}
                      onSelectEvent={(evt) => {
                        if (evt.well) {
                          const wName = evt.well.split(' ')[1];
                          const found = offsetWells.find((w) => w.name.includes(wName));
                          if (found) setSelectedWellState(found);
                        }
                      }}
                      onOpenDoc={handleOpenDoc}
                    />
                  </div>
                </div>

                {/* AI Insights Strip */}
                <AIInsightsStrip
                  currentDepth={currentDepth}
                  onOpenAlertDetails={() => setActiveView('alerts')}
                  onOpenAssistant={() => handleOpenAssistantWithQuery()}
                />

                {/* Bottom Mission Slogan & Compliance Note */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="font-semibold text-slate-300">
                    DRILLDEX — Smarter Drilling. Safer Wells.
                  </span>
                  <span className="font-mono text-slate-500">
                    eRTMAC-NWIS Decision Support System · Oil India Limited / SIH 2026 PS 26121
                  </span>
                </div>
              </div>
            )}

            {/* VIEW: RISK ANALYSIS / RISK INTELLIGENCE */}
            {activeView === 'risk-analysis' && (
              <RiskAnalysisView
                activeWell={activeWell}
                currentDepth={currentDepth}
                onOpenDoc={handleOpenDoc}
                onOpenDepthSimulator={() => setIsDepthModalOpen(true)}
              />
            )}

            {/* VIEW: RISK ALERTS & GLOBAL ALERT CENTER */}
            {activeView === 'alerts' && <AlertCenterView />}

            {/* VIEW: NEARBY OFFSET WELLS GIS */}
            {activeView === 'nearby-wells' && (
              <NearbyWellsView
                activeWell={activeWell}
                wells={offsetWells}
                selectedWell={selectedWell}
                onSelectWell={handleSelectWell}
                onOpenDoc={handleOpenDoc}
                onViewRiskAlert={() => setActiveView('alerts')}
              />
            )}

            {/* VIEW: DOCUMENT INTELLIGENCE / HISTORICAL REPORTS */}
            {(activeView === 'historical-reports' || activeView === 'documents') && (
              <DocumentIntelligenceView />
            )}

            {/* VIEW: WELL COMPARISON MATRIX */}
            {activeView === 'well-comparison' && (
              <WellComparisonView
                activeWell={activeWell}
                onOpenDoc={handleOpenDoc}
                onViewRiskAlert={() => setActiveView('alerts')}
              />
            )}

            {/* VIEW: KNOWLEDGE BASE / SMART OFFSET MACHINE */}
            {activeView === 'knowledge-base' && (
              <KnowledgeBaseView
                onOpenDoc={handleOpenDoc}
                onOpenAssistant={handleOpenAssistantWithQuery}
              />
            )}

            {/* VIEW: LIVE MONITORING */}
            {activeView === 'live-monitoring' && (
              <LiveMonitoringView
                activeWell={activeWell}
                currentDepth={currentDepth}
                onOpenDepthSimulator={() => setIsDepthModalOpen(true)}
              />
            )}

            {/* VIEW: AI ASSISTANT / DECISION COPILOT */}
            {activeView === 'ai-assistant' && (
              <AIAssistantView
                activeWell={activeWell}
                currentDepth={currentDepth}
                onOpenDoc={handleOpenDoc}
                initialQuery={assistantInitialQuery}
              />
            )}

            {/* VIEW: SETTINGS */}
            {activeView === 'settings' && <SettingsView activeWell={activeWell} />}
          </main>

          {/* Global Footer */}
          <Footer />
        </div>

        {/* Global Interactive Modals */}
        <SimulationDepthModal
          isOpen={isDepthModalOpen}
          onClose={() => setIsDepthModalOpen(false)}
          currentDepth={currentDepth}
          onUpdateDepth={handleUpdateDepth}
        />

        <DocumentViewerModal
          isOpen={Boolean(selectedDocId)}
          onClose={() => setSelectedDocId(null)}
          documentIdOrName={selectedDocId}
        />

        <EventDetailModal
          isOpen={Boolean(selectedEventDetails)}
          onClose={() => setSelectedEventDetails(null)}
          event={selectedEventDetails as Parameters<typeof EventDetailModal>[0]['event']}
          onOpenDoc={handleOpenDoc}
        />
      </div>
    </AuthGuard>
  );
}
