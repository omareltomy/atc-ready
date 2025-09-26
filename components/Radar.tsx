/**
 * 📡 RADAR SCREEN COMPONENT 📡
 * 
 * WHAT THIS FILE DOES (explain it like I'm 5):
 * Think of this like the radar screen in a      // 📝 Draw the distance label (like "3NM", "6NM", "9NM")
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', String(toPx(3 * (i + 1)) - 20));   // Position near the ring
      t.setAttribute('y', '12');                              // Slightly below center line
      t.setAttribute('fill', '#666');                         // Gray text col      }
      if (chosen) {
        placed.push({ x: chosen.x, y: chosen.y, w: chosen.w, h: chosen.h });
      }

      // 🔗 STEP 4: DRAW CONNECTOR LINE (connects label to airplane)
      // This draws a line from the airplane to its information label
      if (chosen) {
        const cx2 = chosen.x + chosen.w / 2;     // Connect to center of label width
        let cy2 = y;                             // Start at airplane Y
        cy2 = Math.max(chosen.y, Math.min(cy2, chosen.y + chosen.h));  // Clamp to label bounds  t.setAttribute('font-size', '11');                      // Small text size
      t.setAttribute('font-family', 'monospace');             // Computer-style font
      t.textContent = lab;                                    // The actual text ("3NM", etc.)
      g.appendChild(t);  // Add label to radar screen
    });e or movie!
 * It draws a green circle with rings (like a target) and shows airplanes as dots.
 * The pilot can see where airplanes are and which direction they're flying.
 * 
 * 🎮 HOW A RADAR SCREEN WORKS (like a map from above):
 * - Center = Your airplane (you are always at the middle!)
 * - Green circles = Distance rings (3 miles, 6 miles, 9 miles away)
 * - Compass lines = North, South, East, West directions
 * - Clock numbers = 12 o'clock (North), 3 o'clock (East), etc.
 * - Airplane dots = Other airplanes flying around you
 * - Trail dots = Where airplanes came from (breadcrumb trail)
 * 
 * 🧭 RADAR COORDINATE SYSTEM (like a clock face):
 * - 12 o'clock = North (straight up)
 * - 3 o'clock = East (right side)  
 * - 6 o'clock = South (straight down)
 * - 9 o'clock = West (left side)
 * - You are always at the center of the clock!
 * 
 * 🎨 WHAT WE DRAW (like painting a picture step by step):
 * 1. Green background circle (the radar screen)
 * 2. Distance rings (3NM, 6NM, 9NM circles)
 * 3. Compass lines (North-South and East-West)  
 * 4. Clock numbers (12, 3, 6, 9)
 * 5. Target airplane (your airplane - triangle at center)
 * 6. Intruder airplane (other airplane - triangle somewhere else)
 * 7. History dots (trails showing where airplanes came from)
 * 8. Text labels (airplane names and information)
 */

'use client';

// 📦 IMPORTING THE BUILDING BLOCKS
// Think of these imports like getting different toolboxes:

// 🔧 React toolbox: Special tools for making interactive web components
import { useEffect, useRef } from 'react';

// ✈️ Exercise definition: The instruction manual that tells us what an airplane exercise looks like
import { Exercise } from '@/lib/types';  // Changed from generator to types

// 📋 COMPONENT PROPS (like a delivery package label)
// This tells us what information this radar component needs to work:
type Props = { exercise: Exercise };  // We need an "exercise" containing airplane information

/**
 * 📡 MAIN RADAR COMPONENT FUNCTION
 * This is like the main control room for our radar screen!
 * It takes an airplane exercise and draws it on a radar display.
 * 
 * 🎯 WHAT IT RECEIVES:
 * - exercise = Contains information about two airplanes (target + intruder)
 * 
 * 🎨 WHAT IT CREATES:
 * - A visual radar screen showing the airplanes and their positions
 */
