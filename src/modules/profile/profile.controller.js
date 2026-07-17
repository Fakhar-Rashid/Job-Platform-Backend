import * as service from './profile.service.js';

export async function get(req, res) {
  res.json(await service.getFullProfile(req.params.id));
}

export async function updateCore(req, res) {
  res.json(await service.updateCore(req.user.id, req.body));
}

export async function updateSkills(req, res) {
  res.json(await service.updateSkills(req.user.id, req.body.skills));
}
