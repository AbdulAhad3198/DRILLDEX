export interface RealTimeParameters {
  depth: number; // meters (4,980 m)
  targetDepth: number; // meters (5,500 m)
  rop: number; // m/hr (18.4)
  ropDeltaPct: number;
  wob: number; // klbf (24)
  torque: number; // kNm (31.8)
  torqueDeltaPct: number;
  rpm: number; // rpm (118)
  spp: number; // psi (3,240)
  flowRate: number; // gpm (620)
  mudWeight: number; // SG (1.18)
  ecd: number; // SG (1.24)
  gasUnits: number; // units (42)
  pitVolume: number; // bbl
  tripMargin: number; // psi
}

export interface OffsetWellIncident {
  id: string;
  type: 'Mud Loss' | 'High Torque' | 'Stuck Pipe' | 'Kick' | 'Normal Drilling';
  depth: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Nominal';
  formation: string;
  description: string;
  mitigation: string;
  outcome: 'Worked' | 'Partially Worked' | 'Failed / NPT';
  nptHours: number;
  sourceDocId: string;
  sourceDocName: string;
  sourceDocPage: number;
}

export interface OffsetWell {
  id: string;
  name: string; // "Well A", "Well B", etc.
  code: string;
  distanceKm: number;
  bearing: string;
  lat: number;
  lng: number;
  formation: string;
  lithology: string;
  wellType: 'Development' | 'Exploration' | 'Appraisal' | 'Abandoned';
  spudDate: string;
  completedDate: string;
  drillingDuration: string; // e.g. "103 days"
  totalDepth: number;
  criticalDepth: number; // e.g. 5,040 m
  status: 'Producing' | 'Shut-in' | 'Plugged & Abandoned' | 'Suspended';
  riskCategory: 'Significant' | 'Moderate' | 'Low';
  similarityScore: number; // e.g. 91%
  similarityBreakdown: {
    geographic: number; // 92%
    formation: number; // 96%
    depth: number; // 87%
    parameter: number; // 89%
  };
  historicalEventsList: string[]; // ["Mud Loss", "Lost Circulation", "Torque Spike"]
  relevantDocuments: { id: string; name: string; type: string }[];
  incidents: OffsetWellIncident[];
  summaryNote: string;
  riskHistory: string;
}

export interface RiskAlert {
  id: string;
  header: string; // "POTENTIAL RISK AHEAD"
  title: string; // Compatibility alias
  risk: string; // "High Torque / Stuck Pipe"
  riskType: string; // Compatibility alias
  riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  severity: 'Critical' | 'High' | 'Medium' | 'Low'; // Compatibility alias
  currentDepth: number; // 4,980 m
  riskIntervalStart: number; // 5,030 m
  riskIntervalEnd: number; // 5,070 m
  expectedIntervalStart: number; // Compatibility alias
  expectedIntervalEnd: number; // Compatibility alias
  distanceToInterval: number; // 50 m
  formation: string; // "Formation X"
  lithology: string;
  evidenceSummary: string; // "3 similar offset wells"
  whyExplanation: string;
  evidenceCards: {
    wellId: string;
    wellName: string; // "Well A", "Well B", "Well C"
    distanceKm: number; // 3.0 km, 4.7 km, 6.2 km
    formation: string; // "Formation X"
    event: string; // "Mud Loss", "High Torque", "Stuck Pipe"
    depth: number; // 5,040 m, 5,060 m, 5,025 m
    sourceDoc: string; // "DDR-2021-WELL-A-042"
    relevancePct: number;
    mitigationApplied: string;
  }[];
  evidenceItems: {
    wellId: string;
    wellName: string;
    distanceKm: number;
    depth: number;
    formation: string;
    incidentType: string;
    relevancePct: number;
    sourceDoc: string;
  }[];
  keyObservations: string[];
  recommendation: {
    title: string; // "ENGINEER REVIEW RECOMMENDATION"
    body: string; // "Review historical drilling parameters and mitigation practices from comparable offset wells before entering the identified interval."
    disclaimer: string; // "Final operational decisions remain with the drilling engineer."
  };
  keyActions: {
    id: string;
    label: string;
    completed: boolean;
    priority: 'Immediate' | 'Pre-Interval' | 'Standby';
  }[];
  mitigationHistory: {
    wellId: string;
    wellName: string;
    actionTaken: string;
    result: 'Worked' | 'Partially Worked' | 'Failed';
    sourceDoc: string;
    notes: string;
  }[];
}

export interface SourceDocument {
  id: string;
  name: string;
  title: string;
  type: 'WCR' | 'DDR' | 'Mud Log' | 'Incident Report';
  wellName: string;
  wellCode: string;
  date: string;
  author: string;
  fileSize: string;
  ocrExtractedText: string;
  keyHighlights: string[];
  parametersLogged: {
    depth: string;
    mudWeight: string;
    lossRate: string;
    torqueSpike: string;
    mitigationApplied: string;
  };
}

