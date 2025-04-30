import * as XLSX from 'xlsx-js-style';

interface ExcelColumn {
  header: string;
  accessor: (row: any) => any;
  width?: number;
}

const defaultStyles = {
  font: { bold: true },
  fill: { fgColor: { rgb: '4F46E5' } },
  font: { color: { rgb: 'FFFFFF' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
  },
};

const alternateRowStyle = {
  fill: { fgColor: { rgb: 'F3F4F6' } },
};

const numberFormatStyle = {
  numFmt: '#,##0.00 "DH"',
};

const dateFormatStyle = {
  numFmt: 'yyyy-mm-dd',
};

export const exportToExcel = (data: any[], columns: ExcelColumn[], filename: string) => {
  // Prepare headers
  const headers = columns.map(col => col.header);
  
  // Prepare data for export with styling
  const exportData = [
    headers.map(header => ({
      v: header,
      t: 's',
      s: defaultStyles,
    })),
    ...data.map((row, rowIndex) => 
      columns.map(column => {
        const value = column.accessor(row);
        let cellStyle = rowIndex % 2 === 1 ? { ...alternateRowStyle } : {};

        // Add specific formatting based on value type
        if (typeof value === 'number') {
          cellStyle = { ...cellStyle, ...numberFormatStyle };
        } else if (value instanceof Date) {
          cellStyle = { ...cellStyle, ...dateFormatStyle };
        }

        return {
          v: value,
          t: typeof value === 'number' ? 'n' : 's',
          s: cellStyle,
        };
      })
    ),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width || 20 }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Data');

  // Auto-filter for header row
  ws['!autofilter'] = { ref: `A1:${String.fromCharCode(64 + columns.length)}1` };

  // Freeze the header row
  ws['!freeze'] = { xSplit: '0', ySplit: 1 };

  // Generate Excel file with current date
  const currentDate = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${currentDate}.xlsx`);
};