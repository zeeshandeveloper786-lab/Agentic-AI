import app from './app.js';
import cleanupService from './services/cleanup.service.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    cleanupService.start();
});
