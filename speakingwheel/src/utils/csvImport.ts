import { WheelItem, WHEEL_COLOR_PALETTE } from '../types/game';

export interface ParsedCsvRow {
  id: string;
  text: string;
  image?: string;
  emoji?: string;
  color?: string;
}

/**
 * Robust CSV Line Parser adhering to RFC 4180
 * Handles quotes, commas inside quotes, multi-line values, and escaped quotes ("")
 */
export function parseCsvText(rawText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Normalize line endings
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        // Only push row if it has at least one non-empty field
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push last field & row if present
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

const HEADER_SYNONYMS = {
  text: ['text', 'word', 'name', 'title', 'label', 'tu', 'tu_vung', 'phrase', 'cau', 'item'],
  image: ['image', 'img', 'picture', 'photo', 'url', 'link', 'hinh', 'hinh_anh', 'anh'],
  emoji: ['emoji', 'icon', 'bieu_tuong'],
  color: ['color', 'colour', 'hex', 'mau', 'mau_sac', 'bg'],
};

function normalizeHeaderName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Converts parsed raw CSV matrix into validated WheelItems
 */
export function processCsvToWheelItems(
  matrix: string[][],
  existingCount = 0
): ParsedCsvRow[] {
  if (!matrix || matrix.length === 0) return [];

  // Determine if row 0 is a header
  const firstRow = matrix[0].map(normalizeHeaderName);
  let textCol = -1;
  let imageCol = -1;
  let emojiCol = -1;
  let colorCol = -1;

  firstRow.forEach((h, idx) => {
    if (HEADER_SYNONYMS.text.some((syn) => h.includes(syn))) textCol = idx;
    else if (HEADER_SYNONYMS.image.some((syn) => h.includes(syn))) imageCol = idx;
    else if (HEADER_SYNONYMS.emoji.some((syn) => h.includes(syn))) emojiCol = idx;
    else if (HEADER_SYNONYMS.color.some((syn) => h.includes(syn))) colorCol = idx;
  });

  let dataRows = matrix;
  const hasRecognizedHeader = textCol !== -1 || imageCol !== -1;

  if (hasRecognizedHeader) {
    dataRows = matrix.slice(1);
  } else {
    // Default column order fallback if no header row
    textCol = 0;
    imageCol = 1;
    emojiCol = 2;
    colorCol = 3;
  }

  const results: ParsedCsvRow[] = [];

  dataRows.forEach((row, rowIdx) => {
    // Get text
    let text = (row[textCol] || '').trim();

    // Auto-fallback: if textCol is out of bounds or empty, look at first non-empty col
    if (!text && row.length > 0) {
      const nonImageCol = row.find((val) => val && !val.startsWith('http') && !val.startsWith('data:'));
      if (nonImageCol) text = nonImageCol.trim();
    }

    if (!text && row.every((c) => !c.trim())) {
      // Empty row, skip
      return;
    }

    if (!text) {
      text = `Item ${existingCount + results.length + 1}`;
    }

    // Get image
    let image: string | undefined = undefined;
    if (imageCol >= 0 && row[imageCol]) {
      const candidate = row[imageCol].trim();
      if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('data:image/')) {
        image = candidate;
      }
    }

    // If image wasn't found at imageCol, scan row for http or data: URLs
    if (!image) {
      const foundUrl = row.find((val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'));
      if (foundUrl) image = foundUrl.trim();
    }

    // Get emoji
    let emoji: string | undefined = undefined;
    if (emojiCol >= 0 && row[emojiCol]) {
      const candidate = row[emojiCol].trim();
      // Heuristic for emoji: short string not matching url
      if (candidate && !candidate.startsWith('http') && candidate.length <= 4) {
        emoji = candidate;
      }
    }

    // Get color
    let color: string | undefined = undefined;
    if (colorCol >= 0 && row[colorCol]) {
      const candidate = row[colorCol].trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate)) {
        color = candidate.toUpperCase();
      }
    }

    // Fallback color from palette
    if (!color) {
      const colorIndex = (existingCount + results.length) % WHEEL_COLOR_PALETTE.length;
      color = WHEEL_COLOR_PALETTE[colorIndex];
    }

    results.push({
      id: `item-${Date.now()}-${rowIdx}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      image,
      emoji: emoji || (image ? undefined : '⭐'),
      color,
    });
  });

  return results;
}

/**
 * Generates and downloads a sample CSV file with UTF-8 BOM so Excel opens it with perfect Vietnamese and Emoji characters
 */
export function downloadSampleCsvTemplate(filename = 'SpeakSpin_Sample_Template.csv'): void {
  const sampleCsvContent =
`text,image,emoji,color
cooking,https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300,👩‍🍳,#EF4444
eating,https://images.unsplash.com/photo-1544025162-d76694265947?w=300,🍽️,#F97316
drinking,https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300,🥤,#10B981
reading,https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300,📖,#F59E0B
playing,https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=300,⚽,#06B6D4
sleeping,https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300,😴,#3B82F6
`;

  // \uFEFF BOM ensures Microsoft Excel and Google Sheets render UTF-8 Vietnamese & Emojis correctly
  const blob = new Blob(['\uFEFF' + sampleCsvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
