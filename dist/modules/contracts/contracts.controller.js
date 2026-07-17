import * as contracts from './contracts.service.js';
import * as milestones from './milestones.service.js';
import * as hours from './hours.service.js';
import * as feedback from './feedback.service.js';
export async function hire(req, res) {
    res.status(201).json(await contracts.hire(req.user.id, req.body));
}
export async function listMine(req, res) {
    res.json(await contracts.listMine(req.user.id));
}
export async function get(req, res) {
    res.json(await contracts.get(req.params.id, req.user.id));
}
export async function accept(req, res) {
    res.json(await contracts.accept(req.params.id, req.user.id));
}
export async function decline(req, res) {
    res.json(await contracts.decline(req.params.id, req.user.id));
}
export async function withdraw(req, res) {
    res.json(await contracts.withdraw(req.params.id, req.user.id));
}
export async function end(req, res) {
    res.json(await contracts.end(req.params.id, req.user.id));
}
export async function addMilestone(req, res) {
    res.status(201).json(await milestones.addMilestone(req.params.id, req.user.id, req.body));
}
export async function updateMilestone(req, res) {
    res.json(await milestones.updateMilestone(req.params.id, req.user.id, req.body));
}
export async function deleteMilestone(req, res) {
    await milestones.deleteMilestone(req.params.id, req.user.id);
    res.status(204).end();
}
export async function fundMilestone(req, res) {
    res.json(await milestones.fund(req.params.id, req.user.id));
}
export async function submitMilestone(req, res) {
    res.json(await milestones.submit(req.params.id, req.user.id, req.body.message));
}
export async function requestChanges(req, res) {
    res.json(await milestones.requestChanges(req.params.id, req.user.id, req.body.note));
}
export async function approveMilestone(req, res) {
    res.json(await milestones.approve(req.params.id, req.user.id));
}
export async function logHours(req, res) {
    res.status(201).json(await hours.logHours(req.params.id, req.user.id, req.body));
}
export async function removeEntry(req, res) {
    await hours.removeEntry(req.params.id, req.user.id);
    res.status(204).end();
}
export async function payHours(req, res) {
    res.json(await hours.payLoggedHours(req.params.id, req.user.id));
}
export async function leaveFeedback(req, res) {
    res.status(201).json(await feedback.leaveFeedback(req.params.id, req.user.id, req.body));
}
//# sourceMappingURL=contracts.controller.js.map