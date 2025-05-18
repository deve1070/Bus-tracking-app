import {Router} from 'express';
import {CreateBus} from '../controllers/buses';
import {authenticate} from '../middleware/auth';


const router =Router();


router.post('/', authenticate,CreateBus);



export defualt router;