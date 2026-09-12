import jsPDF from 'jspdf';
import { ReportSnapshot } from '../../types/reports';

export function exportReportToPdf(snapshot: ReportSnapshot): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Primary Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(24, 30, 42); // slate-900
  doc.text(snapshot.reportTitle, 20, y);
  y += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  const locationStr = [snapshot.businessCity, snapshot.businessState].filter(Boolean).join(', ');
  doc.text(
    `Entity: ${snapshot.businessName}${locationStr ? ` (${locationStr})` : ''} | Period: ${snapshot.period}`,
    20,
    y
  );
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Snapshot Generated: ${new Date(snapshot.reportGeneratedAt).toLocaleString()} | Locora Real Data Reporting Engine`,
    20,
    y
  );
  y += 4;

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  // Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('1. EXECUTIVE SUMMARY & EXPLANATION', 20, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const overviewLines = doc.splitTextToSize(snapshot.executiveSummary.overview || '', pageWidth - 40);
  doc.text(overviewLines, 20, y);
  y += overviewLines.length * 4.5 + 4;

  doc.setFont('helvetica', 'bold');
  doc.text('What Changed:', 20, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  const whatChangedLines = doc.splitTextToSize(snapshot.executiveSummary.whatChanged || '', pageWidth - 40);
  doc.text(whatChangedLines, 20, y);
  y += whatChangedLines.length * 4.5 + 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Why It Matters:', 20, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  const whyItMattersLines = doc.splitTextToSize(snapshot.executiveSummary.whyItMatters || '', pageWidth - 40);
  doc.text(whyItMattersLines, 20, y);
  y += whyItMattersLines.length * 4.5 + 4;

  doc.setFont('helvetica', 'bold');
  doc.text('What Should Happen Next:', 20, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  const nextLines = doc.splitTextToSize(snapshot.executiveSummary.whatShouldHappenNext || '', pageWidth - 40);
  doc.text(nextLines, 20, y);
  y += nextLines.length * 4.5 + 6;

  // Verified Metrics
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('2. VERIFIED OPERATIONAL METRICS (DATA PROVENANCE)', 20, y);
  y += 6;

  snapshot.keyMetrics.forEach((metric) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);

    const valStr = metric.status === 'synced' && metric.value !== null
      ? `${metric.value} ${metric.unit || ''}`
      : metric.notConnectedMessage || 'Not connected';

    doc.text(`• ${metric.label}: ${valStr}`, 22, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    y += 4;
    doc.text(`   Source: ${metric.source} | Period: ${metric.period} | Status: ${metric.status.toUpperCase()}`, 22, y);
    y += 5;
  });

  y += 4;

  // Problems & Recommended Actions
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  if (snapshot.problemsDetected.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(185, 28, 28); // red-700
    doc.text('3. PROBLEMS DETECTED', 20, y);
    y += 6;

    snapshot.problemsDetected.forEach((prob) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`[${prob.severity.toUpperCase()}] ${prob.title}`, 22, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const probDesc = doc.splitTextToSize(`${prob.description} (Source: ${prob.source})`, pageWidth - 44);
      doc.text(probDesc, 22, y);
      y += probDesc.length * 4 + 3;
    });

    y += 4;
  }

  if (snapshot.recommendedActions.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('4. PRIORITIZED RECOMMENDED ACTIONS', 20, y);
    y += 6;

    snapshot.recommendedActions.forEach((act, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${act.action}`, 22, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Rationale: ${act.rationale} | Target: ${act.targetArea} | Source: ${act.source}`, 24, y);
      y += 5.5;
    });
  }

  // Save PDF
  const filename = `${snapshot.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${snapshot.reportType}_${new Date(snapshot.reportGeneratedAt).toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
