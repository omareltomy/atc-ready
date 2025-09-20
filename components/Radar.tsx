'use client';

import { useEffect, useRef } from 'react';
import { Exercise } from '@/lib/generator';

type Props = { exercise: Exercise };

export default function Radar({ exercise }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const { target, intruder } = exercise;
    const svgNS = 'http://www.w3.org/2000/svg';

    // Clear prior drawing
    svg.innerHTML = '';

    // Dimensions
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const SCALE = Math.min(w, h) / 24;
    const toPx = (nm: number) => nm * SCALE;
    const BOUND = Math.min(w, h) / 2;
    const M = 8;

    // Draw background fill (circle via CSS) is on <svg> itself

    // Center group for rings/axes/etc.
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', `translate(${cx},${cy})`);
    svg.appendChild(g);

    // Rings & labels
    ['3NM', '6NM', '9NM'].forEach((lab, i) => {
      const r = document.createElementNS(svgNS, 'circle');
      r.setAttribute('cx', '0');
      r.setAttribute('cy', '0');
      r.setAttribute('r', String(toPx(3 * (i + 1))));
      r.setAttribute('stroke', getComputedStyle(document.documentElement)
        .getPropertyValue('--ring').trim());
      r.setAttribute('fill', 'none');
      r.setAttribute('stroke-width', '1');
      g.appendChild(r);

      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', String(toPx(3 * (i + 1)) - 20));
      t.setAttribute('y', '12');
      t.setAttribute('fill', '#666');
      t.setAttribute('font-size', '10');
      t.setAttribute('font-family', 'sans-serif');
      t.textContent = lab;
      g.appendChild(t);
    });

    // Crosshair axes
    const drawLine = (x1: number, y1: number, x2: number, y2: number, varName: string) => {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', String(x1));
      l.setAttribute('y1', String(y1));
      l.setAttribute('x2', String(x2));
      l.setAttribute('y2', String(y2));
      l.setAttribute('stroke', getComputedStyle(document.documentElement)
        .getPropertyValue(varName).trim());
      l.setAttribute('stroke-width', '1');
      g.appendChild(l);
    };
    drawLine(-w, 0, w, 0, '--cross');
    drawLine(0, -h, 0, h, '--cross');

    // Label placement helper - track occupied areas
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const aircraftAreas: { x: number; y: number; w: number; h: number; leaderLine: { x1: number; y1: number; x2: number; y2: number } }[] = [];
    const historyDotAreas: { x: number; y: number; w: number; h: number }[] = [];
    
    // FIRST: Register all aircraft positions, leader lines, and history dots as occupied areas
    [target, intruder].forEach(ac => {
      const x = toPx(ac.position.x);
      const y = -toPx(ac.position.y);
      
      // Register history dots as areas to avoid
      ac.history.forEach(p => {
        const dotX = toPx(p.x);
        const dotY = -toPx(p.y);
        const dotBuffer = 15; // Buffer around each history dot
        historyDotAreas.push({
          x: dotX - dotBuffer,
          y: dotY - dotBuffer,
          w: dotBuffer * 2,
          h: dotBuffer * 2
        });
      });
      
      // Calculate leader line
      const minSpeed = 60;
      const maxSpeed = 350;
      const minLeaderLength = 15;
      const maxLeaderLength = 45;
      const normalizedSpeed = Math.max(0, Math.min(1, (ac.speed - minSpeed) / (maxSpeed - minSpeed)));
      const leaderLength = minLeaderLength + normalizedSpeed * (maxLeaderLength - minLeaderLength);
      const rad = ac.heading * Math.PI / 180;
      const x2 = x + Math.sin(rad) * leaderLength;
      const y2 = y - Math.cos(rad) * leaderLength;
      
      // Register aircraft area with larger buffer to keep labels away
      const aircraftBuffer = 40; // Increased buffer to keep labels further away
      aircraftAreas.push({
        x: x - aircraftBuffer,
        y: y - aircraftBuffer,
        w: aircraftBuffer * 2,
        h: aircraftBuffer * 2,
        leaderLine: { x1: x, y1: y, x2, y2 }
      });
    });
    
    const overlap = (a: any, b: any) =>
      !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
    
    // Check if a rectangle intersects with a line segment
        const linesIntersect = (line1: {x1: number, y1: number, x2: number, y2: number}, 
                           line2: {x1: number, y1: number, x2: number, y2: number}) => {
      const det = (line1.x2 - line1.x1) * (line2.y2 - line2.y1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1);
      if (Math.abs(det) < 1e-10) return false; // Lines are parallel
      
      const t = ((line2.x1 - line1.x1) * (line2.y2 - line2.y1) - (line2.y1 - line1.y1) * (line2.x2 - line2.x1)) / det;
      const u = -((line1.x1 - line2.x1) * (line1.y2 - line1.y1) - (line1.y1 - line2.y1) * (line1.x2 - line1.x1)) / det;
      
      return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    };

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

    function drawAc(ac: typeof target, varName: string) {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(varName).trim();
      const x = toPx(ac.position.x);
      const y = -toPx(ac.position.y);

      // History dots with fixed count and no fading
      ac.history.forEach((p, index) => {
        const d = document.createElementNS(svgNS, 'circle');
        d.setAttribute('cx', String(toPx(p.x)));
        d.setAttribute('cy', String(-toPx(p.y)));
        d.setAttribute('r', '1.5'); // Smaller dots as requested
        d.setAttribute('fill', color);
        d.setAttribute('opacity', '0.8'); // Fixed opacity, no fading
        g.appendChild(d);
      });

      // Velocity vector line with speed-based scaling
      const minSpeed = 60;
      const maxSpeed = 350;
      const minLeaderLength = 15;
      const maxLeaderLength = 45;
      
      // Scale leader line length based on speed
      const normalizedSpeed = Math.max(0, Math.min(1, (ac.speed - minSpeed) / (maxSpeed - minSpeed)));
      const leaderLength = minLeaderLength + normalizedSpeed * (maxLeaderLength - minLeaderLength);
      
      const rad = ac.heading * Math.PI / 180;
      const x2 = x + Math.sin(rad) * leaderLength;
      const y2 = y - Math.cos(rad) * leaderLength;
      
      const vec = document.createElementNS(svgNS, 'line');
      vec.setAttribute('x1', String(x));
      vec.setAttribute('y1', String(y));
      vec.setAttribute('x2', String(x2));
      vec.setAttribute('y2', String(y2));
      vec.setAttribute('stroke', color);
      vec.setAttribute('stroke-width', '2');
      g.appendChild(vec);

      // Advanced force-directed label placement algorithm
      const formatLevel = (level: number, isVFR: boolean) => {
        if (isVFR) {
          return `A${String(Math.round(level / 100)).padStart(2, '0')}`;
        } else {
          return String(Math.round(level / 100)).padStart(3, '0');
        }
      };

      const lines = [
        ac.isVFR ? 'V' : '', // Only show "V" for VFR aircraft
        `${ac.callsign} ${ac.wtc} ${ac.type.type}`,
        formatLevel(ac.level, ac.isVFR) + 
        (ac.levelChange ? ` ${ac.levelChange.dir}${formatLevel(ac.levelChange.to, ac.isVFR)}` : '') + 
        ` N${ac.speed}`
      ].filter(line => line !== ''); // Remove empty lines
      
      const maxLen = Math.max(...lines.map(l => l.length));
      const boxW = maxLen * 7 + 12;
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
            let score = 40 - Math.abs(distance - 75) * 0.2; // Prefer moderate distance
            
            // History dot avoidance bonus
            const historyFree = !historyDotAreas.some(dotArea => overlap(rect, dotArea));
            if (historyFree) score += 30;

            candidates.push({
              x: labelX, y: labelY, w: boxW, h: boxH,
              score, anchor: 'start', distance
            });
          }
        }
      }

      // Select optimal position
      let chosen: any = null;
      
      if (candidates.length > 0) {
        // Sort by score and pick the best
        candidates.sort((a, b) => b.score - a.score);
        const best = candidates[0];
        chosen = { 
          x: best.x, y: best.y, w: best.w, h: best.h, 
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
          anchor: 'start' 
        };
      }
      placed.push(chosen);

      // Connector line - point to halfway along the label width (DRAW BEFORE AIRCRAFT SQUARE)
      const cx2 = chosen.x + chosen.w / 2; // Point to center of label width
      let cy2 = y;
      cy2 = Math.max(chosen.y, Math.min(cy2, chosen.y + chosen.h));
      const conn = document.createElementNS(svgNS, 'line');
      conn.setAttribute('x1', String(x));
      conn.setAttribute('y1', String(y));
      conn.setAttribute('x2', String(cx2));
      conn.setAttribute('y2', String(cy2));
      conn.setAttribute('stroke', '#888');
      conn.setAttribute('stroke-width', '1');
      g.appendChild(conn);

      // Aircraft square (NOW DRAWN ON TOP OF LEADER LINE)
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(x - 4));
      sq.setAttribute('y', String(y - 4));
      sq.setAttribute('width', '8');
      sq.setAttribute('height', '8');
      sq.setAttribute('fill', color);
      g.appendChild(sq);

      // Label text - no background, just text (DRAW AFTER AIRCRAFT SQUARE)
      const txt = document.createElementNS(svgNS, 'text');
      const tx = chosen.x + 6; // Always left align
      txt.setAttribute('x', String(tx));
      txt.setAttribute('y', String(chosen.y + 12));
      txt.setAttribute('fill', getComputedStyle(document.documentElement)
        .getPropertyValue('--text').trim());
      txt.setAttribute('font-family', 'monospace');
      txt.setAttribute('font-size', '12');
      txt.setAttribute('letter-spacing', '0.5px');
      txt.setAttribute('text-anchor', 'start'); // Always left align
      lines.forEach((l, i) => {
        const tsp = document.createElementNS(svgNS, 'tspan');
        tsp.setAttribute('x', String(tx));
        tsp.setAttribute('dy', i === 0 ? '0' : '14');
        tsp.textContent = l;
        txt.appendChild(tsp);
      });
      g.appendChild(txt);
    }

    // Draw both
    drawAc(target, '--target');
    drawAc(intruder, '--intruder');
  }, [exercise]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full rounded-full"
      style={{
        background: 'var(--radar)'
      }}
    />
  );
}
