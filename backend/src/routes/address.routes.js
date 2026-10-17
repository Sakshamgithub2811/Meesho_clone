import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  deleteAddress
} from '../controllers/address.controller.js';

const router = Router();

router.get('/', getAddresses);
router.post('/', createAddress);
router.delete('/:id', deleteAddress);

export default router;
