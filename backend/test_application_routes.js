import mongoose from 'mongoose';
import config from './src/config/env.js';
import User from './src/models/User.js';

const API_BASE = 'http://127.0.0.1:5000';
const PASSWORD = 'Test@12345';
const stamp = Date.now();

const results = [];
const state = {};

const log = (name, ok, details = '') => {
  results.push({ name, ok, details });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${details ? ` - ${details}` : ''}`);
};

const request = async (name, method, path, { token, body, expected = [200] } = {}) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    let payload = null;
    const text = await response.text();
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    const ok = expected.includes(response.status);
    log(name, ok, `${method} ${path} -> ${response.status}${payload?.message ? ` (${payload.message})` : ''}`);
    return { ok, status: response.status, payload };
  } catch (error) {
    log(name, false, `${method} ${path} -> NO RESPONSE (${error.message})`);
    return { ok: false, error };
  }
};

const signup = async (key, role) => {
  const email = `${key}.${stamp}@hackverse.com`;
  const res = await request(`signup ${key}`, 'POST', '/api/v1/auth/signup', {
    body: {
      firstName: key.charAt(0).toUpperCase() + key.slice(1),
      lastName: 'Tester',
      email,
      password: PASSWORD
    },
    expected: [201]
  });

  if (!res.ok) return null;
  const userId = res.payload.data.id;
  if (role !== 'participant') {
    await User.findByIdAndUpdate(userId, { role });
  }

  return { id: userId, email, role };
};

const login = async (key, user) => {
  const res = await request(`login ${key}`, 'POST', '/api/v1/auth/login', {
    body: { email: user.email, password: PASSWORD },
    expected: [200]
  });
  const token = res.payload?.data?.accessToken;
  state[key] = { ...user, token };
  return token;
};

const iso = (offsetDays) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString();
};

const run = async () => {
  await mongoose.connect(config.mongoUri);

  await request('health check', 'GET', '/health');
  await request('public hackathon list', 'GET', '/api/v1/hackathons');

  const admin = await signup('admin', 'admin');
  const organizer = await signup('organizer', 'organizer');
  const judge = await signup('judge', 'judge');
  const participant = await signup('participant', 'participant');
  const teammate = await signup('teammate', 'participant');

  await login('admin', admin);
  await login('organizer', organizer);
  await login('judge', judge);
  await login('participant', participant);
  await login('teammate', teammate);

  await request('auth me admin', 'GET', '/api/v1/auth/me', { token: state.admin.token });
  await request('auth me organizer', 'GET', '/api/v1/auth/me', { token: state.organizer.token });
  await request('auth me judge', 'GET', '/api/v1/auth/me', { token: state.judge.token });
  await request('auth me participant', 'GET', '/api/v1/auth/me', { token: state.participant.token });

  const hackathonPayload = {
    title: `Route Test Hackathon ${stamp}`,
    tagline: 'End to end route smoke test',
    description: 'A complete application route test for HackVerse.',
    registrationStart: iso(-1),
    registrationEnd: iso(1),
    hackathonStart: iso(2),
    hackathonEnd: iso(10),
    minTeamSize: 1,
    maxTeamSize: 4,
    status: 'registration_open',
    visibility: 'public',
    contactEmail: 'support@hackverse.com',
    rules: 'Build fairly and submit working links.'
  };

  await request('admin cannot create hackathon', 'POST', '/api/v1/hackathons', {
    token: state.admin.token,
    body: hackathonPayload,
    expected: [403]
  });

  const createHackathon = await request('organizer create hackathon', 'POST', '/api/v1/hackathons', {
    token: state.organizer.token,
    body: hackathonPayload,
    expected: [201]
  });
  const hackathon = createHackathon.payload?.data;
  state.hackathon = hackathon;

  await request('public hackathon detail by slug', 'GET', `/api/v1/hackathons/${hackathon.slug}`);

  const updateHackathon = await request('organizer update own hackathon', 'PATCH', `/api/v1/hackathons/${hackathon._id}`, {
    token: state.organizer.token,
    body: { tagline: 'Updated by route smoke test' },
    expected: [200]
  });
  state.hackathon = updateHackathon.payload?.data || hackathon;

  await request('admin cannot update hackathon', 'PATCH', `/api/v1/hackathons/${hackathon._id}`, {
    token: state.admin.token,
    body: { tagline: 'Admin update should fail' },
    expected: [403]
  });

  await request('participant register for hackathon', 'POST', `/api/v1/hackathons/${hackathon._id}/register`, {
    token: state.participant.token,
    expected: [201]
  });
  await request('teammate register for hackathon', 'POST', `/api/v1/hackathons/${hackathon._id}/register`, {
    token: state.teammate.token,
    expected: [201]
  });
  await request('participant my registrations', 'GET', '/api/v1/registrations/me', {
    token: state.participant.token
  });

  const teamCreate = await request('participant create team', 'POST', `/api/v1/hackathons/${hackathon._id}/teams`, {
    token: state.participant.token,
    body: { name: `Route Team ${stamp}` },
    expected: [201]
  });
  state.team = teamCreate.payload?.data;

  await request('participant get my team', 'GET', `/api/v1/hackathons/${hackathon._id}/my-team`, {
    token: state.participant.token
  });

  await request('leader add teammate by memberId', 'PATCH', `/api/v1/teams/${state.team._id}/members`, {
    token: state.participant.token,
    body: { memberId: state.teammate.id },
    expected: [200]
  });

  await request('teammate leave team', 'PATCH', `/api/v1/teams/${state.team._id}/leave`, {
    token: state.teammate.token,
    expected: [200]
  });

  await request('leader add teammate again', 'PATCH', `/api/v1/teams/${state.team._id}/members`, {
    token: state.participant.token,
    body: { memberId: state.teammate.id },
    expected: [200]
  });

  await request('leader remove teammate', 'PATCH', `/api/v1/teams/${state.team._id}/remove-member`, {
    token: state.participant.token,
    body: { memberId: state.teammate.id },
    expected: [200]
  });

  const submissionCreate = await request('leader create submission', 'POST', `/api/v1/hackathons/${hackathon._id}/submissions`, {
    token: state.participant.token,
    body: {
      githubRepo: 'https://github.com/example/hackverse-route-test',
      demoUrl: 'https://example.com/demo',
      presentationUrl: 'https://example.com/slides',
      videoUrl: 'https://example.com/video',
      description: 'This is a route test submission with valid links.'
    },
    expected: [201]
  });
  state.submission = submissionCreate.payload?.data;

  await request('leader get my submission', 'GET', `/api/v1/hackathons/${hackathon._id}/my-submission`, {
    token: state.participant.token
  });

  const submissionUpdate = await request('leader update submission', 'PATCH', `/api/v1/submissions/${state.submission._id}`, {
    token: state.participant.token,
    body: { description: 'This is an updated route test submission with valid links.' },
    expected: [200]
  });
  state.submission = submissionUpdate.payload?.data || state.submission;

  await request('organizer view submissions', 'GET', `/api/v1/hackathons/${hackathon._id}/submissions`, {
    token: state.organizer.token
  });

  await request('organizer assign judge', 'PATCH', `/api/v1/hackathons/${hackathon._id}/judges/${state.judge.id}`, {
    token: state.organizer.token,
    expected: [200]
  });

  const evaluationCreate = await request('judge evaluate submission', 'POST', `/api/v1/submissions/${state.submission._id}/evaluate`, {
    token: state.judge.token,
    body: {
      innovationScore: 8,
      technicalScore: 9,
      presentationScore: 8,
      remarks: 'Strong route test evaluation.'
    },
    expected: [201]
  });
  state.evaluation = evaluationCreate.payload?.data;

  await request('judge get my evaluations', 'GET', '/api/v1/evaluations/me', {
    token: state.judge.token
  });

  await request('judge update own evaluation', 'PATCH', `/api/v1/evaluations/${state.evaluation._id}`, {
    token: state.judge.token,
    body: { remarks: 'Updated route test evaluation.' },
    expected: [200]
  });

  await request('organizer view evaluations', 'GET', `/api/v1/hackathons/${hackathon._id}/evaluations`, {
    token: state.organizer.token
  });
  await request('authenticated leaderboard', 'GET', `/api/v1/hackathons/${hackathon._id}/leaderboard`, {
    token: state.participant.token
  });
  await request('organizer results', 'GET', `/api/v1/hackathons/${hackathon._id}/results`, {
    token: state.organizer.token
  });
  await request('participant my result', 'GET', `/api/v1/hackathons/${hackathon._id}/my-result`, {
    token: state.participant.token
  });

  await request('admin delete submission', 'DELETE', `/api/v1/submissions/${state.submission._id}`, {
    token: state.admin.token
  });
  await request('admin delete team', 'DELETE', `/api/v1/teams/${state.team._id}`, {
    token: state.admin.token
  });
  await request('teammate cancel registration', 'PATCH', `/api/v1/registrations/${(await request('teammate my registrations for cancel lookup', 'GET', '/api/v1/registrations/me', { token: state.teammate.token })).payload?.data?.[0]?._id}/cancel`, {
    token: state.teammate.token
  });
  await request('admin delete hackathon', 'DELETE', `/api/v1/hackathons/${hackathon._id}`, {
    token: state.admin.token
  });

  await request('logout participant', 'POST', '/api/v1/auth/logout', {
    token: state.participant.token
  });

  const failed = results.filter((result) => !result.ok);
  console.log('\nAPPLICATION ROUTE TEST SUMMARY');
  console.table(results);
  console.log(`Total: ${results.length}, Passed: ${results.length - failed.length}, Failed: ${failed.length}`);

  await mongoose.disconnect();
  process.exit(failed.length ? 1 : 0);
};

run().catch(async (error) => {
  console.error('Fatal application route test error:', error);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors during fatal cleanup.
  }
  process.exit(1);
});
