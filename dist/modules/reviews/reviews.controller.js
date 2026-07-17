import * as service from './reviews.service.js';
export async function getForJob(req, res) {
    res.json(await service.getForJob(req.params.id));
}
export async function create(req, res) {
    res.status(201).json(await service.createReview(req.params.id, req.user.id, req.body));
}
//# sourceMappingURL=reviews.controller.js.map