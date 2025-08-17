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

    // Label placement helper
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    // Improved overlap detection with padding
    const overlap = (a: any, b: any) => {
      const padding = 8; // Add padding between labels
      return !(a.x + a.w + padding < b.x || 
               b.x + b.w + padding < a.x || 
               a.y + a.h + padding < b.y || 
               b.y + b.h + padding < a.y);
    };

    function drawAc(ac: typeof target, varName: string) {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(varName).trim();
      const x = toPx(ac.position.x);
      const y = -toPx(ac.position.y);

      // History dots
      ac.history.forEach(p => {
        const d = document.createElementNS(svgNS, 'circle');
        d.setAttribute('cx', String(toPx(p.x)));
        d.setAttribute('cy', String(-toPx(p.y)));
        d.setAttribute('r', '2');
        d.setAttribute('fill', color);
        d.setAttribute('opacity', '0.5');
        g.appendChild(d);
      });

      // Velocity vector line
      const lenPx = ac.speed / 10;
      const rad = ac.heading * Math.PI / 180;
      const x2 = x + Math.sin(rad) * lenPx;
      const y2 = y - Math.cos(rad) * lenPx;
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

      // Label text lines
      const lines = [
        `${ac.callsign} ${ac.wtc} ${ac.type.name}`,
        (ac.isVFR
          ? `A${String(Math.round(ac.level / 100)).padStart(2, '0')}`
          : `FL${String(Math.round(ac.level / 100)).padStart(3, '0')}`
        ) + (ac.levelChange
          ? ` ${ac.levelChange.dir}${ac.isVFR ? 'A' : 'FL'}${Math.round(ac.levelChange.to / 100)}`
          : '') + ` N${ac.speed}`
      ];
      const maxLen = Math.max(...lines.map(l => l.length));
      const boxW = maxLen * 7 + 12;
      const boxH = lines.length * 14 + 6;

      // IMPROVED Label placement algorithm
      const placeLabel = (acX: number, acY: number, boxW: number, boxH: number) => {
        const PADDING = 10;
        const RADIUS = BOUND - M; // Usable radius within margins
        
        // Helper to check if a box is fully within the circular radar
        const isWithinCircle = (x: number, y: number, w: number, h: number) => {
          const corners = [
            [x, y], [x + w, y], [x, y + h], [x + w, y + h]
          ];
          return corners.every(([px, py]) => 
            Math.sqrt(px * px + py * py) <= RADIUS - PADDING
          );
        };
        
        // Preferred positions around the aircraft (in order of preference)
        const positions = [
          { dx: PADDING, dy: -boxH - PADDING, anchor: 'start' },     // Right-top
          { dx: -boxW - PADDING, dy: -boxH - PADDING, anchor: 'end' }, // Left-top
          { dx: PADDING, dy: PADDING, anchor: 'start' },             // Right-bottom
          { dx: -boxW - PADDING, dy: PADDING, anchor: 'end' },       // Left-bottom
          { dx: -boxW/2, dy: -boxH - PADDING, anchor: 'middle' },    // Center-top
          { dx: -boxW/2, dy: PADDING, anchor: 'middle' },            // Center-bottom
          { dx: -boxW - PADDING, dy: -boxH/2, anchor: 'end' },       // Left-center
          { dx: PADDING, dy: -boxH/2, anchor: 'start' }              // Right-center
        ];
        
        // Try each preferred position
        for (const pos of positions) {
          const testX = acX + pos.dx;
          const testY = acY + pos.dy;
          const testRect = { x: testX, y: testY, w: boxW, h: boxH, anchor: pos.anchor };
          
          // Check if within bounds and no overlap
          if (isWithinCircle(testX, testY, boxW, boxH) && 
              !placed.some(r => overlap(r, testRect))) {
            return testRect;
          }
        }
        
        // Spiral search for any valid position
        for (let radius = 30; radius <= 120; radius += 15) {
          for (let angle = 0; angle < 360; angle += 30) {
            const rad = angle * Math.PI / 180;
            const testX = acX + Math.cos(rad) * radius - boxW/2;
            const testY = acY + Math.sin(rad) * radius - boxH/2;
            const testRect = { x: testX, y: testY, w: boxW, h: boxH, anchor: 'middle' };
            
            if (isWithinCircle(testX, testY, boxW, boxH) && 
                !placed.some(r => overlap(r, testRect))) {
              return testRect;
            }
          }
        }
        
        // Final fallback - place near aircraft center but ensure it's in bounds
        let fallbackX = acX - boxW/2;
        let fallbackY = acY - boxH - PADDING;
        
        // Clamp to radar bounds
        const maxX = RADIUS - boxW - PADDING;
        const maxY = RADIUS - boxH - PADDING;
        fallbackX = Math.max(-maxX, Math.min(fallbackX, maxX));
        fallbackY = Math.max(-maxY, Math.min(fallbackY, maxY));
        
        return { x: fallbackX, y: fallbackY, w: boxW, h: boxH, anchor: 'middle' };
      };

      const chosen = placeLabel(x, y, boxW, boxH);
      placed.push(chosen);

      // Improved connector line
      const labelCenterX = chosen.x + chosen.w / 2;
      const labelCenterY = chosen.y + chosen.h / 2;
      
      // Find the closest point on the label edge to the aircraft
      let connectorX = labelCenterX;
      let connectorY = labelCenterY;
      
      // Calculate which edge of the label is closest to the aircraft
      const dx = x - labelCenterX;
      const dy = y - labelCenterY;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Connect to left or right edge
        connectorX = dx > 0 ? chosen.x + chosen.w : chosen.x;
        connectorY = Math.max(chosen.y, Math.min(y, chosen.y + chosen.h));
      } else {
        // Connect to top or bottom edge
        connectorX = Math.max(chosen.x, Math.min(x, chosen.x + chosen.w));
        connectorY = dy > 0 ? chosen.y + chosen.h : chosen.y;
      }
      
      const conn = document.createElementNS(svgNS, 'line');
      conn.setAttribute('x1', String(x));
      conn.setAttribute('y1', String(y));
      conn.setAttribute('x2', String(connectorX));
      conn.setAttribute('y2', String(connectorY));
      conn.setAttribute('stroke', '#888');
      conn.setAttribute('stroke-width', '1');
      conn.setAttribute('opacity', '0.7');
      g.appendChild(conn);

      // Create text first to measure it properly
      const txt = document.createElementNS(svgNS, 'text');
      const textX = chosen.x + chosen.w / 2;
      const textY = chosen.y + 16;
      txt.setAttribute('x', String(textX));
      txt.setAttribute('y', String(textY));
      txt.setAttribute('fill', getComputedStyle(document.documentElement)
        .getPropertyValue('--text').trim());
      txt.setAttribute('font-family', 'monospace');
      txt.setAttribute('font-size', '12');
      txt.setAttribute('letter-spacing', '0.5px');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'hanging');
      
      lines.forEach((l, i) => {
        const tsp = document.createElementNS(svgNS, 'tspan');
        tsp.setAttribute('x', String(textX));
        tsp.setAttribute('dy', i === 0 ? '0' : '14');
        tsp.textContent = l;
        txt.appendChild(tsp);
      });
      
      // Add text to DOM temporarily to measure it
      g.appendChild(txt);
      const bbox = txt.getBBox();
      
      // Create background rectangle that exactly fits the text
      const bg2 = document.createElementNS(svgNS, 'rect');
      const padding = 4;
      bg2.setAttribute('x', String(bbox.x - padding));
      bg2.setAttribute('y', String(bbox.y - padding));
      bg2.setAttribute('width', String(bbox.width + padding * 2));
      bg2.setAttribute('height', String(bbox.height + padding * 2));
      bg2.setAttribute('fill', getComputedStyle(document.documentElement)
        .getPropertyValue('--label-bg').trim());
      bg2.setAttribute('rx', '3'); // Rounded corners
      
      // Insert background before text so it appears behind
      g.insertBefore(bg2, txt);
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
