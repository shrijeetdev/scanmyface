import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports a specific DOM element to a multi-page PDF document.
 * @param {string} elementId - The ID of the container to export (e.g., 'report-container')
 * @param {string} filename - The desired output filename
 */
export async function exportReportToPDF(elementId, filename = 'ScanMyFace_Report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    // Add a temporary class or styles if needed before capturing
    // (e.g., to ensure buttons or unneeded UI elements are hidden)
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) exportBtn.style.display = 'none';

    // Capture the entire scrollable container as an image
    // Note: We use a higher scale for better resolution on Retina displays
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true, 
      backgroundColor: '#0C0A14', // Match our dark theme background
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Optional: modify the cloned document before render (e.g. unhide things, remove fixed positioning)
      }
    });

    if (exportBtn) exportBtn.style.display = 'flex'; // Restore button

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // PDF parameters (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const canvasWidth = imgProps.width;
    const canvasHeight = imgProps.height;
    
    // Calculate the total height of the image in PDF mm
    const ratio = pdfWidth / canvasWidth;
    const totalImgHeightInMm = canvasHeight * ratio;

    let heightLeft = totalImgHeightInMm;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
    heightLeft -= pdfHeight;

    // Add subsequent pages if the report is taller than one A4 page
    while (heightLeft > 0) {
      position -= pdfHeight; // Move the image up to show the next slice
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
      heightLeft -= pdfHeight;
    }

    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
