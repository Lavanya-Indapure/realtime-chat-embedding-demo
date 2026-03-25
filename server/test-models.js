require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the client SDK easily accessible without additional auth sometimes,
    // but we can try to use the fetch API or just guess some common ones.
    // Actually, let's try a few common ones and see which one works.
    const models = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro", "gemini-1.5-pro"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Test non-streaming
        const result = await model.generateContent("test");
        await result.response;
        
        // Test streaming
        const streamResult = await model.generateContentStream("test");
        for await (const chunk of streamResult.stream) {
          chunk.text();
        }
        console.log(`✅ Model ${modelName} is WORKING (Streaming OK).`);
      } catch (e) {
        console.log(`❌ Model ${modelName} failed: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Error in listModels:", err);
  }
}

listModels();