export interface ActiveWellState {
  id: string;
  name: string; // "WELL-NWIS-01"
  code: string;
  field: string; // "Prototype Field Alpha"
  block: string;
  basin: string;
  location: string;
  lat: number;
  lng: number;
  spudDate: string;
  status: string; // "DRILLING"
  connection: string; // "LIVE"
  dataSource: string; // "eRTMAC Stream"
  operator: string;
  currentFormation: string; // "Formation X"
  lithology: string;
  parameters: RealTimeParameters;
}

export interface TimelineEvent {
  depth: number;
  title: string;
  well?: string;
  description: string;
  category: 'normal' | 'geological' | 'current' | 'incident';
  type: 'Normal drilling' | 'Formation change' | 'Current Depth' | 'Stuck pipe' | 'Mud loss' | 'High torque';
  severity?: 'critical' | 'high' | 'info' | 'nominal';
}

// ACTIVE WELL SCENARIO (WELL-NWIS-01)
export const INITIAL_ACTIVE_WELL: ActiveWellState = {
  id: 'WELL-NWIS-01',
  name: 'WELL-NWIS-01',
  code: 'WELL-NWIS-01',
  field: 'Prototype Field Alpha',
  block: 'Block-AA-ONHP-2026/1',
  basin: 'Upper Assam Shelf Basin',
  location: 'Assam, India',
  lat: 27.4912,
  lng: 95.3421,
  spudDate: '12 Apr 2026',
  status: 'DRILLING',
  connection: 'LIVE',
  dataSource: 'eRTMAC Stream',
  operator: 'Oil India Limited (OIL)',
  currentFormation: 'Formation X',
  lithology: 'Interbedded Sandstone / Fractured Carbonaceous Shale',
  parameters: {
    depth: 4980, // Scenario: 4,980 m
    targetDepth: 5500,
    rop: 18.4, // 18.4 m/hr
    ropDeltaPct: 12,
    wob: 24, // 24 klbf
    torque: 31.8, // 31.8 kNm
    torqueDeltaPct: 8,
    rpm: 118, // 118
    spp: 3240, // 3,240 psi
    flowRate: 620, // 620 gpm
    mudWeight: 1.18, // 1.18 SG
    ecd: 1.24, // 1.24 SG
    gasUnits: 42,
    pitVolume: 480,
    tripMargin: 240,
  },
};

