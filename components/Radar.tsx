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
    
    // FIRST: Register all aircraft positions and leader lines as occupied areas
    [target, intruder].forEach(ac => {
      const x = toPx(ac.position.x);
      const y = -toPx(ac.position.y);
      
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
    const rectIntersectsLine = (rect: any, line: { x1: number; y1: number; x2: number; y2: number }, buffer = 25) => {
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

      // History dots with speed-based spacing and fade
      ac.history.forEach((p, index) => {
        const d = document.createElementNS(svgNS, 'circle');
        d.setAttribute('cx', String(toPx(p.x)));
        d.setAttribute('cy', String(-toPx(p.y)));
        d.setAttribute('r', '2');
        d.setAttribute('fill', color);
        // Fade older dots more
        const opacity = 0.6 - (index * 0.1);
        d.setAttribute('opacity', String(Math.max(0.2, opacity)));
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

      // Aircraft square
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(x - 4));
      sq.setAttribute('y', String(y - 4));
      sq.setAttribute('width', '8');
      sq.setAttribute('height', '8');
      sq.setAttribute('fill', color);
      g.appendChild(sq);

      // Label text lines - Format: V / Callsign WTC Type / Level LevelChange Speed
      const formatLevel = (level: number, isVFR: boolean) => {
        if (isVFR) {
          return `A${String(Math.round(level / 100)).padStart(2, '0')}`;
        } else {
          return String(Math.round(level / 100)).padStart(3, '0');
        }
      };

      const lines = [
        'V',
        `${ac.callsign} ${ac.wtc} ${ac.type.type}`,
        formatLevel(ac.level, ac.isVFR) + 
        (ac.levelChange ? ` ${ac.levelChange.dir}${formatLevel(ac.levelChange.to, ac.isVFR)}` : '') + 
        ` N${ac.speed}`
      ];
      
      const maxLen = Math.max(...lines.map(l => l.length));
      const boxW = maxLen * 7 + 12;
      const boxH = lines.length * 14 + 6;

      // Try quadrants - avoid leader line by preferring opposite direction
      const leaderAngle = ac.heading * Math.PI / 180;
      const leaderQuadrant = Math.floor(((ac.heading + 45) % 360) / 90);
      const baseQ = (leaderQuadrant + 2) % 4; // Start with opposite quadrant
      let chosen: any = null;
      const maxRadius = BOUND - M; // Maximum distance from center
      
      for (let dist = 30; dist < 150 && !chosen; dist += 20) {
        for (let dq = 0; dq < 4; dq++) {
          const q = (baseQ + dq) % 4;
          const offX = (q === 1 || q === 2 ? -1 : 1) * dist;
          const offY = (q === 0 || q === 1 ? 1 : -1) * dist;
          const anc = (q === 1 || q === 2) ? 'end' : 'start';
          let bx = x + offX + (anc === 'end' ? -boxW : 0);
          let by = y + offY - 14;
          
          // Check if label fits within circular boundary
          const corners = [
            { x: bx, y: by },
            { x: bx + boxW, y: by },
            { x: bx, y: by + boxH },
            { x: bx + boxW, y: by + boxH }
          ];
          
          const allCornersInside = corners.every(corner => {
            const distFromCenter = Math.sqrt(corner.x * corner.x + corner.y * corner.y);
            return distFromCenter <= maxRadius;
          });
          
          // Check if label overlaps with leader line
          const labelCenterX = bx + boxW / 2;
          const labelCenterY = by + boxH / 2;
          const distToLeaderLine = Math.abs(
            Math.sin(leaderAngle) * (labelCenterY - y) - Math.cos(leaderAngle) * (labelCenterX - x)
          );
          const leaderLineClear = distToLeaderLine > 20; // Minimum distance from leader line
          
          // Check if label intersects with any aircraft areas or leader lines
          const rect = { x: bx, y: by, w: boxW, h: boxH };
          const clearOfAircraft = aircraftAreas.every(area => {
            // Check overlap with aircraft area
            if (overlap(rect, area)) return false;
            // Check intersection with leader line
            if (rectIntersectsLine(rect, area.leaderLine)) return false;
            return true;
          });
          
          if (allCornersInside && leaderLineClear && clearOfAircraft) {
            const labelRect = { x: bx, y: by, w: boxW, h: boxH, anchor: anc };
            if (!placed.some(r => overlap(r, labelRect))) {
              chosen = labelRect;
              break;
            }
          }
        }
      }
      
      if (!chosen) {
        // Advanced fallback: try multiple angles around the aircraft
        const fallbackAttempts = 16; // Try 16 different angles (22.5 degree increments)
        for (let attempt = 0; attempt < fallbackAttempts && !chosen; attempt++) {
          const fallbackAngle = (ac.heading + 90 + (attempt * 22.5)) % 360; // Start perpendicular to leader
          
          for (let dist = 40; dist <= 100; dist += 20) {
            const fallbackX = x + Math.sin(fallbackAngle * Math.PI / 180) * dist;
            const fallbackY = y - Math.cos(fallbackAngle * Math.PI / 180) * dist;
            
            // Check if fallback position fits within circular boundary
            const fallbackRect = {
              x: fallbackX,
              y: fallbackY,
              w: boxW,
              h: boxH
            };
            
            const fallbackCorners = [
              { x: fallbackX, y: fallbackY },
              { x: fallbackX + boxW, y: fallbackY },
              { x: fallbackX, y: fallbackY + boxH },
              { x: fallbackX + boxW, y: fallbackY + boxH }
            ];
            
            const maxFallbackRadius = maxRadius - 10;
            const withinBounds = fallbackCorners.every(corner => {
              const distFromCenter = Math.sqrt(corner.x * corner.x + corner.y * corner.y);
              return distFromCenter <= maxFallbackRadius;
            });
            
            // Check if clear of aircraft areas and other labels
            const clearOfAircraft = aircraftAreas.every(area => {
              if (overlap(fallbackRect, area)) return false;
              if (rectIntersectsLine(fallbackRect, area.leaderLine)) return false;
              return true;
            });
            
            const clearOfLabels = !placed.some(r => overlap(r, fallbackRect));
            
            if (withinBounds && clearOfAircraft && clearOfLabels) {
              chosen = { x: fallbackX, y: fallbackY, w: boxW, h: boxH, anchor: 'start' };
              break;
            }
          }
        }
        
        // Ultimate fallback: place very close to aircraft if nothing else works
        if (!chosen) {
          const ultimateAngle = (ac.heading + 180) % 360; // Opposite to heading
          const ultimateDist = 25;
          const ultimateX = x + Math.sin(ultimateAngle * Math.PI / 180) * ultimateDist;
          const ultimateY = y - Math.cos(ultimateAngle * Math.PI / 180) * ultimateDist;
          chosen = { x: ultimateX, y: ultimateY, w: boxW, h: boxH, anchor: 'start' };
        }
      }
      placed.push(chosen);

      // Connector line
      const cx2 = chosen.anchor === 'end' ? chosen.x + chosen.w : chosen.x;
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

      // Label background
      const bg2 = document.createElementNS(svgNS, 'rect');
      bg2.setAttribute('x', String(chosen.x));
      bg2.setAttribute('y', String(chosen.y));
      bg2.setAttribute('width', String(chosen.w));
      bg2.setAttribute('height', String(chosen.h));
      bg2.setAttribute('fill', getComputedStyle(document.documentElement)
        .getPropertyValue('--label-bg').trim());
      g.appendChild(bg2);

      // Label text - always left aligned
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
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'var(--radar)'
      }}
    />
  );
}
