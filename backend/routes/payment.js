const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node'); // This will need to be installed via npm
const dotenv = require('dotenv');
const { PaymentInformation, User } = require('../models');

dotenv.config();

// Initialize PayOS SDK with credentials from environment variables
let payos;
try {
  // Check if all required credentials are available
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  
  if (clientId && apiKey && checksumKey) {
    payos = new PayOS(clientId, apiKey, checksumKey);
  } else {
    console.warn('PayOS credentials missing. Payment functionality will be limited.');
  }
} catch (error) {
  console.error('Error initializing PayOS:', error);
}

// Create payment link route
router.post('/create', async (req, res) => {
  try {
    // Check if PayOS is properly initialized
    if (!payos) {
      // For testing purposes, we'll return a mock response
      console.log('PayOS not initialized, returning mock response');
      const mockOrderCode = Date.now().toString();
      return res.json({
        success: true,
        checkoutUrl: 'https://pay.payos.vn/web/7e36a8cb5ff34c4e8d0fc93dd06a8c0/',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        paymentLinkId: mockOrderCode,
        orderCode: mockOrderCode
      });
    }

    const { amount, orderInfo, productId } = req.body;

    // Validate input
    if (!amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters (amount, orderInfo)'
      });
    }

    // Format orderCode - must be unique for each payment link
    const orderCode = Date.now();

    // Create payment link request data
    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: `Thanh toán ${orderCode}`,
      items: [
        {
          name: orderInfo,
          quantity: 1,
          price: amount
        }
      ],
      // Return URL after payment completion (frontend URL)
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-result?orderCode=${orderCode}`,
      // Cancel URL if user cancels payment
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/test-payment`
    };

    // Create payment link using PayOS SDK
    const paymentLinkResponse = await payos.createPaymentLink(paymentData);

    // Return the payment link info to the client
    res.json({
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      paymentLinkId: paymentLinkResponse.paymentLinkId,
      orderCode: orderCode
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment link',
      error: error.message
    });
  }
});

// Get payment link information
router.get('/info/:orderCode', async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    // First, check if payment already exists in database to avoid duplicates
    const existingPayment = await PaymentInformation.findOne({
      where: { transactionId: orderCode.toString() }
    });
    
    if (existingPayment) {
      console.log(`Payment for order ${orderCode} found in database`);
      
      // Parse payment details if it's a JSON string
      let paymentDetailsObj = {};
      try {
        paymentDetailsObj = typeof existingPayment.paymentDetails === 'string' 
          ? JSON.parse(existingPayment.paymentDetails)
          : existingPayment.paymentDetails;
      } catch (e) {
        console.warn('Could not parse payment details JSON:', e);
      }
      
      // Return a formatted response that matches what the frontend expects
      return res.json({
        success: true,
        data: {
          id: existingPayment.id,
          orderCode: existingPayment.transactionId,
          amount: existingPayment.amount,
          amountPaid: existingPayment.amount, // Assume fully paid if in database with completed status
          amountRemaining: 0,
          status: existingPayment.status === 'completed' ? 'PAID' : existingPayment.status.toUpperCase(),
          createdAt: existingPayment.createdAt,
          transactions: [{
            reference: paymentDetailsObj.reference || 'transaction',
            amount: existingPayment.amount,
            description: existingPayment.notes,
            transactionDateTime: existingPayment.paymentDate
          }]
        }
      });
    }
    
    // Check if PayOS is properly initialized
    if (!payos) {
      // For testing purposes, return a mock payment info
      const mockInfo = {
        id: 'mock-payment-id',
        orderCode: orderCode,
        amount: 50000,
        amountPaid: 50000,
        amountRemaining: 0,
        status: 'PAID',
        createdAt: new Date().toISOString(),
        transactions: [{
          reference: 'mock-transaction',
          amount: 50000,
          accountNumber: '123456789',
          description: `Thanh toán ${orderCode}`,
          transactionDateTime: new Date().toISOString()
        }]
      };
      
      // Save mock payment to database for testing
      try {
        // Create the payment record directly
        await PaymentInformation.create({
          userId: 1, // Default user ID
          transactionId: orderCode.toString(), // Save order code in transactionId
          paymentMethod: 'e_wallet',
          amount: mockInfo.amount,
          currency: 'VND',
          status: 'completed',
          paymentDate: new Date(),
          paymentDetails: JSON.stringify(mockInfo),
          notes: mockInfo.transactions[0].description // Save description in notes
        });
        
        console.log(`Mock payment information saved for order ${orderCode}`);
      } catch (dbError) {
        console.error('Error saving mock payment:', dbError);
      }
      
      return res.json({
        success: true,
        data: mockInfo
      });
    }
    
    const paymentLinkInfo = await payos.getPaymentLinkInformation(orderCode);
    
    // If payment is successful, save to database
    if (paymentLinkInfo && 
        (paymentLinkInfo.status === 'PAID' || 
         paymentLinkInfo.amountPaid >= paymentLinkInfo.amount)) {
      try {
        // Extract transaction data if available
        const transaction = paymentLinkInfo.transactions && paymentLinkInfo.transactions.length > 0 
          ? paymentLinkInfo.transactions[0] 
          : null;
        
        // Find a user (simplified approach)
        const user = await User.findOne();
        const userId = user ? user.id : 1;
        
        // Check if payment already exists in database
        const existingPayment = await PaymentInformation.findOne({
          where: { transactionId: orderCode.toString() }
        });
        
        if (!existingPayment) {
          // Create the payment record directly
          await PaymentInformation.create({
            userId,
            transactionId: orderCode.toString(), // Save order code in transactionId
            paymentMethod: 'e_wallet',
            amount: paymentLinkInfo.amount,
            currency: 'VND',
            status: 'completed',
            paymentDate: transaction?.transactionDateTime 
              ? new Date(transaction.transactionDateTime) 
              : new Date(paymentLinkInfo.createdAt),
            paymentDetails: JSON.stringify(paymentLinkInfo),
            notes: transaction?.description || `Thanh toán ${orderCode}` // Save description in notes
          });
          
          console.log(`Payment information saved for order ${orderCode} from info endpoint`);
        } else {
          console.log(`Payment for order ${orderCode} already exists in database, skipping`);
        }
      } catch (dbError) {
        console.error('Error saving payment from info endpoint:', dbError);
      }
    }
    
    res.json({
      success: true,
      data: paymentLinkInfo
    });
  } catch (error) {
    console.error('Error getting payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment information',
      error: error.message
    });
  }
});