// NEARBY / OFFSET WELLS
export const OFFSET_WELLS: OffsetWell[] = [
  {
    id: 'WELL-A',
    name: 'Well A',
    code: 'OFFSET-A-042',
    distanceKm: 3.0, // 3.0 km
    bearing: 'NW (315°)',
    lat: 27.5115,
    lng: 95.3218,
    formation: 'Formation X',
    lithology: 'Micro-fractured Sandstone / Shale',
    wellType: 'Development',
    spudDate: '15 Jan 2021',
    completedDate: '28 Apr 2021',
    drillingDuration: '103 days',
    totalDepth: 5320,
    criticalDepth: 5040,
    status: 'Producing',
    riskCategory: 'Significant',
    similarityScore: 91, // Prompt example: 91%
    similarityBreakdown: {
      geographic: 92,
      formation: 96,
      depth: 87,
      parameter: 89,
    },
    historicalEventsList: ['Mud Loss', 'Lost Circulation', 'Torque Spike'],
    relevantDocuments: [
      { id: 'DOC-DDR-WELL-A-042', name: 'DDR-2021-WELL-A-042', type: 'DDR' },
    ],
    summaryNote: 'Experienced severe mud loss (78 bbl/hr) at 5,040 m upon entering depleted sandstone member of Formation X.',
    riskHistory: 'High mud loss zone at 5,040 m; required coarse LCM pill and 4.5h hesitation squeeze.',
    incidents: [
      {
        id: 'INC-A-1',
        type: 'Mud Loss',
        depth: 5040,
        severity: 'High',
        formation: 'Formation X',
        description: 'Complete lost circulation (78 bbl/hr) upon penetrating micro-fractures in Formation X at 5,040 m. Standpipe pressure dropped 350 psi.',
        mitigation: 'Spotted 40 bbl coarse LCM pill (calcium carbonate + nutplug + mica) with 4.5h hesitation squeeze. Total circulation regained.',
        outcome: 'Worked',
        nptHours: 26.0,
        sourceDocId: 'DOC-DDR-WELL-A-042',
        sourceDocName: 'DDR-2021-WELL-A-042',
        sourceDocPage: 42,
      },
    ],
  },
  {
    id: 'WELL-B',
    name: 'Well B',
    code: 'OFFSET-B-118',
    distanceKm: 4.7, // 4.7 km
    bearing: 'NE (045°)',
    lat: 27.5210,
    lng: 95.3780,
    formation: 'Formation X',
    lithology: 'Carbonaceous Shale & High-Stress Coal Stringers',
    wellType: 'Development',
    spudDate: '04 Aug 2022',
    completedDate: '19 Nov 2022',
    drillingDuration: '98 days',
    totalDepth: 5410,
    criticalDepth: 5060,
    status: 'Shut-in',
    riskCategory: 'Moderate',
    similarityScore: 89,
    similarityBreakdown: {
      geographic: 88,
      formation: 95,
      depth: 89,
      parameter: 84,
    },
    historicalEventsList: ['High Torque', 'Tight Hole', 'Drillstring Vibration'],
    relevantDocuments: [
      { id: 'DOC-DDR-WELL-B-118', name: 'DDR-2022-WELL-B-118', type: 'DDR' },
    ],
    summaryNote: 'Logged erratic torque spikes to 38 kNm with top drive stalling at 5,060 m due to reactive formation stress.',
    riskHistory: 'Severe torque fluctuations and tight hole between 5,050–5,070 m in Formation X.',
    incidents: [
      {
        id: 'INC-B-1',
        type: 'High Torque',
        depth: 5060,
        severity: 'High',
        formation: 'Formation X',
        description: 'Rotary torque jumped from 22 kNm to 38 kNm with top drive stalling twice during connection break at 5,060 m.',
        mitigation: 'Rheology conditioning (reduced Yield Point from 26 to 18 lb/100ft²), dosed lubricant beads, and reduced ROP to 6 m/hr with wiper trips.',
        outcome: 'Worked',
        nptHours: 14.0,
        sourceDocId: 'DOC-DDR-WELL-B-118',
        sourceDocName: 'DDR-2022-WELL-B-118',
        sourceDocPage: 18,
      },
    ],
  },
  {
    id: 'WELL-C',
    name: 'Well C',
    code: 'OFFSET-C-076',
    distanceKm: 6.2, // 6.2 km
    bearing: 'SE (135°)',
    lat: 27.4420,
    lng: 95.3850,
    formation: 'Formation X',
    lithology: 'Depleted Porous Sandstone Member',
    wellType: 'Abandoned',
    spudDate: '10 Feb 2019',
    completedDate: '22 Jun 2019',
    drillingDuration: '132 days',
    totalDepth: 5200,
    criticalDepth: 5025,
    status: 'Plugged & Abandoned',
    riskCategory: 'Significant',
    similarityScore: 85,
    similarityBreakdown: {
      geographic: 83,
      formation: 94,
      depth: 86,
      parameter: 77,
    },
    historicalEventsList: ['Stuck Pipe', 'Differential Pressure', 'Excessive Overpull'],
    relevantDocuments: [
      { id: 'DOC-WCR-WELL-C-076', name: 'WCR-2019-WELL-C-076', type: 'WCR' },
    ],
    summaryNote: 'Suffered differential stuck pipe at 5,025 m after string remained stationary for 22 minutes during MWD survey in depleted Formation X.',
    riskHistory: 'Differential sticking hazard at 5,025 m with 38 hours NPT. High differential pressure overbalance.',
    incidents: [
      {
        id: 'INC-C-1',
        type: 'Stuck Pipe',
        depth: 5025,
        severity: 'Critical',
        formation: 'Formation X',
        description: 'Drillstring became stuck off bottom after 22 minutes stationary connection time during MWD pulser check. Overpull exceeded 180 klbf.',
        mitigation: 'Spotted 50 bbl pipe-freeing surfactant soak pill across BHA, activated hydraulic drilling jars upward, regained string rotation after 14 hrs.',
        outcome: 'Partially Worked',
        nptHours: 38.0,
        sourceDocId: 'DOC-WCR-WELL-C-076',
        sourceDocName: 'WCR-2019-WELL-C-076',
        sourceDocPage: 88,
      },
    ],
  },
  {
    id: 'WELL-D',
    name: 'Well D',
    code: 'OFFSET-D-015',
    distanceKm: 8.1, // 8.1 km
    bearing: 'SW (220°)',
    lat: 27.4350,
    lng: 95.2890,
    formation: 'Formation X',
    lithology: 'Competent Siltstone & Dense Sandstone',
    wellType: 'Development',
    spudDate: '18 Nov 2023',
    completedDate: '02 Mar 2024',
    drillingDuration: '85 days',
    totalDepth: 5100,
    criticalDepth: 5100,
    status: 'Producing',
    riskCategory: 'Low',
    similarityScore: 72,
    similarityBreakdown: {
      geographic: 78,
      formation: 85,
      depth: 70,
      parameter: 55,
    },
    historicalEventsList: ['Normal Drilling', 'Managed Pressure Control'],
    relevantDocuments: [
      { id: 'DOC-DDR-WELL-D-015', name: 'DDR-2023-WELL-D-015', type: 'DDR' },
    ],
    summaryNote: 'Drilled with continuous automated Managed Pressure Drilling (MPD); minor seepage handled with LCM background dose.',
    riskHistory: 'Stable borehole; minor seepage managed without major NPT.',
    incidents: [
      {
        id: 'INC-D-1',
        type: 'Normal Drilling',
        depth: 5100,
        severity: 'Nominal',
        formation: 'Formation X',
        description: 'Controlled drilling across Formation X using MPD choke backpressure. Zero non-productive time.',
        mitigation: 'Proactive 15 ppb fine calcium carbonate background maintenance.',
        outcome: 'Worked',
        nptHours: 0,
        sourceDocId: 'DOC-DDR-WELL-D-015',
        sourceDocName: 'DDR-2023-WELL-D-015',
        sourceDocPage: 12,
      },
    ],
  },
  {
    id: 'WELL-E',
    name: 'Well E',
    code: 'OFFSET-E-008',
    distanceKm: 14.5,
    bearing: 'West (275°)',
    lat: 27.4980,
    lng: 95.1950,
    formation: 'Formation F-2 (Surma)',
    lithology: 'Laminated Shale & Hard Siltstone',
    wellType: 'Exploration',
    spudDate: '10 Jun 2020',
    completedDate: '28 Sep 2020',
    drillingDuration: '110 days',
    totalDepth: 4890,
    criticalDepth: 4890,
    status: 'Producing',
    riskCategory: 'Low',
    similarityScore: 64,
    similarityBreakdown: {
      geographic: 60,
      formation: 78,
      depth: 62,
      parameter: 56,
    },
    historicalEventsList: ['Bit Wear', 'Minor Drag'],
    relevantDocuments: [
      { id: 'DOC-WCR-WELL-E-008', name: 'WCR-2020-WELL-E-008', type: 'WCR' },
    ],
    summaryNote: 'Wildcat exploration well verifying regional seal integrity. Stable borehole without fluid losses.',
    riskHistory: 'No major geological hazards encountered in primary objectives.',
    incidents: [],
  },
  {
    id: 'WELL-F',
    name: 'Well F',
    code: 'OFFSET-F-033',
    distanceKm: 22.0,
    bearing: 'North (010°)',
    lat: 27.6890,
    lng: 95.3520,
    formation: 'Formation X',
    lithology: 'Fractured Sandstone with Reactive Claystone',
    wellType: 'Appraisal',
    spudDate: '01 Mar 2021',
    completedDate: '04 Jul 2021',
    drillingDuration: '125 days',
    totalDepth: 5450,
    criticalDepth: 5180,
    status: 'Shut-in',
    riskCategory: 'Moderate',
    similarityScore: 58,
    similarityBreakdown: {
      geographic: 52,
      formation: 72,
      depth: 58,
      parameter: 50,
    },
    historicalEventsList: ['Shale Swelling', 'Hole Washout'],
    relevantDocuments: [
      { id: 'DOC-DDR-WELL-F-033', name: 'DDR-2021-WELL-F-033', type: 'DDR' },
    ],
    summaryNote: 'Appraisal step-out well; observed reactive shale swelling requiring high KCl mud inhibition.',
    riskHistory: 'Shale dispersion and tight hole at 5,180 m.',
    incidents: [],
  },
];

