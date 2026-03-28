import express from 'express'
const router = express.Router();
import { getllbController, getBCAController, getBTechController, getBBAController } from '../controller/comparisonController.js';

router.post('/llb/comparison', getllbController);
router.post('/bca/comparison', getBCAController);
router.post('/bba/comparison', getBBAController);
router.post('/btech/comparison', getBTechController);

export default router;