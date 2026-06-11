/**
 * Generates public/Matteo-Catalano-Resume.pdf straight from src/data/content.ts,
 * so the downloadable résumé can never drift from the site. Runs automatically
 * via the `prebuild` npm hook (locally and in the Pages deploy workflow).
 *
 *   npm run pdf
 */

import PDFDocument from 'pdfkit';
import { createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { profile, experience, capabilities, education, certifications } from '../src/data/content';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/Matteo-Catalano-Resume.pdf');

const M = 54; // page margin
const ACCENT = '#ff4d00';
const ACCENT_DEEP = '#c81e00';
const INK = '#141414';
const BODY = '#333333';
const DIM = '#4a4a4a';
const FAINT = '#7a7a7a';

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: M, bottom: M, left: M, right: M },
  info: {
    Title: `${profile.name} — Résumé`,
    Author: profile.name,
    Subject: profile.role,
  },
});
const W = doc.page.width - M * 2;
const stream = createWriteStream(OUT);
doc.pipe(stream);

/** Start a new page if fewer than `space` points remain on this one. */
const ensure = (space: number) => {
  if (doc.y + space > doc.page.height - M) doc.addPage();
};

const section = (title: string) => {
  ensure(70);
  doc.moveDown(1.1);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(ACCENT_DEEP)
    .text(title.toUpperCase(), M, doc.y, { characterSpacing: 2.2 });
  const y = doc.y + 3;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.6).strokeColor('#dddddd').stroke();
  doc.y = y + 8;
  doc.x = M;
};

/* ---- header ---- */
doc.font('Helvetica-Bold').fontSize(23).fillColor(INK).text(profile.name, M, M - 6);
doc.moveDown(0.15);
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(ACCENT_DEEP)
  .text(profile.role.toUpperCase(), { characterSpacing: 1.6 });
doc.moveDown(0.35);
doc.font('Helvetica').fontSize(9).fillColor(DIM)
  .text(`${profile.email}  ·  ${profile.phone}  ·  ${profile.location}  ·  `, { continued: true })
  .fillColor(ACCENT_DEEP)
  .text('linkedin.com/in/matteo-catalano', { link: profile.linkedin });

const ruleY = doc.y + 8;
doc.moveTo(M, ruleY).lineTo(M + W, ruleY).lineWidth(1.4).strokeColor(ACCENT).stroke();
doc.y = ruleY + 12;
doc.x = M;

doc.font('Helvetica').fontSize(9.5).fillColor(BODY).text(profile.summary, { lineGap: 1.6 });

/* ---- skills ---- */
section('Skills');
for (const group of capabilities) {
  ensure(26);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(`${group.title}:  `, { continued: true });
  doc.font('Helvetica').fillColor(DIM).text(group.items.join(', '), { lineGap: 1 });
  doc.moveDown(0.22);
}

/* ---- experience ---- */
section('Experience');
for (const job of experience) {
  ensure(78);
  const y0 = doc.y;
  doc.font('Helvetica').fontSize(8.5).fillColor(FAINT)
    .text(job.period.replace('—', '–'), M, y0 + 1.5, { width: W, align: 'right' });
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK)
    .text(`${job.role}  |  ${job.company}`, M, y0, { width: W - 130 });
  doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(FAINT).text(job.location, M, doc.y + 1);
  doc.moveDown(0.3);

  for (const b of job.bullets) {
    ensure(26);
    const by = doc.y;
    doc.font('Helvetica').fontSize(9.3).fillColor(BODY);
    doc.text('•', M + 2, by);
    doc.text(b, M + 14, by, { width: W - 14, lineGap: 1.2 });
    doc.moveDown(0.18);
  }
  doc.moveDown(0.55);
  doc.x = M;
}

/* ---- education ---- */
section('Education');
for (const e of education) {
  ensure(30);
  const y0 = doc.y;
  doc.font('Helvetica').fontSize(8.5).fillColor(FAINT).text(e.year, M, y0 + 1, { width: W, align: 'right' });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(e.school, M, y0, { width: W - 110 });
  doc.font('Helvetica').fontSize(9.3).fillColor(DIM).text(e.detail, M, doc.y + 1);
  doc.moveDown(0.5);
}

/* ---- certifications ---- */
section('Certifications');
doc.font('Helvetica').fontSize(9.3).fillColor(BODY).text(certifications.join('   ·   '), M, doc.y);

doc.end();
await new Promise<void>((res, rej) => {
  stream.on('finish', () => res());
  stream.on('error', rej);
});
console.log(`Résumé PDF written to ${OUT}`);
