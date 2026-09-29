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
import { AIAssistantView } from '@/components/views/AIAssistantView';
import { RiskAnalysisView } from '@/components/views/RiskAnalysisView';
import { NearbyWellsView } from '@/components/views/NearbyWellsView';
import { AlertDetailView } from '@/components/alerts/AlertDetailView';
import { DocumentIntelligenceView } from '@/components/views/DocumentIntelligenceView';
import { KnowledgeBaseView } from '@/components/views/KnowledgeBaseView';
import { WellComparisonView } from '@/components/views/WellComparisonView';
import { LiveMonitoringView } from '@/components/views/LiveMonitoringView';
import { SettingsView } from '@/components/views/SettingsView';

// Modals
import { SimulationDepthModal } from '@/components/modals/SimulationDepthModal';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AIAssistantPage() {
  const [activeWell, setActiveWell] = useState<ActiveWellState>(INITIAL_ACTIVE_WELL);
  const [currentDepth, setCurrentDepth] = useState<number>(INITIAL_ACTIVE_WELL.parameters.depth);
  const [activeView, setActiveView] = useState<string>('ai-assistant');
  const [selectedWell, setSelectedWell] = useState<OffsetWell | null>(OFFSET_WELLS[0]);
  
  // Modals state
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string | undefined>(undefined);

  // Active risk alert
  const [alert, setAlert] = useState(PRIMARY_RISK_ALERT);
  const [unreadAlertCount, setUnreadAlertCount] = useState(3);

  const handleSelectWell = (well: OffsetWell) => {
    setSelectedWell(well);
  };

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

  const handleOpenDoc = (docName: string) => {
    setSelectedDocId(docName);
  };

  const handleNavigateView = (viewId: string) => {
    if (viewId === 'dashboard') {
      window.location.href = '/';
    } else if (viewId === 'nearby-wells') {
      window.location.href = '/nearby-wells';
    } else if (viewId === 'risk-analysis') {
      window.location.href = '/risk-analysis';
    } else if (viewId === 'documents' || viewId === 'historical-reports') {
      window.location.href = '/documents';
    } else if (viewId === 'knowledge-base') {
      window.location.href = '/knowledge-base';
    } else if (viewId === 'ai-assistant') {
      setActiveView('ai-assistant');
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

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1720px] mx-auto w-full">
          {/* VIEW: AI DRILLING ASSISTANT */}
          {activeView === 'ai-assistant' && (
            <AIAssistantView
              activeWell={activeWell}
              currentDepth={currentDepth}
              onOpenDoc={handleOpenDoc}
              initialQuery={assistantInitialQuery}
            />
          )}

          {/* VIEW: RISK ANALYSIS */}
          {activeView === 'risk-analysis' && (
            <RiskAnalysisView
              activeWell={activeWell}
              currentDepth={currentDepth}
              onOpenDoc={handleOpenDoc}
              onOpenDepthSimulator={() => setIsDepthModalOpen(true)}
            />
          )}

          {/* VIEW: RISK ALERTS */}
          {activeView === 'alerts' && (
            <AlertDetailView
              alert={alert}
              activeWell={activeWell}
              offsetWells={OFFSET_WELLS}
              currentDepth={currentDepth}
              onBack={() => setActiveView('ai-assistant')}
              onOpenDoc={handleOpenDoc}
              onSelectWell={(w) => {
                handleSelectWell(w);
                window.location.href = '/nearby-wells';
              }}
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
              onViewRiskAlert={() => setActiveView('alerts')}
            />
          )}

          {/* VIEW: DOCUMENT INTELLIGENCE */}
          {activeView === 'documents' && (
            <DocumentIntelligenceView />
          )}

          {/* VIEW: KNOWLEDGE BASE */}
          {activeView === 'knowledge-base' && (
            <KnowledgeBaseView 
              onOpenDoc={handleOpenDoc}
              onOpenAssistant={(q) => {
                setAssistantInitialQuery(q);
                setActiveView('ai-assistant');
              }}
            />
          )}

          {/* VIEW: WELL COMPARISON MATRIX */}
          {activeView === 'well-comparison' && (
            <WellComparisonView
              activeWell={activeWell}
              onOpenDoc={handleOpenDoc}
              onViewRiskAlert={() => setActiveView('alerts')}
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

          {/* VIEW: SETTINGS */}
          {activeView === 'settings' && (
            <SettingsView activeWell={activeWell} />
          )}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <SimulationDepthModal
        isOpen={isDepthModalOpen}
        onClose={() => setIsDepthModalOpen(false)}
        currentDepth={currentDepth}
        onUpdateDepth={handleUpdateDepth}
      />

      {selectedDocId && (
        <DocumentViewerModal
          documentIdOrName={selectedDocId}
          isOpen={!!selectedDocId}
          onClose={() => setSelectedDocId(null)}
        />
      )}

      {selectedEventDetails && (
        <EventDetailModal
          event={selectedEventDetails}
          isOpen={!!selectedEventDetails}
          onClose={() => setSelectedEventDetails(null)}
          onOpenDoc={handleOpenDoc}
        />
      )}
      </div>
    </AuthGuard>
  );
}