// CRITICAL RISK ALERT SCENARIO
export const PRIMARY_RISK_ALERT: RiskAlert = {
  id: 'RISK-ALERT-01',
  header: 'POTENTIAL RISK AHEAD',
  title: 'POTENTIAL RISK AHEAD — HIGH TORQUE / STUCK PIPE',
  risk: 'High Torque / Stuck Pipe',
  riskType: 'High Torque / Stuck Pipe',
  riskLevel: 'HIGH',
  severity: 'High',
  currentDepth: 4980, // 4,980 m
  riskIntervalStart: 5030, // 5,030 m
  riskIntervalEnd: 5070, // 5,070 m
  expectedIntervalStart: 5030,
  expectedIntervalEnd: 5070,
  distanceToInterval: 50, // 50 m (5,030 - 4,980)
  formation: 'Formation X',
  lithology: 'Interbedded Sandstone / Fractured Carbonaceous Shale',
  evidenceSummary: '3 similar offset wells',
  whyExplanation: '3 similar offset wells experienced related lost circulation, torque stalling, and differential pipe sticking within a comparable depth interval (5,025–5,060 m) across Formation X.',
  evidenceCards: [
    {
      wellId: 'WELL-A',
      wellName: 'Well A',
      distanceKm: 3.0,
      formation: 'Formation X',
      event: 'Mud Loss',
      depth: 5040,
      sourceDoc: 'DDR-2021-WELL-A-042',
      relevancePct: 94,
      mitigationApplied: '40 bbl Coarse LCM pill + hesitation squeeze. Circulation restored after 6 hrs.',
    },
    {
      wellId: 'WELL-B',
      wellName: 'Well B',
      distanceKm: 4.7,
      formation: 'Formation X',
      event: 'High Torque',
      depth: 5060,
      sourceDoc: 'DDR-2022-WELL-B-118',
      relevancePct: 89,
      mitigationApplied: 'Rheology conditioning (YP < 18) + lubricant beads + controlled ROP (6 m/hr).',
    },
    {
      wellId: 'WELL-C',
      wellName: 'Well C',
      distanceKm: 6.2,
      formation: 'Formation X',
      event: 'Stuck Pipe',
      depth: 5025,
      sourceDoc: 'WCR-2019-WELL-C-076',
      relevancePct: 85,
      mitigationApplied: '50 bbl Surfactant soak pill + 180 klbf jar activation. Enforced stationary string limit.',
    },
  ],
  evidenceItems: [
    {
      wellId: 'WELL-A',
      wellName: 'Well A',
      distanceKm: 3.0,
      depth: 5040,
      formation: 'Formation X',
      incidentType: 'Mud Loss',
      relevancePct: 94,
      sourceDoc: 'DDR-2021-WELL-A-042',
    },
    {
      wellId: 'WELL-B',
      wellName: 'Well B',
      distanceKm: 4.7,
      depth: 5060,
      formation: 'Formation X',
      incidentType: 'High Torque',
      relevancePct: 89,
      sourceDoc: 'DDR-2022-WELL-B-118',
    },
    {
      wellId: 'WELL-C',
      wellName: 'Well C',
      distanceKm: 6.2,
      depth: 5025,
      formation: 'Formation X',
      incidentType: 'Stuck Pipe',
      relevancePct: 85,
      sourceDoc: 'WCR-2019-WELL-C-076',
    },
  ],
  keyObservations: [
    'Mud loss and high torque incidents consistently recorded in Formation X between 5,025–5,060 m.',
    'Depleted sandstone pressure creates high differential pressure overbalance across collars.',
    'Well A restored full circulation using 40 bbl coarse LCM pill + hesitation squeeze.',
    'Well B successfully mitigated torque stalling by lowering Yield Point to 18 and adding lubricant.',
  ],
  recommendation: {
    title: 'ENGINEER REVIEW RECOMMENDATION',
    body: 'Review historical drilling parameters and mitigation practices from comparable offset wells before entering the identified interval.',
    disclaimer: 'Final operational decisions remain with the drilling engineer.',
  },
  keyActions: [
    {
      id: 'ACT-1',
      label: 'Verify mud rheology (keep Yield Point 18–20 lb/100ft² to minimize torque drag)',
      completed: true,
      priority: 'Immediate',
    },
    {
      id: 'ACT-2',
      label: 'Pre-mix 50 bbl LCM pill on standby in suction pit #3 before penetrating 5,030 m',
      completed: true,
      priority: 'Immediate',
    },
    {
      id: 'ACT-3',
      label: 'Strict stationary string restriction: limit connection stop to < 3 minutes',
      completed: false,
      priority: 'Pre-Interval',
    },
    {
      id: 'ACT-4',
      label: 'Configure automated standpipe pressure & mud pit drop alarms on 15s polling',
      completed: false,
      priority: 'Immediate',
    },
  ],
  mitigationHistory: [
    {
      wellId: 'WELL-A',
      wellName: 'Well A',
      actionTaken: 'Increased mud weight to 1.22 SG + 40 bbl coarse LCM pill (nutplug + mica)',
      result: 'Worked',
      sourceDoc: 'DDR-2021-WELL-A-042',
      notes: 'Total fluid circulation restored after 6 hrs hesitation soak.',
    },
    {
      wellId: 'WELL-B',
      wellName: 'Well B',
      actionTaken: 'Rheology conditioning (reduced YP) + controlled ROP reduction to 6 m/hr',
      result: 'Worked',
      sourceDoc: 'DDR-2022-WELL-B-118',
      notes: 'Torque stabilized to nominal 20 kNm. Wiper trips executed every 3 stands.',
    },
    {
      wellId: 'WELL-C',
      wellName: 'Well C',
      actionTaken: 'Circulation material + pipe-freeing surfactant soak pill + back-reaming',
      result: 'Partially Worked',
      sourceDoc: 'WCR-2019-WELL-C-076',
      notes: 'Pipe jarred free after 14 hours; required 38h NPT. Recommended preventing stationary string.',
    },
  ],
};

