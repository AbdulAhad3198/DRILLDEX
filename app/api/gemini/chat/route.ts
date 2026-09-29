import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { OFFSET_WELLS, PRIMARY_RISK_ALERT, FORMATION_STRATA } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const { message, currentDepth = 4780, history = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = `You are NWIS-Agent, the AI Decision Support Engine for eRTMAC-NWIS (Nearby Wells Intelligence System, Problem Statement 26121).
Core Philosophy: "eRTMAC tells what is happening now; NWIS tells what happened before and what may matter now."
Target Operator: Oil India Limited (OIL), Upper Assam Shelf (Makum Field).

CURRENT DRILLING CONTEXT:
- Active Well: Well A-12 (WELL-NWIS-01)
- Current Depth: ${currentDepth} m MD
- Target Depth: 5,500 m MD
- Current Formation: Formation F-3 (Barail Sandstone & Coal Member, depth interval 4,750 m to 5,250 m)
- Critical Approaching Risk Interval: 5,030 m – 5,120 m MD (Mud Loss / Lost Circulation & Differential Sticking)
- Current Real-time Parameters: ROP 8.2 m/hr, Torque 11.5 k·ft-lb, SPP 3,280 psi, Mud Weight 1.18 SG, ECD 1.24 SG.

OFFSET WELL DATABASE SUMMARY:
1. Well B-03 (3.2 km NW): Lost circulation at 4,820 m (45 bbl) and complete loss at 5,040 m (78 bbl/hr) in Formation F-3. Mitigated by increasing mud weight to 1.22 SG and pumping 40 bbl coarse LCM (nutplug + mica) pill with 4.5h soak. (Source: WCR-2021-045.pdf)
2. Well C-07 (5.1 km NE): Erratic torque spikes (up to 28 k·ft-lb) and tight hole at 4,850 m and 5,060 m in F-3. Mitigated by rheology adjustment (lowering YP to 18 lb/100ft²), lubricant beads, and reducing ROP to 6 m/hr with wiper trips. (Source: DDR-2022-C07-118.pdf)
3. Well D-11 (7.4 km SE): Differential sticking at 5,060 m (38h NPT) after 22 minutes stationary pipe during MWD survey in depleted sandstone. Mitigated by spotting 50 bbl surfactant soak pill and jarring. Advised strict stationary string limit (<3 min). (Source: WCR-2019-076.pdf)
4. Well F-02 (6.8 km W): Gas kick at 5,015 m (18 bbl pit gain). Controlled using Wait & Weight method, kill weight 1.21 SG. (Source: DDR-2020-F02-089.pdf)

STRICT OPERATIONAL RULES:
1. You are a DECISION-SUPPORT SYSTEM, NOT an autonomous drilling controller.
2. ALWAYS include this operational disclaimer when recommending actions: "Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer."
3. Always explain: Risk, Why it happened, Evidence from offset wells (with well names and exact depths), and Historical Mitigations.
4. Format responses cleanly with concise paragraphs, bulleted technical checklists, and source report citations.`;

    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const contents = [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
        ];

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents as any,
        });

        const replyText = response.text;
        if (replyText) {
          return NextResponse.json({
            reply: replyText,
            source: "gemini-api",
            citations: [
              { well: "Well B-03", depth: "5,040 m", event: "Mud Loss", source: "WCR-2021-045.pdf" },
              { well: "Well C-07", depth: "5,060 m", event: "High Torque", source: "DDR-2022-C07-118.pdf" },
              { well: "Well D-11", depth: "5,060 m", event: "Differential Sticking", source: "WCR-2019-076.pdf" },
            ],
          });
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed, falling back to local expert system:", geminiErr?.message);
      }
    }

    // High-quality fallback expert response generator
    const query = message.toLowerCase();
    let reply = "";
    const citations: any[] = [];

    if (query.includes("mud loss") || query.includes("lost circulation") || query.includes("lcm")) {
      reply = `**Offset Well Intelligence: Mud Loss Risk Assessment**

• **Approaching Hazard:** Entering Formation F-3 (Barail Sandstone) between **5,030 m and 5,120 m**.
• **Historical Precedent:**
  - **Well B-03 (3.2 km NW)** suffered severe mud loss of 78 bbl/hr at 5,040 m (*WCR-2021-045.pdf*).
  - Standpipe pressure dropped 350 psi upon penetrating micro-fractures in depleted sandstone.
• **Historical Proven Mitigation:**
  1. Raised mud weight from 1.18 to 1.22 SG.
  2. Spotted 40 bbl coarse LCM pill (calcium carbonate + nutplug + mica flakes).
  3. Hesitation squeeze over 4.5 hours fully restored returns without sidetracking.
• **Recommended Action for Well A-12:**
  - Pre-mix 50 bbl LCM pill on standby in active pit #3 before drilling past 5,010 m.
  - Monitor standpipe pressure and pit volume alarms closely on 30-second intervals.

*Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.*`;
      citations.push({ well: "Well B-03", depth: "5,040 m", event: "Mud Loss", source: "WCR-2021-045.pdf" });
    } else if (query.includes("stuck") || query.includes("torque") || query.includes("drag")) {
      reply = `**Offset Well Intelligence: Torque & Differential Sticking Advisory**

• **Approaching Hazard:** High torque spikes and differential sticking risk across **5,025 m – 5,070 m**.
• **Historical Evidence:**
  - **Well C-07 (5.1 km NE):** Rotary torque spiked from 12 to 28 k·ft-lb at 4,850 m and 5,060 m (*DDR-2022-C07-118.pdf*). Top drive stalled twice due to reactive shale stringers.
  - **Well D-11 (7.4 km SE):** Experienced differential sticking at 5,060 m (*WCR-2019-076.pdf*) after remaining stationary for 22 minutes during an MWD survey. Required 38 hours NPT and hydraulic jar activation to free.
• **Recommended Preventative Checklist:**
  1. **Strict Stationary Time Limit:** Restrict stationary string time to under 3 minutes on connections. Keep string rotating at 25–40 RPM or reciprocating.
  2. **Rheology Control:** Condition mud to maintain Yield Point between 18–20 lb/100ft².
  3. **Lubricity:** Consider adding 2% organic lubricant beads if torque exceeds 15 k·ft-lb.

*Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.*`;
      citations.push({ well: "Well C-07", depth: "4,850 m", event: "High Torque", source: "DDR-2022-C07-118.pdf" });
      citations.push({ well: "Well D-11", depth: "5,060 m", event: "Stuck Pipe", source: "WCR-2019-076.pdf" });
    } else if (query.includes("formation") || query.includes("f-3") || query.includes("barail")) {
      reply = `**Geological & Stratigraphic Intelligence: Formation F-3 (Barail)**

• **Interval:** 4,750 m to 5,250 m MD.
• **Lithology:** Interbedded fractured porous sandstone, carbonaceous shale, and friable sub-bituminous coal seams.
• **Pore Pressure Regime:** Depleted sand members (~0.98 SG equivalent pore pressure) juxtaposed with overpressured shale bands (1.20 SG).
• **Core Vulnerability:** Differential pressure overbalance reaches up to 1,800 psi across the sandstone face, causing rapid filter cake buildup and fluid leakoff.
• **Offset Reference:** 4 out of 5 offset wells in Makum block logged either fluid loss or high drag in this specific member.

*Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.*`;
      citations.push({ well: "Stratigraphic Study", depth: "4,750–5,250 m", event: "Formation Characterization", source: "GEO-2023-MAKUM-09.pdf" });
    } else {
      reply = `**eRTMAC-NWIS Decision Support Summary**

Current Well **Well A-12** is at **${currentDepth} m MD**, approaching the critical risk window **5,030 m – 5,120 m** in **Formation F-3**.

Key Offset Insights:
• **Mud Loss Warning:** Offset Well B-03 had complete loss at 5,040 m. Pre-mix LCM pill recommended.
• **Stuck Pipe Warning:** Offset Well D-11 stuck at 5,060 m due to differential pressure. Stationary pipe restriction advised (< 3 min).
• **Torque Fluctuation:** Offset Well C-07 experienced top-drive stalls at 4,850 m & 5,060 m. Rheology conditioning (YP < 20) proven effective.

*Recommendations are provided for engineer review. Final operational decisions remain with the drilling engineer.*`;
      citations.push({ well: "Well B-03", depth: "5,040 m", event: "Mud Loss", source: "WCR-2021-045.pdf" });
      citations.push({ well: "Well C-07", depth: "4,850 m", event: "High Torque", source: "DDR-2022-C07-118.pdf" });
    }

    return NextResponse.json({
      reply,
      source: "expert-knowledge-engine",
      citations,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
