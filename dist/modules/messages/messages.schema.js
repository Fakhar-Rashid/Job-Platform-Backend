import { z } from 'zod';
export const startConversationSchema = z.object({
    jobId: z.string().min(1),
    freelancerId: z.string().min(1),
    body: z.string().trim().min(1, 'Message cannot be empty').max(5000),
});
export const sendMessageSchema = z.object({
    body: z.string().trim().min(1, 'Message cannot be empty').max(5000),
});
export const noteSchema = z.object({
    note: z.string().max(5000),
});
export const listConversationsSchema = z.object({
    filter: z.enum(['all', 'unread', 'favorites']).optional(),
});
export const listMessagesSchema = z.object({
    search: z.string().trim().optional(),
});
//# sourceMappingURL=messages.schema.js.map