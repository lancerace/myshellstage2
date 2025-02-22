import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';
import { fileName, analyzeDocument } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('analyzeDocumentFile', () => {
  let docxPath;
  let convertedHtml;

  //make sure file exists before running tests
  beforeAll(async () => {
    // Get path to the test document
    docxPath = path.join(__dirname, '..', '..', 'docs', fileName);
    //console.log('Testing document path:', docxPath);

    // Verify file exists
    if (!fs.existsSync(docxPath)) {
      throw new Error(`Test document not found at: ${docxPath}`);
    }

    // Get actual HTML from document
    const result = await mammoth.convertToHtml({ path: docxPath });
    convertedHtml = result.value;
    //console.log('Converted HTML:', convertedHtml);
  });

  it('should find and analyze the document file', async () => {
    let responseData;
    const response = {
      json: (data) => {
        console.log('Jest Test: Response data:', data);
        responseData = data;
        return data;
      },
      status: () => response
    };

    await analyzeDocument({}, response);
    console.log('Jest Test: Full response:', responseData);

    // Verify API response structure
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Document analyzed successfully');
    expect(responseData.data).toHaveProperty('firstWordsBold', true);
    expect(responseData.data).toHaveProperty('secondWordUnderlined', true);
    // Check thirdWordFontSize exists and has a numeric value
    expect(responseData.data).toHaveProperty('thirdWordFontSize');
    expect(responseData.data.thirdWordFontSize).toBeGreaterThan(0);
  });
}); 