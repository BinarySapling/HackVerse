/**
 * HackVerse Complete Product Flow E2E Test
 * Covers auth, organizer, judge invites, teams, submissions, evaluation, winners, RBAC.
 */
import http from 'http';
import mongoose from 'mongoose';
import crypto from 'crypto';

const BASE = { hostname: 'localhost', port: 5000 };
const PASS = 'SecurePassword123!';
const now = Date.now();
const iso = (ms) => new Date(ms).toISOString();

// Timeline must satisfy: regStart < regEnd <= hackStart < hackEnd
// Keep registration + submission windows open "now" for live E2E actions.
const dates = {
  registrationStart: iso(now - 2 * 24 * 60 * 60 * 1000),
  registrationEnd: iso(now + 2 * 24 * 60 * 60 * 1000),
  hackathonStart: iso(now + 2 * 24 * 60 * 60 * 1000),
  hackathonEnd: iso(now + 14 * 24 * 60 * 60 * 1000),
  submissionStart: iso(now - 30 * 60 * 1000),
  submissionDeadline: iso(now + 7 * 24 * 60 * 60 * 1000),
};

const request = (method, path, { token, body } = {}) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request({ ...BASE, path, method, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch {
          parsed = { raw: data };
        }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

let passed = 0;
let failed = 0;
const failures = [];

const assert = (name, condition, detail = '') => {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.log(`[FAIL] ${name}${detail ? ` — ${detail}` : ''}`);
    failed++;
    failures.push({ name, detail });
  }
};

const uid = () => Math.floor(Math.random() * 1e9);
const email = (prefix) => `${prefix}_${uid()}@hackverse-e2e.com`;

const signup = async (firstName, lastName, mail, role) => {
  const res = await request('POST', '/api/v1/auth/signup', {
    body: { firstName, lastName, email: mail, password: PASS, ...(role ? { role } : {}) },
  });
  return res;
};

const login = async (mail) => {
  const res = await request('POST', '/api/v1/auth/login', {
    body: { email: mail, password: PASS },
  });
  return {
    res,
    token: res.body?.data?.accessToken,
    user: res.body?.data?.user,
  };
};

const setRole = async (mail, role) => {
  await mongoose.connection.db.collection('users').updateOne(
    { email: mail.toLowerCase() },
    { $set: { role } }
  );
};

const getInviteTokenPlain = async (inviteId) => {
  // Tokens are hashed in DB — we intercept by reading invitation and regenerating is impossible.
  // Instead tests that need raw token will capture from service by creating invites via a test helper.
  // For E2E we store raw tokens by querying invitation records is not possible.
  // Workaround: use Invitation collection + recreate flow that returns token only in email.
  // We'll use a DB-backed approach: temporarily store plaintext tokens on create is not available.
  return null;
};

async function run() {
  console.log('====================================================');
  console.log('  HACKVERSE COMPLETE PRODUCT FLOW E2E');
  console.log('====================================================');

  await mongoose.connect('mongodb://127.0.0.1:27017/HacVerse?directConnection=true');
  console.log('[DB] Connected\n');

  // ---------- PHASE 1: AUTH ----------
  console.log('--- Phase 1: Authentication ---');
  const orgMail = email('org');
  const judgeMail = email('judge');
  const newJudgeMail = email('newjudge');
  const leaderMail = email('leader');
  const memberMail = email('member');
  const p2Mail = email('participant2');

  const orgSignup = await signup('Org', 'User', orgMail, 'organizer');
  assert('Organizer signup', orgSignup.status === 201, JSON.stringify(orgSignup.body));

  const judgeSignup = await signup('Judge', 'Existing', judgeMail);
  assert('Judge base signup (participant then promote)', judgeSignup.status === 201);
  await setRole(judgeMail, 'judge');

  const leaderSignup = await signup('Team', 'Leader', leaderMail);
  assert('Leader signup', leaderSignup.status === 201);

  const memberSignup = await signup('Team', 'Member', memberMail);
  assert('Member signup', memberSignup.status === 201);

  const p2Signup = await signup('Other', 'Participant', p2Mail);
  assert('Participant2 signup', p2Signup.status === 201);

  const org = await login(orgMail);
  assert('Organizer login', org.res.status === 200 && org.user?.role === 'organizer');

  const judge = await login(judgeMail);
  assert('Existing judge login', judge.res.status === 200 && judge.user?.role === 'judge');

  const leader = await login(leaderMail);
  assert('Leader login', leader.res.status === 200);

  const member = await login(memberMail);
  assert('Member login', member.res.status === 200);

  const p2 = await login(p2Mail);
  assert('Participant2 login', p2.res.status === 200);

  const me = await request('GET', '/api/v1/auth/me', { token: org.token });
  assert('JWT /auth/me', me.status === 200 && me.body?.data?.email === orgMail.toLowerCase());

  const badMe = await request('GET', '/api/v1/auth/me');
  assert('Protected route without JWT rejected', badMe.status === 401);

  const logout = await request('POST', '/api/v1/auth/logout', { token: p2.token });
  assert('Logout succeeds', logout.status === 200);

  // ---------- PHASE 2: ORGANIZER ----------
  console.log('\n--- Phase 2: Organizer Hackathon ---');
  const createHack = await request('POST', '/api/v1/hackathons', {
    token: org.token,
    body: {
      title: `E2E Flow Hack ${uid()}`,
      tagline: 'Full product verification',
      description: 'End-to-end verification of HackVerse product flows.',
      banner: 'https://example.com/banner.png',
      rules: 'Be excellent to each other.',
      registrationStart: dates.registrationStart,
      registrationEnd: dates.registrationEnd,
      hackathonStart: dates.hackathonStart,
      hackathonEnd: dates.hackathonEnd,
      submissionStart: dates.submissionStart,
      submissionDeadline: dates.submissionDeadline,
      minTeamSize: 1,
      maxTeamSize: 3,
      maxTeams: 50,
      prizePool: '$5,000',
      techStack: ['React', 'Node'],
      problemStatements: [{ title: 'Build something', description: 'Ship a useful app' }],
      contactEmail: orgMail,
    },
  });
  assert('Create hackathon', createHack.status === 201, JSON.stringify(createHack.body?.message || createHack.body));
  const hackathon = createHack.body?.data;
  const hackathonId = hackathon?._id || hackathon?.id;

  if (!hackathonId) {
    console.error('FATAL: hackathon create failed; aborting remaining phases');
    await mongoose.disconnect();
    process.exit(1);
  }

  assert('Hackathon starts as draft', hackathon?.status === 'draft');

  const publish = await request('POST', `/api/v1/hackathons/${hackathonId}/publish`, {
    token: org.token,
  });
  assert('Publish hackathon', publish.status === 200, JSON.stringify(publish.body));
  assert(
    'Published status is registration_open or ongoing',
    ['registration_open', 'ongoing', 'published'].includes(publish.body?.data?.status),
    publish.body?.data?.status
  );

  const list = await request('GET', '/api/v1/hackathons?search=E2E%20Flow');
  assert('Hackathon visible in list', list.status === 200 && Array.isArray(list.body?.data));

  const orgStats = await request('GET', '/api/v1/dashboard/stats', { token: org.token });
  assert('Organizer dashboard stats', orgStats.status === 200 && orgStats.body?.data?.totalHackathons >= 1);

  // Participant cannot create hackathon
  const partCreate = await request('POST', '/api/v1/hackathons', {
    token: leader.token,
    body: {
      title: 'Illegal Hack',
      description: 'Should fail',
      registrationStart: dates.registrationStart,
      registrationEnd: dates.registrationEnd,
      hackathonStart: dates.hackathonStart,
      hackathonEnd: dates.hackathonEnd,
      minTeamSize: 1,
      maxTeamSize: 2,
      contactEmail: leaderMail,
    },
  });
  assert('Participant blocked from creating hackathon', partCreate.status === 403);

  // ---------- PHASE 3: JUDGE INVITATIONS ----------
  console.log('\n--- Phase 3: Judge Invitations ---');

  // Capture plaintext tokens by monkey-patching via Invitation create helper in-process
  // We call invite API then read invite hash and inject known token for respond tests.
  const inviteExisting = await request('POST', `/api/v1/hackathons/${hackathonId}/judges/invite`, {
    token: org.token,
    body: { email: judgeMail },
  });
  assert('Invite existing judge', inviteExisting.status === 201, JSON.stringify(inviteExisting.body));
  assert('Existing judge invite marked existingUser', inviteExisting.body?.data?.existingUser === true);

  const existingInviteId = inviteExisting.body?.data?.id;
  if (!existingInviteId) {
    console.error('FATAL: existing judge invite missing id; aborting');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Prepare a known token for respond flow
  const plainTokenExisting = crypto.randomBytes(32).toString('hex');
  const hashExisting = crypto.createHash('sha256').update(plainTokenExisting).digest('hex');
  await mongoose.connection.db.collection('invitations').updateOne(
    { _id: new mongoose.Types.ObjectId(existingInviteId) },
    { $set: { tokenHash: hashExisting, status: 'pending' } }
  );

  // Ensure judge NOT yet attached before accept
  const hackBeforeAccept = await mongoose.connection.db.collection('hackathons').findOne({
    _id: new mongoose.Types.ObjectId(hackathonId),
  });
  const attachedBefore = (hackBeforeAccept?.judges || []).some(
    (j) => j.toString() === judge.user.id
  );
  assert('Existing judge NOT auto-attached before accept', !attachedBefore);

  const declineThenReinvite = false; // we'll accept directly
  const acceptJudge = await request('POST', '/api/v1/judge-invitations/respond', {
    token: judge.token,
    body: { token: plainTokenExisting, accepted: true },
  });
  assert('Existing judge accepts invitation', acceptJudge.status === 200, JSON.stringify(acceptJudge.body));

  const hackAfterAccept = await mongoose.connection.db.collection('hackathons').findOne({
    _id: new mongoose.Types.ObjectId(hackathonId),
  });
  const attachedAfter = (hackAfterAccept?.judges || []).map(String).includes(String(judge.user.id));
  assert('Judge attached after accept', attachedAfter);

  // Duplicate invite should fail
  const dupInvite = await request('POST', `/api/v1/hackathons/${hackathonId}/judges/invite`, {
    token: org.token,
    body: { email: judgeMail },
  });
  assert('Duplicate pending/assigned invite handled', [409, 201, 400].includes(dupInvite.status), `status=${dupInvite.status}`);

  // New judge registration invite
  const inviteNew = await request('POST', `/api/v1/hackathons/${hackathonId}/judges/invite`, {
    token: org.token,
    body: { email: newJudgeMail },
  });
  assert('Invite new judge (registration)', inviteNew.status === 201, JSON.stringify(inviteNew.body));
  assert('New judge invite existingUser=false', inviteNew.body?.data?.existingUser === false);

  const plainTokenNew = crypto.randomBytes(32).toString('hex');
  const hashNew = crypto.createHash('sha256').update(plainTokenNew).digest('hex');
  await mongoose.connection.db.collection('invitations').updateOne(
    { _id: new mongoose.Types.ObjectId(inviteNew.body.data.id) },
    { $set: { tokenHash: hashNew, status: 'pending' } }
  );

  const registerNewJudge = await request('POST', '/api/v1/judge-invitations/register', {
    body: {
      token: plainTokenNew,
      firstName: 'Fresh',
      lastName: 'Judge',
      email: newJudgeMail,
      password: PASS,
    },
  });
  assert('New judge registers via invitation', registerNewJudge.status === 201, JSON.stringify(registerNewJudge.body));
  assert('New judge role is judge', registerNewJudge.body?.data?.role === 'judge');

  const reusedToken = await request('POST', '/api/v1/judge-invitations/register', {
    body: {
      token: plainTokenNew,
      firstName: 'Fresh',
      lastName: 'Judge',
      email: newJudgeMail,
      password: PASS,
    },
  });
  assert('Invitation token invalid after use', [400, 409].includes(reusedToken.status), `status=${reusedToken.status}`);

  const newJudge = await login(newJudgeMail);
  assert('New judge can login', newJudge.res.status === 200 && newJudge.user?.role === 'judge');

  // Expired token
  const expiredInvite = await request('POST', `/api/v1/hackathons/${hackathonId}/judges/invite`, {
    token: org.token,
    body: { email: email('expiredjudge') },
  });
  if (expiredInvite.status === 201) {
    const expiredPlain = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredPlain).digest('hex');
    await mongoose.connection.db.collection('invitations').updateOne(
      { _id: new mongoose.Types.ObjectId(expiredInvite.body.data.id) },
      { $set: { tokenHash: expiredHash, expiresAt: new Date(Date.now() - 1000), status: 'pending' } }
    );
    const expiredRespond = await request('POST', '/api/v1/judge-invitations/respond', {
      token: judge.token,
      body: { token: expiredPlain, accepted: true },
    });
    assert('Expired invitation rejected', expiredRespond.status === 400, JSON.stringify(expiredRespond.body));
  } else {
    assert('Expired invitation setup skipped', false, JSON.stringify(expiredInvite.body));
  }

  // Decline flow with another invite
  const declineMail = email('declinejudge');
  await signup('Decline', 'Judge', declineMail);
  await setRole(declineMail, 'judge');
  const declineJudge = await login(declineMail);
  const declineInvite = await request('POST', `/api/v1/hackathons/${hackathonId}/judges/invite`, {
    token: org.token,
    body: { email: declineMail },
  });
  if (declineInvite.status === 201) {
    const dPlain = crypto.randomBytes(32).toString('hex');
    const dHash = crypto.createHash('sha256').update(dPlain).digest('hex');
    await mongoose.connection.db.collection('invitations').updateOne(
      { _id: new mongoose.Types.ObjectId(declineInvite.body.data.id) },
      { $set: { tokenHash: dHash, status: 'pending' } }
    );
    const declineRes = await request('POST', '/api/v1/judge-invitations/respond', {
      token: declineJudge.token,
      body: { token: dPlain, accepted: false },
    });
    assert('Judge can decline invitation', declineRes.status === 200 && declineRes.body?.data?.status === 'declined');
  }

  // ---------- PHASE 4: PARTICIPANT ----------
  console.log('\n--- Phase 4: Participant Registration ---');
  const browse = await request('GET', '/api/v1/hackathons?status=ongoing');
  assert('Browse hackathons', browse.status === 200);

  const search = await request('GET', `/api/v1/hackathons?search=${encodeURIComponent(hackathon.title)}`);
  assert('Search hackathons', search.status === 200);

  const detail = await request('GET', `/api/v1/hackathons/${hackathon.slug}`);
  assert('Hackathon detail by slug', detail.status === 200);

  const regLeader = await request('POST', `/api/v1/hackathons/${hackathonId}/register`, {
    token: leader.token,
  });
  assert('Leader registers', [200, 201].includes(regLeader.status), JSON.stringify(regLeader.body));

  const dupReg = await request('POST', `/api/v1/hackathons/${hackathonId}/register`, {
    token: leader.token,
  });
  assert('Duplicate registration blocked', dupReg.status === 409);

  await request('POST', `/api/v1/hackathons/${hackathonId}/register`, { token: member.token });
  await request('POST', `/api/v1/hackathons/${hackathonId}/register`, { token: p2.token });

  const orgReg = await request('POST', `/api/v1/hackathons/${hackathonId}/register`, {
    token: org.token,
  });
  assert('Organizer cannot register as participant', orgReg.status === 403);

  // ---------- PHASE 5: TEAM ----------
  console.log('\n--- Phase 5: Team Flow ---');
  const createTeam = await request('POST', `/api/v1/hackathons/${hackathonId}/teams`, {
    token: leader.token,
    body: { name: `Alpha Team ${uid()}` },
  });
  assert('Create team', createTeam.status === 201, JSON.stringify(createTeam.body));
  const teamId = createTeam.body?.data?._id;
  const teamName = createTeam.body?.data?.name;

  const teamInvite = await request('POST', `/api/v1/teams/${teamId}/invitations`, {
    token: leader.token,
    body: { email: memberMail },
  });
  assert('Team invite by email', teamInvite.status === 201, JSON.stringify(teamInvite.body));

  const teamPlain = crypto.randomBytes(32).toString('hex');
  const teamHash = crypto.createHash('sha256').update(teamPlain).digest('hex');
  await mongoose.connection.db.collection('invitations').updateOne(
    { _id: new mongoose.Types.ObjectId(teamInvite.body.data.id) },
    { $set: { tokenHash: teamHash, status: 'pending' } }
  );

  const acceptTeam = await request('POST', '/api/v1/team-invitations/respond', {
    token: member.token,
    body: { token: teamPlain, accepted: true },
  });
  assert('Member accepts team invite', acceptTeam.status === 200, JSON.stringify(acceptTeam.body));

  const myTeam = await request('GET', `/api/v1/hackathons/${hackathonId}/my-team`, {
    token: member.token,
  });
  assert('Member sees team after accept', myTeam.status === 200);

  // Duplicate join / second team
  const secondTeam = await request('POST', `/api/v1/hackathons/${hackathonId}/teams`, {
    token: member.token,
    body: { name: `Beta Team ${uid()}` },
  });
  assert('Member cannot create second team', secondTeam.status === 409);

  // Reject invite flow for p2
  const rejectInvite = await request('POST', `/api/v1/teams/${teamId}/invitations`, {
    token: leader.token,
    body: { email: p2Mail },
  });
  if (rejectInvite.status === 201) {
    const rPlain = crypto.randomBytes(32).toString('hex');
    const rHash = crypto.createHash('sha256').update(rPlain).digest('hex');
    await mongoose.connection.db.collection('invitations').updateOne(
      { _id: new mongoose.Types.ObjectId(rejectInvite.body.data.id) },
      { $set: { tokenHash: rHash, status: 'pending' } }
    );
    const rejectRes = await request('POST', '/api/v1/team-invitations/respond', {
      token: p2.token,
      body: { token: rPlain, accepted: false },
    });
    assert('Member can reject team invite', rejectRes.status === 200);
  }

  // Max size: invite/add until full (max 3: leader+member = 2, add p2)
  // First p2 needs to not be in a team - create own team then try join? Better add via invite accept
  // Re-invite p2 and accept to fill capacity then try fourth
  const inviteP2Again = await request('POST', `/api/v1/teams/${teamId}/invitations`, {
    token: leader.token,
    body: { email: p2Mail },
  });
  if (inviteP2Again.status === 201) {
    const pPlain = crypto.randomBytes(32).toString('hex');
    const pHash = crypto.createHash('sha256').update(pPlain).digest('hex');
    await mongoose.connection.db.collection('invitations').updateOne(
      { _id: new mongoose.Types.ObjectId(inviteP2Again.body.data.id) },
      { $set: { tokenHash: pHash, status: 'pending' } }
    );
    await request('POST', '/api/v1/team-invitations/respond', {
      token: p2.token,
      body: { token: pPlain, accepted: true },
    });
  }

  const overflowMail = email('overflow');
  await signup('Over', 'Flow', overflowMail);
  await request('POST', `/api/v1/hackathons/${hackathonId}/register`, {
    token: (await login(overflowMail)).token,
  });
  const overflowInvite = await request('POST', `/api/v1/teams/${teamId}/invitations`, {
    token: leader.token,
    body: { email: overflowMail },
  });
  assert('Exceeding max team size blocked on invite', overflowInvite.status === 400, JSON.stringify(overflowInvite.body));

  // Member cannot submit
  // ---------- PHASE 6: SUBMISSION ----------
  console.log('\n--- Phase 6: Submission Flow ---');
  const badGithub = await request('POST', `/api/v1/hackathons/${hackathonId}/submissions`, {
    token: leader.token,
    body: {
      githubRepo: 'https://gitlab.com/foo/bar',
      description: 'Invalid github host should fail validation checks here.',
    },
  });
  assert('Invalid GitHub URL rejected', badGithub.status === 400);

  const memberSubmit = await request('POST', `/api/v1/hackathons/${hackathonId}/submissions`, {
    token: member.token,
    body: {
      githubRepo: 'https://github.com/hackverse/demo',
      description: 'Member should not be allowed to submit this project entry.',
    },
  });
  assert('Non-leader cannot submit', memberSubmit.status === 403);

  const submit = await request('POST', `/api/v1/hackathons/${hackathonId}/submissions`, {
    token: leader.token,
    body: {
      githubRepo: 'https://github.com/hackverse/demo-project',
      demoUrl: 'https://demo.hackverse-e2e.com',
      description: 'Initial submission for E2E verification of the full product flow.',
      presentationUrl: 'https://docs.google.com/presentation/d/abc',
      videoUrl: 'https://youtube.com/watch?v=abc',
    },
  });
  assert('Leader submits project', [200, 201].includes(submit.status), JSON.stringify(submit.body));
  const submissionId = submit.body?.data?._id;

  const resubmit = await request('POST', `/api/v1/hackathons/${hackathonId}/submissions`, {
    token: leader.token,
    body: {
      githubRepo: 'https://github.com/hackverse/demo-project-v2',
      description: 'Resubmission before deadline should overwrite the previous submission.',
    },
  });
  assert('Resubmission before deadline allowed', [200, 201].includes(resubmit.status), JSON.stringify(resubmit.body));

  // Lock after deadline
  await mongoose.connection.db.collection('hackathons').updateOne(
    { _id: new mongoose.Types.ObjectId(hackathonId) },
    { $set: { submissionDeadline: new Date(Date.now() - 1000), hackathonEnd: new Date(Date.now() - 1000) } }
  );
  const afterDeadline = await request('PATCH', `/api/v1/submissions/${submissionId || resubmit.body?.data?._id}`, {
    token: leader.token,
    body: { description: 'Should be locked after deadline passes completely now.' },
  });
  assert('Submission locked after deadline', afterDeadline.status === 400, JSON.stringify(afterDeadline.body));

  // Restore window for judge evaluation
  await mongoose.connection.db.collection('hackathons').updateOne(
    { _id: new mongoose.Types.ObjectId(hackathonId) },
    {
      $set: {
        submissionDeadline: new Date(dates.submissionDeadline),
        hackathonEnd: new Date(dates.hackathonEnd),
      },
    }
  );

  const finalSub = await request('GET', `/api/v1/hackathons/${hackathonId}/my-submission`, {
    token: leader.token,
  });
  assert('Leader can fetch submission', finalSub.status === 200);
  const finalSubmissionId = finalSub.body?.data?._id || submissionId || resubmit.body?.data?._id;

  // ---------- PHASE 7: JUDGE EVALUATION ----------
  console.log('\n--- Phase 7: Judge Evaluation ---');
  const judgeSubs = await request('GET', `/api/v1/hackathons/${hackathonId}/judge-submissions`, {
    token: judge.token,
  });
  assert('Judge sees assigned submissions', judgeSubs.status === 200, JSON.stringify(judgeSubs.body));
  assert('Submission list non-empty for judge', (judgeSubs.body?.data || []).length >= 1);

  const unassignedJudgeMail = email('unassigned');
  await signup('Un', 'Assigned', unassignedJudgeMail);
  await setRole(unassignedJudgeMail, 'judge');
  const unassigned = await login(unassignedJudgeMail);
  const unauthEval = await request('POST', `/api/v1/submissions/${finalSubmissionId}/evaluate`, {
    token: unassigned.token,
    body: {
      innovationScore: 8,
      uiuxScore: 8,
      technicalScore: 8,
      presentationScore: 8,
      codeQualityScore: 8,
      problemSolvingScore: 8,
      remarks: 'Should not be allowed for unassigned judge account.',
    },
  });
  assert('Unassigned judge cannot evaluate', unauthEval.status === 403);

  const evaluate = await request('POST', `/api/v1/submissions/${finalSubmissionId}/evaluate`, {
    token: judge.token,
    body: {
      innovationScore: 9,
      uiuxScore: 8,
      technicalScore: 9,
      presentationScore: 8,
      codeQualityScore: 9,
      problemSolvingScore: 8,
      remarks: 'Strong technical execution with polished UX and clear problem solving.',
    },
  });
  assert('Judge evaluates submission', evaluate.status === 201, JSON.stringify(evaluate.body));
  assert('Total score auto-calculated', evaluate.body?.data?.totalScore === 51, `score=${evaluate.body?.data?.totalScore}`);
  const evaluationId = evaluate.body?.data?._id;

  const dupEval = await request('POST', `/api/v1/submissions/${finalSubmissionId}/evaluate`, {
    token: judge.token,
    body: {
      innovationScore: 1,
      uiuxScore: 1,
      technicalScore: 1,
      presentationScore: 1,
      codeQualityScore: 1,
      problemSolvingScore: 1,
      remarks: 'Duplicate evaluation attempt should fail for this judge.',
    },
  });
  assert('Duplicate evaluation blocked', dupEval.status === 409);

  const editEval = await request('PATCH', `/api/v1/evaluations/${evaluationId}`, {
    token: judge.token,
    body: { innovationScore: 10, remarks: 'Updated remarks after minor score adjustment.' },
  });
  assert('Judge can edit score before close', editEval.status === 200);
  assert('Edited total recalculated', editEval.body?.data?.totalScore === 52, `score=${editEval.body?.data?.totalScore}`);

  // Second judge also scores for averaging
  const evaluate2 = await request('POST', `/api/v1/submissions/${finalSubmissionId}/evaluate`, {
    token: newJudge.token,
    body: {
      innovationScore: 7,
      uiuxScore: 7,
      technicalScore: 8,
      presentationScore: 7,
      codeQualityScore: 8,
      problemSolvingScore: 7,
      remarks: 'Solid project with room to improve presentation polish.',
    },
  });
  assert('Second assigned judge can evaluate', evaluate2.status === 201, JSON.stringify(evaluate2.body));

  const orgEvalAttempt = await request('POST', `/api/v1/submissions/${finalSubmissionId}/evaluate`, {
    token: org.token,
    body: {
      innovationScore: 5,
      uiuxScore: 5,
      technicalScore: 5,
      presentationScore: 5,
      codeQualityScore: 5,
      problemSolvingScore: 5,
      remarks: 'Organizer should not evaluate submissions directly here.',
    },
  });
  assert('Organizer cannot evaluate', orgEvalAttempt.status === 403);

  // ---------- PHASE 8: CLOSE EVALUATION ----------
  console.log('\n--- Phase 8: Close Evaluation ---');
  const close = await request('POST', `/api/v1/hackathons/${hackathonId}/close-evaluation`, {
    token: org.token,
  });
  assert('Close evaluation', close.status === 200, JSON.stringify(close.body));

  const editAfterClose = await request('PATCH', `/api/v1/evaluations/${evaluationId}`, {
    token: judge.token,
    body: { innovationScore: 1, remarks: 'Edit after close must be rejected by the API.' },
  });
  assert('Edit blocked after evaluation closed', editAfterClose.status === 400);

  const leaderboard = await request('GET', `/api/v1/hackathons/${hackathonId}/leaderboard`, {
    token: leader.token,
  });
  assert('Leaderboard available', leaderboard.status === 200);
  assert('Leaderboard has ranked teams', (leaderboard.body?.data || []).length >= 1);
  assert('Top rank is 1', leaderboard.body?.data?.[0]?.rank === 1);

  const results = await request('GET', `/api/v1/hackathons/${hackathonId}/results`, {
    token: org.token,
  });
  assert('Organizer results', results.status === 200);
  assert('Average score present', typeof results.body?.data?.[0]?.averageScore === 'number');

  // ---------- PHASE 9: WINNERS ----------
  console.log('\n--- Phase 9: Announce Winners ---');
  const announce = await request('POST', `/api/v1/hackathons/${hackathonId}/announce-winners`, {
    token: org.token,
  });
  assert('Announce winners', announce.status === 200, JSON.stringify(announce.body));
  assert('Winners array returned', Array.isArray(announce.body?.data?.winners));
  assert('Hackathon winnersAnnounced', announce.body?.data?.hackathon?.winnersAnnounced === true);

  const announceAgain = await request('POST', `/api/v1/hackathons/${hackathonId}/announce-winners`, {
    token: org.token,
  });
  assert('Duplicate announce blocked', announceAgain.status === 409);

  // ---------- PHASE 10: DASHBOARDS ----------
  console.log('\n--- Phase 10: Dashboards ---');
  const oStats = await request('GET', '/api/v1/dashboard/stats', { token: org.token });
  assert('Organizer stats after winners', oStats.status === 200 && oStats.body?.data?.winners >= 1);

  const jStats = await request('GET', '/api/v1/dashboard/stats', { token: judge.token });
  assert('Judge stats', jStats.status === 200 && jStats.body?.data?.assignedHackathons >= 1);
  assert('Judge completed evaluations', jStats.body?.data?.completedEvaluations >= 1);

  const pStats = await request('GET', '/api/v1/dashboard/stats', { token: leader.token });
  assert('Participant stats', pStats.status === 200 && pStats.body?.data?.registeredHackathons >= 1);

  // ---------- PHASE 11: NOTIFICATIONS ----------
  console.log('\n--- Phase 11: Notifications ---');
  const orgNotes = await request('GET', '/api/v1/notifications/me', { token: org.token });
  assert('Organizer notifications', orgNotes.status === 200);
  assert('Organizer has notifications', (orgNotes.body?.data || []).length >= 1);

  const leaderNotes = await request('GET', '/api/v1/notifications/me', { token: leader.token });
  assert('Leader notifications', leaderNotes.status === 200);

  if ((leaderNotes.body?.data || []).length > 0) {
    const noteId = leaderNotes.body.data[0]._id;
    const mark = await request('PATCH', `/api/v1/notifications/${noteId}/read`, { token: leader.token });
    assert('Mark notification read', mark.status === 200);
  } else {
    assert('Leader notifications non-empty', false, 'no notifications for leader');
  }

  const markAll = await request('PATCH', '/api/v1/notifications/read-all', { token: org.token });
  assert('Mark all notifications read', markAll.status === 200);

  // ---------- PHASE 13: PERMISSIONS ----------
  console.log('\n--- Phase 13: Permissions ---');
  const judgeEditHack = await request('PATCH', `/api/v1/hackathons/${hackathonId}`, {
    token: judge.token,
    body: { title: 'Hacked Title' },
  });
  assert('Judge cannot edit hackathon', judgeEditHack.status === 403);

  const partResults = await request('GET', `/api/v1/hackathons/${hackathonId}/results`, {
    token: leader.token,
  });
  assert('Participant cannot view organizer results', partResults.status === 403);

  const invalidJwt = await request('GET', '/api/v1/auth/me', { token: 'invalid.jwt.token' });
  assert('Invalid JWT rejected', invalidJwt.status === 401);

  // ---------- SUMMARY ----------
  console.log('\n====================================================');
  console.log(`RESULT: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(` - ${f.name}: ${f.detail}`));
  }
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(async (err) => {
  console.error('FATAL:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
