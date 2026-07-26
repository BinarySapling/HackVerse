import http from 'http';
import mongoose from 'mongoose';

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(data || '{}')
        });
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const runE2ETests = async () => {
  console.log("====================================================");
  console.log("      STARTING FULL END-TO-END VERIFICATION FLOW    ");
  console.log("====================================================");

  let passed = 0;
  let failed = 0;
  const bugs = [];

  const recordResult = (name, condition, errorMsg = "", responseBody = null) => {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.log(`[FAIL] ${name} ${errorMsg ? `- Reason: ${errorMsg}` : ""}`);
      if (responseBody) console.log(`   --> Response:`, JSON.stringify(responseBody));
      failed++;
      bugs.push(name);
    }
  };

  const dbUri = "mongodb://127.0.0.1:27017/HacVerse?directConnection=true";
  console.log("[DB] Connecting to MongoDB...");
  await mongoose.connect(dbUri);
  console.log("[DB] MongoDB connected successfully.");

  // Helper to update user roles in DB
  const setRole = async (email, role) => {
    await mongoose.connection.db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { role } }
    );
    console.log(`[DB] Updated user role to '${role}' for ${email}`);
  };

  // --- PHASE 1: ADMIN LOGIN ---
  console.log("\n--- Phase 1: Admin Authorization ---");
  const adminEmail = `admin_e2e_${Math.floor(Math.random() * 100000)}@example.com`;
  
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    firstName: "Platform",
    lastName: "Admin",
    email: adminEmail,
    password: "SecurePassword123!"
  });

  await setRole(adminEmail, 'admin');

  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: adminEmail, password: "SecurePassword123!" });

  recordResult(
    "Admin login successful",
    adminLogin.statusCode === 200 && adminLogin.body.data.user.role === 'admin'
  );
  const adminToken = adminLogin.body.data ? adminLogin.body.data.accessToken : "";

  // --- PHASE 2: ORGANIZER CREATES HACKATHON ---
  console.log("\n--- Phase 2: Organizer Signup/Login & Hackathon Setup ---");
  const orgEmail = `org_${Math.floor(Math.random() * 100000)}@example.com`;
  
  const orgSignup = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    firstName: "Organizer",
    lastName: "Event",
    email: orgEmail,
    password: "SecurePassword123!"
  });
  recordResult("Organizer signup returns 201 Created", orgSignup.statusCode === 201);

  await setRole(orgEmail, 'organizer');

  const orgLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: orgEmail, password: "SecurePassword123!" });
  recordResult("Organizer login returns 200 OK", orgLogin.statusCode === 200);
  const organizerToken = orgLogin.body.data ? orgLogin.body.data.accessToken : "";

  // Create Hackathon 1 (Max team size 2 to test limits)
  const hackPayload1 = {
    title: "Limit Hackathon " + Math.floor(Math.random() * 100000),
    tagline: "Bounds checks",
    description: "Verify team limit validations.",
    registrationStart: "2026-07-18T00:00:00Z",
    registrationEnd: "2026-07-25T00:00:00Z",
    hackathonStart: "2026-07-26T00:00:00Z",
    hackathonEnd: "2026-07-30T00:00:00Z",
    minTeamSize: 1,
    maxTeamSize: 2, // limit is 2
    contactEmail: "limit@hackverse.com"
  };

  const createHackRes1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/hackathons',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizerToken}`
    }
  }, hackPayload1);
  recordResult("Hackathon created successfully", createHackRes1.statusCode === 201);
  const hackathonId = createHackRes1.body.data ? createHackRes1.body.data._id : "";

  // --- PHASE 3: PARTICIPANTS CREATION ---
  console.log("\n--- Phase 3: Participants Creation ---");
  const createParticipant = async (prefix) => {
    const email = `${prefix}_${Math.floor(Math.random() * 100000)}@example.com`;
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      firstName: prefix,
      lastName: "Tester",
      email,
      password: "SecurePassword123!"
    });
    const login = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, password: "SecurePassword123!" });
    return { token: login.body.data.accessToken, id: login.body.data.user.id };
  };

  const leader = await createParticipant("leader");
  const member1 = await createParticipant("member1");
  const member2 = await createParticipant("member2");
  recordResult("Multiple participant accounts created and logged in", !!leader.token && !!member1.token && !!member2.token);

  // --- PHASE 4: REGISTRATION ---
  console.log("\n--- Phase 4: Registration Window and Rules ---");
  const reg1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Participant registered successfully (201 Created)", reg1.statusCode === 201);
  const registrationId = reg1.body.data ? reg1.body.data._id : "";

  const dupReg = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Duplicate registration rejected (409 Conflict)", dupReg.statusCode === 409);

  const orgReg = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${organizerToken}` }
  });
  recordResult("Organizer registration blocked (403 Forbidden)", orgReg.statusCode === 403);

  // Cancel and Re-register using correct patch url
  const cancelReg = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/registrations/${registrationId}/cancel`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Cancel registration succeeds (200 OK)", cancelReg.statusCode === 200);

  const reReg = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Re-registration updates cancelled record state (200 OK)", reReg.statusCode === 200);

  // Register remaining members
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${member1.token}` }
  });
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${member2.token}` }
  });

  // --- PHASE 5: TEAM MANAGEMENT ---
  console.log("\n--- Phase 5: Team Management and Capacity Constraints ---");
  const createTeamRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/teams`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { name: "Limits Team" });
  recordResult("Leader successfully created team", createTeamRes.statusCode === 201);
  const teamId = createTeamRes.body.data ? createTeamRes.body.data._id : "";

  // Add Member 1
  const addMem1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${teamId}/members`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { memberId: member1.id });
  recordResult("Added Member 1 to the team successfully", addMem1.statusCode === 200);

  // Add Member 2 when team is at maximum size (Limit = 2)
  const addMem2Fail = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${teamId}/members`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { memberId: member2.id });
  recordResult("Adding Member 2 exceeds max team size limits (400 Bad Request)", addMem2Fail.statusCode === 400);

  // Try creating another team by Leader (one team per participant limit)
  const dupTeamRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/teams`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { name: "Another Limits Team" });
  recordResult("Leader cannot belong to multiple teams in same hackathon (409 Conflict)", dupTeamRes.statusCode === 409);

  // Remove Member 1
  const removeMem1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${teamId}/remove-member`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { memberId: member1.id });
  recordResult("Remove member by leader succeeds", removeMem1.statusCode === 200);

  // Re-add Member 1, then Member 1 leaves
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${teamId}/members`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { memberId: member1.id });

  const leaveTeam = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${teamId}/leave`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${member1.token}` }
  });
  recordResult("Member leaves team succeeds", leaveTeam.statusCode === 200);

  // Delete team
  const deleteTeam = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${teamId}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Soft delete team succeeds", deleteTeam.statusCode === 200);

  // Create final team with larger size to complete the flow (Max size = 4)
  const hackPayload2 = {
    title: "Judging Hackathon " + Math.floor(Math.random() * 100000),
    tagline: "Grades setup",
    description: "Evaluations e2e testing.",
    registrationStart: "2026-07-18T00:00:00Z",
    registrationEnd: "2026-07-25T00:00:00Z",
    hackathonStart: "2026-07-26T00:00:00Z",
    hackathonEnd: "2026-07-30T00:00:00Z",
    minTeamSize: 1,
    maxTeamSize: 4,
    contactEmail: "grades@hackverse.com"
  };

  const createHackRes2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/hackathons',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizerToken}`
    }
  }, hackPayload2);
  const finalHackathonId = createHackRes2.body.data._id;

  // Register Leader & Member 1 for final hackathon
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${member1.token}` }
  });

  const finalTeamRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/teams`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { name: "Final Team" });
  const finalTeamId = finalTeamRes.body.data._id;

  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/teams/${finalTeamId}/members`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { memberId: member1.id });

  // --- PHASE 6: SUBMISSION ---
  console.log("\n--- Phase 6: Project Submissions ---");
  const submissionPayload = {
    githubRepo: "https://github.com/test/project",
    demoUrl: "https://project-demo.vercel.app",
    description: "Evaluations testing demo submission project."
  };

  const submitRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/submissions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, submissionPayload);
  recordResult("Project submission successfully created", submitRes.statusCode === 201);
  const submissionId = submitRes.body.data ? submitRes.body.data._id : "";

  const dupSubmitRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/submissions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, submissionPayload);
  recordResult("Duplicate submission rejected (409 Conflict)", dupSubmitRes.statusCode === 409);

  // Update submission
  const updateSubRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/submissions/${submissionId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, { description: "An updated submission description details." });
  recordResult("Update submission details succeeds", updateSubRes.statusCode === 200);

  // --- PHASE 7: JUDGE EVALUATION ---
  console.log("\n--- Phase 7: Judge Assignment and Project Evaluation ---");
  const judgeEmail = `judge_${Math.floor(Math.random() * 100000)}@example.com`;
  
  await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    firstName: "John",
    lastName: "Judge",
    email: judgeEmail,
    password: "SecurePassword123!"
  });

  await setRole(judgeEmail, 'judge');

  const judgeLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: judgeEmail, password: "SecurePassword123!" });
  
  const judgeToken = judgeLogin.body.data ? judgeLogin.body.data.accessToken : "";
  const judgeUserId = judgeLogin.body.data && judgeLogin.body.data.user ? judgeLogin.body.data.user.id : "";
  recordResult("Judge login successful", judgeLogin.statusCode === 200, "", judgeLogin.body);

  // Assign Judge to Hackathon
  const assignJudgeRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/judges/${judgeUserId}`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${organizerToken}` }
  });
  recordResult("Organizer assigns judge to hackathon successfully", assignJudgeRes.statusCode === 200, "", assignJudgeRes.body);

  // Judge evaluates submission
  const evaluateRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/submissions/${submissionId}/evaluate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${judgeToken}`
    }
  }, {
    innovationScore: 8,
    technicalScore: 9,
    presentationScore: 7,
    remarks: "Perfect implementation."
  });
  recordResult("Judge evaluated submission successfully", evaluateRes.statusCode === 201);
  const evaluationId = evaluateRes.body.data ? evaluateRes.body.data._id : "";
  recordResult("Total score computed dynamically (8+9+7 = 24)", evaluateRes.body.data && evaluateRes.body.data.totalScore === 24);

  // Duplicate evaluation rejected
  const dupEvalRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/submissions/${submissionId}/evaluate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${judgeToken}`
    }
  }, {
    innovationScore: 8,
    technicalScore: 9,
    presentationScore: 7,
    remarks: "Perfect implementation."
  });
  recordResult("Duplicate evaluation rejected (409 Conflict)", dupEvalRes.statusCode === 409);

  // Update evaluation
  const updateEvalRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/evaluations/${evaluationId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${judgeToken}`
    }
  }, { innovationScore: 10 });
  recordResult("Update evaluation recalculates total score successfully", updateEvalRes.statusCode === 200 && updateEvalRes.body.data.totalScore === 26);

  // --- CROSS-MODULE AND NEGATIVE TESTS ---
  console.log("\n--- Phase 8: Cross-Module and Negative Validations ---");
  
  // Deleted team cannot submit projects
  const deletedTeamSubmit = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${hackathonId}/submissions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${leader.token}`
    }
  }, submissionPayload);
  recordResult("Deleted team cannot submit projects (403/404)", deletedTeamSubmit.statusCode === 403 || deletedTeamSubmit.statusCode === 404);

  // Judge cannot create team
  const judgeCreateTeam = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/teams`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${judgeToken}`
    }
  }, { name: "Judge Team" });
  recordResult("Judge is blocked from creating a team (403 Forbidden)", judgeCreateTeam.statusCode === 403);

  // Participant cannot assign judge
  const partAssignJudge = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/judges/${judgeUserId}`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Participant is blocked from assigning a judge (403 Forbidden)", partAssignJudge.statusCode === 403);

  // Organizer cannot evaluate project submission
  const orgEval = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/submissions/${submissionId}/evaluate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizerToken}`
    }
  }, {
    innovationScore: 8,
    technicalScore: 9,
    presentationScore: 7,
    remarks: "Perfect implementation."
  });
  recordResult("Organizer is blocked from evaluating submission (403 Forbidden)", orgEval.statusCode === 403);

  // Invalid JWT Token
  const invalidJwt = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${finalHackathonId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer invalid_token` }
  });
  recordResult("Request with invalid JWT returns 401 Unauthorized", invalidJwt.statusCode === 401);

  // Invalid ObjectId Format
  const invalidObjectId = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/invalid-id/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${leader.token}` }
  });
  recordResult("Request with invalid ObjectId format returns 400 Bad Request", invalidObjectId.statusCode === 400);

  // Expired Timelines validation (using past registrationDates hackathon)
  const expiredHack = {
    title: "Past Hackathon " + Math.floor(Math.random() * 100000),
    tagline: "Expired",
    description: "A hackathon where registration has passed.",
    registrationStart: "2026-07-01T00:00:00Z",
    registrationEnd: "2026-07-10T00:00:00Z",
    hackathonStart: "2026-07-11T00:00:00Z",
    hackathonEnd: "2026-07-15T00:00:00Z",
    minTeamSize: 1,
    maxTeamSize: 4,
    contactEmail: "past@hackverse.com"
  };

  const pastHackRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/hackathons',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${organizerToken}`
    }
  }, expiredHack);
  const pastHackId = pastHackRes.body.data._id;

  const pastReg = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/hackathons/${pastHackId}/register`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${member2.token}` }
  });
  recordResult("Registration fails if timeline registration window closed (400 Bad Request)", pastReg.statusCode === 400);

  // Close database connection
  await mongoose.disconnect();
  console.log("[DB] Disconnected from MongoDB.");

  // Close output formatting check
  console.log("\n====================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("====================================================");

  if (bugs.length > 0) {
    console.log("Bugs discovered:", bugs.join(", "));
  } else {
    console.log("System is fully stable and clean.");
  }
};

runE2ETests().catch(console.error);
