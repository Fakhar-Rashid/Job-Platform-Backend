import * as connectsService from './connects.service.js';
export async function balance(req, res) {
    res.json(await connectsService.getBalance(req.user.id));
}
export async function topUp(req, res) {
    res.json(await connectsService.topUp(req.user.id));
}
export async function transactions(req, res) {
    res.json(await connectsService.listTransactions(req.user.id));
}
//# sourceMappingURL=connects.controller.js.map