// HISTORICAL EVENTS TIMELINE
export const HISTORICAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    depth: 4820,
    title: 'Normal drilling',
    description: 'Stable baseline drilling in upper formation member. Nominal torque and pressure.',
    category: 'normal',
    type: 'Normal drilling',
    severity: 'nominal',
  },
  {
    depth: 4910,
    title: 'Formation change',
    description: 'Transition into Formation X (Barail Sandstone Member). Increase in sandstone content.',
    category: 'geological',
    type: 'Formation change',
    severity: 'info',
  },
  {
    depth: 4980,
    title: 'CURRENT DEPTH (WELL-NWIS-01)',
    description: 'Bit at 4,980 m MD. Approaching risk interval 5,030–5,070 m (50 m ahead). Live stream active.',
    category: 'current',
    type: 'Current Depth',
    severity: 'high',
  },
  {
    depth: 5025,
    title: 'Stuck pipe — Well C',
    well: 'Well C (6.2 km offset)',
    description: 'Differential sticking occurred at 5,025 m after 22 minutes stationary pipe. 38h NPT.',
    category: 'incident',
    type: 'Stuck pipe',
    severity: 'critical',
  },
  {
    depth: 5040,
    title: 'Mud loss — Well A',
    well: 'Well A (3.0 km offset)',
    description: 'Severe lost circulation (78 bbl/hr) at 5,040 m upon entering micro-fractured sandstone.',
    category: 'incident',
    type: 'Mud loss',
    severity: 'high',
  },
  {
    depth: 5060,
    title: 'High torque — Well B',
    well: 'Well B (4.7 km offset)',
    description: 'Torque spiked from 22 to 38 kNm with top drive stalling at 5,060 m due to formation stress.',
    category: 'incident',
    type: 'High torque',
    severity: 'high',
  },
];

