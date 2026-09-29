import { OFFSET_WELLS, OffsetWell, HISTORICAL_DOCUMENTS, SourceDocument } from './data';

export interface CasingEntry {
  stringName: string;
  holeSize: string;
  casingSize: string;
  shoeDepth: number; // meters
  mudWeight: string; // SG
  cementTop: string;
  notes: string;
}

export interface MudProgramEntry {
  interval: string;
  mudType: string;
  densityRange: string;
  pvYp: string;
  phFilterCake: string;
  targetObjective: string;
}

export interface TimelineEventItem {
  id: string;
  depth: number;
  date: string;
  title: string;
  type: 'Normal drilling' | 'Formation transition' | 'MUD LOSS' | 'High Torque' | 'Stuck Pipe' | 'Circulation restored' | 'Casing operation' | 'Logging / MWD';
  category: 'normal' | 'transition' | 'incident' | 'operation';
  severity?: 'Critical' | 'High' | 'Moderate' | 'Low' | 'Nominal';
  cause?: string;
  impact?: string;
  mitigation?: string;
  sourceDoc?: string;
  sourceDocPage?: number;
  description: string;
}

export interface ParameterDepthPoint {
  depth: number;
  rop: number; // m/hr
  wob: number; // klbf
  torque: number; // kNm
  spp: number; // psi
  isCriticalZone?: boolean;
}

export interface FormationLayer {
  formation: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  porePressureEquivalent: string;
  fractureGradient: string;
  permeability: string;
  drillingCharacteristics: string;
}

export interface WellDossier {
  id: string;
  name: string;
  code: string;
  subtitle: string;
  distanceKm: number;
  bearing: string;
  formation: string;
  lithology: string;
  totalDepth: number;
  similarityScore: number;
  similarityBreakdown: {
    geographic: number;
    formation: number;
    depth: number;
    parameter: number;
  };
  riskHistory: 'CRITICAL' | 'SIGNIFICANT' | 'MODERATE' | 'LOW';
  status: string;
  spudDate: string;
  completedDate: string;
  drillingDuration: string;
  nptHours: number;
  nptPercentage: string;
  operator: string;
  rigName: string;
  field: string;
  block: string;
  basin: string;
  lat: number;
  lng: number;
  casingProgram: CasingEntry[];
  mudProgram: MudProgramEntry[];
  timeline: TimelineEventItem[];
  parameters: ParameterDepthPoint[];
  formations: FormationLayer[];
  documents: { id: string; name: string; title: string; type: string; date: string }[];
  lessonsLearned: {
    historicalLesson: string;
    evidenceDoc: string;
    evidencePage: number;
    aiInterpretationNote: string;
    keyTakeaways: string[];
    mitigationPlaybook: {
      action: string;
      result: 'Worked' | 'Partially Worked' | 'Failed';
      protocol: string;
    }[];
  };
}

// Generate realistic depth-series parameters with signature event spikes
function generateWellParameters(baseWellId: string): ParameterDepthPoint[] {
  const points: ParameterDepthPoint[] = [];
  const startDepth = 4700;
  const endDepth = 5300;
  const step = 20;

  for (let d = startDepth; d <= endDepth; d += step) {
    let rop = 16 + Math.sin(d / 40) * 3 + (Math.random() * 2 - 1);
    let wob = 22 + Math.cos(d / 50) * 2 + (Math.random() * 1.5 - 0.75);
    let torque = 24 + Math.sin(d / 60) * 3 + (Math.random() * 2 - 1);
    let spp = 3100 + Math.sin(d / 70) * 120 + (Math.random() * 40 - 20);
    const isCriticalZone = d >= 5020 && d <= 5080;

    if (baseWellId === 'WELL-A' || baseWellId === 'well-a') {
      // Mud loss at 5,040 m: SPP drops abruptly, torque rises briefly then eases as circulation is lost
      if (d === 5040) {
        spp = 2750; // sharp drop
        rop = 5.2; // halted/drastically lowered
        torque = 32.5;
        wob = 12.0;
      } else if (d === 5060) {
        spp = 2820;
        rop = 3.5;
        torque = 28.0;
      } else if (d === 5080) {
        spp = 3050; // circulation restored
        rop = 8.5;
        torque = 26.0;
      }
    } else if (baseWellId === 'WELL-B' || baseWellId === 'well-b') {
      // High torque at 5,060 m: Torque jumps to 38 kNm
      if (d === 5060) {
        torque = 38.4; // spike
        rop = 6.0;
        wob = 18.0;
        spp = 3380;
      } else if (d >= 5040 && d <= 5080) {
        torque = 34.0 + Math.random() * 3;
      }
    } else if (baseWellId === 'WELL-C' || baseWellId === 'well-c') {
      // Stuck pipe at 5,025 m: Torque locked, ROP 0
      if (d === 5020 || d === 5040) {
        torque = 41.0;
        rop = 0.5;
        wob = 4.0;
        spp = 2950;
      }
    }

    points.push({
      depth: d,
      rop: parseFloat(rop.toFixed(1)),
      wob: parseFloat(wob.toFixed(1)),
      torque: parseFloat(torque.toFixed(1)),
      spp: Math.round(spp),
      isCriticalZone,
    });
  }

  return points;
}

