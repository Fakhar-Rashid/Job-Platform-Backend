import * as bidsService from './bids.service.js';
export async function place(req, res) {
    res.status(201).json(await bidsService.placeBid(req.params.id, req.user.id, req.body));
}
export async function listForJob(req, res) {
    res.json(await bidsService.listJobBids(req.params.id, req.user.id));
}
export async function mine(req, res) {
    res.json(await bidsService.listMyBids(req.user.id));
}
export async function accept(req, res) {
    res.json(await bidsService.acceptBid(req.params.id, req.user.id));
}
//# sourceMappingURL=bids.controller.js.map