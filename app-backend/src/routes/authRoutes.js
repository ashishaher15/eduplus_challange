import express from 'express';
import { register, login, updatePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/password', updatePassword);

export default router;