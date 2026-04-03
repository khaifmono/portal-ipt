import { prisma } from '@/lib/db'
import type { ForumThread, ForumReply } from '@/lib/types'

export async function getThreadsByCourse(courseId: string) {
  const data = await prisma.forumThread.findMany({
    where: { course_id: courseId },
    include: {
      creator: { select: { id: true, nama: true, role: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
  })
  return data.map((row) => ({
    ...serializeThread(row),
    creator_name: row.creator.nama,
    creator_role: row.creator.role,
    reply_count: row._count.replies,
  }))
}

export async function getThreadById(threadId: string) {
  const data = await prisma.forumThread.findUnique({
    where: { id: threadId },
    include: {
      creator: { select: { id: true, nama: true, role: true } },
    },
  })
  if (!data) return null
  return {
    ...serializeThread(data),
    creator_name: data.creator.nama,
    creator_role: data.creator.role,
  }
}

export async function getRepliesByThread(threadId: string) {
  const data = await prisma.forumReply.findMany({
    where: { thread_id: threadId },
    include: {
      creator: { select: { id: true, nama: true, role: true } },
    },
    orderBy: { created_at: 'asc' },
  })
  return data.map((row) => ({
    ...serializeReply(row),
    creator_name: row.creator.nama,
    creator_role: row.creator.role,
  }))
}

export async function createThread(params: {
  courseId: string
  iptId: string
  title: string
  content: string
  createdBy: string
}): Promise<ForumThread> {
  const data = await prisma.forumThread.create({
    data: {
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      content: params.content,
      created_by: params.createdBy,
    },
  })
  return serializeThread(data)
}

export async function createReply(params: {
  threadId: string
  iptId: string
  content: string
  createdBy: string
}): Promise<ForumReply> {
  const data = await prisma.forumReply.create({
    data: {
      thread_id: params.threadId,
      ipt_id: params.iptId,
      content: params.content,
      created_by: params.createdBy,
    },
  })
  return serializeReply(data)
}

export async function toggleThreadPin(threadId: string, isPinned: boolean) {
  await prisma.forumThread.update({
    where: { id: threadId },
    data: { is_pinned: isPinned },
  })
}

export async function toggleThreadLock(threadId: string, isLocked: boolean) {
  await prisma.forumThread.update({
    where: { id: threadId },
    data: { is_locked: isLocked },
  })
}

export async function deleteReply(replyId: string) {
  await prisma.forumReply.delete({ where: { id: replyId } })
}

function serializeThread(row: Record<string, unknown>): ForumThread {
  return {
    ...(row as unknown as ForumThread),
    created_at: (row.created_at as Date).toISOString(),
  }
}

function serializeReply(row: Record<string, unknown>): ForumReply {
  return {
    ...(row as unknown as ForumReply),
    created_at: (row.created_at as Date).toISOString(),
  }
}
