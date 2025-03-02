import express from 'express';
import { randomFormattingTask } from './controllers/index.js';

const app = express();

// API Routes with versioning
const v1Router = express.Router();
app.use('/v1', v1Router);

v1Router.get('/random-formatting-task', randomFormattingTask);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