// DRILLING CHARTS DEPTH-INDEXED DATA
// Spans 4,800 m to 5,140 m showing Torque, ROP, WOB, SPP with highlighted risk zone 5,030–5,070 m
export const DEPTH_DRILLING_PROFILES = [
  { depth: 4800, torque: 18.2, rop: 21.0, wob: 22.0, spp: 3220, isRiskZone: false },
  { depth: 4840, torque: 19.5, rop: 20.2, wob: 23.0, spp: 3230, isRiskZone: false },
  { depth: 4880, torque: 21.0, rop: 19.8, wob: 23.5, spp: 3240, isRiskZone: false },
  { depth: 4910, torque: 22.5, rop: 19.2, wob: 24.0, spp: 3240, isRiskZone: false },
  { depth: 4940, torque: 25.0, rop: 18.8, wob: 24.0, spp: 3240, isRiskZone: false },
  { depth: 4980, torque: 31.8, rop: 18.4, wob: 24.0, spp: 3240, isRiskZone: false }, // CURRENT DEPTH
  // Predicted / Projected offset profile into risk interval (5,030 - 5,070 m)
  { depth: 5010, torque: 34.5, rop: 15.2, wob: 25.5, spp: 3210, isRiskZone: false },
  { depth: 5030, torque: 39.2, rop: 9.5, wob: 28.0, spp: 3080, isRiskZone: true }, // ENTERING RISK
  { depth: 5045, torque: 42.0, rop: 6.2, wob: 30.5, spp: 2950, isRiskZone: true }, // PEAK MUD LOSS / DRAG
  { depth: 5060, torque: 38.5, rop: 5.8, wob: 29.0, spp: 3010, isRiskZone: true }, // HIGH TORQUE PEAK
  { depth: 5070, torque: 32.0, rop: 8.5, wob: 26.5, spp: 3140, isRiskZone: true }, // EXITING RISK
  { depth: 5090, torque: 24.5, rop: 14.0, wob: 24.5, spp: 3220, isRiskZone: false },
  { depth: 5120, torque: 20.8, rop: 17.5, wob: 23.8, spp: 3240, isRiskZone: false },
  { depth: 5150, torque: 19.2, rop: 19.0, wob: 23.0, spp: 3250, isRiskZone: false },
];

// FORMATION STRATA DEFINITIONS
export const FORMATION_STRATA = [
  { name: 'Surface & Tipam', code: 'F-1', topDepth: 0, bottomDepth: 2500, lithology: 'Massive Sandstone', riskLevel: 'Low' },
  { name: 'Surma & Bokabil', code: 'F-2', topDepth: 2500, bottomDepth: 4750, lithology: 'Interbedded Siltstone/Shale', riskLevel: 'Medium' },
  { name: 'Formation X (Barail Sandstone)', code: 'F-3', topDepth: 4750, bottomDepth: 5250, lithology: 'Depleted Fractured Sandstone & Reactive Shale', riskLevel: 'High' },
  { name: 'Disang Group', code: 'F-4', topDepth: 5250, bottomDepth: 5600, lithology: 'Overpressured Siltstone', riskLevel: 'Medium' },
];