export const WELL_DOSSIERS: Record<string, WellDossier> = {
  'WELL-A': {
    id: 'WELL-A',
    name: 'WELL-A',
    code: 'OFFSET-A-042',
    subtitle: 'Historical Offset Well',
    distanceKm: 3.0,
    bearing: 'NW (315°)',
    formation: 'Formation X',
    lithology: 'Micro-fractured Sandstone / Shale',
    totalDepth: 5420,
    similarityScore: 91,
    similarityBreakdown: {
      geographic: 92,
      formation: 96,
      depth: 87,
      parameter: 89,
    },
    riskHistory: 'MODERATE',
    status: 'Producing (Gas & Condensate)',
    spudDate: '15 Jan 2021',
    completedDate: '28 Apr 2021',
    drillingDuration: '103 days',
    nptHours: 26.0,
    nptPercentage: '6.8% of Total Rig Time',
    operator: 'Oil India Limited (OIL)',
    rigName: 'OIL Rig Drillmaster-VII (2000 HP)',
    field: 'Prototype Field Alpha',
    block: 'Block-AA-ONHP-2021/4',
    basin: 'Upper Assam Shelf Basin',
    lat: 27.5115,
    lng: 95.3218,
    casingProgram: [
      {
        stringName: 'Conductor Pipe',
        holeSize: '36"',
        casingSize: '30"',
        shoeDepth: 80,
        mudWeight: '1.05 SG',
        cementTop: 'Surface',
        notes: 'Driven to refusal at 80 m depth.'
      },
      {
        stringName: 'Surface Casing',
        holeSize: '26"',
        casingSize: '20"',
        shoeDepth: 650,
        mudWeight: '1.08 SG',
        cementTop: 'Surface',
        notes: 'Isolated freshwater sand aquifers and uncompacted alluvium.'
      },
      {
        stringName: 'Intermediate Casing',
        holeSize: '17-1/2"',
        casingSize: '13-3/8"',
        shoeDepth: 2450,
        mudWeight: '1.14 SG',
        cementTop: '350 m',
        notes: 'Cased off reactive Surma claystone sequences.'
      },
      {
        stringName: 'Production Casing',
        holeSize: '12-1/4"',
        casingSize: '9-5/8"',
        shoeDepth: 4680,
        mudWeight: '1.18 SG',
        cementTop: '1,800 m',
        notes: 'Anchored 20 m above Formation X transition zone.'
      },
      {
        stringName: 'Production Liner',
        holeSize: '8-1/2"',
        casingSize: '7"',
        shoeDepth: 5420,
        mudWeight: '1.24 SG',
        cementTop: '4,520 m (TOL)',
        notes: 'Set across reservoir target; slotted liner across 5,120–5,380 m.'
      },
    ],
    mudProgram: [
      {
        interval: '0 – 650 m',
        mudType: 'Spud Mud / Bentonite Pre-hydrated',
        densityRange: '1.05 – 1.08 SG',
        pvYp: '12 cP / 16 lb/100ft²',
        phFilterCake: '9.0 / 7.5 ml',
        targetObjective: 'Hole cleaning and shallow alluvium stabilization.'
      },
      {
        interval: '650 – 2,450 m',
        mudType: 'KCl / PHPA Polymer Gel',
        densityRange: '1.10 – 1.14 SG',
        pvYp: '16 cP / 20 lb/100ft²',
        phFilterCake: '9.5 / 6.0 ml',
        targetObjective: 'Inhibit reactive smectite clays in Tipam group.'
      },
      {
        interval: '2,450 – 4,680 m',
        mudType: 'Low Solids Non-Dispersed (LSND)',
        densityRange: '1.15 – 1.18 SG',
        pvYp: '20 cP / 24 lb/100ft²',
        phFilterCake: '10.0 / 4.5 ml',
        targetObjective: 'Maintain hole stability across Bokabil & Barail shales.'
      },
      {
        interval: '4,680 – 5,420 m (TD)',
        mudType: 'HPWBM (High-Performance Glycol / Polymer)',
        densityRange: '1.18 – 1.24 SG',
        pvYp: '24 cP / 26 lb/100ft²',
        phFilterCake: '9.8 / 3.8 ml',
        targetObjective: 'Prevent pore-pressure ballooning and lubricate BHA in micro-fractured Sandstone.'
      },
    ],
    timeline: [
      {
        id: 'TL-A-1',
        depth: 4700,
        date: '28 Mar 2021',
        title: 'Normal Drilling',
        type: 'Normal drilling',
        category: 'normal',
        severity: 'Nominal',
        description: 'Drilling 8-1/2" hole smoothly below 9-5/8" casing shoe with HPWBM. Average ROP 16.5 m/hr. Torque steady at 22 kNm.',
      },
      {
        id: 'TL-A-2',
        depth: 4850,
        date: '02 Apr 2021',
        title: 'Formation Transition',
        type: 'Formation transition',
        category: 'transition',
        severity: 'Low',
        description: 'Entered Barail Upper Member transition. Lithology shifted from massive shale to interlaminated siltstone with minor gas shows (22 to 38 units).',
      },
      {
        id: 'TL-A-3',
        depth: 5040,
        date: '08 Apr 2021',
        title: 'MUD LOSS (Critical Event)',
        type: 'MUD LOSS',
        category: 'incident',
        severity: 'High',
        cause: 'Prototype historical classification: Micro-fractured depleted sandstone member penetration',
        impact: 'Lost circulation (78 bbl/hr) / operational delay / 26 hrs NPT',
        mitigation: 'Historical mitigation: Spotted 40 bbl coarse LCM pill (calcium carbonate + nutplug + mica) with 4.5h hesitation squeeze. Regained total returns.',
        sourceDoc: 'DDR-2021-WELL-A-042',
        sourceDocPage: 42,
        description: 'Severe sudden lost circulation (78 bbl/hr) upon penetrating micro-fractures in Formation X at 5,040 m. SPP dropped 350 psi. Drilling stopped immediately.',
      },
      {
        id: 'TL-A-4',
        depth: 5080,
        date: '10 Apr 2021',
        title: 'Circulation Restored',
        type: 'Circulation restored',
        category: 'operation',
        severity: 'Moderate',
        description: 'Circulation successfully restored after second LCM pill. Mud weight adjusted from 1.22 to 1.19 SG. Dynamic loss rate reduced to <2 bbl/hr.',
      },
      {
        id: 'TL-A-5',
        depth: 5220,
        date: '18 Apr 2021',
        title: 'Casing Operation / Wireline Logs',
        type: 'Casing operation',
        category: 'operation',
        severity: 'Nominal',
        description: 'Reached reservoir section TD 5,420 m. Ran quadruple combo wireline logs without sticking. Ran and cemented 7" production liner at 5,420 m.',
      },
    ],
    parameters: generateWellParameters('WELL-A'),
    formations: [
      {
        formation: 'Formation F-1 (Tipam)',
        topDepth: 2450,
        bottomDepth: 3800,
        lithology: 'Coarse to medium Sandstone with interbedded claystone',
        porePressureEquivalent: '1.08 SG',
        fractureGradient: '1.65 SG',
        permeability: '150 - 300 mD',
        drillingCharacteristics: 'High penetration rates, minimal drag, stable borehole.'
      },
      {
        formation: 'Formation F-2 (Surma / Bokabil)',
        topDepth: 3800,
        bottomDepth: 4680,
        lithology: 'Laminated Mudstone and tight Siltstone sequence',
        porePressureEquivalent: '1.14 SG',
        fractureGradient: '1.78 SG',
        permeability: '5 - 15 mD',
        drillingCharacteristics: 'Reactive shales prone to sloughing if KCl concentration falls below 6%.'
      },
      {
        formation: 'Formation X (Barail Sandstone Member)',
        topDepth: 4680,
        bottomDepth: 5420,
        lithology: 'Micro-fractured Sandstone interbedded with Carbonaceous Shale',
        porePressureEquivalent: '1.02 - 1.16 SG (Sub-hydrostatic depleted zones)',
        fractureGradient: '1.48 - 1.54 SG (Narrow drilling margin!)',
        permeability: '80 - 240 mD',
        drillingCharacteristics: 'Hazardous loss zone between 5,030–5,070 m due to localized natural fracture network.'
      },
    ],
    documents: [
      {
        id: 'DOC-DDR-WELL-A-042',
        name: 'DDR-2021-WELL-A-042',
        title: 'Daily Drilling Report #42 — Well A (Offset 3.0 km)',
        type: 'DDR',
        date: '08 Apr 2021',
      },
      {
        id: 'DOC-WCR-WELL-A-FINAL',
        name: 'WCR-2021-WELL-A-FINAL',
        title: 'Well Completion Report — Well A (Primary Dossier)',
        type: 'WCR',
        date: '28 Apr 2021',
      },
    ],
    lessonsLearned: {
      historicalLesson: 'Similar drilling conditions were associated with a mud-loss event around 5,040 m.',
      evidenceDoc: 'DDR-2021-WELL-A-042',
      evidencePage: 42,
      aiInterpretationNote: 'AI-assisted summary — Source-backed information only. Operational parameters calibrated from historical daily mud and mud logging telemetry.',
      keyTakeaways: [
        'Depleted sub-hydrostatic sands in Formation X exhibit narrow drilling window (1.18 SG pore pressure vs 1.48 SG fracture gradient).',
        'Conventional 1.22 SG mud exceeded fracture breakdown pressure, triggering immediate 78 bbl/hr losses.',
        'Pre-mixing a 40 bbl coarse LCM pill on standby prior to entering 5,030 m is mandatory for offset wells.',
        'Controlled ROP (<8 m/hr) reduces dynamic ECD pressure surges across fractured intervals.',
      ],
      mitigationPlaybook: [
        {
          action: 'Pre-load mud system with 15–20 ppb medium calcium carbonate prior to 5,020 m depth.',
          result: 'Worked',
          protocol: 'Reduces initial micro-fracture leak-off rate by over 65% based on offset DDR analysis.'
        },
        {
          action: '40 bbl Coarse LCM hesitation squeeze (nutplug + mica blend).',
          result: 'Worked',
          protocol: 'Regained full returns after 4.5 hours hesitation pumping at 2.0 bpm.'
        },
        {
          action: 'Maintaining 1.24 SG mud weight through interval without ECD reduction.',
          result: 'Failed',
          protocol: 'Directly caused breakdown of low-pressure fracture network in Formation X.'
        },
      ],
    },
  },

  'WELL-B': {
    id: 'WELL-B',
    name: 'WELL-B',
    code: 'OFFSET-B-118',
    subtitle: 'Historical Offset Well',
    distanceKm: 4.7,
    bearing: 'NE (045°)',
    formation: 'Formation X',
    lithology: 'Carbonaceous Shale & High-Stress Coal Stringers',
    totalDepth: 5410,
    similarityScore: 89,
    similarityBreakdown: {
      geographic: 88,
      formation: 95,
      depth: 89,
      parameter: 84,
    },
    riskHistory: 'MODERATE',
    status: 'Shut-in',
    spudDate: '04 Aug 2022',
    completedDate: '19 Nov 2022',
    drillingDuration: '98 days',
    nptHours: 14.0,
    nptPercentage: '3.9% of Total Rig Time',
    operator: 'Oil India Limited (OIL)',
    rigName: 'OIL Rig Drillmaster-V (1500 HP)',
    field: 'Prototype Field Alpha',
    block: 'Block-AA-ONHP-2021/4',
    basin: 'Upper Assam Shelf Basin',
    lat: 27.5210,
    lng: 95.3780,
    casingProgram: [
      {
        stringName: 'Surface Casing',
        holeSize: '26"',
        casingSize: '20"',
        shoeDepth: 620,
        mudWeight: '1.08 SG',
        cementTop: 'Surface',
        notes: 'Surface hole isolation.'
      },
      {
        stringName: 'Intermediate Casing',
        holeSize: '17-1/2"',
        casingSize: '13-3/8"',
        shoeDepth: 2380,
        mudWeight: '1.14 SG',
        cementTop: '400 m',
        notes: 'Tipam sand seal.'
      },
      {
        stringName: 'Production Casing',
        holeSize: '12-1/4"',
        casingSize: '9-5/8"',
        shoeDepth: 4710,
        mudWeight: '1.19 SG',
        cementTop: '2,100 m',
        notes: 'Set above Formation X coal stringers.'
      },
      {
        stringName: 'Production Liner',
        holeSize: '8-1/2"',
        casingSize: '7"',
        shoeDepth: 5410,
        mudWeight: '1.22 SG',
        cementTop: '4,550 m (TOL)',
        notes: 'Completed in Lower Barail reservoir.'
      },
    ],
    mudProgram: [
      {
        interval: '4,710 – 5,410 m (TD)',
        mudType: 'Polymer-Inhibited Glycol HPWBM',
        densityRange: '1.18 – 1.22 SG',
        pvYp: '22 cP / 18 lb/100ft²',
        phFilterCake: '9.6 / 4.2 ml',
        targetObjective: 'Inhibit tectonically stressed coal seams and lower mechanical rotary friction.'
      },
    ],
    timeline: [
      {
        id: 'TL-B-1',
        depth: 4750,
        date: '20 Oct 2022',
        title: 'Normal Drilling',
        type: 'Normal drilling',
        category: 'normal',
        severity: 'Nominal',
        description: 'Drilling 8-1/2" hole below 9-5/8" casing shoe. Parameters steady with ROP 15 m/hr and torque 20 kNm.',
      },
      {
        id: 'TL-B-2',
        depth: 4920,
        date: '25 Oct 2022',
        title: 'Formation Transition',
        type: 'Formation transition',
        category: 'transition',
        severity: 'Low',
        description: 'Entered stressed carbonaceous interval. Torque fluctuations observed (+/- 4 kNm).',
      },
      {
        id: 'TL-B-3',
        depth: 5060,
        date: '02 Nov 2022',
        title: 'High Torque / Top Drive Stalls',
        type: 'High Torque',
        category: 'incident',
        severity: 'High',
        cause: 'Prototype historical classification: High-stress coal stringer pinching drillstring',
        impact: 'Top drive stalled twice / tight hole / 14 hrs NPT',
        mitigation: 'Historical mitigation: Rheology conditioning (YP reduced from 26 to 18 lb/100ft²), dosed lubricant beads, and limited ROP to 6 m/hr.',
        sourceDoc: 'DDR-2022-WELL-B-118',
        sourceDocPage: 18,
        description: 'Torque spiked from 22 kNm to 38 kNm at 5,060 m. Top drive stalled during connection break. Heavy back-reaming required.',
      },
      {
        id: 'TL-B-4',
        depth: 5120,
        date: '06 Nov 2022',
        title: 'Parameters Stabilized',
        type: 'Circulation restored',
        category: 'operation',
        severity: 'Low',
        description: 'Borehole stabilized following lubricity pill and wiper trip. Torque normalized to 21 kNm.',
      },
      {
        id: 'TL-B-5',
        depth: 5410,
        date: '19 Nov 2022',
        title: 'TD Reached & 7" Liner Set',
        type: 'Casing operation',
        category: 'operation',
        severity: 'Nominal',
        description: 'Reached total depth 5,410 m. Successfully set and cemented 7" production liner.',
      },
    ],
    parameters: generateWellParameters('WELL-B'),
    formations: [
      {
        formation: 'Formation X (Stressed Coal Interval)',
        topDepth: 4710,
        bottomDepth: 5410,
        lithology: 'Stressed Carbonaceous Shale with brittle coal stringers',
        porePressureEquivalent: '1.16 SG',
        fractureGradient: '1.62 SG',
        permeability: '40 - 120 mD',
        drillingCharacteristics: 'High mechanical drag; hole enlargement and borehole breakouts if mud lubricity is deficient.'
      },
    ],
    documents: [
      {
        id: 'DOC-DDR-WELL-B-118',
        name: 'DDR-2022-WELL-B-118',
        title: 'Daily Drilling Report #118 — Well B (Offset 4.7 km)',
        type: 'DDR',
        date: '02 Nov 2022',
      },
    ],
    lessonsLearned: {
      historicalLesson: 'Reactive carbonaceous shale and high-stress coal stringers caused violent torque spikes at 5,060 m.',
      evidenceDoc: 'DDR-2022-WELL-B-118',
      evidencePage: 18,
      aiInterpretationNote: 'AI-assisted summary — Source-backed information only.',
      keyTakeaways: [
        'Top drive stalled twice at 5,060 m due to cutting bed accumulation and tight clearance.',
        'High Yield Point (26 lb/100ft²) exacerbated annular pressure spikes; thinning mud to 18 lb/100ft² restored circulation.',
        'Continuous addition of 2% organic lubricant beads reduced rotary torque by 34%.',
      ],
      mitigationPlaybook: [
        {
          action: 'Circulate high-viscosity sweeps and dose lubricant beads prior to 5,050 m.',
          result: 'Worked',
          protocol: 'Keeps rotary torque below 28 kNm throughout coal stringer section.'
        },
        {
          action: 'Aggressive rotary reaming without mud lubrication.',
          result: 'Failed',
          protocol: 'Resulted in top drive stall and drillpipe twist-off hazard.'
        },
      ],
    },
  },

  'WELL-C': {
    id: 'WELL-C',
    name: 'WELL-C',
    code: 'OFFSET-C-076',
    subtitle: 'Historical Offset Well',
    distanceKm: 6.2,
    bearing: 'SE (135°)',
    formation: 'Formation X',
    lithology: 'Depleted Porous Sandstone Member',
    totalDepth: 5200,
    similarityScore: 85,
    similarityBreakdown: {
      geographic: 83,
      formation: 94,
      depth: 86,
      parameter: 77,
    },
    riskHistory: 'SIGNIFICANT',
    status: 'Plugged & Abandoned',
    spudDate: '10 Feb 2019',
    completedDate: '22 Jun 2019',
    drillingDuration: '132 days',
    nptHours: 38.0,
    nptPercentage: '11.8% of Total Rig Time',
    operator: 'Oil India Limited (OIL)',
    rigName: 'OIL Rig Drillmaster-III (1500 HP)',
    field: 'Prototype Field Alpha',
    block: 'Block-AA-ONHP-2019/2',
    basin: 'Upper Assam Shelf Basin',
    lat: 27.4420,
    lng: 95.3850,
    casingProgram: [
      {
        stringName: 'Surface Casing',
        holeSize: '26"',
        casingSize: '20"',
        shoeDepth: 600,
        mudWeight: '1.08 SG',
        cementTop: 'Surface',
        notes: 'Isolated shallow formations.'
      },
      {
        stringName: 'Intermediate Casing',
        holeSize: '17-1/2"',
        casingSize: '13-3/8"',
        shoeDepth: 2320,
        mudWeight: '1.14 SG',
        cementTop: '300 m',
        notes: 'Tipam isolation.'
      },
      {
        stringName: 'Production Casing',
        holeSize: '12-1/4"',
        casingSize: '9-5/8"',
        shoeDepth: 4620,
        mudWeight: '1.18 SG',
        cementTop: '2,000 m',
        notes: 'Set above Formation X.'
      },
    ],
    mudProgram: [
      {
        interval: '4,620 – 5,200 m (TD)',
        mudType: 'Water-Based Mud (Weighted Barite)',
        densityRange: '1.24 – 1.26 SG',
        pvYp: '26 cP / 28 lb/100ft²',
        phFilterCake: '9.4 / 6.8 ml (Thick filter cake)',
        targetObjective: 'Control overpressured shales; inadvertently led to severe overbalance in depleted sands.'
      },
    ],
    timeline: [
      {
        id: 'TL-C-1',
        depth: 4650,
        date: '02 May 2019',
        title: 'Normal Drilling',
        type: 'Normal drilling',
        category: 'normal',
        severity: 'Nominal',
        description: 'Drilling out 9-5/8" casing shoe with 1.24 SG mud.',
      },
      {
        id: 'TL-C-2',
        depth: 4880,
        date: '08 May 2019',
        title: 'Formation Transition',
        type: 'Formation transition',
        category: 'transition',
        severity: 'Low',
        description: 'Entered Formation X sand sequence.',
      },
      {
        id: 'TL-C-3',
        depth: 5025,
        date: '14 May 2019',
        title: 'STUCK PIPE (Differential Sticking)',
        type: 'Stuck Pipe',
        category: 'incident',
        severity: 'Critical',
        cause: 'Prototype historical classification: High overbalance differential pressure across depleted sandstone',
        impact: 'Pipe locked off bottom / overpull exceeded 180 klbf / 38 hrs NPT',
        mitigation: 'Historical mitigation: 50 bbl surfactant soak pill across BHA, activated hydraulic drilling jars upward, freed after 14 hrs.',
        sourceDoc: 'WCR-2019-WELL-C-076',
        sourceDocPage: 88,
        description: 'Drillstring became differentials stuck off bottom after 22 minutes stationary connection time during MWD survey in depleted Formation X.',
      },
      {
        id: 'TL-C-4',
        depth: 5035,
        date: '17 May 2019',
        title: 'Circulation & Rotation Regained',
        type: 'Circulation restored',
        category: 'operation',
        severity: 'Moderate',
        description: 'String jarred free. Circulated out heavy filter cake. Enforced 3-minute stationary pipe restriction.',
      },
      {
        id: 'TL-C-5',
        depth: 5200,
        date: '28 May 2019',
        title: 'TD Reached & Suspended',
        type: 'Casing operation',
        category: 'operation',
        severity: 'Nominal',
        description: 'Terminated drilling early at 5,200 m due to depleted pressure regime. Well later plugged and abandoned.',
      },
    ],
    parameters: generateWellParameters('WELL-C'),
    formations: [
      {
        formation: 'Formation X (Depleted Reservoir Sand)',
        topDepth: 4620,
        bottomDepth: 5200,
        lithology: 'High-porosity Depleted Sandstone',
        porePressureEquivalent: '0.98 SG (Depleted)',
        fractureGradient: '1.46 SG',
        permeability: '180 - 450 mD',
        drillingCharacteristics: 'High risk of differential sticking when mud weight exceeds 1.15 SG.'
      },
    ],
    documents: [
      {
        id: 'DOC-WCR-WELL-C-076',
        name: 'WCR-2019-WELL-C-076',
        title: 'Well Completion Report — Well C (Offset 6.2 km)',
        type: 'WCR',
        date: '14 May 2019',
      },
    ],
    lessonsLearned: {
      historicalLesson: 'Differential sticking occurred at 5,025 m due to excessive mud overbalance and 22 minutes stationary time.',
      evidenceDoc: 'WCR-2019-WELL-C-076',
      evidencePage: 88,
      aiInterpretationNote: 'AI-assisted summary — Source-backed information only.',
      keyTakeaways: [
        'Depleted reservoir pressure was 0.98 SG equivalent, meaning 1.24 SG mud generated ~1,800 psi differential pressure across BHA.',
        'Never leave drillstring stationary for more than 3 minutes across Formation X.',
        'Maintain thin, low-permeability filter cake with starch and synthetic fluid loss additives.',
      ],
      mitigationPlaybook: [
        {
          action: 'Spot 50 bbl Pipe-Freeing Oil/Surfactant Pill across BHA with 4-hour chemical soak.',
          result: 'Worked',
          protocol: 'Broke differential filter cake bond and allowed upward jarring release.'
        },
        {
          action: 'Excessive straight overpull without chemical soaking.',
          result: 'Failed',
          protocol: 'Exceeded 180 klbf overpull without movement; risked parting string.'
        },
      ],
    },
  },
};

