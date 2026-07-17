import * as conversations from './messages.service.js';
import * as thread from './thread.service.js';
export async function start(req, res) {
    res.status(201).json(await conversations.startConversation(req.user.id, req.body));
}
export async function list(req, res) {
    res.json(await conversations.listConversations(req.user.id, req.query.filter));
}
export async function unread(req, res) {
    res.json(await conversations.unreadCount(req.user.id));
}
export async function get(req, res) {
    res.json(await conversations.getConversation(req.params.id, req.user.id));
}
export async function messages(req, res) {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    res.json(await thread.listMessages(req.params.id, req.user.id, search));
}
export async function send(req, res) {
    res.status(201).json(await thread.sendMessage(req.params.id, req.user.id, req.body.body));
}
export async function note(req, res) {
    await conversations.setNote(req.params.id, req.user.id, req.body.note);
    res.status(204).end();
}
export async function favorite(req, res) {
    await conversations.toggleFavorite(req.params.id, req.user.id);
    res.status(204).end();
}
//# sourceMappingURL=messages.controller.js.map