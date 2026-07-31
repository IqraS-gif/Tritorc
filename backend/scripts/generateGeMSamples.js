const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../../");

/**
 * Creates a GeM (Government eMarketplace) style PDF Tender document.
 * Ensures the output has AT LEAST 6 pages with realistic GeM sections.
 */
function createGeMPDF(filename, options) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(rootDir, filename);
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      pdfVersion: "1.4",
      compress: false,
    });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    let pageCount = 0;

    // Helper: Draw header on each page
    function drawHeader() {
      pageCount++;
      // Top header banner
      doc.rect(40, 30, 515, 36).fill("#991b1b");
      doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold")
         .text("GeM  |  Government eMarketplace", 50, 40, { align: "left" });
      doc.fontSize(9).font("Helvetica")
         .text("Bid Document / शासकीय बोली दस्तावेज", 400, 42, { align: "right" });
      
      doc.strokeColor("#dc2626").lineWidth(1.5).moveTo(40, 70).lineTo(555, 70).stroke();
      doc.y = 80;
    }

    // Helper: Draw footer on each page
    function drawFooter() {
      const bottom = 800;
      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(40, bottom - 15).lineTo(555, bottom - 15).stroke();
      doc.fillColor("#64748b").fontSize(8).font("Helvetica")
         .text(`GeM Bid Reference: ${options.bidNumber}`, 40, bottom - 8, { align: "left" })
         .text(`Generated via GeM Portal | Confidential`, 200, bottom - 8, { align: "center" })
         .text(`Page ${pageCount}`, 500, bottom - 8, { align: "right" });
    }

    // Start Page 1
    drawHeader();

    // ── PAGE 1: BID DETAILS TABLE ──────────────────────────────────────────────
    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold")
       .text(`Bid Details / बोली विवरण  (Ref No: ${options.bidNumber})`, 40, doc.y);
    doc.moveDown(0.5);

    const bidTable = [
      ["Bid End Date/Time / बोली बंद होने की तिथि/समय", options.bidEndDate],
      ["Bid Opening Date/Time / बोली खुलने की तिथि/समय", options.bidOpeningDate],
      ["Bid Offer Validity / बोली पेशकश वैधता", "180 Days"],
      ["Ministry/State Name / मंत्रालय/राज्य का नाम", options.ministry],
      ["Department Name / विभाग का नाम", options.department],
      ["Organisation Name / संगठन का नाम", options.organisation],
      ["Office Name / कार्यालय का नाम", options.office],
      ["Item Category / वस्तु श्रेणी", options.category],
      ["Total Quantity / कुल मात्रा", options.quantity],
      ["Contract Period / अनुबंध अवधि", "3 Year(s)"],
      ["MSE Exemption for Years of Experience / एमएसई छूट", "Yes"],
      ["Startup Exemption for Years of Experience / स्टार्टअप छूट", "Yes"],
      ["Document Required from Seller / विक्रेता से मांगे गए दस्तावेज़", "Experience Criteria, Past Performance, OEM Authorization, Compliance Certificate"],
      ["Bid to RA enabled / बोली से रिवर्स नीलामी", "Yes"],
      ["RCM Applicable / आरसीएम लागू", "No"],
      ["EMD Detail / ईएमडी विवरण", "Applicable (2% of estimated value)"],
      ["ePBG Detail / ईपीबीजी विवरण", "Applicable (5% of contract value)"],
    ];

    let startY = doc.y;
    doc.font("Helvetica").fontSize(8.5);

    bidTable.forEach(([label, val], idx) => {
      const rowY = startY + idx * 18;
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      doc.rect(40, rowY, 515, 18).fill(bg);
      doc.rect(40, rowY, 250, 18).strokeColor("#e2e8f0").lineWidth(0.5).stroke();
      doc.rect(290, rowY, 265, 18).strokeColor("#e2e8f0").lineWidth(0.5).stroke();

      doc.fillColor("#334155").font("Helvetica-Bold").text(label, 45, rowY + 4, { width: 240 });
      doc.fillColor("#0f172a").font("Helvetica").text(val, 295, rowY + 4, { width: 255 });
    });

    drawFooter();

    // ── PAGE 2: EMD / ePBG & ELIGIBILITY CRITERIA ───────────────────────────────
    doc.addPage();
    drawHeader();

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("1. EMD & ePBG Details / ईएमडी और ईपीबीजी विवरण");
    doc.moveDown(0.5);

    doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(
      "Earnest Money Deposit (EMD) of 2% of the total estimated contract value must be submitted in the form of Bank Guarantee / Demand Draft favoring the Accounts Officer, OPGC Banharpali. Bidders seeking exemption under MSE / Startup categories must upload valid Registration Certificates issued by NSIC / UDYAM / DPIIT.",
      { align: "justify", lineGap: 3 }
    );
    doc.moveDown(1);

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("2. Splitting & Purchase Preference / विभाजन और खरीद प्राथमिकता");
    doc.moveDown(0.5);
    doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(
      "1. Splitting of Order: The Buyer reserves the right to split the order among multiple qualified L1, L2 sellers in the ratio of 60:40 subject to L2 matching L1 prices.\n" +
      "2. MII Purchase Preference: Preference will be given to Class 1 Local Suppliers as defined under Make in India policy. Local content minimum requirement is 50%.\n" +
      "3. MSE Purchase Preference: 25% of total procurement quantity is reserved for Micro and Small Enterprises.",
      { align: "justify", lineGap: 4 }
    );
    doc.moveDown(1.5);

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("3. Vendor Eligibility & Qualification Criteria / पात्रता मापदंड");
    doc.moveDown(0.5);
    doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(
      "The bidder or its OEM must have executed at least 3 similar contracts in major public sector undertakings (PSUs), refineries, power plants, or fertilizer complexes during the last 5 financial years. Minimum annual financial turnover during the last 3 financial years must not be less than INR 2.5 Crores. ISO 9001, ISO 14001, and ISO 4501 certifications are mandatory.",
      { align: "justify", lineGap: 4 }
    );

    drawFooter();

    // ── PAGE 3: DETAILED SCOPE OF WORK (SOW) ──────────────────────────────────
    doc.addPage();
    drawHeader();

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("4. Comprehensive Scope of Work (SOW) / कार्य का विस्तृत दायरा");
    doc.moveDown(0.6);

    options.sowParagraphs.forEach((para, i) => {
      doc.fillColor("#991b1b").fontSize(10.5).font("Helvetica-Bold").text(`4.${i + 1} ${para.title}`);
      doc.moveDown(0.3);
      doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(para.text, { align: "justify", lineGap: 4 });
      doc.moveDown(1);
    });

    drawFooter();

    // ── PAGE 4: TECHNICAL SPECIFICATIONS & SCHEDULE OF REQUIREMENTS ─────────────
    doc.addPage();
    drawHeader();

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("5. Technical Specifications & BOQ / तकनीकी विशिष्टियां और मात्रा तालिका");
    doc.moveDown(0.5);

    doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(
      "The equipment and tools supplied under this contract must conform strictly to the technical parameters specified below. Any deviation will result in immediate rejection during pre-dispatch inspection.",
      { align: "justify", lineGap: 3 }
    );
    doc.moveDown(0.8);

    // Spec table header
    let specY = doc.y;
    doc.rect(40, specY, 515, 20).fill("#991b1b");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
    doc.text("Item #", 45, specY + 5, { width: 35 });
    doc.text("Description of Tool / Service", 85, specY + 5, { width: 220 });
    doc.text("Technical Standard / Parameter", 310, specY + 5, { width: 170 });
    doc.text("Qty", 490, specY + 5, { width: 60, align: "center" });

    options.specTable.forEach((item, idx) => {
      const rowY = specY + 20 + idx * 24;
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      doc.rect(40, rowY, 515, 24).fill(bg);
      doc.rect(40, rowY, 515, 24).strokeColor("#cbd5e1").lineWidth(0.5).stroke();

      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(8.5).text(`${idx + 1}`, 45, rowY + 7, { width: 35 });
      doc.font("Helvetica").text(item.name, 85, rowY + 7, { width: 220 });
      doc.text(item.param, 310, rowY + 7, { width: 170 });
      doc.font("Helvetica-Bold").text(`${item.qty}`, 490, rowY + 7, { width: 60, align: "center" });
    });

    drawFooter();

    // ── PAGE 5: BUYER ADDED BID SPECIFIC TERMS & CONDITIONS ───────────────────
    doc.addPage();
    drawHeader();

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("6. Buyer Added Bid Specific Terms & Conditions / क्रेता की विशेष शर्तें");
    doc.moveDown(0.6);

    const terms = [
      "1. Inspection & Testing: Pre-dispatch inspection (PDI) shall be conducted by Buyer's authorized third-party inspection agency (TUV / DNV / Lloyd's Register) at OEM works.",
      "2. Calibration Certificates: All calibration must be conducted using NABL accredited master instruments with valid calibration certificates valid for 12 months from delivery date.",
      "3. On-Site Support & Training: Successful bidder must depute qualified service engineers for on-site commissioning, tool operation training, and maintenance demonstration for minimum 5 working days.",
      "4. Guarantee / Warranty: The seller shall provide comprehensive 36-month replacement warranty against manufacturing defects, material failure, or performance degradation under full rated load.",
      "5. Liquidated Damages (LD): If the seller fails to deliver tools or services within specified schedule, LD at 0.5% per week up to a maximum of 10% of total contract value will be deducted.",
      "6. Safety & Statutory Compliance: All field technicians deputed for turnaround services or plant shutdown work must possess valid Plant Safety Cards, PPE kits, and medical fitness certificates.",
      "7. Force Majeure: Standard GeM SLA terms regarding natural disasters, strikes, or government restrictions shall govern contract extensions.",
      "8. Payment Terms: 80% payment upon receipt and physical verification of tools at site; remaining 20% against submission of Performance Bank Guarantee (ePBG)."
    ];

    terms.forEach((term) => {
      doc.fillColor("#334155").fontSize(9).font("Helvetica").text(term, { align: "justify", lineGap: 4 });
      doc.moveDown(0.7);
    });

    drawFooter();

    // ── PAGE 6: ANNEXURE I & COMPLIANCE UNDERTAKING ───────────────────────────
    doc.addPage();
    drawHeader();

    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("7. Annexure I — Technical Compliance & Self Declaration Undertaking");
    doc.moveDown(0.6);

    doc.fillColor("#334155").fontSize(9).font("Helvetica").text(
      "To,\n" +
      "The Superintending Engineer (Procurement & Contracts),\n" +
      `${options.organisation}, ${options.office}\n\n` +
      `Sub: Technical Compliance & Undertaking for GeM Bid No: ${options.bidNumber}\n\n` +
      "Dear Sir,\n\n" +
      "We hereby declare that we have carefully read and understood all technical specifications, scope of work, and buyer terms contained in the GeM Bid document. We confirm full compliance without any commercial or technical deviations.\n\n" +
      "We confirm that all equipment supplied (including hydraulic tools, tensioners, multipliers, and joint integrity testing units) will be 100% genuine, brand new, and supported by OEM test certificates.\n\n" +
      "We further declare that our firm has not been blacklisted or debarred by any Central / State Government department or PSU as on bid submission date.\n\n" +
      "Thanking you,\n\n" +
      "Yours faithfully,\n\n" +
      "For & On Behalf of: _____________________________________\n" +
      "Authorized Signatory: ___________________________________\n" +
      "Name & Designation: ____________________________________\n" +
      "Company Seal & Date: ___________________________________",
      { align: "left", lineGap: 3 }
    );

    drawFooter();

    // End stream
    doc.end();

    writeStream.on("finish", () => {
      console.log(`✓ Successfully generated 6-page GeM tender PDF: ${filename}`);
      resolve();
    });
    writeStream.on("error", reject);
  });
}

