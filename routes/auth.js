import express from 'express';
import { signup, login, forgotPassword, resetPassword, getUserInfo, fileuplaod } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

router.get('/user', authenticateToken, getUserInfo);

router.post('/fileUpload',fileuplaod)

export default router;