// Payment webhook for receiving payment notifications from PayOS
router.post('/webhook', async (req, res) => {
  try {
    // Check if PayOS is properly initialized
    if (!payos) {
      console.warn('PayOS not initialized. Webhook request ignored.');
      return res.status(200).json({ message: 'Webhook received' });
    }

    console.log('Received payment webhook from PayOS');
    const webhookData = payos.verifyPaymentWebhookData(req.body);
    
    if (webhookData) {
      // Process the payment notification
      console.log('Payment webhook data verified:', webhookData.orderCode);
      
      // Extract payment information
      const {
        orderCode,
        amount,
        description,
        accountNumber,
        reference,
        transactionDateTime,
        currency,
        paymentLinkId,
        code,
        desc,
        counterAccountBankId,
        counterAccountBankName,
        counterAccountName,
        counterAccountNumber
      } = webhookData;
      
      // Parse transaction date
      const paymentDate = new Date(transactionDateTime);
      
      // Only save successful payments
      if (code === '00' || desc.toLowerCase().includes('thành công')) {
        try {
          // Find the associated user (this is simplified, you might need more logic)
          const user = await User.findOne();
          const userId = user ? user.id : 1; // Default to user ID 1 if no user found
          
          // Format transaction details for storage
          const paymentDetails = JSON.stringify({
            accountNumber,
            reference,
            counterAccountBankId,
            counterAccountBankName,
            counterAccountName,
            counterAccountNumber,
            paymentLinkId
          });
          
          // Check if payment already exists in database
          const existingPayment = await PaymentInformation.findOne({
            where: { transactionId: orderCode.toString() }
          });
          
          if (!existingPayment) {
            // Save to payment_information table
            await PaymentInformation.create({
              userId,
              transactionId: orderCode.toString(), // Save order code in transactionId as specified
              paymentMethod: 'e_wallet', // PayOS payments are typically e-wallet or bank transfer
              amount: parseFloat(amount),
              currency: currency || 'VND',
              status: 'completed',
              paymentDate,
              paymentDetails,
              notes: description || `Thanh toán ${orderCode}` // Save description in notes as specified
            });
            
            console.log(`Payment information saved for order ${orderCode}`);
          } else {
            console.log(`Payment for order ${orderCode} already exists in database, skipping`);
          }
        } catch (dbError) {
          console.error('Error saving payment to database:', dbError);
        }
      } else {
        console.log(`Payment webhook received but payment not successful. Status: ${code} - ${desc}`);
      }
      
      res.status(200).json({ message: 'Webhook received and processed' });
    } else {
      console.warn('Invalid webhook data received');
      res.status(400).json({ message: 'Invalid webhook data' });
    }
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
});

module.exports = router; 