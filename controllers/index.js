import fs from "fs";
import mammoth from "mammoth";
import path from "path";
import { fileURLToPath } from "url";
import { TextRun, Paragraph, Document, Packer } from "docx";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fileName = "docA.docx";

// Function to analyze document
async function analyzeDocumentFile() {
  try {
    const filePath = path.join(__dirname, "..", "docs", fileName);
    console.log("filePath:", filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Document ${fileName} not found in docs directory`);
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
}

async function generateRandomFormattingTask(text) {
  const words = text.split(" ");
  const numberOfWords = words.length;
  const randomOperations = ["bold", "underline", "italic"];
  const tasks = [];

  //generate 5 random formatting operations

  const max = randomOperations.length;
  for (let i = 0; i < 5; i++) {
    const randomOperation = randomOperations[Math.floor(Math.random() * max)];
    const randomWordIndex = Math.floor(Math.random() * numberOfWords);

    /* Have the output be taskA = [("bold", 9), ("underline", 5), ("bold", 6), ("italic", 9), ("italic", 5)]
    since tuple is not supported in javascript, we can use array of arrays.
    output would be, for example [["bold", 9], ["underline", 5], ["bold", 6], ["italic", 9], ["italic", 5]] */
    tasks.push([randomOperation, randomWordIndex]);
  }
  return tasks;
}

async function applyFormatting(textContent, tasks) {
  const words = textContent.split(" ");

  const formattedRuns = words.map((word, index) => {
    let textRun = new TextRun({ text: word + ' ' });

    //for each task, if the word index matches, apply the formatting
    for (let i = 0; i < tasks.length; i++) {
      const [operation, wordIndex] = tasks[i];
      if (index === wordIndex) {
        if (operation === "bold") {
          textRun = new TextRun({ text: word + " ", bold: true });
        }
        if (operation === "underline") {
          textRun = new TextRun({ text: word + " ", underline: { type: "single" } });
        }
        if (operation === "italic") {
          textRun = new TextRun({ text: word + " ", italics: true });
        }
      }
    }
    return textRun;
  });

  return new Paragraph({
    children: formattedRuns,
  });
}

async function getDocumentContent() {
  fs.readFile(path.join(__dirname, "..", "docs", fileName), (err, data) => {
    if (err) {
      console.error("Error reading document:", err);
      return;
    }

    mammoth.extractRawText({ buffer: data }).then(async (result) => {
      const textContent = result.value.trim();
      console.log("text:", textContent);
      const tasks = await generateRandomFormattingTask(textContent);
      console.log("tasks:", tasks);

      const formattedText = await applyFormatting(textContent, tasks);

      //prepare the document and write to file
      const doc = new Document({
        sections: [
          {
            children: [formattedText],
          },
        ],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      const newFilePath = path.join(
        __dirname,
        "..",
        "docs",
        "formattedDocA.docx"
      );
      fs.writeFile(newFilePath, docxBuffer, (err) => {
        if (err) {
          console.error("Error writing formatted document:", err);
        }
      });
    });
  });
}

export async function randomFormattingTask(req, res) {
  try {
    const content = await getDocumentContent();

    res.json({
      success: true,
      message: "Random formatting task generated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error generating random formatting task",
    });
  }
}
