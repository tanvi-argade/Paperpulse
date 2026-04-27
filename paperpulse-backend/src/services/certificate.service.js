const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

/**
 * Generates a certificate for a published paper.
 * FIXED: Optimized for single-page output with vertically spaced content.
 */
const generateCertificate = async (paperId) => {
  try {
    // 1. Fetch paper by ID
    const paperRes = await pool.query('SELECT * FROM papers WHERE id = $1', [paperId]);
    const paper = paperRes.rows[0];

    if (!paper) {
      console.error(`[CERTIFICATE] Paper ${paperId} not found`);
      return;
    }

    // 2. Idempotency Check
    if (paper.certificate_url) {
      return paper.certificate_url;
    }

    // 3. Fetch Authors
    const authorsRes = await pool.query(
      'SELECT name_snapshot FROM paper_authors WHERE paper_id = $1 ORDER BY author_order ASC',
      [paperId]
    );
    
    let authorsList = authorsRes.rows.map(a => a.name_snapshot).join(', ');
    if (!authorsList) {
      const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [paper.author_id]);
      authorsList = userRes.rows[0]?.name || 'Unknown Author';
    }

    // 4. Generate PDF (Single Page)
    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape', 
      margin: 40,
      autoFirstPage: true 
    });

    const fileName = `certificate-paper-${paperId}.pdf`;
    const uploadsDir = path.join(__dirname, '../../uploads/certificates');
    const filePath = path.join(uploadsDir, fileName);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- SINGLE PAGE LAYOUT ---
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Border
    doc.rect(25, 25, pageWidth - 50, pageHeight - 50).lineWidth(2).stroke('#1e293b');

    // 1. Title
    doc.moveDown(3);
    doc.font('Helvetica-Bold').fontSize(32).fillColor('#1e293b').text('CERTIFICATE OF PUBLICATION', { align: 'center' });
    
    // 2. Statement line
    doc.moveDown(1.5);
    doc.font('Helvetica').fontSize(16).fillColor('#475569').text('This is to certify that the research paper titled', { align: 'center' });
    
    // 3. Paper Title (Quoted)
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text(`"${paper.title.toUpperCase()}"`, { 
      align: 'center',
      width: pageWidth - 100,
      ellipsis: true
    });

    // 4. "authored by"
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(16).fillColor('#475569').text('authored by', { align: 'center' });
    
    // 5. All Authors
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#2563eb').text(authorsList, { align: 'center' });

    // 6. Publication Statement
    doc.moveDown(1.5);
    doc.font('Helvetica').fontSize(14).fillColor('#64748b').text('has been successfully peer-reviewed and published in', { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e293b').text('PaperPulse Academic Repository', { align: 'center' });

    // 7. Footer
    const pubDate = paper.updated_at ? new Date(paper.updated_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : new Date().toLocaleDateString();

    // Use absolute positioning for footer to ensure it stays on one page
    const footerY = pageHeight - 110;
    doc.fontSize(12).fillColor('#475569').text(`Publication Date: ${pubDate}`, 40, footerY, { align: 'center' });
    doc.text(`Paper ID: ${paperId}`, 40, footerY + 20, { align: 'center' });
    doc.fontSize(10).fillColor('#94a3b8').text('Verification URL: http://paperpulse.com/verify', 40, footerY + 45, { align: 'center' });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // 5. Update DB
    const certificateUrl = `/uploads/certificates/${fileName}`;
    await pool.query(
      'UPDATE papers SET certificate_url = $1, certificate_generated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [certificateUrl, paperId]
    );

    return certificateUrl;
  } catch (error) {
    console.error('[CERTIFICATE SERVICE ERROR]', error);
    throw error;
  }
};

module.exports = { generateCertificate };
