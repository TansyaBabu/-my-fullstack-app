const asyncHandler = require('express-async-handler');
const puppeteer = require('puppeteer');
const FileData = require('../models/FileData');
const AnalysisHistory = require('../models/AnalysisHistory');
const User = require('../models/userModel');
const html2canvas = require('html2canvas');

// @desc    Generate a PDF report
// @route   POST /api/reports/generate
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
    const { fileId, chartType: reqChartType, xAxis: reqXAxis, yAxis: reqYAxis, chartImage } = req.body;
    if (!fileId) {
        return res.status(400).send('File ID is required');
    }

    // Fetch file and user
    const fileData = await FileData.findById(fileId);
    if (!fileData) {
        return res.status(404).send('File not found');
    }
    const user = await User.findById(fileData.user);

    // Try to get the latest analysis for this file and user
    const analysis = await AnalysisHistory.findOne({ file: fileId, user: fileData.user }).sort({ createdAt: -1 });

    // Prepare data for the report
    const fileName = fileData.fileName;
    const uploadDate = fileData.createdAt ? new Date(fileData.createdAt).toLocaleString() : 'N/A';
    const rowCount = Array.isArray(fileData.data) ? fileData.data.length : 0;
    const colCount = Array.isArray(fileData.data) && fileData.data[0] ? Object.keys(fileData.data[0]).length : 0;
    const userName = user ? (user.name || user.username || user.email) : 'Unknown User';
    const chartType = reqChartType || (analysis ? analysis.analysisType || analysis.chartType : 'N/A') || 'N/A';
    const xAxis = reqXAxis || (analysis ? analysis.parameters?.xAxis || analysis.xAxis : 'N/A') || 'N/A';
    const yAxis = reqYAxis || (analysis ? analysis.parameters?.yAxis || analysis.yAxis : 'N/A') || 'N/A';
    const now = new Date().toLocaleString();

    // Prepare summary table (first 10 rows)
    let tableHeaders = '';
    let tableRows = '';
    if (Array.isArray(fileData.data) && fileData.data.length > 0) {
        const headers = Object.keys(fileData.data[0]);
        tableHeaders = headers.map(h => `<th style='padding:8px;background:#e0e7ff;'>${h}</th>`).join('');
        tableRows = fileData.data.slice(0, 10).map((row, idx) =>
            `<tr style='background:${idx%2===0?'#f8fafc':'#e0e7ff'};'>${headers.map(h => `<td style='padding:8px;'>${row[h]}</td>`).join('')}</tr>`
        ).join('');
    }

    const chartImageHtml = chartImage
        ? `<img src="${chartImage}" style="max-width:100%;border:2px solid #e0e7ff;margin:24px 0;" />`
        : '<p style="color:#f00;">No chart image provided.</p>';

    console.log('Chart image received:', chartImage ? chartImage.substring(0, 100) : 'NO IMAGE');

    // HTML template
    const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #222;">
      <div style="background: linear-gradient(90deg, #6366f1 0%, #a21caf 100%); color: #fff; padding: 24px 32px; border-radius: 16px 16px 0 0;">
        <h1 style="margin:0; font-size:2.2em; letter-spacing:1px;">ExcelVerse Data Analysis Report</h1>
        <p style="margin:0; font-size:1.1em;">Generated for <b>${userName}</b> on ${now}</p>
      </div>
      <div style="padding: 24px 32px;">
        <h2 style="color:#4f46e5;">File Details</h2>
        <ul style="font-size:1.1em;">
          <li><b>File Name:</b> ${fileName}</li>
          <li><b>Upload Date:</b> ${uploadDate}</li>
          <li><b>Rows:</b> ${rowCount}</li>
          <li><b>Columns:</b> ${colCount}</li>
        </ul>
        <hr style="margin:24px 0; border:0; border-top:2px solid #e0e7ff;" />
        <h2 style="color:#a21caf;">Analysis Details</h2>
        <ul style="font-size:1.1em;">
          <li><b>Chart Type:</b> ${chartType}</li>
          <li><b>X-Axis:</b> ${xAxis}</li>
          <li><b>Y-Axis:</b> ${yAxis}</li>
        </ul>
        <hr style="margin:24px 0; border:0; border-top:2px solid #e0e7ff;" />
        <h2 style="color:#16a34a;">Data Preview (First 10 Rows)</h2>
        <table style="border-collapse:collapse; width:100%; font-size:0.98em; margin-top:12px;">
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <h2 style="color:#6366f1;">Chart Visualization</h2>
        ${chartImageHtml}
      </div>
      <div style="background: linear-gradient(90deg, #6366f1 0%, #a21caf 100%); color: #fff; padding: 12px 32px; border-radius: 0 0 16px 16px; text-align:center; font-size:1em;">
        <p style="margin:0;">ExcelVerse &copy; ${new Date().getFullYear()} | Data Intelligence Platform</p>
      </div>
    </div>
    `;

    // Use puppeteer to generate PDF from HTML
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '16px', bottom: '16px', left: '16px', right: '16px' } });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${fileId}.pdf`);
    res.send(pdfBuffer);
});

module.exports = {
    generateReport,
}; 