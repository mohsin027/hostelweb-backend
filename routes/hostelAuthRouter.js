import express from 'express';

import { checkHostelLoggedIn, home,hostelLogin,hostelRegister, hostelRegisterVerify, logoutHostel } from '../controllers/hostelAuthController.js';

const router=express.Router();

router.get('/',home)
router.post('/register',hostelRegister)
router.post('/register/verify',hostelRegisterVerify)
router.post('/login',hostelLogin)
router.get('/login/check',checkHostelLoggedIn)
router.get('/logout',logoutHostel)

export default router