// LIVE DRILLING SENSOR TIME-SERIES
export const LIVE_DRILLING_TIME_SERIES = [
  { time: '04:00', rop: 18.2, torque: 28.5, spp: 3230, flowRate: 620, depth: 4965 },
  { time: '05:00', rop: 18.5, torque: 29.2, spp: 3240, flowRate: 620, depth: 4970 },
  { time: '06:00', rop: 18.4, torque: 30.1, spp: 3240, flowRate: 620, depth: 4974 },
  { time: '07:00', rop: 18.6, torque: 31.0, spp: 3240, flowRate: 620, depth: 4977 },
  { time: '08:00', rop: 18.4, torque: 31.8, spp: 3240, flowRate: 620, depth: 4980 },
  { time: '09:00', rop: 18.3, torque: 32.2, spp: 3240, flowRate: 618, depth: 4980.5 },
  { time: '10:00', rop: 18.4, torque: 31.8, spp: 3240, flowRate: 620, depth: 4981 },
];

// HISTORICAL MUD LOSS DEPTH COMPARISON
export const HISTORICAL_MUD_LOSS_DEPTH_TREND = [
  { depth: 4800, currentWell: 0, offsetAvg: 2, upperRiskLimit: 15 },
  { depth: 4900, currentWell: 0, offsetAvg: 6, upperRiskLimit: 20 },
  { depth: 4980, currentWell: 2, offsetAvg: 18, upperRiskLimit: 35 },
  { depth: 5025, currentWell: null, offsetAvg: 65, upperRiskLimit: 110 },
  { depth: 5040, currentWell: null, offsetAvg: 95, upperRiskLimit: 140 },
  { depth: 5060, currentWell: null, offsetAvg: 125, upperRiskLimit: 175 },
  { depth: 5070, currentWell: null, offsetAvg: 80, upperRiskLimit: 120 },
  { depth: 5120, currentWell: null, offsetAvg: 25, upperRiskLimit: 45 },
  { depth: 5150, currentWell: null, offsetAvg: 8, upperRiskLimit: 20 },
];

