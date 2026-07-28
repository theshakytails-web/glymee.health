import { jsPDF } from "jspdf";

interface ReportData {
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  clinicianName: string;
  assessmentDate: string;
  diagnoses: string;
  medications: string;
  history: string;
  dietaryPattern: string;
  hydrationStatus: string;
  physicalActivity: string;
  substanceUse: string;
  sleepStress: string;
  bloodPressure: string;
  heartRate: string;
  bmi: string;
  hba1c: string;
  glucoseFasting: string;
  glucosePostPrandial: string;
  previousInvestigations: string;
  clinicalSummary: string;
  continuousMonitoring: string;
  dietaryOptimization: string;
  physicalActivityPlan: string;
  followUpSchedule: string;
}

function drawHeader(doc: jsPDF) {
  doc.setFillColor(0, 100, 124);
  doc.rect(0, 0, 210, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Glymee Health Clinical Assessment", 20, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(141, 212, 230);
  doc.text("Comprehensive Patient Metabolic & Lifestyle Evaluation Report", 20, 34);
}

function drawFooter(doc: jsPDF, pageNum: number) {
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Glymee Health Clinical Assessment Report Template | Confidential", 105, 282, { align: "center" });
  doc.text("Pune, Maharashtra, India | help@glymee.com", 105, 290, { align: "center" });
  doc.text(`Page ${pageNum}`, 190, 290, { align: "right" });
}

function drawSection(doc: jsPDF, y: number, title: string, color: [number, number, number]): number {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);
  doc.line(20, y, 190, y);
  doc.setTextColor(...color);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y + 6);
  return y + 12;
}

function drawTable(doc: jsPDF, y: number, headers: string[], rows: string[][], startX = 20): number {
  const colW = (170) / headers.length;
  doc.setFontSize(9);
  doc.setFillColor(245, 245, 245);
  headers.forEach((h, i) => {
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "bold");
    doc.text(h, startX + i * colW + 3, y + 4);
    doc.rect(startX + i * colW, y, colW, 8, i === 0 ? "F" : "FD");
  });
  y += 10;
  rows.forEach((row, ri) => {
    if (y > 260) { doc.addPage(); y = 40; }
    row.forEach((cell, ci) => {
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", ci === 1 ? "normal" : "bold");
      const lines = doc.splitTextToSize(cell, colW - 4);
      doc.text(lines, startX + ci * colW + 3, y + 4);
    });
    doc.setDrawColor(230, 230, 230);
    doc.line(startX, y + 8, startX + 170, y + 8);
    y += 12;
  });
  return y + 4;
}

export function generateReportPdf(data: ReportData): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let pageNum = 1;

  drawHeader(doc);
  let y = 55;

  doc.setFontSize(9);
  const meta = [
    ["Patient Name:", data.patientName, "Age / Gender:", `${data.age} / ${data.gender}`],
    ["Assessment Date:", data.assessmentDate, "Primary Clinician:", data.clinicianName],
  ];
  meta.forEach((row) => {
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], 20, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(row[1], 52, y);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text(row[2], 110, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(row[3], 148, y);
    y += 6;
  });

  y += 4;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("Chief Complaint:", 20, y);
  y += 5;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  const complaintLines = doc.splitTextToSize(data.chiefComplaint, 170);
  doc.text(complaintLines, 20, y);
  y += complaintLines.length * 4 + 6;

  y = drawSection(doc, y, "1. Clinical & Medical History", [0, 100, 124]);
  y = drawTable(doc, y,
    ["Condition / Parameter", "Clinical Status & Details"],
    [
      ["Primary Diagnoses", data.diagnoses],
      ["Current Medications", data.medications],
      ["Significant History", data.history],
    ]
  );

  y = drawSection(doc, y, "2. Lifestyle & Behavioral Assessment", [0, 100, 124]);
  y = drawTable(doc, y,
    ["Domain", "Patient Assessment Findings"],
    [
      ["Dietary Pattern", data.dietaryPattern],
      ["Hydration Status", data.hydrationStatus],
      ["Physical Activity", data.physicalActivity],
      ["Substance Use", data.substanceUse],
      ["Sleep & Stress", data.sleepStress],
    ]
  );

  y = drawSection(doc, y, "3. Previous Investigations", [0, 100, 124]);
  if (y > 240) { doc.addPage(); y = 40; drawHeader(doc); }
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "normal");
  const invLines = doc.splitTextToSize(data.previousInvestigations || "None reported", 170);
  doc.text(invLines, 20, y);
  y += invLines.length * 4 + 8;

  y = drawSection(doc, y, "4. Clinical Metrics & Vitals", [0, 100, 124]);
  y = drawTable(doc, y,
    ["Metric", "Recorded Value", "Target Range"],
    [
      ["Blood Pressure", data.bloodPressure, "< 130/80 mmHg"],
      ["Heart Rate", data.heartRate, "60-100 bpm"],
      ["BMI / Weight", data.bmi, "18.5-24.9 kg/m2"],
      ["HbA1c", data.hba1c, "< 7.0%"],
      ["Fasting Glucose", data.glucoseFasting, "< 126 mg/dL"],
      ["Postprandial Glucose", data.glucosePostPrandial, "< 180 mg/dL"],
    ]
  );

  y = drawSection(doc, y, "5. Clinical Summary & Observations", [0, 100, 124]);
  if (y > 240) { doc.addPage(); y = 40; drawHeader(doc); }
  doc.setFillColor(240, 249, 251);
  doc.roundedRect(20, y, 170, 24, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.clinicalSummary, 160);
  doc.text(summaryLines, 26, y + 6);
  y += 30;

  y = drawSection(doc, y, "6. Personalized Management & Action Plan", [0, 100, 124]);
  y = drawTable(doc, y,
    ["Intervention Area", "Prescribed Action Plan"],
    [
      ["Continuous Monitoring", data.continuousMonitoring],
      ["Dietary Optimization", data.dietaryOptimization],
      ["Physical Activity", data.physicalActivityPlan],
      ["Follow-up Schedule", data.followUpSchedule],
    ]
  );

  drawFooter(doc, pageNum);
  if (y > 270) { doc.addPage(); drawHeader(doc); pageNum++; drawFooter(doc, pageNum); }

  return Buffer.from(doc.output("arraybuffer"));
}
