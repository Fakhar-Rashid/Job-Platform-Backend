import type { Request, Response } from 'express';
import * as conversations from './messages.service.js';
import * as thread from './thread.service.js';

export async function start(req: Request, res: Response) {
  res.status(201).json(await conversations.startConversation(req.user!.id, req.body));
}

export async function list(req: Request, res: Response) {
  res.json(await conversations.listConversations(req.user!.id, req.query.filter as never));
}

export async function unread(req: Request, res: Response) {
  res.json(await conversations.unreadCount(req.user!.id));
}

export async function get(req: Request, res: Response) {
  res.json(await conversations.getConversation(req.params.id, req.user!.id));
}

export async function messages(req: Request, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  res.json(await thread.listMessages(req.params.id, req.user!.id, search));
}

export async function send(req: Request, res: Response) {
  res.status(201).json(await thread.sendMessage(req.params.id, req.user!.id, req.body.body));
}

export async function note(req: Request, res: Response) {
  await conversations.setNote(req.params.id, req.user!.id, req.body.note);
  res.status(204).end();
}

export async function favorite(req: Request, res: Response) {
  await conversations.toggleFavorite(req.params.id, req.user!.id);
  res.status(204).end();
}
