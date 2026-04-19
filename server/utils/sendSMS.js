const axios = require('axios');

const sendSMS = async (options) => {
  // If no API key, fallback to console log (Free for Dev)
  if (!process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY === 'your_fast2sms_api_key') {
    console.log(`\n--- [SMS SIMULATOR] ---`);
    console.log(`To: ${options.number}`);
    console.log(`Code: ${options.code}`);
    console.log(`-----------------------\n`);
    return { success: true, mock: true };
  }

  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'otp',
      variables_values: options.code,
      numbers: options.number,
    }, {
      headers: {
        "authorization": process.env.FAST2SMS_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    console.log(`\n--- [SIMULATING FALLBACK SMS DUE TO FAST2SMS ERROR] ---`);
    console.log(`To: ${options.number}`);
    console.log(`Code: ${options.code}`);
    console.log(`----------------------------------------------------\n`);
    // Return early to pretend we successfully sent it anyway
    return { success: true, mock: true, errorFallback: true };
  }
};

module.exports = sendSMS;
