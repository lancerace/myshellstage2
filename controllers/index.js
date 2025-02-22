import fs from 'fs';
import mammoth from 'mammoth';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fileName = 'bold_underline.docx';

// Function to analyze document
async function analyzeDocumentFile() {
  try {
    const filePath = path.join(__dirname, "..", "docs", fileName);
    console.log("filePath:", filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Document ${fileName} not found in docs directory`);
    }

    let trackThirdWord = 0;
    let fontSize = 0;
    const htmlResult = await mammoth.convertToHtml(
      { path: filePath },
      {
        styleMap: ["u => u", "b => strong"],
        transformDocument: (element) => {
          let words = [];
          // Get all words from the paragraph
          console.log("element:", element);
          element.children.forEach((run) => {
            run.children.forEach((runChild) => {
              if (
                runChild.children &&
                runChild.children[0]?.type &&
                runChild.children[0].type === "text"
              ) {
                const text = runChild.children[0].value.trim(); //do a basic trim on whitespaces
                const isSingleWord = text.split(" ").length === 1;
                const isValidWord = text.length >= 1;

                if (isValidWord && trackThirdWord < 3) {
                  //console.log('check isValidword:',text,isValidWord);
                  //console.log(isSingleWord);
                  if (!isSingleWord) {
                    const words = text.split(" ");
                    //console.log("words:", words);
                    words.forEach((word) => {
                      const isValidWord = word.length >= 1;
                      if(trackThirdWord ===3){
                        fontSize = runChild.fontSize;
                      }
                      if (isValidWord)
                        trackThirdWord += 1;
                    });
                  }//end if(!isSingleWord)
                }//end if(isValidWord && trackThirdWord < 3)
                if (trackThirdWord === 3) {
                  fontSize = runChild.fontSize;
                }

                if (text) {
                  words = words.concat(text.split(/\s+/));
                }
              }
            });
          });

          return element;
        },
      }
    );

    const html = htmlResult.value; // The HTML with formatting
    console.log("html:", html);

    // Create a DOM parser to get text content
    const dom = new JSDOM(`<!DOCTYPE html><div id="content">${html}</div>`);
    const document = dom.window.document;

    // Get text content and split into words
    const text = document.getElementById("content").textContent;
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const firstThreeWords = words.slice(0, 3);
    console.log("firstThreeWords:", firstThreeWords);

    // Initialize analysis results
    const analysis = {
      firstWordsBold: false,
      secondWordUnderlined: false,
      thirdWordFontSize: fontSize,
      words: {
        first: words[0] || "",
        second: words[1] || "",
        third: words[2] || "",
      },
    };

    // Check if first word is bold
    const strongElements = document.querySelectorAll("strong");
    console.log("strongElements:", strongElements);
    for (const element of strongElements) {
      //console.log("Bold element content:", element.textContent.trim());
      if (element.textContent.trim() === words[0]) {
        analysis.firstWordsBold = true;
        break;
      }
    }

    // Check if second word is underlined
    const underlineElements = document.querySelectorAll("u");
    //console.log("underlineElements:", underlineElements);
    for (const element of underlineElements) {
     // console.log("Underline element content:", element.textContent.trim());
      if (element.textContent.trim() === words[1]) {
        analysis.secondWordUnderlined = true;
        break;
      }
    }


    console.log("Analysis results:", analysis);
    return analysis;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
}

// Controller methods
export const analyzeDocument = async (req, res) => {
  try {
    const analysis = await analyzeDocumentFile();
    res.json({
      success: true,
      message: "Document analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error analyzing document",
    });
  }
};
