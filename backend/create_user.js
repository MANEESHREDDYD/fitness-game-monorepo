const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';

async function createTestUser() {
    try {
        console.log('--- Creating test user ---');
        const res = await axios.post(`${API_URL}/signup`, {
            username: 'ProGamerNYC',
            email: 'test@fitness.com',
            password: 'password123'
        });
        console.log('Success:', res.data.user.username, 'created.');
    } catch (err) {
        if (err.response && err.response.status === 409) {
            console.log('User already exists, continuing...');
        } else {
            console.error('Error creating user:', err.response ? err.response.data : err.message);
        }
    }
}

createTestUser();