export default function Radar({ exercise }: Props) {
  // 📺 SVG SCREEN REFERENCE (like a TV remote control)
  // This gives us direct control over the radar screen so we can draw on it
  const svgRef = useRef<SVGSVGElement | null>(null);

  /**
   * 🎬 USEEFFECT: THE MOVIE DIRECTOR
   * This is like a movie director that says "Action!" whenever something changes.
   * Every time we get a new airplane exercise, it redraws the entire radar screen.
   * 
   * 🎭 WHAT TRIGGERS A REDRAW:
   * - New exercise received (different airplanes to show)
   * - Component first loads on screen
   * 
   * 🎨 WHAT THE REDRAW DOES:
   * 1. Clears the old radar screen (erases everything)
   * 2. Sets up the coordinate system and scaling
   * 3. Draws all the radar elements step by step
   * 4. Places airplanes in their correct positions
   */
  useEffect(() => {
    // 🚨 SAFETY CHECK: Make sure we have a radar screen to draw on
    if (!svgRef.current) return;  // Exit if no screen available
    
    // 📺 Get our drawing canvas (the SVG radar screen)
    const svg = svgRef.current;
    // ✈️ Extract the airplane information from the exercise
    const { target, intruder } = exercise;
    // 🎨 SVG drawing toolkit (like getting the right paintbrushes)
    const svgNS = 'http://www.w3.org/2000/svg';

    // 🧹 CLEAR THE OLD DRAWING (like erasing a whiteboard)
    // Remove everything from the previous radar display
    svg.innerHTML = '';

    // 📐 RADAR SCREEN MATH SETUP (like measuring a canvas before painting)
    // Think of this like setting up a coordinate system on graph paper:
    
    // 📏 Screen dimensions (how big is our radar screen?)
    const w = svg.clientWidth;   // Width in pixels (left to right)  
    const h = svg.clientHeight;  // Height in pixels (top to bottom)
    const cx = w / 2;           // Center X coordinate (middle sideways)
    const cy = h / 2;           // Center Y coordinate (middle up-down)
    
    // 🔍 SCALING SYSTEM (converting nautical miles to screen pixels)
    // This is like deciding how many steps = 1 mile on our map
    const SCALE = Math.min(w, h) / 24;  // Each nautical mile = this many pixels
    const toPx = (nm: number) => nm * SCALE;  // Function to convert miles to pixels
    
    // 📊 Size limits and margins
    const BOUND = Math.min(w, h) / 2;  // How far we can draw from center
    const M = 8;                       // Margin space (like border around a picture)

    // 🎨 DRAWING BACKGROUND INFO: The green circular background is handled by CSS styles

    // 🎯 CREATE MAIN DRAWING GROUP (like setting up an easel)
    // All radar elements will be drawn inside this group, centered on the screen
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `translate(${cx},${cy})`);  // Move to center of screen
    svg.appendChild(g);  // Add the group to our radar screen

    // 🎯 DRAW DISTANCE RINGS & LABELS (like target rings on a bullseye)
    // These help pilots know how far away other airplanes are
    ['3NM', '6NM', '9NM'].forEach((lab, i) => {
      // 🟢 Draw the circular ring
      const r = document.createElementNS(svgNS, 'circle');
      r.setAttribute('cx', '0');                              // Center X (we're already at center)
      r.setAttribute('cy', '0');                              // Center Y (we're already at center)  
      r.setAttribute('r', String(toPx(3 * (i + 1))));        // Radius: 3NM, 6NM, or 9NM
      r.setAttribute('stroke', getComputedStyle(document.documentElement)
        .getPropertyValue('--ring').trim());                 // Ring color from CSS theme
      r.setAttribute('fill', 'none');                         // Hollow circle (no inside color)
      r.setAttribute('stroke-width', '1');                    // Thin ring line
      g.appendChild(r);

      // 📝 Draw the distance label (like "3NM", "6NM", "9NM")
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', String(toPx(3 * (i + 1)) - 20));
      t.setAttribute('y', '12');
      t.setAttribute('fill', '#666');
      t.setAttribute('font-size', '10');
      t.setAttribute('font-family', 'sans-serif');
      t.textContent = lab;
      g.appendChild(t);
    });

    // 🧭 DRAW COMPASS AXES (North-South and East-West lines)
    // These are like the crosshairs in a scope, helping show directions
    const drawLine = (x1: number, y1: number, x2: number, y2: number, varName: string) => {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', String(x1));         // Starting point X
      l.setAttribute('y1', String(y1));         // Starting point Y  
      l.setAttribute('x2', String(x2));         // Ending point X
      l.setAttribute('y2', String(y2));         // Ending point Y
      l.setAttribute('stroke', getComputedStyle(document.documentElement)
        .getPropertyValue(varName).trim());     // Line color from CSS theme
      l.setAttribute('stroke-width', '1');      // Thin line
      g.appendChild(l);
    };
    // Draw horizontal line (East-West axis)
    drawLine(-w, 0, w, 0, '--cross');
    // Draw vertical line (North-South axis)  
    drawLine(0, -h, 0, h, '--cross');

    // 📐 LABEL PLACEMENT TRACKING SYSTEM (like parking spaces for text)
    // This keeps track of where we've already put text so labels don't overlap
    const placed: { x: number; y: number; w: number; h: number }[] = [];                           // Already used areas
    const aircraftAreas: { x: number; y: number; w: number; h: number; leaderLine: { x1: number; y1: number; x2: number; y2: number } }[] = [];  // Airplane + leader line areas
    const historyDotAreas: { x: number; y: number; w: number; h: number }[] = [];                  // History dot areas
    
    // 🎯 STEP 1: REGISTER ALL AIRPLANE POSITIONS (reserve parking spaces)
    // Before we draw anything, figure out where everything goes so nothing overlaps
    [target, intruder].forEach(ac => {
      // 📍 Convert airplane coordinates from nautical miles to screen pixels
      const x = toPx(ac.position.x);      // Convert X position to pixels
      const y = -toPx(ac.position.y);     // Convert Y position to pixels (flip because screen Y is upside down)
      
      // 🎯 Register history dots as no-fly zones for labels (keep text away from dots)  
      ac.history.forEach((p: { x: number; y: number }) => {  // Added type to fix TypeScript error
        const dotX = toPx(p.x);         // Convert dot X to pixels
        const dotY = -toPx(p.y);        // Convert dot Y to pixels (flip Y axis)
        const dotBuffer = 15;           // Safety buffer around each dot (like a force field)
        historyDotAreas.push({
          x: dotX - dotBuffer,          // Left edge of no-fly zone  
          y: dotY - dotBuffer,          // Top edge of no-fly zone
          w: dotBuffer * 2,             // Width of no-fly zone
          h: dotBuffer * 2              // Height of no-fly zone  
        });
      });
      
      // 📏 Calculate leader line (speed arrow pointing where airplane is going)
      // Think of this like an arrow pointing in the direction the airplane is flying
      // Faster airplanes get longer arrows, slower airplanes get shorter arrows
      const minSpeed = 60;             // Slowest possible airplane speed
      const maxSpeed = 350;            // Fastest possible airplane speed  
      const minLeaderLength = 15;      // Shortest arrow length (pixels)
      const maxLeaderLength = 45;      // Longest arrow length (pixels)
      
      // 🧮 Calculate arrow length based on airplane speed (like a speedometer)
      const normalizedSpeed = Math.max(0, Math.min(1, (ac.speed - minSpeed) / (maxSpeed - minSpeed)));
      const leaderLength = minLeaderLength + normalizedSpeed * (maxLeaderLength - minLeaderLength);
      
      // 📐 Calculate where the arrow points (based on airplane heading)
      const rad = ac.heading * Math.PI / 180;        // Convert degrees to radians for math
      const x2 = x + Math.sin(rad) * leaderLength;   // Arrow end point X
      const y2 = y - Math.cos(rad) * leaderLength;   // Arrow end point Y
      
      // 🚫 Register airplane area as no-fly zone for labels (bigger buffer to keep text away)
      const aircraftBuffer = 40;   // Extra space around airplane (like personal bubble)
      aircraftAreas.push({
        x: x - aircraftBuffer,      // Left edge of airplane's personal space
        y: y - aircraftBuffer,      // Top edge of airplane's personal space  
        w: aircraftBuffer * 2,      // Width of airplane's personal space
        h: aircraftBuffer * 2,      // Height of airplane's personal space
        leaderLine: { x1: x, y1: y, x2, y2 }  // Remember the arrow coordinates
      });
    });
    
    // 🎯 Function to check if two rectangles overlap (like checking if two airplanes bump into each other on screen)
    // Like checking if two toy blocks are touching on a table
    interface Rectangle {
      x: number;
      y: number;
      w: number;
      h: number;
    }
    
    const overlap = (a: Rectangle, b: Rectangle) =>
      !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
    

    const rectIntersectsLine = (rect: {x: number, y: number, w: number, h: number}, 
                               line: {x1: number, y1: number, x2: number, y2: number},
                               buffer: number = 5) => {
      const { x1, y1, x2, y2 } = line;
      const { x: rx, y: ry, w: rw, h: rh } = rect;
      
      // Expand rectangle by buffer
      const expandedRect = {
        x: rx - buffer,
        y: ry - buffer,
        w: rw + 2 * buffer,
        h: rh + 2 * buffer
      };
      
      // Check if line endpoints are inside expanded rectangle
      if ((x1 >= expandedRect.x && x1 <= expandedRect.x + expandedRect.w && 
           y1 >= expandedRect.y && y1 <= expandedRect.y + expandedRect.h) ||
          (x2 >= expandedRect.x && x2 <= expandedRect.x + expandedRect.w && 
           y2 >= expandedRect.y && y2 <= expandedRect.y + expandedRect.h)) {
        return true;
      }
      
      // Check line-rectangle intersection using parametric line equation
      const dx = x2 - x1;
      const dy = y2 - y1;
      
      // Check intersection with each edge of expanded rectangle
      const edges = [
        { x1: expandedRect.x, y1: expandedRect.y, x2: expandedRect.x + expandedRect.w, y2: expandedRect.y }, // top
        { x1: expandedRect.x + expandedRect.w, y1: expandedRect.y, x2: expandedRect.x + expandedRect.w, y2: expandedRect.y + expandedRect.h }, // right
        { x1: expandedRect.x + expandedRect.w, y1: expandedRect.y + expandedRect.h, x2: expandedRect.x, y2: expandedRect.y + expandedRect.h }, // bottom
        { x1: expandedRect.x, y1: expandedRect.y + expandedRect.h, x2: expandedRect.x, y2: expandedRect.y } // left
      ];
      
      for (const edge of edges) {
        const denominator = (edge.x1 - edge.x2) * dy - (edge.y1 - edge.y2) * dx;
        if (Math.abs(denominator) < 1e-10) continue; // Lines are parallel
        
        const t = ((edge.x1 - x1) * dy - (edge.y1 - y1) * dx) / denominator;
        const u = -((x1 - edge.x1) * (edge.y1 - edge.y2) - (y1 - edge.y1) * (edge.x1 - edge.x2)) / denominator;
        
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
          return true;
        }
      }
      
      return false;
    };

    /**
     * ✈️ AIRPLANE DRAWING FUNCTION (like drawing a plane and its information)
     * This function draws one airplane on the radar screen with all its details!
     * 
     * 🎨 WHAT IT DRAWS FOR EACH AIRPLANE:
     * 1. History dots (breadcrumb trail showing where it came from)
     * 2. Velocity vector (arrow showing speed and direction) 
     * 3. Airplane square (the airplane itself)
     * 4. Information label (callsign, type, altitude, speed)
     * 5. Connector line (connects label to airplane)
     * 
     * @param ac - The airplane data (position, speed, callsign, etc.)
     * @param varName - CSS color variable name (different colors for target vs intruder)
     */
    function drawAc(ac: typeof target, varName: string) {
      // 🎨 Get the airplane's color from CSS theme (target = blue, intruder = red)
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(varName).trim();
        
      // 📍 Convert airplane position from nautical miles to screen pixels  
      const x = toPx(ac.position.x);      // X position on screen
      const y = -toPx(ac.position.y);     // Y position on screen (negative because screen Y is flipped)

      // 🔸 STEP 1: DRAW HISTORY DOTS (breadcrumb trail)
      // These show where the airplane has been (like dots in Pac-Man!)
      ac.history.forEach((p: { x: number; y: number }, _index: number) => {  // Added types to fix TypeScript
        const d = document.createElementNS(svgNS, 'circle');
        d.setAttribute('cx', String(toPx(p.x)));           // Dot X position
        d.setAttribute('cy', String(-toPx(p.y)));          // Dot Y position (flipped)
        d.setAttribute('r', '1.5');                        // Small dot radius
        d.setAttribute('fill', color);                     // Same color as airplane
        d.setAttribute('opacity', '0.8');                 // Slightly transparent
        g.appendChild(d);  // Add dot to radar screen
      });

      // ➡️ STEP 2: DRAW VELOCITY VECTOR (speed arrow)
      // This arrow shows which direction the airplane is flying and how fast
      // Think of it like the airplane's "intention arrow"
      
      // 🏎️ Speed scaling constants (convert airplane speed to arrow length)
      const minSpeed = 60;         // Slowest airplane speed (knots)
      const maxSpeed = 350;        // Fastest airplane speed (knots)
      const minLeaderLength = 15;  // Shortest arrow (pixels)  
      const maxLeaderLength = 45;  // Longest arrow (pixels)
      
      // 📏 Calculate arrow length based on airplane speed
      // Faster airplane = longer arrow, slower airplane = shorter arrow
      const normalizedSpeed = Math.max(0, Math.min(1, (ac.speed - minSpeed) / (maxSpeed - minSpeed)));
      const leaderLength = minLeaderLength + normalizedSpeed * (maxLeaderLength - minLeaderLength);
      
      // 🧭 Calculate arrow direction (where the airplane is heading)
      const rad = ac.heading * Math.PI / 180;       // Convert degrees to radians for math
      const x2 = x + Math.sin(rad) * leaderLength;  // Arrow end point X
      const y2 = y - Math.cos(rad) * leaderLength;  // Arrow end point Y
      
      // ➡️ Draw the velocity vector line (speed arrow)
      const vec = document.createElementNS(svgNS, 'line');
      vec.setAttribute('x1', String(x));            // Arrow start (airplane position)
      vec.setAttribute('y1', String(y));
      vec.setAttribute('x2', String(x2));           // Arrow end (pointing in flight direction)
      vec.setAttribute('y2', String(y2));
      vec.setAttribute('stroke', color);            // Same color as airplane
      vec.setAttribute('stroke-width', '2');        // Medium thickness line
      g.appendChild(vec);  // Add arrow to radar screen

      // 📋 STEP 3: PREPARE AIRPLANE INFORMATION LABEL
      // This creates the text label that shows airplane details (like a name tag)
      
      // 🏷️ Format altitude for display (different rules for VFR vs IFR)
      const formatLevel = (level: number, isVFR: boolean) => {
        if (isVFR) {
          // 🛩️ VFR altitude: "A35" means 3500 feet (VFR uses "A" prefix)
          return `A${String(Math.round(level / 100)).padStart(2, '0')}`;
        } else {
          // ✈️ IFR altitude: "035" means 3500 feet (IFR uses flight level numbers)
          return String(Math.round(level / 100)).padStart(3, '0');
        }
      };

      // 📝 Build the information text lines (like filling out an airplane ID card)
      const lines = [
        ac.isVFR ? 'V' : '',                    // Line 1: "V" for VFR airplanes (blank for IFR)
        `${ac.callsign} ${ac.wtc} ${ac.type.type}`,  // Line 2: Name, size category, airplane type
        formatLevel(ac.level, ac.isVFR) +       // Line 3: Current altitude + 
        (ac.levelChange ? ` ${ac.levelChange.dir}${formatLevel(ac.levelChange.to, ac.isVFR)}` : '') +  // Level change info (if climbing/descending)
        ` N${ac.speed}`                         // + Speed in knots
      ].filter(line => line !== '');           // Remove any empty lines
      
      // 📐 Calculate label box size (how much space our text needs)
      const maxLen = Math.max(...lines.map(l => l.length));  // Find longest text line
      const boxW = maxLen * 7 + 12;           // Width: character width × length + padding
      const boxH = lines.length * 14 + 6;
      const maxRadius = BOUND - M;

      // Generate candidate positions using proven cartographic techniques
      const candidates: Array<{
        x: number, y: number, w: number, h: number, 
        score: number, anchor: string, distance: number
      }> = [];

      // 8-position model (standard for point feature labeling in GIS)
      const standardPositions = [
        { angle: 0, anchor: 'start', priority: 1 },     // right (preferred)
        { angle: 180, anchor: 'end', priority: 2 },     // left (second choice)
        { angle: 270, anchor: 'middle', priority: 3 },  // top
        { angle: 90, anchor: 'middle', priority: 3 },   // bottom
        { angle: 315, anchor: 'start', priority: 4 },   // top-right
        { angle: 225, anchor: 'end', priority: 4 },     // top-left
        { angle: 45, anchor: 'start', priority: 4 },    // bottom-right
        { angle: 135, anchor: 'end', priority: 4 }      // bottom-left
      ];

      // Bias positions away from leader line direction
      const leaderAngle = ac.heading;
      
      for (const pos of standardPositions) {
        // Rotate position relative to aircraft heading for context-aware placement
        const adjustedAngle = (pos.angle + leaderAngle + 180) % 360; // Prefer opposite to motion
        
        for (let distance = 40; distance <= 140; distance += 30) {
          const rad = adjustedAngle * Math.PI / 180;
          
          let labelX = x + Math.cos(rad) * distance;
          let labelY = y + Math.sin(rad) * distance;
          
          // Adjust for anchor point
          if (pos.anchor === 'end') labelX -= boxW;
          else if (pos.anchor === 'middle') labelX -= boxW / 2;
          labelY -= boxH / 2; // Center vertically

          // Boundary check
          const corners = [
            { x: labelX, y: labelY },
            { x: labelX + boxW, y: labelY },
            { x: labelX, y: labelY + boxH },
            { x: labelX + boxW, y: labelY + boxH }
          ];
          
          const withinBounds = corners.every(corner => {
            const distFromCenter = Math.sqrt(corner.x * corner.x + corner.y * corner.y);
            return distFromCenter <= maxRadius;
          });

          if (!withinBounds) continue;

          // Calculate quality score
          let score = 100 / pos.priority; // Base score from position preference
          
          // Distance optimization (prefer 60-90px from aircraft)
          const idealDistance = 75;
          const distancePenalty = Math.abs(distance - idealDistance) * 0.4;
          score -= distancePenalty;

          const rect = { x: labelX, y: labelY, w: boxW, h: boxH };
          
          // Check for hard conflicts (immediate disqualification)
          let hasHardConflict = false;
          
          // Aircraft and leader line conflicts
          for (const area of aircraftAreas) {
            if (overlap(rect, area) || rectIntersectsLine(rect, area.leaderLine)) {
              hasHardConflict = true;
              break;
            }
          }
          
          // Existing label conflicts
          if (!hasHardConflict && placed.some(r => overlap(r, rect))) {
            hasHardConflict = true;
          }

          if (!hasHardConflict) {
            // History dot avoidance bonus
            const historyFree = !historyDotAreas.some(dotArea => overlap(rect, dotArea));
            if (historyFree) score += 15; // Bonus for avoiding history dots

            candidates.push({
              x: labelX, y: labelY, w: boxW, h: boxH,
              score, anchor: pos.anchor, distance
            });
          }
        }
      }

      // 🎯 Choose the best position for the label (like finding the best spot to put a name tag)
      interface LabelCandidate {
        x: number;
        y: number;
        w: number;
        h: number;
        score: number;
        anchor: string;
      }
      
      let chosen: LabelCandidate | null = null;
      
      if (candidates.length > 0) {
        // Sort by score and pick the best
        candidates.sort((a, b) => b.score - a.score);
        const best = candidates[0];
        chosen = { 
          x: best.x, y: best.y, w: best.w, h: best.h, 
          score: best.score,
          anchor: best.anchor 
        };
      } else {
        // Emergency fallback with minimal requirements
        const emergencyAngle = (leaderAngle + 180) % 360;
        const rad = emergencyAngle * Math.PI / 180;
        const emergencyX = x + Math.cos(rad) * 35 - boxW/2;
        const emergencyY = y + Math.sin(rad) * 35 - boxH/2;
        chosen = { 
          x: emergencyX, y: emergencyY, w: boxW, h: boxH, 
          score: 0,
          anchor: 'start' 
        };
      }
      // At this point, chosen is never null since we always assign it above
      placed.push({ x: chosen!.x, y: chosen!.y, w: chosen!.w, h: chosen!.h });

      // 🔗 STEP 4: DRAW CONNECTOR LINE (connects label to airplane)
      // This draws a line from the airplane to its information label
      const cx2 = chosen!.x + chosen!.w / 2;     // Connect to center of label width
      let cy2 = y;                             // Start at airplane Y position
      cy2 = Math.max(chosen!.y, Math.min(cy2, chosen!.y + chosen!.h));  // Clamp to label bounds
      const conn = document.createElementNS(svgNS, 'line');
      conn.setAttribute('x1', String(x));      // Line starts at airplane
      conn.setAttribute('y1', String(y));
      conn.setAttribute('x2', String(cx2));    // Line ends at label center
      conn.setAttribute('y2', String(cy2));
      conn.setAttribute('stroke', '#888');     // Gray connecting line
      conn.setAttribute('stroke-width', '1');  // Thin line
      g.appendChild(conn);

      // ✈️ STEP 5: DRAW AIRPLANE SQUARE (the airplane itself on radar)
      // This is drawn ON TOP of the leader line so airplane is always visible
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(x - 4));     // Center the 8x8 square on airplane position
      sq.setAttribute('y', String(y - 4));
      sq.setAttribute('width', '8');           // Small square (8 pixels wide)
      sq.setAttribute('height', '8');          // Small square (8 pixels tall)
      sq.setAttribute('fill', color);          // Same color as other airplane elements
      g.appendChild(sq);

      // 📝 STEP 6: DRAW INFORMATION TEXT (airplane details)
      // This draws all the text information about the airplane
      const txt = document.createElementNS(svgNS, 'text');
      const tx = chosen!.x + 6;                 // Text position with small margin
      txt.setAttribute('x', String(tx));
      txt.setAttribute('y', String(chosen!.y + 12));
      txt.setAttribute('fill', getComputedStyle(document.documentElement)
        .getPropertyValue('--text').trim());   // Text color from CSS theme
      txt.setAttribute('font-family', 'monospace');     // Computer-style font (all letters same width)
      txt.setAttribute('font-size', '12');              // Medium text size  
      txt.setAttribute('letter-spacing', '0.5px');     // Slightly spaced letters
      txt.setAttribute('text-anchor', 'start');        // Left-aligned text
      
      // 📋 Draw each line of information (callsign, altitude, speed, etc.)
      lines.forEach((l, i) => {
        const tsp = document.createElementNS(svgNS, 'tspan');
        tsp.setAttribute('x', String(tx));              // Same X position for all lines
        tsp.setAttribute('dy', i === 0 ? '0' : '14');   // First line: no offset, others: 14px down
        tsp.textContent = l;                            // The actual text content
        txt.appendChild(tsp);   // Add this line to the text element
      });
      g.appendChild(txt);  // Add all the text to the radar screen
    }

    // 🎬 MAIN DRAWING SEQUENCE (like directing a movie scene)
    // Draw both airplanes with their specific colors:
    drawAc(target, '--target');      // Draw target airplane (usually blue)
    drawAc(intruder, '--intruder');  // Draw intruder airplane (usually red)
    
  }, [exercise]);  // Redraw whenever we get a new exercise

  // 🖼️ RENDER THE RADAR SCREEN (return the actual HTML element)
  return (
    <svg
      ref={svgRef}                        // Connect to our drawing reference
      className="w-full h-full rounded-full"  // Make it fill container and round
      style={{
        background: 'var(--radar)'       // Green radar background from CSS theme
      }}
    />
  );
}
