import express from 'express';
import { analyzeDocument } from './controllers/index.js';

const app = express();

// API Routes with versioning
const v1Router = express.Router();
app.use('/v1', v1Router);

// Document analysis route
v1Router.get('/analyze-document', analyzeDocument);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
