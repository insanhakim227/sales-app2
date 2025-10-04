const prisma = require('../prisma');


async function createAudit(userId, action, entity, entityId, details) {
try {
await prisma.auditLog.create({
data: {
userId,
action,
entity,
entityId,
details,
},
});
} catch (err) {
console.error('Audit log error', err);
}
}


module.exports = createAudit;