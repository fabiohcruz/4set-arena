import express from 'express';
import paymentController from '../controllers/paymentController';
import { authenticateMember } from '../middleware/memberAuth';

const router = express.Router();

// Rotas protegidas (requerem autenticação de membro)
router.post('/reservation', authenticateMember, paymentController.createReservationPayment);
router.post('/order', authenticateMember, paymentController.createOrderPayment);
router.get('/my-payments', authenticateMember, paymentController.getMemberPayments);
router.get('/status/:externalReference', authenticateMember, paymentController.getPaymentStatus);

// Webhook do Mercado Pago (não requer autenticação)
router.post('/webhook', paymentController.handleWebhook);

export default router;

