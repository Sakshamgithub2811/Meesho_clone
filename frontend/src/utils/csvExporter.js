import { toast } from 'sonner';

/**
 * Universal CSV / Excel Exporter for Admin & Partner Reports
 * Converts JSON records to standard RFC-4180 CSV with UTF-8 BOM for Microsoft Excel & Google Sheets.
 * 
 * @param {Object} options
 * @param {Array<Object>} options.data - Array of row objects to export
 * @param {string} [options.filename='report'] - Desired file name prefix (without extension)
 * @param {Array<{ key: string, label: string, formatter?: (val: any, row: Object) => string|number }>} options.columns - Column configuration
 */
export function exportToCsv({ data = [], filename = 'report', columns = [] }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    toast.error('Export Error', {
      description: 'No data available to export in current view.'
    });
    return;
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    toast.error('Export Error', {
      description: 'No export columns configured.'
    });
    return;
  }

  try {
    // 1. Build Header Row
    const headerRow = columns
      .map((col) => {
        const headerTitle = col.label || col.key || 'Column';
        return `"${String(headerTitle).replace(/"/g, '""')}"`;
      })
      .join(',');

    // 2. Build Data Rows
    const dataRows = data.map((row) => {
      return columns
        .map((col) => {
          // Resolve nested properties (e.g. 'user.fullName' or 'order.items.length')
          let cellValue = col.key.split('.').reduce((acc, part) => {
            return acc !== null && acc !== undefined ? acc[part] : undefined;
          }, row);

          // Apply custom column formatter if provided
          if (col.formatter && typeof col.formatter === 'function') {
            cellValue = col.formatter(cellValue, row);
          }

          if (cellValue === null || cellValue === undefined) {
            cellValue = '';
          }

          // Escape internal quotes by doubling them (RFC-4180 standard)
          const sanitizedString = String(cellValue).replace(/"/g, '""');
          return `"${sanitizedString}"`;
        })
        .join(',');
    });

    // 3. Assemble CSV text with UTF-8 BOM (\uFEFF)
    // The BOM ensures Excel correctly identifies UTF-8, rendering ₹ rupee symbols and special characters cleanly.
    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

    // 4. Create in-memory Blob and trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);

    const safeTimestamp = new Date().toISOString().slice(0, 10);
    const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const downloadName = `${cleanFilename}_${safeTimestamp}.csv`;

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', blobUrl);
    downloadLink.setAttribute('download', downloadName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Free memory
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    toast.success('Report Exported!', {
      description: `Downloaded ${data.length} records to ${downloadName}`
    });
  } catch (error) {
    console.error('Failed to export CSV report:', error);
    toast.error('Export Failed', {
      description: error.message || 'An unexpected error occurred while generating the CSV file.'
    });
  }
}

export default exportToCsv;
