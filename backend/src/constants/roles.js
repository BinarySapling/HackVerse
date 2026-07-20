/**
 * @desc Catalog of supported user roles inside the HackVerse platform
 */
const Roles = {
  ADMIN: "admin",
  ORGANIZER: "organizer",
  JUDGE: "judge",
  PARTICIPANT: "participant"
};

// Ensure roles dictionary is immutable
Object.freeze(Roles);

export default Roles;