export const HISTORICAL_DOCUMENTS: SourceDocument[] = [
  {
    id: 'DOC-DDR-WELL-A-042',
    name: 'DDR-2021-WELL-A-042',
    title: 'Daily Drilling Report #42 — Well A (Offset 3.0 km)',
    type: 'DDR',
    wellName: 'Well A',
    wellCode: 'OFFSET-A-042',
    date: '28 Apr 2021',
    author: 'Operations Drilling Engineer / OIL',
    fileSize: '4.8 MB',
    keyHighlights: [
      'Total Depth 5,320 m in Formation X.',
      'Significant lost circulation at 5,040 m (78 bbl/hr fluid loss into depleted sandstone member).',
      'Circulation restored using 40 bbl coarse LCM pill + 4.5h hesitation soak.',
    ],
    parametersLogged: {
      depth: '5,040 m MD',
      mudWeight: '1.20 SG raised to 1.22 SG',
      lossRate: '78 bbl/hr total loss',
      torqueSpike: '24.5 kNm',
      mitigationApplied: '40 bbl Coarse LCM pill (nutplug + mica) + hesitation squeeze',
    },
    ocrExtractedText: `OIL INDIA LIMITED - DRILLING OPERATIONS
DAILY DRILLING REPORT: DDR-2021-WELL-A-042
WELL: WELL A | FIELD: PROTOTYPE FIELD ALPHA | BLOCK: AA-ONHP-2026/1
DEPTH: 5,040 m MD | FORMATION: FORMATION X

INCIDENT REPORT - SEVERE LOST CIRCULATION:
At 14:15 hrs at 5,040 m depth, active mud pit level dropped 45 bbl in 18 minutes. Standpipe pressure decreased from 3,240 psi to 2,890 psi.
Drilling was immediately stopped. Bit pulled 10 m off bottom.
Mud engineer prepared 40 bbl high-solids Lost Circulation Material (LCM) pill containing 25 ppb fine nutplug, 15 ppb coarse mica, and calcium carbonate.
Pill pumped and displaced across the 5,030–5,070 m interval.
Hesitation squeeze applied at 250 psi overbalance for 4.5 hours.
Returns fully regained at 620 gpm flow rate. Drilling resumed to TD (5,320 m).
Advisory for future offset wells: Pre-mix LCM pill before drilling past 5,020 m in Formation X.`,
  },
  {
    id: 'DOC-DDR-WELL-B-118',
    name: 'DDR-2022-WELL-B-118',
    title: 'Daily Drilling Report #118 — Well B (Offset 4.7 km)',
    type: 'DDR',
    wellName: 'Well B',
    wellCode: 'OFFSET-B-118',
    date: '12 Sep 2022',
    author: 'Shift Engineer / eRTMAC Command',
    fileSize: '3.6 MB',
    keyHighlights: [
      'Depth interval 5,050 m – 5,070 m MD.',
      'Torque spikes from 22 kNm to 38 kNm stalling top drive.',
      'Mud rheology adjustments reduced sticking tendency and stabilized torque.',
    ],
    parametersLogged: {
      depth: '5,060 m MD',
      mudWeight: '1.19 SG',
      lossRate: 'Nil (Seepage < 4 bbl/hr)',
      torqueSpike: '38.0 kNm (top drive stall)',
      mitigationApplied: 'Rheology conditioning (YP reduced to 18 lb/100ft²) + bead lubricant + controlled ROP',
    },
    ocrExtractedText: `OIL INDIA LIMITED - eRTMAC OPERATIONS
DAILY DRILLING REPORT: DDR-2022-WELL-B-118
WELL: WELL B | FIELD: PROTOTYPE FIELD ALPHA
DEPTH: 5,060 m MD | FORMATION: FORMATION X

INCIDENT REPORT - HIGH TORQUE / TIGHT HOLE:
At 08:30 hrs at 5,060 m depth, rotary torque jumped abruptly from 22 kNm to 38 kNm. Top drive stalled twice at 60 RPM.
Investigation showed high reactive shale solids had increased Yield Point to 26 lb/100ft².
Action taken: Discontinued drilling. Circulated bottoms-up.
Added polymer thinners to lower YP to 18 lb/100ft². Added 2% organic lubricant beads.
Controlled ROP to 6.0 m/hr with short wiper trips every single stand.
Torque stabilized back to nominal 20–22 kNm. Drilling proceeded safely.`,
  },
  {
    id: 'DOC-WCR-WELL-C-076',
    name: 'WCR-2019-WELL-C-076',
    title: 'Well Completion Report — Well C (Offset 6.2 km)',
    type: 'WCR',
    wellName: 'Well C',
    wellCode: 'OFFSET-C-076',
    date: '14 May 2019',
    author: 'Senior Drilling Superintendent',
    fileSize: '16.4 MB',
    keyHighlights: [
      'Stuck pipe incident at 5,025 m MD in Formation X.',
      '38 hours Non-Productive Time (NPT).',
      'Root cause: Differential sticking during prolonged stationary pipe connection across depleted sandstone.',
    ],
    parametersLogged: {
      depth: '5,025 m MD',
      mudWeight: '1.24 SG (Excessive overbalance)',
      lossRate: '12 bbl/hr seepage',
      torqueSpike: 'Rotary stalled locked',
      mitigationApplied: '50 bbl Pipe-freeing surfactant soak pill + 180 klbf jar activation',
    },
    ocrExtractedText: `OIL INDIA LIMITED - WELL COMPLETION INVESTIGATION
WELL: WELL C | REPORT: WCR-2019-WELL-C-076
DEPTH: 5,025 m MD | FORMATION: FORMATION X

INCIDENT REPORT - DIFFERENTIAL STICKING (38h NPT):
At 5,025 m MD, drill string was held stationary for 22 minutes while investigating an MWD telemetry failure.
Upon attempt to rotate drillstring, top drive stalled at 38 kNm.
Overpull limit reached (180 klbf over 240 klbf string weight) without pipe movement.
Formation pressure evaluation revealed depleted reservoir pressure of ~0.98 SG equivalent, resulting in differential overbalance of +0.26 SG (approx. 1,800 psi differential across drill collars).
Mitigation:
1. Spotted 50 bbl Pipe-Freeing Oil/Surfactant Pill across BHA.
2. 4-hour chemical soak to break filter cake.
3. Activated hydraulic drilling jars in upward cycle. Pipe freed after 14 hrs.
4. Total NPT: 38 hours.
LESSONS LEARNED:
- Never leave drillstring stationary in Formation X interval.
- Enforce strict 3-minute stationary limit. Continuous rotation or oscillation is mandatory.`,
  },
  {
    id: 'DOC-DDR-WELL-D-015',
    name: 'DDR-2023-WELL-D-015',
    title: 'Daily Drilling Report #15 — Well D (Offset 8.1 km)',
    type: 'DDR',
    wellName: 'Well D',
    wellCode: 'OFFSET-D-015',
    date: '24 Feb 2024',
    author: 'MPD Engineer / OIL',
    fileSize: '3.1 MB',
    keyHighlights: [
      'Depth 5,100 m MD in Formation X.',
      'Automated Managed Pressure Drilling (MPD) used successfully.',
      'Zero NPT across the 5,030–5,070 m risk interval.',
    ],
    parametersLogged: {
      depth: '5,100 m MD',
      mudWeight: '1.18 SG with automated surface backpressure',
      lossRate: 'Zero losses',
      torqueSpike: 'Nominal 19.5 kNm',
      mitigationApplied: 'Closed-loop MPD backpressure management',
    },
    ocrExtractedText: `OIL INDIA LIMITED - ADVANCED DRILLING
REPORT: DDR-2023-WELL-D-015 | WELL D
DEPTH: 5,100 m MD | FORMATION: FORMATION X

DRILLING SUMMARY:
Drilled smoothly through Formation X from 5,010 m to 5,100 m using automated MPD system.
Surface backpressure calibrated dynamically to prevent fluid loss into depleted sandstone while preventing swab kicks during connections.
Zero stuck pipe, zero fluid losses, zero NPT logged.`,
  },
];
