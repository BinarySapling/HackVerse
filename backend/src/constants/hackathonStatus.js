/**
 * @desc Catalog of standard states for a hackathon
 */
const HackathonStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  REGISTRATION_OPEN: "registration_open",
  ONGOING: "ongoing",
  JUDGING: "judging",
  COMPLETED: "completed",
  ARCHIVED: "archived"
};

Object.freeze(HackathonStatus);

export default HackathonStatus;
