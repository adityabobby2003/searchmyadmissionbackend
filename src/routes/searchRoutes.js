import express from 'express'
const router = express.Router();
import { getllbController, getBCAController, getBTechController, getBBAController, paymentController } from '../controller/searchController.js';

router.post('/llb', getllbController);
router.post('/bca', getBCAController);
router.post('/bba', getBBAController);
router.post('/btech', getBTechController);
router.post('/payment', paymentController);

export default router; 