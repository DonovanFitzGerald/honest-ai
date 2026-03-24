import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

function hexToRgb(hex: string) {
    const h = hex.replace('#', '').trim();
    const full =
        h.length === 3
            ? h
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp01(t: number) {
    return Math.max(0, Math.min(1, t));
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function lerpHex(start: string, end: string, t: number) {
    t = clamp01(t);
    const s = hexToRgb(start);
    const e = hexToRgb(end);

    const r = Math.round(lerp(s.r, e.r, t));
    const g = Math.round(lerp(s.g, e.g, t));
    const b = Math.round(lerp(s.b, e.b, t));

    return rgbToHex(r, g, b);
}

export function createHexGradientArray(
    start: string,
    end: string,
    len: number,
) {
    const colors = [];

    for (let i = 0; i < len; i++) {
        colors[i] = lerpHex(start, end, i / len);
    }

    return colors;
}
