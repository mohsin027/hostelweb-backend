import express from 'express';
import { adminLogin, checkAdminLoggedIn, logoutAdmin } from '../controllers/adminAuthController.js';
const router=express.Router();

router.post('/login',adminLogin)
router.get('/login/check',checkAdminLoggedIn)
router.get('/logout',logoutAdmin)

export default router