// Helper to look up a well dossier by ID or generate fallback from OFFSET_WELLS
export function getWellDossier(wellId: string): WellDossier {
  const normalized = wellId.toUpperCase().replace(/\s+/g, '-');

  // Direct match
  if (WELL_DOSSIERS[normalized]) {
    return WELL_DOSSIERS[normalized];
  }

  // Alias lookup (e.g. WELL-A -> WELL-A, A -> WELL-A)
  for (const key of Object.keys(WELL_DOSSIERS)) {
    if (key.includes(normalized) || normalized.includes(key) || key.endsWith(normalized)) {
      return WELL_DOSSIERS[key];
    }
  }

  // Match from base OFFSET_WELLS list
  const offset = OFFSET_WELLS.find(
    (w) => w.id.toUpperCase() === normalized || w.name.toUpperCase().includes(normalized)
  );

  if (offset) {
    return {
      id: offset.id,
      name: offset.name,
      code: offset.code,
      subtitle: 'Historical Offset Well',
      distanceKm: offset.distanceKm,
      bearing: offset.bearing,
      formation: offset.formation,
      lithology: offset.lithology,
      totalDepth: offset.totalDepth,
      similarityScore: offset.similarityScore,
      similarityBreakdown: offset.similarityBreakdown,
      riskHistory: offset.riskCategory === 'Significant' ? 'SIGNIFICANT' : offset.riskCategory === 'Moderate' ? 'MODERATE' : 'LOW',
      status: offset.status,
      spudDate: offset.spudDate,
      completedDate: offset.completedDate,
      drillingDuration: offset.drillingDuration,
      nptHours: offset.incidents.reduce((acc, i) => acc + i.nptHours, 0),
      nptPercentage: `${((offset.incidents.reduce((acc, i) => acc + i.nptHours, 0) / 2400) * 100).toFixed(1)}% of Rig Time`,
      operator: 'Oil India Limited (OIL)',
      rigName: 'OIL Rig Drillmaster (2000 HP)',
      field: 'Prototype Field Alpha',
      block: 'Block-AA-ONHP-2021/4',
      basin: 'Upper Assam Shelf Basin',
      lat: offset.lat,
      lng: offset.lng,
      casingProgram: [
        {
          stringName: 'Conductor Casing',
          holeSize: '36"',
          casingSize: '30"',
          shoeDepth: 80,
          mudWeight: '1.05 SG',
          cementTop: 'Surface',
          notes: 'Standard structural pipe.'
        },
        {
          stringName: 'Surface Casing',
          holeSize: '26"',
          casingSize: '20"',
          shoeDepth: 640,
          mudWeight: '1.08 SG',
          cementTop: 'Surface',
          notes: 'Aquifer protection string.'
        },
        {
          stringName: 'Intermediate Casing',
          holeSize: '17-1/2"',
          casingSize: '13-3/8"',
          shoeDepth: 2400,
          mudWeight: '1.14 SG',
          cementTop: '350 m',
          notes: 'Upper shale barrier.'
        },
        {
          stringName: 'Production Casing',
          holeSize: '12-1/4"',
          casingSize: '9-5/8"',
          shoeDepth: 4650,
          mudWeight: '1.18 SG',
          cementTop: '2,000 m',
          notes: 'Target reservoir isolation.'
        },
        {
          stringName: 'Production Liner',
          holeSize: '8-1/2"',
          casingSize: '7"',
          shoeDepth: offset.totalDepth,
          mudWeight: '1.22 SG',
          cementTop: '4,500 m (TOL)',
          notes: 'Set through reservoir.'
        },
      ],
      mudProgram: [
        {
          interval: '0 – 2,400 m',
          mudType: 'Water-Based Bentonite / Polymer',
          densityRange: '1.05 – 1.14 SG',
          pvYp: '14 cP / 18 lb/100ft²',
          phFilterCake: '9.2 / 6.0 ml',
          targetObjective: 'Upper section hole cleaning.'
        },
        {
          interval: '2,400 – TD',
          mudType: 'HPWBM Glycol Inhibited',
          densityRange: '1.18 – 1.22 SG',
          pvYp: '22 cP / 24 lb/100ft²',
          phFilterCake: '9.8 / 4.0 ml',
          targetObjective: 'Formation stability and shale inhibition.'
        },
      ],
      timeline: [
        {
          id: 'TL-GEN-1',
          depth: 4700,
          date: offset.spudDate,
          title: 'Normal Drilling',
          type: 'Normal drilling',
          category: 'normal',
          severity: 'Nominal',
          description: 'Smooth drilling operations in upper section.',
        },
        {
          id: 'TL-GEN-2',
          depth: 4850,
          date: offset.spudDate,
          title: 'Formation Transition',
          type: 'Formation transition',
          category: 'transition',
          severity: 'Low',
          description: `Transition into ${offset.formation}.`,
        },
        ...(offset.incidents.map((inc, i) => ({
          id: `TL-INC-${i}`,
          depth: inc.depth,
          date: offset.completedDate,
          title: inc.type.toUpperCase(),
          type: (inc.type === 'Mud Loss' ? 'MUD LOSS' : inc.type === 'High Torque' ? 'High Torque' : inc.type === 'Stuck Pipe' ? 'Stuck Pipe' : 'Normal drilling') as any,
          category: 'incident' as const,
          severity: inc.severity as any,
          cause: 'Prototype historical classification',
          impact: `${inc.type} / operational delay / ${inc.nptHours} hrs NPT`,
          mitigation: inc.mitigation,
          sourceDoc: inc.sourceDocName,
          sourceDocPage: inc.sourceDocPage,
          description: inc.description,
        }))),
        {
          id: 'TL-GEN-3',
          depth: offset.totalDepth,
          date: offset.completedDate,
          title: 'TD Reached & Casing Set',
          type: 'Casing operation',
          category: 'operation',
          severity: 'Nominal',
          description: `Completed well at ${offset.totalDepth.toLocaleString()} m.`,
        },
      ],
      parameters: generateWellParameters(offset.id),
      formations: [
        {
          formation: offset.formation,
          topDepth: 4680,
          bottomDepth: offset.totalDepth,
          lithology: offset.lithology,
          porePressureEquivalent: '1.14 SG',
          fractureGradient: '1.58 SG',
          permeability: '90 - 210 mD',
          drillingCharacteristics: offset.summaryNote,
        },
      ],
      documents: offset.relevantDocuments.map((d) => ({
        id: d.id,
        name: d.name,
        title: `Report — ${d.name}`,
        type: d.type,
        date: offset.completedDate,
      })),
      lessonsLearned: {
        historicalLesson: `Similar drilling conditions were associated with historical ${offset.historicalEventsList[0] || 'drilling'} events in this formation.`,
        evidenceDoc: offset.relevantDocuments[0]?.name || 'DDR-ARCHIVE',
        evidencePage: 24,
        aiInterpretationNote: 'AI-assisted summary — Source-backed information only.',
        keyTakeaways: [
          `Offset records reveal ${offset.riskHistory}.`,
          `Pay close attention to drilling dynamics when approaching critical depth ${offset.criticalDepth} m.`,
        ],
        mitigationPlaybook: [
          {
            action: 'Proactive parameter monitoring and standby LCM.',
            result: 'Worked',
            protocol: 'Pre-treated mud system prevented severe stuck pipe or total losses.'
          },
        ],
      },
    };
  }

  // Fallback to WELL-A default
  return WELL_DOSSIERS['WELL-A'];
}
