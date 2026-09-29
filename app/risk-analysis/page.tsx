'use client';

import React, { useState } from 'react';
import { 
  INITIAL_ACTIVE_WELL, 
  OFFSET_WELLS, 
  PRIMARY_RISK_ALERT, 
  OffsetWell, 
  ActiveWellState 
} from '@/lib/data';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

// Dedicated Views
import { RiskAnalysisView } from '@/components/views/RiskAnalysisView';
import { NearbyWellsView } from '@/components/views/NearbyWellsView';
import { AlertDetailView } from '@/components/alerts/AlertDetailView';
import { HistoricalReportsView } from '@/components/views/HistoricalReportsView';
import { WellComparisonView } from '@/components/views/WellComparisonView';
import { KnowledgeBaseView } from '@/components/views/KnowledgeBaseView';
import { LiveMonitoringView } from '@/components/views/LiveMonitoringView';
import { AIAssistantView } from '@/components/views/AIAssistantView';
import { SettingsView } from '@/components/views/SettingsView';

// Modals
import { SimulationDepthModal } from '@/components/modals/SimulationDepthModal';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function RiskAnalysisPage() {
  const [activeWell, setActiveWell] = useState<ActiveWellState>(INITIAL_ACTIVE_WELL);
  const [currentDepth, setCurrentDepth] = useState<number>(INITIAL_ACTIVE_WELL.parameters.depth);
  const [activeView, setActiveView] = useState<string>('risk-analysis');
  const [selectedWell, setSelectedWell] = useState<OffsetWell | null>(OFFSET_WELLS[0]); // Well A default
  
  // Modals state
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string | undefined>(undefined);

  // Active risk alert
  const [alert, setAlert] = useState(PRIMARY_RISK_ALERT);
  const [unreadAlertCount, setUnreadAlertCount] = useState(3);

  // Well selection handler
  const handleSelectWell = (well: OffsetWell) => {
    setSelectedWell(well);
  };

  // Depth update handler
  const handleUpdateDepth = (newDepth: number) => {
    setCurrentDepth(newDepth);
    setActiveWell(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        depth: newDepth,
      },
    }));
  };

  // Open Document Modal
  const handleOpenDoc = (docName: string) => {
    setSelectedDocId(docName);
  };

  // Open Assistant with query
  const handleOpenAssistantWithQuery = (query?: string) => {
    setAssistantInitialQuery(query);
    setActiveView('ai-assistant');
  };

  const handleNavigateView = (viewId: string) => {
    if (viewId === 'dashboard') {
      window.location.href = '/';
    } else if (viewId === 'nearby-wells') {
      window.location.href = '/nearby-wells';
    } else {
      setActiveView(viewId);
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-[#060a14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Left Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleNavigateView}
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
          setActiveView={handleNavigateView}
          unreadAlertCount={unreadAlertCount}
        />

        {/* Primary Page Content */}
        <main className="flex-1 p-4 md:p-5 max-w-[1720px] w-full mx-auto">
          {/* VIEW: RISK ANALYSIS / RISK INTELLIGENCE */}
          {activeView === 'risk-analysis' && (
            <RiskAnalysisView
              activeWell={activeWell}
              currentDepth={currentDepth}
              onOpenDoc={handleOpenDoc}
              onOpenDepthSimulator={() => setIsDepthModalOpen(true)}
            />
          )}

          {/* VIEW: NEARBY OFFSET WELLS GIS */}
          {activeView === 'nearby-wells' && (
            <NearbyWellsView
              activeWell={activeWell}
              wells={OFFSET_WELLS}
              selectedWell={selectedWell}
              onSelectWell={handleSelectWell}
              onOpenDoc={handleOpenDoc}
              onViewRiskAlert={() => setActiveView('risk-analysis')}
            />
          )}

          {/* VIEW: RISK ALERTS & ALERT DETAILS */}
          {activeView === 'alerts' && (
            <AlertDetailView
              alert={alert}
              activeWell={activeWell}
              offsetWells={OFFSET_WELLS}
              currentDepth={currentDepth}
              onBack={() => setActiveView('risk-analysis')}
              onOpenDoc={handleOpenDoc}
              onSelectWell={(w) => {
                handleSelectWell(w);
                setActiveView('nearby-wells');
              }}
            />
          )}

          {/* VIEW: HISTORICAL REPORTS (Centralized Well DB) */}
          {activeView === 'historical-reports' && (
            <HistoricalReportsView onOpenDoc={handleOpenDoc} />
          )}

          {/* VIEW: WELL COMPARISON MATRIX */}
          {activeView === 'well-comparison' && (
            <WellComparisonView
              activeWell={activeWell}
              onOpenDoc={handleOpenDoc}
              onViewRiskAlert={() => setActiveView('risk-analysis')}
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
          {activeView === 'settings' && (
            <SettingsView activeWell={activeWell} />
          )}
        </main>
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
        event={selectedEventDetails}
        onOpenDoc={handleOpenDoc}
      />
      </div>
    </AuthGuard>
  );
}
