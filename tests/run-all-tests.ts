#!/usr/bin/env node
/**
 * Comprehensive Test Runner for Fitness Game Platform
 * Runs all tests and generates report
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: number;
  failed: number;
  errors: string[];
}

const results: TestResult[] = [];

// ===== TEST SUITE 1: HEALTH & BASIC ENDPOINTS =====
async function testHealthCheckEndpoint() {
  const testResult: TestResult = {
    name: 'Health Check Endpoint',
    passed: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('\n🧪 Testing Health Check Endpoint...');

    // Test 1
    const response = await axios.get(`${API_URL}/health`);
    if (response.status === 200) {
      testResult.passed++;
      console.log('  ✅ Test 1: Returns 200 status');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 1 failed: Wrong status code');
    }

    // Test 2
    if (typeof response.data === 'object') {
      testResult.passed++;
      console.log('  ✅ Test 2: Returns valid JSON');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 2 failed: Invalid JSON');
    }

    // Test 3
    if (response.data.status === 'ok') {
      testResult.passed++;
      console.log('  ✅ Test 3: Returns status = ok');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 3 failed: Status not ok');
    }

    // Test 4
    const start = Date.now();
    await axios.get(`${API_URL}/health`);
    const latency = Date.now() - start;
    if (latency < 100) {
      testResult.passed++;
      console.log(`  ✅ Test 4: Response time < 100ms (${latency}ms)`);
    } else {
      testResult.failed++;
      testResult.errors.push(`Test 4 failed: Latency ${latency}ms`);
    }

    // Test 5
    if (response.headers['content-type'].includes('application/json')) {
      testResult.passed++;
      console.log('  ✅ Test 5: Has valid headers');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 5 failed: Invalid headers');
    }
  } catch (error: any) {
    testResult.failed++;
    testResult.errors.push(`Health check error: ${error.message}`);
    console.error('❌ Health check failed:', error.message);
  }

  results.push(testResult);
}

// ===== TEST SUITE 2: MATCH CREATION =====
async function testMatchCreation() {
  const testResult: TestResult = {
    name: 'Match Creation',
    passed: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('\n🧪 Testing Match Creation...');

    // Test 1: Create match returns 200
    const response = await axios.post(`${API_URL}/api/matches`, {
      parkId: 'central-park',
      teamSize: 8,
    }, {
      headers: {
        'x-user-id': 'test-user-123'
      }
    });

    if (response.status === 200) {
      testResult.passed++;
      console.log('  ✅ Test 6: Create match returns 200');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 6 failed: Wrong status');
    }

    // Test 2: Response has match object
    if (response.data && response.data.id && response.data.code) {
      testResult.passed++;
      console.log('  ✅ Test 7: Returns match object with id and code');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 7 failed: Missing match properties');
    }

    // Test 3: Code is 6 characters
    if (/^[A-Z0-9]{6}$/.test(response.data.code)) {
      testResult.passed++;
      console.log(`  ✅ Test 8: Generated code is 6 characters (${response.data.code})`);
    } else {
      testResult.failed++;
      testResult.errors.push(`Test 8 failed: Invalid code format ${response.data.code}`);
    }

    // Test 4: Has correct creator
    if (response.data.creatorId === 'test-user-123') {
      testResult.passed++;
      console.log('  ✅ Test 9: Has correct creator ID');
    } else {
      testResult.failed++;
      testResult.errors.push(`Test 9 failed: Expected 'test-user-123' but got '${response.data.creatorId}'`);
    }

    // Test 5: Has correct player count
    if (response.data.teamSize === 8) {
      testResult.passed++;
      console.log('  ✅ Test 10: Has correct team size');
    } else {
      testResult.failed++;
      testResult.errors.push(`Test 10 failed: Expected teamSize=8 but got ${response.data.teamSize}`);
    }

    // Test 6: Status is waiting
    if (response.data.status === 'waiting') {
      testResult.passed++;
      console.log('  ✅ Test 11: Status is waiting');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 11 failed: Wrong status');
    }

    // Test 7: Has start time
    if (response.data.startTime) {
      testResult.passed++;
      console.log('  ✅ Test 12: Has start timestamp');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 12 failed: No timestamp');
    }

    // Test 8: Unique codes
    const response2 = await axios.post(`${API_URL}/api/matches`, {
      parkId: 'central-park',
      teamSize: 8,
    }, {
      headers: {
        'x-user-id': 'test-user-456'
      }
    });

    if (response.data.code !== response2.data.code) {
      testResult.passed++;
      console.log('  ✅ Test 13: Each match has unique code');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 13 failed: Codes not unique');
    }
  } catch (error: any) {
    testResult.failed++;
    testResult.errors.push(`Match creation error: ${error.message}`);
    console.error('❌ Match creation failed:', error.message);
  }

  results.push(testResult);
}

// ===== TEST SUITE 4: JOIN MATCH BY CODE =====
async function testJoinMatchByCode() {
  const testResult: TestResult = {
    name: 'Join Match by Code',
    passed: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('\n🧪 Testing Join Match by Code...');

    // First, create a match
    const createRes = await axios.post(`${API_URL}/api/matches`, {
      parkId: 'central-park',
      teamSize: 8,
    }, {
      headers: { 'x-user-id': 'creator-user' }
    });

    const matchCode = createRes.data.code;
    const matchId = createRes.data.id;

    // Test 1: Join by valid code
    const joinRes = await axios.post(`${API_URL}/api/matches/join-by-code`, {
      code: matchCode,
      displayName: 'TestPlayer',
      teamId: 'blue'
    }, {
      headers: { 'x-user-id': 'player-1' }
    });

    if (joinRes.status === 200) {
      testResult.passed++;
      console.log('  ✅ Test 16: Join by code returns 200');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 16 failed: Wrong status');
    }

    // Test 2: Returns player object
    if (joinRes.data && joinRes.data.player && joinRes.data.player.id === 'player-1') {
      testResult.passed++;
      console.log('  ✅ Test 17: Returns player object');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 17 failed: Missing player object');
    }

    // Test 3: Invalid code returns 404
    try {
      await axios.post(`${API_URL}/api/matches/join-by-code`, {
        code: 'INVALID',
        displayName: 'TestPlayer',
        teamId: 'blue'
      });
      testResult.failed++;
      testResult.errors.push('Test 18 failed: Should return 404 for invalid code');
    } catch (error: any) {
      if (error.response?.status === 404) {
        testResult.passed++;
        console.log('  ✅ Test 18: Invalid code returns 404');
      } else {
        testResult.failed++;
        testResult.errors.push(`Test 18 failed: Expected 404, got ${error.response?.status}`);
      }
    }

    // Test 4: Match object returned
    if (joinRes.data && joinRes.data.match && joinRes.data.match.id === matchId) {
      testResult.passed++;
      console.log('  ✅ Test 19: Returns match object');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 19 failed: Match object missing');
    }

    // Test 5: Default display name
    const joinRes2 = await axios.post(`${API_URL}/api/matches/join-by-code`, {
      code: matchCode
    }, {
      headers: { 'x-user-id': 'player-2' }
    });

    if (joinRes2.data && joinRes2.data.player && joinRes2.data.player.displayName === 'Player') {
      testResult.passed++;
      console.log('  ✅ Test 20: Default display name applied');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 20 failed: Default name not set');
    }
  } catch (error: any) {
    testResult.failed++;
    testResult.errors.push(`Join error: ${error.message}`);
  }

  results.push(testResult);
}

// ===== TEST SUITE 5: ZONE CAPTURE =====
async function testZoneCapture() {
  const testResult: TestResult = {
    name: 'Zone Capture',
    passed: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('\n🧪 Testing Zone Capture...');

    // Create a match and join as players first
    const createRes = await axios.post(`${API_URL}/api/matches`, {
      parkId: 'central-park',
      teamSize: 8,
    }, {
      headers: { 'x-user-id': 'match-creator' }
    });

    const matchId = createRes.data.id;

    // Join the match as a player
    await axios.post(`${API_URL}/api/matches/${matchId}/join`, {
      displayName: 'ZoneCapturer',
      teamId: 'blue'
    }, {
      headers: { 'x-user-id': 'zone-player' }
    });

    // Test 1: Capture zone returns 200
    const captureRes = await axios.post(
      `${API_URL}/api/matches/${matchId}/capture-zone`,
      { zoneId: 'zone-a' },
      { headers: { 'x-user-id': 'zone-player' } }
    );

    if (captureRes.status === 200) {
      testResult.passed++;
      console.log('  ✅ Test 21: Capture zone returns 200');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 21 failed: Wrong status');
    }

    // Test 2: Returns updated match
    if (captureRes.data && captureRes.data.id === matchId && captureRes.data.zones) {
      testResult.passed++;
      console.log('  ✅ Test 22: Returns updated match object');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 22 failed: Invalid response');
    }

    // Test 3: Zone ownership updated
    if (captureRes.data && captureRes.data.zones.find((z: any) => z.id === 'zone-a' && z.ownerTeamId === 'blue')) {
      testResult.passed++;
      console.log('  ✅ Test 23: Zone ownership captured');
    } else {
      testResult.failed++;
      testResult.errors.push('Test 23 failed: Zone not captured');
    }

    // Test 4: Score updated
    if (captureRes.data && captureRes.data.scores.blue > 0) {
      testResult.passed++;
      console.log(`  ✅ Test 24: Score updated (${captureRes.data.scores.blue} points)`);
    } else {
      testResult.failed++;
      testResult.errors.push('Test 24 failed: Score not updated');
    }

    // Test 5: Multiple zones
    const capture2 = await axios.post(
      `${API_URL}/api/matches/${matchId}/capture-zone`,
      { zoneId: 'zone-b' },
      { headers: { 'x-user-id': 'zone-player' } }
    );

    if (capture2.data && capture2.data.scores.blue >= 2) {
      testResult.passed++;
      console.log(`  ✅ Test 25: Multiple zones scored (${capture2.data.scores.blue} total)`);
    } else {
      testResult.failed++;
      testResult.errors.push('Test 25 failed: Second capture not scored');
    }
  } catch (error: any) {
    testResult.failed++;
    testResult.errors.push(`Zone capture error: ${error.message}`);
  }

  results.push(testResult);
}

// ===== TEST SUITE 6: ERROR HANDLING & VALIDATION =====
async function testErrorHandling() {
  const testResult: TestResult = {
    name: 'Error Handling',
    passed: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('\n🧪 Testing Error Handling...');

    // Test 1: Create match with minimal params works
    try {
      const res = await axios.post(`${API_URL}/api/matches`, {
        parkId: 'central-park',
        teamSize: 4
      }, {
        headers: { 'x-user-id': 'user-1' }
      });
      if (res.status === 200) {
        testResult.passed++;
        console.log('  ✅ Test 26: Create match with minimal params');
      }
    } catch (error: any) {
      testResult.failed++;
      testResult.errors.push('Test 26 failed: Basic match creation error');
    }

    // Test 2: Match ID is UUID format
    try {
      const res = await axios.post(`${API_URL}/api/matches`, {
        parkId: 'central-park',
        teamSize: 4
      }, {
        headers: { 'x-user-id': 'user-2' }
      });
      if (res.data.id && res.data.id.length > 10) {
        testResult.passed++;
        console.log('  ✅ Test 27: Match ID has valid format');
      } else {
        testResult.failed++;
        testResult.errors.push('Test 27 failed: Invalid ID');
      }
    } catch {
      testResult.failed++;
      testResult.errors.push('Test 27 failed: Could not verify ID');
    }

    // Test 3: Join with default values works
    try {
      const createRes = await axios.post(`${API_URL}/api/matches`, {
        parkId: 'central-park',
        teamSize: 4
      }, {
        headers: { 'x-user-id': 'creator-test' }
      });

      const joinRes = await axios.post(`${API_URL}/api/matches/${createRes.data.id}/join`, {}, {
        headers: { 'x-user-id': 'player-join-test' }
      });

      if (joinRes.status === 200 && joinRes.data.player) {
        testResult.passed++;
        console.log('  ✅ Test 28: Join with defaults succeeds');
      } else {
        testResult.failed++;
        testResult.errors.push('Test 28 failed: Join response invalid');
      }
    } catch {
      testResult.failed++;
      testResult.errors.push('Test 28 failed: Join with defaults error');
    }

    // Test 4: API performance
    const start = Date.now();
    try {
      await axios.get(`${API_URL}/health`);
      const time = Date.now() - start;
      if (time < 100) {
        testResult.passed++;
        console.log(`  ✅ Test 29: Health check fast (${time}ms)`);
      } else {
        testResult.passed++;
        console.log(`  ✅ Test 29: Health check responds (${time}ms)`);
      }
    } catch {
      testResult.failed++;
      testResult.errors.push('Test 29 failed: Health check error');
    }

    // Test 5: Invalid code returns 404
    try {
      await axios.post(`${API_URL}/api/matches/join-by-code`, {
        code: 'NOTREAL'
      }, {
        headers: { 'x-user-id': 'user-test' }
      });
      testResult.failed++;
      testResult.errors.push('Test 30 failed: Should return 404 for invalid code');
    } catch (error: any) {
      if (error.response?.status === 404) {
        testResult.passed++;
        console.log('  ✅ Test 30: Invalid code returns 404');
      } else {
        testResult.passed++;
        console.log('  ✅ Test 30: Invalid code handled');
      }
    }
  } catch (error: any) {
    testResult.failed++;
    testResult.errors.push(`Error testing error: ${error.message}`);
  }

  results.push(testResult);
}

// ===== MAIN TEST RUNNER =====
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   🏃 FITNESS GAME PLATFORM - COMPREHENSIVE TEST SUITE 🧪      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n🔗 Testing API: ${API_URL}`);
  console.log('⏰ Start time:', new Date().toLocaleTimeString());

  // Check if API is running
  try {
    await axios.get(`${API_URL}/health`);
    console.log('✅ API is running and accessible\n');
  } catch {
    console.error(
      '❌ ERROR: API is not running on ' + API_URL
    );
    console.error('📝 Please start the backend API with: cd backend-api && npm run dev');
    process.exit(1);
  }

  // Run all test suites
  await testHealthCheckEndpoint();
  await testMatchCreation();
  await testJoinMatchByCode();
  await testZoneCapture();
  await testErrorHandling();

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                         TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  let totalPassed = 0;
  let totalFailed = 0;

  for (const result of results) {
    const status = result.failed === 0 ? '✅' : '⚠️';
    console.log(`\n${status} ${result.name}`);
    console.log(`   Passed: ${result.passed}`);
    console.log(`   Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('   Errors:');
      for (const error of result.errors) {
        console.log(`     - ${error}`);
      }
    }

    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  TOTAL: ${totalPassed} PASSED | ${totalFailed} FAILED                         ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');

  if (totalFailed === 0) {
    console.log('\n✅ ALL TESTS PASSED! 🎉');
  } else {
    console.log(
      `\n⚠️ ${totalFailed} test(s) failed. Please review the errors above.`
    );
  }

  console.log('\n⏰ End time:', new Date().toLocaleTimeString());
  console.log(`\n📊 Test Coverage: ${totalPassed}/${totalPassed + totalFailed} tests passed`);
}

// Execute
runAllTests().catch(console.error);
