require('dotenv').config();
const PayOS = require('@payos/node');

// Check if PayOS credentials are set
const checkPayOSCredentials = () => {
  console.log('Checking PayOS credentials...');
  
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  
  if (!clientId || !apiKey || !checksumKey) {
    console.error('⚠️ ERROR: Missing PayOS credentials in .env file');
    console.log('Please ensure you have set the following environment variables:');
    console.log('PAYOS_CLIENT_ID');
    console.log('PAYOS_API_KEY');
    console.log('PAYOS_CHECKSUM_KEY');
    return false;
  }
  
  console.log('✅ PayOS credentials found');
  return true;
};

// Test creating a payment link
const testCreatePayment = async () => {
  try {
    console.log('Testing PayOS payment creation...');
    
    // Initialize PayOS SDK
    const payos = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
    
    // Create a test payment
    const orderCode = Date.now();
    const paymentData = {
      orderCode: orderCode,
      amount: 10000,
      description: `Test payment ${orderCode}`,
      items: [
        {
          name: "Test item",
          quantity: 1,
          price: 10000
        }
      ],
      returnUrl: "http://localhost:3000/payment-result",
      cancelUrl: "http://localhost:3000/test-payment"
    };
    
    console.log('Creating test payment with data:', paymentData);
    
    const response = await payos.createPaymentLink(paymentData);
    console.log('✅ Payment link created successfully:');
    console.log('Payment URL:', response.checkoutUrl);
    console.log('Payment Link ID:', response.paymentLinkId);
    return true;
  } catch (error) {
    console.error('❌ Failed to create payment link:', error);
    return false;
  }
};

// Run the tests
const main = async () => {
  console.log('===== PayOS Integration Test =====');
  
  if (!checkPayOSCredentials()) {
    process.exit(1);
  }
  
  try {
    const success = await testCreatePayment();
    if (success) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Tests failed with error:', error);
    process.exit(1);
  }
};

main(); 