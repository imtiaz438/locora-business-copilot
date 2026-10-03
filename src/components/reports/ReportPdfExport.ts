import jsPDF from 'jspdf';
import { ReportSnapshot } from '../../types/reports';

export interface ReportBranding {
  /** Agency/company name to show instead of Locora. */
  brandName?: string;
  /** Logo image URL (png/jpg). Loaded async; falls back to text name. */
  logoUrl?: string;
  /** White-label mode: hide all Locora mentions. Intended for Agency tier. */
  whiteLabel?: boolean;
  /** Brand accent as [r, g, b]. Defaults to Locora emerald. */
  accentColor?: [number, number, number];
}

const LOCORA_EMERALD: [number, number, number] = [5, 150, 105];
const INK: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [226, 232, 240];

async function loadLogoDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Premium white-label business health report.
 *
 * - All content comes from the snapshot (real, source-attributed data).
 * - Metrics with status !== 'synced' render as "Not connected" — never invented.
 * - whiteLabel=true removes every Locora mention and uses the agency brand.
 */
export async function exportReportToPdf(snapshot: ReportSnapshot, branding: ReportBranding = {}): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const accent = branding.accentColor || LOCORA_EMERALD;
  const brandName = branding.whiteLabel ? (branding.brandName || 'Your Agency') : 'Locora AI';
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const logoDataUrl = branding.logoUrl ? await loadLogoDataUrl(branding.logoUrl) : null;

  const newPage = (withHeader = true) => {
    doc.addPage();
    y = 18;
    if (withHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(brandName.toUpperCase(), margin, y);
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.setLineWidth(0.8);
      doc.line(margin, y + 3, margin + 40, y + 3);
      y += 12;
    }
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 28) newPage();
  };

  const sectionTitle = (num: string, title: string, color: [number, number, number] = INK) => {
    ensureSpace(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${num}  ${title}`, margin, y);
    y += 4;
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const bodyText = (text: string, size = 9.5, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [51, 65, 85]) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text || '', contentWidth - 4);
    ensureSpace(lines.length * (size * 0.5) + 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * (size * 0.5) + 4;
  };

  // ============ COVER PAGE ============
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 0, pageWidth, 10, 'F');
  y = 30;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, y, 36, 18);
      y += 24;
    } catch {
      /* fall through to text brand */
    }
  }
  if (!logoDataUrl) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(brandName, margin, y);
    y += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  const titleLines = doc.splitTextToSize(snapshot.reportTitle, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 11 + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const locationStr = [snapshot.businessCity, snapshot.businessState].filter(Boolean).join(', ');
  doc.text(`${snapshot.businessName}${locationStr ? `  •  ${locationStr}` : ''}`, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Reporting period: ${snapshot.period}`, margin, y);
  y += 6;
  doc.text(`Generated: ${new Date(snapshot.reportGeneratedAt).toLocaleDateString()}`, margin, y);
  y += 16;

  // Cover stat strip (real counts only — no invented scores)
  const syncedCount = snapshot.keyMetrics.filter((m) => m.status === 'synced').length;
  const stats: Array<[string, string]> = [
    [`${syncedCount}/${snapshot.keyMetrics.length}`, 'Verified metrics'],
    [`${snapshot.problemsDetected.length}`, 'Problems found'],
    [`${snapshot.recommendedActions.length}`, 'Recommended actions'],
  ];
  const colW = contentWidth / stats.length;
  stats.forEach(([val, label], i) => {
    const x = margin + i * colW;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, colW - 6, 26, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(val, x + 6, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(label, x + 6, y + 19);
  });
  y += 40;

  const coverNote = branding.whiteLabel
    ? `Prepared by ${brandName} for ${snapshot.businessName}. All figures below come from connected data sources; unconnected sources are marked "Not connected". Confidential.`
    : `Prepared with ${brandName} for ${snapshot.businessName}. All figures below come from connected data sources; unconnected sources are marked "Not connected". Confidential.`;
  bodyText(coverNote, 8.5, 'normal', MUTED);

  // ============ 1. EXECUTIVE SUMMARY ============
  newPage();
  sectionTitle('1', 'EXECUTIVE SUMMARY');
  bodyText('Overview', 10, 'bold', INK);
  bodyText(snapshot.executiveSummary.overview || '—');
  bodyText('What changed', 10, 'bold', INK);
  bodyText(snapshot.executiveSummary.whatChanged || '—');
  bodyText('Why it matters', 10, 'bold', INK);
  bodyText(snapshot.executiveSummary.whyItMatters || '—');
  bodyText('What should happen next', 10, 'bold', INK);
  bodyText(snapshot.executiveSummary.whatShouldHappenNext || '—');

  // ============ 2. VERIFIED METRICS ============
  newPage();
  sectionTitle('2', 'VERIFIED METRICS');
  bodyText('Every metric carries its source. Anything not connected is labeled as such — never estimated.', 8.5, 'normal', MUTED);
  snapshot.keyMetrics.forEach((metric) => {
    ensureSpace(20);
    const synced = metric.status === 'synced' && metric.value !== null;
    const pill: [number, number, number] = synced ? [5, 150, 105] : [148, 163, 184];
    doc.setFillColor(pill[0], pill[1], pill[2]);
    doc.circle(margin + 3, y - 1.5, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(metric.label, margin + 8, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    if (synced) doc.setTextColor(INK[0], INK[1], INK[2]);
    else doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(synced ? `${metric.value} ${metric.unit || ''}`.trim() : metric.notConnectedMessage || 'Not connected', margin + 8, y);
    y += 5;
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`Source: ${metric.source}  •  Period: ${metric.period}  •  Status: ${metric.status.toUpperCase()}`, margin + 8, y);
    y += 8;
  });

  // ============ 3. PROBLEMS ============
  if (snapshot.problemsDetected.length > 0) {
    newPage();
    sectionTitle('3', 'PROBLEMS DETECTED', [185, 28, 28]);
    const sevColor: Record<string, [number, number, number]> = {
      critical: [185, 28, 28],
      high: [194, 65, 12],
      warning: [180, 120, 10],
      info: [51, 65, 85],
    };
    snapshot.problemsDetected.forEach((prob) => {
      ensureSpace(22);
      const c = sevColor[(prob.severity || '').toLowerCase()] || [51, 65, 85];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.roundedRect(margin + 2, y - 4, 34, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text((prob.severity || 'INFO').toUpperCase(), margin + 5, y + 1);
      doc.setFontSize(10);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      const tLines = doc.splitTextToSize(prob.title, contentWidth - 44);
      doc.text(tLines, margin + 40, y);
      y += tLines.length * 5 + 2;
      bodyText(`${prob.description}  (Source: ${prob.source})`, 8.5);
      y += 2;
    });
  }

  // ============ 4. RECOMMENDED ACTIONS ============
  if (snapshot.recommendedActions.length > 0) {
    newPage();
    sectionTitle('4', 'PRIORITIZED RECOMMENDED ACTIONS');
    snapshot.recommendedActions.forEach((act, idx) => {
      ensureSpace(24);
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.circle(margin + 5, y - 1.5, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(String(idx + 1), margin + 5, y + 1.2, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      const aLines = doc.splitTextToSize(act.action, contentWidth - 18);
      doc.text(aLines, margin + 12, y);
      y += aLines.length * 5 + 2;
      bodyText(`Rationale: ${act.rationale}`, 8.5);
      doc.setFontSize(7.5);
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text(`Target: ${act.targetArea}  •  Source: ${act.source}`, margin + 4, y);
      y += 8;
    });
  }

  // ============ FOOTERS ============
  const totalPages = doc.getNumberOfPages();
  const footerText = branding.whiteLabel
    ? `Prepared by ${brandName}  •  Confidential`
    : `Generated by ${brandName} Real Data Reporting  •  Confidential`;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i === 1) continue; // cover stays clean
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(footerText, margin, pageHeight - 12);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
  }

  const filename = `${snapshot.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${snapshot.reportType}_${new Date(snapshot.reportGeneratedAt).toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
