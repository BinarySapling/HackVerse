import assert from 'node:assert/strict';
import authRoutes from './src/routes/auth.routes.js';
import hackathonRoutes from './src/routes/hackathon.routes.js';
import registrationRoutes from './src/routes/registration.routes.js';
import teamRoutes from './src/routes/team.routes.js';
import submissionRoutes from './src/routes/submission.routes.js';
import evaluationRoutes from './src/routes/evaluation.routes.js';
import leaderboardRoutes from './src/routes/leaderboard.routes.js';
import authorize from './src/middleware/authorize.js';
import Roles from './src/constants/roles.js';
import { signupSchema } from './src/validators/auth.validator.js';

const ALL_ROLES = Object.values(Roles);

const routeModules = [
  { prefix: '/api/v1/auth', router: authRoutes },
  { prefix: '/api/v1/hackathons', router: hackathonRoutes },
  { prefix: '/api/v1', router: registrationRoutes },
  { prefix: '/api/v1', router: teamRoutes },
  { prefix: '/api/v1', router: submissionRoutes },
  { prefix: '/api/v1', router: evaluationRoutes },
  { prefix: '/api/v1', router: leaderboardRoutes }
];

const expectedMatrix = [
  ['POST', '/api/v1/auth/signup', []],
  ['POST', '/api/v1/auth/login', []],
  ['POST', '/api/v1/auth/refresh', []],
  ['POST', '/api/v1/auth/logout', []],
  ['GET', '/api/v1/auth/me', ALL_ROLES],
  ['GET', '/api/v1/hackathons/', []],
  ['GET', '/api/v1/hackathons/:slug', []],
  ['POST', '/api/v1/hackathons/', [Roles.ORGANIZER]],
  ['PATCH', '/api/v1/hackathons/:id', [Roles.ORGANIZER]],
  ['DELETE', '/api/v1/hackathons/:id', [Roles.ORGANIZER, Roles.ADMIN]],
  ['POST', '/api/v1/hackathons/:hackathonId/register', [Roles.PARTICIPANT]],
  ['GET', '/api/v1/registrations/me', [Roles.PARTICIPANT]],
  ['PATCH', '/api/v1/registrations/:id/cancel', [Roles.PARTICIPANT]],
  ['POST', '/api/v1/hackathons/:hackathonId/teams', [Roles.PARTICIPANT]],
  ['GET', '/api/v1/hackathons/:hackathonId/my-team', [Roles.PARTICIPANT]],
  ['PATCH', '/api/v1/teams/:teamId/members', [Roles.PARTICIPANT]],
  ['PATCH', '/api/v1/teams/:teamId/remove-member', [Roles.PARTICIPANT]],
  ['PATCH', '/api/v1/teams/:teamId/leave', [Roles.PARTICIPANT]],
  ['DELETE', '/api/v1/teams/:teamId', [Roles.PARTICIPANT, Roles.ADMIN]],
  ['POST', '/api/v1/hackathons/:hackathonId/submissions', [Roles.PARTICIPANT]],
  ['GET', '/api/v1/hackathons/:hackathonId/my-submission', [Roles.PARTICIPANT]],
  ['GET', '/api/v1/hackathons/:hackathonId/submissions', [Roles.ORGANIZER, Roles.ADMIN]],
  ['PATCH', '/api/v1/submissions/:submissionId', [Roles.PARTICIPANT]],
  ['DELETE', '/api/v1/submissions/:submissionId', [Roles.PARTICIPANT, Roles.ADMIN]],
  ['PATCH', '/api/v1/hackathons/:hackathonId/judges/:judgeId', [Roles.ORGANIZER, Roles.ADMIN]],
  ['POST', '/api/v1/submissions/:submissionId/evaluate', [Roles.JUDGE]],
  ['PATCH', '/api/v1/evaluations/:evaluationId', [Roles.JUDGE]],
  ['GET', '/api/v1/evaluations/me', [Roles.JUDGE]],
  ['GET', '/api/v1/hackathons/:hackathonId/evaluations', [Roles.ORGANIZER, Roles.ADMIN]],
  ['GET', '/api/v1/hackathons/:hackathonId/leaderboard', ALL_ROLES],
  ['GET', '/api/v1/hackathons/:hackathonId/results', [Roles.ORGANIZER, Roles.ADMIN]],
  ['GET', '/api/v1/hackathons/:hackathonId/my-result', [Roles.PARTICIPANT]]
];