async function generateGeMFiles() {
  console.log("Generating 2 authentic GeM Tender documents (6+ pages each)...\n");

  // 1. High Relevance GeM Document (Matches 8+ Tritorc keywords -> Relevance: YES)
  await createGeMPDF("GeM-Bidding-High-Relevance.pdf", {
    bidNumber: "GEM/2026/B/9852104",
    bidEndDate: "24-08-2026 15:00:00",
    bidOpeningDate: "24-08-2026 15:30:00",
    ministry: "Ministry of Petroleum and Natural Gas",
    department: "Refineries & Petrochemicals Division",
    organisation: "Indian Oil Corporation Limited (IOCL)",
    office: "Gujarat Refinery Vadodara",
    category: "Controlled Bolting Equipment & Turnaround Services",
    quantity: "1 Package (Comprehensive Service & Supply)",
    sowParagraphs: [
      {
        title: "Plant Shutdown & Turnaround Maintenance Bolting Services",
        text: "The contractor shall mobilize certified personnel and high-capacity equipment for annual plant shutdown maintenance across Hydrocracker and Crude Distillation Units. Services demand 24/7 technical execution for controlled bolting on high-pressure reactor vessel heads, heat exchanger end covers, and steam reformer piping."
      },
      {
        title: "Supply & Operation of Hydraulic Torque Wrench Systems",
        text: "Contractor must deploy low-profile and square-drive hydraulic torque wrench tools capable of working up to 35,000 Nm torque output. All hydraulic torque wrenches must feature multi-axis swivel couplings, anti-reverse ratchets, and digital electric power packs to ensure exact torque application during flange joint tightening."
      },
      {
        title: "Hydraulic Bolt Tensioning & Pre-tensioning Protocol",
        text: "For critical high-temperature flanges, the vendor must supply multi-stage hydraulic bolt tensioning equipment and specialized bolt tensioner units. Execution of stud bolt tensioning must adhere strictly to ASME PCC-1 Guidelines for Bolted Flange Joint Assembly to achieve uniform pre-tensioning and prevent joint leakage."
      },
      {
        title: "Flange Joint Integrity & Flange Management Program",
        text: "The scope encompasses a total flange management service including joint tagging, ultrasonic bolt elongation measurement, flange face inspection, gasket replacement, nut splitter deployment for corroded fasteners, and final flange joint integrity testing prior to plant pressurization."
      }
    ],
    specTable: [
      { name: "Hydraulic Torque Wrench (Square Drive)", param: "Max Torque 15,000 Nm, 1.5 inch drive", qty: 4 },
      { name: "Low Profile Hydraulic Torque Wrench", param: "Hex sizes 50mm to 110mm", qty: 6 },
      { name: "Top-Side Hydraulic Bolt Tensioner", param: "Max Working Pressure 1500 Bar", qty: 8 },
      { name: "Hydraulic Nut Splitter Unit", param: "Cuts M24 to M64 heavy hex nuts", qty: 2 },
      { name: "High-Pressure Electric Torque Pump", param: "700 Bar output, 230V, quad port", qty: 3 },
      { name: "Flange Joint Integrity Test Kit", param: "Nitrogen/Helium leak testing skid", qty: 1 }
    ]
  });

  // 2. Borderline Relevance GeM Document (Matches 1-2 keywords -> Relevance: POSSIBLE)
  await createGeMPDF("GeM-Bidding-Borderline-Relevance.pdf", {
    bidNumber: "GEM/2026/B/9601142",
    bidEndDate: "28-08-2026 14:00:00",
    bidOpeningDate: "28-08-2026 14:30:00",
    ministry: "Ministry of Heavy Industries",
    department: "Central Public Sector Enterprises",
    organisation: "Bharat Heavy Electricals Limited (BHEL)",
    office: "Heavy Electrical Equipment Plant Haridwar",
    category: "General Hardware & Maintenance Bolting Tools",
    quantity: "48 Items (Workshop Consumables & Hand Tools)",
    sowParagraphs: [
      {
        title: "Supply of General Workshop Maintenance Consumables",
        text: "Contractor shall supply standard maintenance workshop consumables including open-ended spanners, ring spanners, socket driver sets, pneumatic impact wrenches, bench vices, torque wrench calibrators, and general bolting tools required for routine maintenance of turbine assembly bays."
      },
      {
        title: "Tool Calibration & Quality Acceptance",
        text: "All hand tools supplied under this contract must carry standard manufacturer warranty. Any manual torque wrench included in the lot must be supplied with factory calibration certificates traceable to national standards."
      },
      {
        title: "Delivery & Storage Packaging Requirements",
        text: "Tools must be packed in heavy-duty steel toolboxes with foam cutouts. Delivery must be completed at Central Stores BHEL Haridwar within 45 days of GeM contract creation."
      }
    ],
    specTable: [
      { name: "Combination Spanner Set (Metric 6-32mm)", param: "Chrome Vanadium Steel, DIN 3113", qty: 15 },
      { name: "1/2 Inch Drive Socket Wrench Set", param: "24 Pieces with quick release ratchet", qty: 10 },
      { name: "Manual Click-Type Torque Wrench", param: "1/2 inch drive, 40-200 Nm range", qty: 5 },
      { name: "Heavy Duty General Bolting Tools", param: "Adjustable wrenches & pliers set", qty: 12 },
      { name: "Pneumatic Impact Driver 3/4 Inch", param: "Working pressure 6.2 Bar, 1200 Nm", qty: 4 },
      { name: "Steel Tool Chest with Drawers", param: "Powder coated 7-drawer mobile cabinet", qty: 2 }
    ]
  });

  // Clean up old single-page test PDFs if present
  const oldFiles = [
    "sample_tender_relevant.pdf",
    "sample_tender_borderline.pdf",
    "sample_tender_not_relevant.pdf",
  ];
  oldFiles.forEach((f) => {
    const p = path.join(rootDir, f);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`✓ Removed old 1-page PDF: ${f}`);
    }
  });

  console.log("\nDone! 2 GeM tender PDF documents (6 pages each) generated successfully.");
}

generateGeMFiles().catch(console.error);
