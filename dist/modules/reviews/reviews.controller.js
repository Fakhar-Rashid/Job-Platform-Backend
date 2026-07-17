import * as service from './reviews.service.js';
export async function getForJob(req, res) {
    res.json(await service.getForJob(req.params.id));
}
//# sourceMappingURL=reviews.controller.js.map