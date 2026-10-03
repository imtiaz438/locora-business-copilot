import { jsPDF } from 'jspdf';
import type { Audit40EvaluationResult } from './audit40PointsGenerator.ts';

export interface GeneratePdfOptions {
  evaluation: Audit40EvaluationResult;
  agencyName: string;
  clientBusinessName: string;
  agencyContactEmail: string;
  agencyPhone: string;
  agencyWebsite: string;
  agencyBrandColor: string;
  customExecutiveNote?: string;
  proposalRetainerQuote?: string;
}

export function generateAuditPdf(options: GeneratePdfOptions): void {
  const {
    evaluation,
    agencyName,
    clientBusinessName,
    agencyContactEmail,
    agencyPhone,
    agencyWebsite,
    agencyBrandColor,
    customExecutiveNote,
    proposalRetainerQuote = '$1,500 - $3,500/mo',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const brandRgb = hexToRgb(agencyBrandColor || '#059669');

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Executive 40-Point Technical & SEO Evaluation · https://${evaluation.cleanDomain}`,
      margin,
      24
    );
    doc.text(`Agency: ${agencyName}`, pageWidth - margin, 24, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 28, pageWidth - margin, 28);
  };

  // -------------------------------------------------------------
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // -------------------------------------------------------------
  // Top Banner
  doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.rect(margin, y, contentWidth, 54, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('EXECUTIVE 40-POINT WEBSITE & SEO DIAGNOSTIC AUDIT', margin + 14, y + 24);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Comprehensive Technical Crawl, Security, Speed & Conversion Evaluation`, margin + 14, y + 42);

  y += 66;

  // Client Details & Agency Info Row
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(clientBusinessName || evaluation.cleanDomain, margin, y + 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Target Domain: https://${evaluation.cleanDomain}  ·  Date: ${evaluation.analyzedAt}`, margin, y + 30);

  // Agency branding on right
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
  doc.text(agencyName, pageWidth - margin, y + 14, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${agencyWebsite}  ·  ${agencyPhone}`, pageWidth - margin, y + 28, { align: 'right' });
  doc.text(agencyContactEmail, pageWidth - margin, y + 40, { align: 'right' });

  y += 52;

  // Key KPI Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 68, 6, 6, 'FD');

  const colW = contentWidth / 4;

  // Metric 1: Overall Health Score
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('OVERALL HEALTH', margin + 14, y + 18);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const score = evaluation.overallScore ?? 75;
  const scoreColor = score >= 80 ? [5, 150, 105] : score >= 60 ? [217, 119, 6] : [225, 29, 72];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${score}/100`, margin + 14, y + 42);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  doc.text(`Grade: ${grade}`, margin + 14, y + 56);

  // Metric 2: Critical Deficits
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CRITICAL DEFICITS', margin + colW + 10, y + 18);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`${evaluation.failedCount} Points`, margin + colW + 10, y + 42);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Requiring immediate fix', margin + colW + 10, y + 56);

  // Metric 3: Passed Checks
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CHECKS PASSED', margin + colW * 2 + 10, y + 18);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`${evaluation.passedCount} Points`, margin + colW * 2 + 10, y + 42);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('of 40 evaluated', margin + colW * 2 + 10, y + 56);

  // Metric 4: Warnings
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('WARNINGS', margin + colW * 3 + 10, y + 18);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text(`${evaluation.warningCount} Points`, margin + colW * 3 + 10, y + 42);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('need attention', margin + colW * 3 + 10, y + 56);

  y += 82;

  // Executive Cover Note
  if (customExecutiveNote) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE AUDIT SUMMARY:', margin + 10, y + 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitNote = doc.splitTextToSize(customExecutiveNote, contentWidth - 20);
    doc.text(splitNote, margin + 10, y + 26);
    y += 50;
  }

  // 5 Pillar Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('FIVE CORE PILLARS OF PERFORMANCE', margin, y + 12);
  y += 20;

  const pillarW = contentWidth / 5;
  evaluation.pillars.forEach((p, idx) => {
    const px = margin + idx * pillarW;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(px, y, pillarW - 4, 44, 4, 4, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(p.label.toUpperCase(), px + 6, y + 14);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const pColor = p.score >= 80 ? [5, 150, 105] : p.score >= 60 ? [217, 119, 6] : [225, 29, 72];
    doc.setTextColor(pColor[0], pColor[1], pColor[2]);
    doc.text(`${p.score}%`, px + 6, y + 32);

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`${p.passedCount}/${p.totalCount} passed`, px + 6, y + 40);
  });

  y += 58;

  // -------------------------------------------------------------
  // DETAILED 40-POINT CHECKLIST
  // -------------------------------------------------------------
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DETAILED 40-POINT DIAGNOSTIC EVALUATION', margin, y + 12);
  y += 20;

  // Iterate over all 40 points
  evaluation.points.forEach((item, index) => {
    checkPageBreak(48);

    const isFail = item.status === 'fail';
    const isWarn = item.status === 'warning';

    // Card background
    if (isFail) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 205, 205);
    } else if (isWarn) {
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(254, 243, 199);
    } else {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
    }
    doc.roundedRect(margin, y, contentWidth, 42, 3, 3, 'FD');

    // Number & Title
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`#${index + 1}  ${item.name}`, margin + 8, y + 12);

    // Status Badge
    const statusText = isFail ? '[CRITICAL DEFICIT]' : isWarn ? '[NEEDS ATTENTION]' : '[PASSED OPTIMAL]';
    const statusColor = isFail ? [225, 29, 72] : isWarn ? [217, 119, 6] : [5, 150, 105];
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, pageWidth - margin - 8, y + 12, { align: 'right' });

    // Finding & Benchmark Line
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const detailText = `Diagnostic: ${item.diagnostic}  ·  Target: ${item.targetMetric}`;
    doc.text(detailText, margin + 8, y + 23);

    // Fix suggestion
    doc.setFontSize(7);
    doc.setFont('helvetica', isFail || isWarn ? 'bold' : 'normal');
    doc.setTextColor(isFail ? 185 : isWarn ? 146 : 71, isFail ? 28 : isWarn ? 64 : 85, isFail ? 28 : isWarn ? 14 : 105);
    const fixLine = doc.splitTextToSize(`Action: ${item.remediation}`, contentWidth - 16);
    doc.text(fixLine[0], margin + 8, y + 34);

    y += 46;
  });

  // Footer on last page
  checkPageBreak(36);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 10, pageWidth - margin, y + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Prepared by ${agencyName}  ·  ${agencyContactEmail}  ·  Confidential Client Audit`,
    margin,
    y + 24
  );

  doc.text('Page ' + doc.internal.pages.length, pageWidth - margin, y + 24, { align: 'right' });

  // Save the PDF file directly to client browser
  doc.save(`Website_Audit_40_Point_Report_${evaluation.cleanDomain}.pdf`);
}
