import 'dotenv/config';
import express from 'express';
import { executeJob } from './agent';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// A simple middleware for API key authentication
const apiKeyAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.WORKER_API_KEY) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

app.post('/execute-job', apiKeyAuth, async (req, res) => {
    try {
        const { submissionId } = req.body;
        if (!submissionId) {
            return res.status(400).json({ error: 'Missing submissionId' });
        }

        // Don't await this, we want to return a response immediately
        executeJob(submissionId).catch(err => {
            console.error(`Error in background job for submission ${submissionId}:`, err);
            // Here you would typically update the submission status to 'failed' in the database
        });

        res.status(202).json({ message: 'Job accepted and is running in the background', submissionId });
    } catch (error) {
        console.error('Error in /execute-job endpoint:', error);
        res.status(500).json({ error: 'Failed to start job' });
    }
});


app.listen(port, () => {
    console.log(`Agent worker listening on port ${port}`);
});