const normalizePath = (prefix, path) => {
  if (path === '/') return `${prefix}/`;
  return `${prefix}${path}`;
};

const sortRoles = (roles) => [...roles].sort();

const actualRoutes = routeModules.flatMap(({ prefix, router }) => {
  return router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) => {
      const methodNames = Object.keys(layer.route.methods).map((method) => method.toUpperCase());
      const middlewareStack = layer.route.stack.map((entry) => entry.handle);
      const authIndex = middlewareStack.findIndex((handler) => handler.rbacRequiresAuthentication);
      const authorizeIndex = middlewareStack.findIndex((handler) => handler.rbacAllowedRoles);
      const allowedRoles = authorizeIndex >= 0
        ? middlewareStack[authorizeIndex].rbacAllowedRoles
        : [];

      return methodNames.map((method) => ({
        method,
        path: normalizePath(prefix, layer.route.path),
        authIndex,
        authorizeIndex,
        allowedRoles: [...allowedRoles]
      }));
    });
});

const actualByKey = new Map(actualRoutes.map((route) => [`${route.method} ${route.path}`, route]));

for (const [method, path, allowedRoles] of expectedMatrix) {
  const key = `${method} ${path}`;
  const actual = actualByKey.get(key);
  assert.ok(actual, `Missing route from RBAC audit matrix: ${key}`);
  assert.deepEqual(sortRoles(actual.allowedRoles), sortRoles(allowedRoles), `Allowed roles mismatch for ${key}`);

  if (allowedRoles.length > 0) {
    assert.ok(actual.authIndex >= 0, `Protected route is missing authenticate middleware: ${key}`);
    assert.ok(actual.authorizeIndex >= 0, `Protected route is missing authorize middleware: ${key}`);
    assert.ok(actual.authIndex < actual.authorizeIndex, `Authorize must run after authenticate for ${key}`);
  }
}

for (const actual of actualRoutes) {
  const key = `${actual.method} ${actual.path}`;
  assert.ok(
    expectedMatrix.some(([method, path]) => method === actual.method && path === actual.path),
    `Route missing from expected RBAC matrix: ${key}`
  );
}

for (const [method, path, allowedRoles] of expectedMatrix.filter((entry) => entry[2].length > 0)) {
  const deniedRoles = ALL_ROLES.filter((role) => !allowedRoles.includes(role));
  assert.ok(allowedRoles.length > 0, `${method} ${path} should allow at least one role`);
  assert.equal(allowedRoles.length + deniedRoles.length, ALL_ROLES.length, `${method} ${path} role partition is incomplete`);
}

const forbiddenMiddleware = authorize(Roles.PARTICIPANT);
assert.throws(
  () => forbiddenMiddleware(
    { requestId: 'rbac-test', user: { email: 'judge@example.com', role: Roles.JUDGE } },
    {},
    () => assert.fail('Denied role should not reach next()')
  ),
  (error) => error.statusCode === 403
);

const privilegedSignup = signupSchema.safeParse({
  firstName: 'Ada',
  lastName: 'Admin',
  email: 'ada@example.com',
  password: 'StrongPass1!',
  role: Roles.ADMIN
});
assert.equal(privilegedSignup.success, false, 'Public signup must reject privileged role requests');

const participantSignup = signupSchema.safeParse({
  firstName: 'Pat',
  lastName: 'Participant',
  email: 'pat@example.com',
  password: 'StrongPass1!',
  role: Roles.PARTICIPANT
});
assert.equal(participantSignup.success, true, 'Public signup should still accept participant registration');

console.table(expectedMatrix.map(([method, endpoint, allowedRoles]) => ({
  method,
  endpoint,
  allowedRoles: allowedRoles.length ? allowedRoles.join(', ') : 'public',
  deniedRoles: allowedRoles.length
    ? ALL_ROLES.filter((role) => !allowedRoles.includes(role)).join(', ') || 'none'
    : 'none'
})));

console.log(`RBAC verification passed for ${expectedMatrix.length} routes.`);
