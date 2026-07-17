import * as jobsService from './jobs.service.js';
import * as savedService from './saved.service.js';
export async function list(req, res) {
    res.json(await jobsService.listJobs(req.query));
}
export async function mine(req, res) {
    res.json(await jobsService.listMyJobs(req.user.id));
}
export async function getOne(req, res) {
    res.json(await jobsService.getJob(req.params.id));
}
export async function create(req, res) {
    res.status(201).json(await jobsService.createJob(req.user.id, req.body));
}
export async function update(req, res) {
    res.json(await jobsService.updateJob(req.params.id, req.user.id, req.body));
}
export async function remove(req, res) {
    await jobsService.deleteJob(req.params.id, req.user.id);
    res.status(204).end();
}
export async function listSaved(req, res) {
    res.json(await savedService.listSaved(req.user.id));
}
export async function save(req, res) {
    await savedService.saveJob(req.user.id, req.params.id);
    res.status(204).end();
}
export async function unsave(req, res) {
    await savedService.unsaveJob(req.user.id, req.params.id);
    res.status(204).end();
}
//# sourceMappingURL=jobs.controller.js.map