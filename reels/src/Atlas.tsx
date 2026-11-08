import React from 'react';
import {geoMercator, geoPath, geoCentroid} from 'd3-geo';
import {feature} from 'topojson-client';
import topo from 'world-atlas/countries-50m.json';

export const W = 1080;
export const H = 1920;
export const MAP_Y = 1000; // screen y of the map focus point

const projection = geoMercator().center([66, 40]).scale(640).translate([0, 0]);
const pathGen = geoPath(projection);

const all: any[] = (feature(topo as any, (topo as any).objects.countries) as any).features;

type C = {name: string; d: string};
const countries: C[] = all
  .map((f) => ({f, c: geoCentroid(f)}))
  .filter(({c}) => c[0] > -15 && c[0] < 150 && c[1] > -15 && c[1] < 82)
  .map(({f}) => ({name: f.properties.name as string, d: pathGen(f) as string}))
  .filter((c) => !!c.d);

const centroids: Record<string, [number, number]> = {};
for (const f of all) centroids[f.properties.name] = geoCentroid(f) as [number, number];

export const MEMBERS = ['Turkey', 'Kazakhstan', 'Uzbekistan', 'Azerbaijan', 'Kyrgyzstan'];
export const MEMBER_COLORS: Record<string, string> = {
  Turkey: '#b8604c',
  Kazakhstan: '#7ea4b6',
  Uzbekistan: '#d6a23e',
  Azerbaijan: '#6fa882',
  Kyrgyzstan: '#a283b8',
};
export const GOLD = '#d4a935';
export const LAND = '#cdbf9f';
export const LAND_STROKE = '#8c8060';
export const BG = '#0d231c';

export type Camera = {lon: number; lat: number; zoom: number};

export const project = (lon: number, lat: number): [number, number] => projection([lon, lat]) as [number, number];

export const toScreen = (lon: number, lat: number, cam: Camera): [number, number] => {
  const [fx, fy] = project(cam.lon, cam.lat);
  const [px, py] = project(lon, lat);
  return [W / 2 + cam.zoom * (px - fx), MAP_Y + cam.zoom * (py - fy)];
};

export const centroidOf = (name: string): [number, number] => centroids[name];

const Land: React.FC<{fills: Record<string, string>}> = React.memo(({fills}) => (
  <>
    {countries.map((c) => (
      <path
        key={c.name}
        d={c.d}
        fill={fills[c.name] ?? LAND}
        stroke={LAND_STROKE}
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    ))}
  </>
));

export const BaseMap: React.FC<{fills: Record<string, string>; camera: Camera; dim?: number}> = ({fills, camera, dim = 0}) => {
  const [fx, fy] = project(camera.lon, camera.lat);
  return (
    <>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <g transform={`translate(${W / 2} ${MAP_Y}) scale(${camera.zoom}) translate(${-fx} ${-fy})`} filter="url(#shadow)">
        <Land fills={fills} />
      </g>
      {dim > 0 && <rect width={W} height={H} fill={BG} opacity={dim} />}
    </svg>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 640, background: 'linear-gradient(rgba(7,20,15,.97) 0%, rgba(7,20,15,.85) 50%, rgba(7,20,15,0) 100%)'}} />
    <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: 240, background: 'linear-gradient(rgba(7,20,15,0), rgba(7,20,15,.92))'}} />
    </>
  );
};
