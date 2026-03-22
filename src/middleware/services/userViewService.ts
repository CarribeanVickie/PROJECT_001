export const PLACEHOLDER_EMAIL_DOMAIN = 'pending.local';

export function createPlaceholderEmail(userId: string) {
  return `pending+${userId}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

export function isPlaceholderEmail(email?: string | null) {
  return Boolean(email && email.endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`));
}

export function sanitizeUserForResponse<T extends Record<string, any> | null | undefined>(user: T): T {
  if (!user) {
    return user;
  }

  return {
    ...user,
    email: isPlaceholderEmail(user.email) ? null : user.email,
  } as T;
}

export function sanitizeTaskForResponse<T extends Record<string, any> | null | undefined>(task: T): T {
  if (!task) {
    return task;
  }

  return {
    ...task,
    assignee: sanitizeUserForResponse(task.assignee),
    comments: Array.isArray(task.comments)
      ? task.comments.map((comment: any) => ({
          ...comment,
          author: sanitizeUserForResponse(comment.author),
        }))
      : task.comments,
  } as T;
}
