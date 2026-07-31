const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../../");

function createPDF(filename, title, subtitle, sections) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(rootDir, filename);
    const doc = new PDFDocument({ margin: 50, pdfVersion: '1.4', compress: false });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header
    doc.fillColor("#dc2626").fontSize(20).text(title, { align: "left" });
    doc.moveDown(0.3);
    doc.fillColor("#475569").fontSize(12).text(subtitle, { align: "left" });
    doc.moveDown(0.5);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Sections
    sections.forEach((sec) => {
      doc.fillColor("#0f172a").fontSize(14).text(sec.heading, { underline: false });
      doc.moveDown(0.3);
      doc.fillColor("#334155").fontSize(10).text(sec.body, { align: "justify", lineGap: 3 });
      doc.moveDown(0.8);
    });

    // Footer
    doc.fontSize(8).fillColor("#94a3b8").text("Tritorc Relevance Checker Test Sample Document", 50, 720, { align: "center" });

    doc.end();

    writeStream.on("finish", () => {
      console.log(`✓ Created: ${filename}`);
      resolve();
    });
    writeStream.on("error", reject);
  });
}

async function generateAll() {
  // 1. Clearly Relevant Document (11 Matches -> Relevance: YES)
  await createPDF(
    "sample_tender_relevant.pdf",
    "Scope of Work — Refinery Shutdown Maintenance & Bolting",
    "Tender Ref: SOW-2026-PETRO-891 | Category: Plant Maintenance Services",
    [
      {
        heading: "1. Executive Summary & Objective",
        body: "The contractor shall execute complete shutdown maintenance services across Unit 4 and Unit 5 of the Petrochemical Refinery. The scope strictly demands specialized controlled bolting, flange management, and flange joint integrity testing to ensure leak-free operations post startup."
      },
      {
        heading: "2. Equipment & Tool Requirements",
        body: "Contractors must provide heavy-duty hydraulic torque wrench systems capable of up to 25,000 Nm torque, along with high-pressure bolt tensioner units for critical reactor vessel head flanges. All hydraulic bolt tensioning equipment must be calibrated with traceable test certificates prior to turnaround services."
      },
      {
        heading: "3. Technical Specifications",
        body: "Pre-tensioning protocols must strictly comply with ASME PCC-1 guidelines. Stud bolt tensioning procedures require multi-stage pressure checks to guarantee uniform gasket compression across all high-pressure pipework."
      }
    ]
  );

  // 2. Borderline Document (2 Matches -> Relevance: POSSIBLE)
  await createPDF(
    "sample_tender_borderline.pdf",
    "General Workshop Hand Tools & Maintenance Procurement",
    "Tender Ref: PR-2026-MECH-402 | Category: Hardware & Workshop Inventory",
    [
      {
        heading: "1. Intent",
        body: "Procurement notice for general mechanics workshop supplies including combination spanners, socket sets, pneumatic impact drivers, screwdrivers, and bench vices for standard vehicle fleet repairs."
      },
      {
        heading: "2. Tool List",
        body: "Item 4: Standard manual torque wrench (1/2 inch drive, 40-200 Nm range) for tire lug nuts. Item 7: Miscellaneous general bolting tools including manual ratchet wrenches, hex keys, and adjustable pliers."
      },
      {
        heading: "3. Delivery & Warranty",
        body: "All items must be delivered to the central transport warehouse within 30 days of PO issuance with a 12-month standard manufacturer warranty."
      }
    ]
  );

  // 3. Clearly Not Relevant Document (0 Matches -> Relevance: NO)
  await createPDF(
    "sample_tender_not_relevant.pdf",
    "Enterprise Cloud Infrastructure & IT Software Tender",
    "Tender Ref: IT-2026-CLOUD-109 | Category: Information Technology",
    [
      {
        heading: "1. Project Scope",
        body: "Invitation for proposals to migrate legacy on-premises application servers to a secure multi-region cloud infrastructure using Kubernetes container orchestration, PostgreSQL database clusters, and automated CI/CD deployment pipelines."
      },
      {
        heading: "2. Service Level Agreement (SLA)",
        body: "The vendor must guarantee 99.99% uptime for Web API endpoints, 24/7 technical helpdesk support, end-to-end TLS encryption, SOC2 Type II compliance, and automated daily offsite backup replication."
      },
      {
        heading: "3. Vendor Qualifications",
        body: "Bidders must possess certified cloud solution architect credentials, demonstrated experience with React and Node.js enterprise microservices, and minimum 5 years of commercial IT consulting history."
      }
    ]
  );

  console.log("\nAll 3 sample test PDFs generated successfully!");
}

generateAll().catch(console.error);
