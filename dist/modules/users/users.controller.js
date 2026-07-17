import * as usersService from './users.service.js';
export async function getProfile(req, res) {
    const user = await usersService.getProfile(req.params.id);
    res.json(user);
}
//# sourceMappingURL=users.controller.js.map