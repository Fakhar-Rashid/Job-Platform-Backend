import * as usersService from './users.service.js';
export async function getProfile(req, res) {
    const user = await usersService.getProfile(req.params.id);
    res.json(user);
}
export async function listTalent(_req, res) {
    res.json(await usersService.listTalent());
}
//# sourceMappingURL=users.controller.js.map