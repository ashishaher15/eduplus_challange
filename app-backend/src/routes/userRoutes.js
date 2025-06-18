import express from 'express';
import { getAllStores, submitRating } from '../controllers/userController.js';

const router = express.Router();

router.get('/stores', getAllStores);
router.post('/stores/:storeId/rate', submitRating);

export default router;