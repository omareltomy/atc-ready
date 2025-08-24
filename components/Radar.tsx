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
    const overlap = (a: any, b: any) =>
      !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);

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

      // Try quadrants
      const baseQ = Math.floor(((ac.heading + 45) % 360) / 90);
      let chosen: any = null;
      for (let dist = 30; dist < 200 && !chosen; dist += 20) {
        for (let dq = 0; dq < 4; dq++) {
          const q = (baseQ + dq) % 4;
          const offX = (q === 1 || q === 2 ? -1 : 1) * dist;
          const offY = (q === 0 || q === 1 ? 1 : -1) * dist;
          const anc = (q === 1 || q === 2) ? 'end' : 'start';
          let bx = x + offX + (anc === 'end' ? -boxW : 0);
          let by = y + offY - 14;
          bx = Math.min(Math.max(bx, -BOUND + M), BOUND - M - boxW);
          by = Math.min(Math.max(by, -BOUND + M), BOUND - M - boxH);
          const rect = { x: bx, y: by, w: boxW, h: boxH, anchor: anc };
          if (!placed.some(r => overlap(r, rect))) {
            chosen = rect;
            break;
          }
        }
      }
      if (!chosen) chosen = { x: x + 30, y: y - 14, w: boxW, h: boxH, anchor: 'start' };
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

      // Label text
      const txt = document.createElementNS(svgNS, 'text');
      const tx = chosen.x + (chosen.anchor === 'end' ? chosen.w - 6 : 6);
      txt.setAttribute('x', String(tx));
      txt.setAttribute('y', String(chosen.y + 12));
      txt.setAttribute('fill', getComputedStyle(document.documentElement)
        .getPropertyValue('--text').trim());
      txt.setAttribute('font-family', 'monospace');
      txt.setAttribute('font-size', '12');
      txt.setAttribute('letter-spacing', '0.5px');
      txt.setAttribute('text-anchor', chosen.anchor);
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
