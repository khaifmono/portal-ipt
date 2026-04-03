import { prisma } from '@/lib/db'
import type { CourseMaterial, MaterialType } from '@/lib/types'

export async function getMaterialsByWeek(weekId: string): Promise<CourseMaterial[]> {
  const data = await prisma.courseMaterial.findMany({
    where: { week_id: weekId },
    orderBy: { order_index: 'asc' },
  })
  return data.map(serialize)
}

export async function createMaterial(params: {
  weekId: string
  courseId: string
  iptId: string
  title: string
  description?: string
  type: MaterialType
  filePath?: string
  url?: string
  createdBy: string
}): Promise<CourseMaterial> {
  // Get next order index
  const last = await prisma.courseMaterial.findFirst({
    where: { week_id: params.weekId },
    orderBy: { order_index: 'desc' },
    select: { order_index: true },
  })
  const nextOrder = last ? last.order_index + 1 : 0

  const data = await prisma.courseMaterial.create({
    data: {
      week_id: params.weekId,
      course_id: params.courseId,
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      type: params.type,
      file_path: params.filePath ?? null,
      url: params.url ?? null,
      order_index: nextOrder,
      created_by: params.createdBy,
    },
  })
  return serialize(data)
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await prisma.courseMaterial.delete({ where: { id: materialId } })
}

function serialize(row: Record<string, unknown>): CourseMaterial {
  return {
    ...(row as unknown as CourseMaterial),
    created_at: (row.created_at as Date).toISOString(),
  }
}
