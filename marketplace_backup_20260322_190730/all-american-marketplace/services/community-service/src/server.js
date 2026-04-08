require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit } = require("@aam/shared");

const PORT = process.env.COMMUNITY_SERVICE_PORT || 5900;

const app = makeApp("community-service", PORT, (app) => {
  app.get("/members", (_req, res) => {
    const members = readJson("community_members.json", []);
    res.json({ ok: true, members });
  });

  app.post("/members", authMiddleware, requireRole("admin"), (req, res) => {
    const {
      name,
      membershipType = "community",
      assembly = "",
      notes = "",
      linkedUserId = null,
      status = "active"
    } = req.body;

    if (!name) return res.status(400).json({ ok: false, error: "name required" });

    const members = readJson("community_members.json", []);
    const member = {
      id: nextId(members),
      name,
      membershipType,
      assembly,
      notes,
      linkedUserId,
      status,
      createdAt: new Date().toISOString()
    };
    members.push(member);
    writeJson("community_members.json", members);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "community_member_created",
      entityType: "community_member",
      entityId: member.id,
      payload: member
    });

    res.status(201).json({ ok: true, member });
  });

  app.get("/assemblies", (_req, res) => {
    const assemblies = readJson("assemblies.json", []);
    res.json({ ok: true, assemblies });
  });

  app.post("/assemblies", authMiddleware, requireRole("admin"), (req, res) => {
    const { name, region = "", notes = "" } = req.body;
    if (!name) return res.status(400).json({ ok: false, error: "name required" });

    const assemblies = readJson("assemblies.json", []);
    const assembly = {
      id: nextId(assemblies),
      name,
      region,
      notes,
      createdAt: new Date().toISOString()
    };
    assemblies.push(assembly);
    writeJson("assemblies.json", assemblies);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "assembly_created",
      entityType: "assembly",
      entityId: assembly.id,
      payload: assembly
    });

    res.status(201).json({ ok: true, assembly });
  });

  app.get("/service-roles", (_req, res) => {
    const roles = readJson("service_roles.json", []);
    res.json({ ok: true, roles });
  });

  app.post("/service-roles", authMiddleware, requireRole("admin"), (req, res) => {
    const { memberId, roleName, department = "", notes = "" } = req.body;
    if (!memberId || !roleName) {
      return res.status(400).json({ ok: false, error: "memberId, roleName required" });
    }

    const roles = readJson("service_roles.json", []);
    const role = {
      id: nextId(roles),
      memberId: Number(memberId),
      roleName,
      department,
      notes,
      createdAt: new Date().toISOString()
    };
    roles.push(role);
    writeJson("service_roles.json", roles);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "service_role_assigned",
      entityType: "service_role",
      entityId: role.id,
      payload: role
    });

    res.status(201).json({ ok: true, role });
  });
});

app.listen(PORT, () => {
  console.log(`Community Service running on http://127.0.0.1:${PORT}`);
});
