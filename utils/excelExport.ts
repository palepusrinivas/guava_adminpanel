/**
 * Utility functions for exporting data to Excel format
 */

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param columns Column definitions with header and key
 * @param filename Name of the Excel file (without extension)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string
): Promise<void> {
  // Dynamic import to avoid loading xlsx library if not used
  return import('xlsx').then((XLSX) => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = data.map((row) => {
      const excelRow: Record<string, any> = {};
      columns.forEach((col) => {
        const value = row[col.key];
        // Handle nested objects
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          excelRow[col.header] = JSON.stringify(value);
        } else {
          excelRow[col.header] = value ?? '';
        }
      });
      return excelRow;
    });
    
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = columns.map((col) => ({
      wch: col.width || 15,
    }));
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }).catch((error) => {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel. Please install xlsx library: npm install xlsx');
  });
}

