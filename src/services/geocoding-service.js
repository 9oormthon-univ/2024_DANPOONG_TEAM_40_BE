// geocoding-service.js
const axios = require('axios');

async function geocode(address) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding 실패: ${response.data.status}`);
    }

    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lon: location.lng };
  } catch (err) {
    console.error('Geocoding 오류:', err.message);
    throw new Error('주소를 좌표로 변환하는 중 오류 발생');
  }
}

module.exports = { geocode };