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
import { WellComparisonView } from '@/components/views/WellComparisonView';
import { RiskAnalysisView } from '@/components/views/RiskAnalysisView';
import { NearbyWellsView } from '@/components/views/NearbyWellsView';
import { AlertDetailView } from '@/components/alerts/AlertDetailView';
import { DocumentIntelligenceView } from '@/components/views/DocumentIntelligenceView';
import { KnowledgeBaseView } from '@/components/views/KnowledgeBaseView';
import { LiveMonitoringView } from '@/components/views/LiveMonitoringView';
import { AIAssistantView } from '@/components/views/AIAssistantView';
import { AlertCenterView } from '@/components/views/AlertCenterView';
import { SettingsView } from '@/components/views/SettingsView';

// Modals & Drawers
import { SimulationDepthModal } from '@/components/modals/SimulationDepthModal';
import { DocumentViewerModal } from '@/components/modals/DocumentViewerModal';
import { EventDetailModal } from '@/components/modals/EventDetailModal';
import { NotificationDrawer, NotificationItem } from '@/components/drawers/NotificationDrawer';
import { AuthGuard } from '@/components/auth/AuthGuard';

const MOCK_DRAWER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ALT-1001',
    title: 'Potential Stuck Pipe Risk',
    riskType: 'Stuck Pipe Risk',
    severity: 'High Priority',
    well: 'WELL-NWIS-01',
    depth: '5,035 m',
    interval: '5,030–5,070 m',
    timestamp: '12 mins ago',
    reason: 'Comparable formation and historical torque/stuck-pipe events within the upcoming interval.',
    evidenceCount: 3,
    status: 'New',
  },
];

export default function WellComparisonPage() {
  const [activeWell, setActiveWell] = useState<ActiveWellState>(INITIAL_ACTIVE_WELL);
  const [currentDepth, setCurrentDepth] = useState<number>(INITIAL_ACTIVE_WELL.parameters.depth);
  const [activeView, setActiveView] = useState<string>('well-comparison');
  const [selectedWell, setSelectedWell] = useState<OffsetWell | null>(OFFSET_WELLS[0]);
  
  // Modals & Drawers state
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerNotifications, setDrawerNotifications] = useState<NotificationItem[]>(MOCK_DRAWER_NOTIFICATIONS);

  const unreadAlertCount = drawerNotifications.filter(n => n.status === 'New').length;

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

  const handleAcknowledgeDrawerNotification = (id: string) => {
    setDrawerNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'Acknowledged' } : n)
    );
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
      window.location.href = '/ai-assistant';
    } else if (viewId === 'live-monitoring') {
      window.location.href = '/live-monitoring';
    } else if (viewId === 'alerts') {
      window.location.href = '/alerts';
    } else if (viewId === 'well-comparison') {
      setActiveView('well-comparison');
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
          setActiveView={(v) => {
            if (v === 'alerts') {
              setIsDrawerOpen(true);
            } else {
              handleNavigateView(v);
            }
          }}
          unreadAlertCount={unreadAlertCount}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1720px] mx-auto w-full">
          {/* VIEW: WELL COMPARISON */}
          {activeView === 'well-comparison' && (
            <WellComparisonView
              activeWell={activeWell}
              onOpenDoc={handleOpenDoc}
              onViewRiskAlert={() => handleNavigateView('alerts')}
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

          {/* VIEW: GLOBAL ALERT CENTER */}
          {activeView === 'alerts' && (
            <AlertCenterView />
          )}

          {/* VIEW: NEARBY OFFSET WELLS GIS */}
          {activeView === 'nearby-wells' && (
            <NearbyWellsView
              activeWell={activeWell}
              wells={OFFSET_WELLS}
              selectedWell={selectedWell}
              onSelectWell={handleSelectWell}
              onOpenDoc={handleOpenDoc}
              onViewRiskAlert={() => handleNavigateView('alerts')}
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
                window.location.href = `/ai-assistant?q=${encodeURIComponent(q || '')}`;
              }}
            />
          )}

          {/* VIEW: LIVE MONITORING */}
          {activeView === 'live-monitoring' && (
            <LiveMonitoringView
              activeWell={activeWell}
              currentDepth={currentDepth}
              onOpenDepthSimulator={() => setIsDepthModalOpen(true)}
              onUpdateDepth={handleUpdateDepth}
            />
          )}

          {/* VIEW: AI DRILLING ASSISTANT */}
          {activeView === 'ai-assistant' && (
            <AIAssistantView
              activeWell={activeWell}
              currentDepth={currentDepth}
              onOpenDoc={handleOpenDoc}
            />
          )}

          {/* VIEW: SETTINGS */}
          {activeView === 'settings' && (
            <SettingsView activeWell={activeWell} />
          )}
        </main>
      </div>

      {/* NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={drawerNotifications}
        onAcknowledge={handleAcknowledgeDrawerNotification}
        onOpenDoc={handleOpenDoc}
      />

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
