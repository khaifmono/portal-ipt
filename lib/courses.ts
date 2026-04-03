import { prisma } from '@/lib/db'
import type { Course, CourseWeek } from '@/lib/types'

export async function getCoursesByIpt(iptId: string): Promise<Course[]> {
  const data = await prisma.course.findMany({
    where: { ipt_id: iptId },
    orderBy: { created_at: 'desc' },
  })
  return data.map(serialize)
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const data = await prisma.course.findUnique({ where: { id: courseId } })
  return data ? serialize(data) : null
}

export async function createCourse(params: {
  iptId: string
  title: string
  description?: string
  createdBy: string
}): Promise<Course> {
  if (!params.iptId) throw new Error('ipt_id diperlukan untuk mencipta kursus')

  const data = await prisma.course.create({
    data: {
      ipt_id: params.iptId,
      title: params.title,
      description: params.description ?? null,
      created_by: params.createdBy,
    },
  })
  return serialize(data)
}

export async function getWeeksByCourse(courseId: string): Promise<CourseWeek[]> {
  const data = await prisma.courseWeek.findMany({
    where: { course_id: courseId },
    orderBy: { week_number: 'asc' },
  })
  return data.map(serializeWeek)
}

export async function addWeekToCourse(params: {
  courseId: string
  iptId: string
  title: string
  description?: string
}): Promise<CourseWeek> {
  const lastWeek = await prisma.courseWeek.findFirst({
    where: { course_id: params.courseId },
    orderBy: { week_number: 'desc' },
    select: { week_number: true },
  })

  const nextWeekNumber = lastWeek ? lastWeek.week_number + 1 : 1

  const data = await prisma.courseWeek.create({
    data: {
      course_id: params.courseId,
      ipt_id: params.iptId,
      week_number: nextWeekNumber,
      title: params.title,
      description: params.description ?? null,
    },
  })
  return serializeWeek(data)
}

/**
 * Duplicate a course: copies weeks, assignments (no submissions), and quizzes with questions.
 * Does NOT copy enrollments, submissions, or quiz attempts.
 */
export async function duplicateCourse(
  courseId: string,
  newTitle: string,
  createdBy: string
): Promise<Course> {
  // Fetch the original course
  const original = await prisma.course.findUnique({ where: { id: courseId } })
  if (!original) throw new Error('Kursus asal tidak dijumpai')

  // Fetch all related data
  const [weeks, assignments, quizzes, quizQuestions] = await Promise.all([
    prisma.courseWeek.findMany({
      where: { course_id: courseId },
      orderBy: { week_number: 'asc' },
    }),
    prisma.assignment.findMany({
      where: { course_id: courseId },
      orderBy: { created_at: 'asc' },
    }),
    prisma.quiz.findMany({
      where: { course_id: courseId },
      orderBy: { created_at: 'asc' },
    }),
    prisma.quizQuestion.findMany({
      where: { quiz: { course_id: courseId } },
      orderBy: { order_index: 'asc' },
    }),
  ])

  // Group quiz questions by quiz_id
  const questionsByQuiz = new Map<string, typeof quizQuestions>()
  for (const q of quizQuestions) {
    if (!questionsByQuiz.has(q.quiz_id)) questionsByQuiz.set(q.quiz_id, [])
    questionsByQuiz.get(q.quiz_id)!.push(q)
  }

  // Create new course
  const newCourse = await prisma.course.create({
    data: {
      ipt_id: original.ipt_id,
      title: newTitle,
      description: original.description,
      created_by: createdBy,
    },
  })

  // Clone weeks and build old->new ID map
  const weekIdMap = new Map<string, string>()
  for (const week of weeks) {
    const newWeek = await prisma.courseWeek.create({
      data: {
        course_id: newCourse.id,
        ipt_id: original.ipt_id,
        week_number: week.week_number,
        title: week.title,
        description: week.description,
      },
    })
    weekIdMap.set(week.id, newWeek.id)
  }

  // Clone assignments (reset due_date to null, keep everything else)
  for (const assignment of assignments) {
    const newWeekId = weekIdMap.get(assignment.week_id)
    if (!newWeekId) continue
    await prisma.assignment.create({
      data: {
        course_id: newCourse.id,
        week_id: newWeekId,
        ipt_id: original.ipt_id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        due_date: null,
        max_score: assignment.max_score,
        created_by: createdBy,
      },
    })
  }

  // Clone quizzes with their questions
  for (const quiz of quizzes) {
    const newWeekId = weekIdMap.get(quiz.week_id)
    if (!newWeekId) continue
    const newQuiz = await prisma.quiz.create({
      data: {
        course_id: newCourse.id,
        week_id: newWeekId,
        ipt_id: original.ipt_id,
        title: quiz.title,
        description: quiz.description,
        timer_minutes: quiz.timer_minutes,
        randomize_questions: quiz.randomize_questions,
        created_by: createdBy,
      },
    })

    const questions = questionsByQuiz.get(quiz.id) ?? []
    for (const question of questions) {
      await prisma.quizQuestion.create({
        data: {
          quiz_id: newQuiz.id,
          ipt_id: original.ipt_id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options ?? undefined,
          correct_answer: question.correct_answer,
          marks: question.marks,
          order_index: question.order_index,
        },
      })
    }
  }

  return serialize(newCourse)
}

export async function getCourseProgress(courseId: string, userId: string): Promise<number> {
  const [totalAssignments, totalQuizzes, submittedAssignments, submittedQuizzes] =
    await Promise.all([
      prisma.assignment.count({ where: { course_id: courseId } }),
      prisma.quiz.count({ where: { course_id: courseId } }),
      prisma.submission.count({
        where: {
          user_id: userId,
          assignment: { course_id: courseId },
        },
      }),
      prisma.quizAttempt.count({
        where: {
          user_id: userId,
          status: 'submitted',
          quiz: { course_id: courseId },
        },
      }),
    ])

  const totalItems = totalAssignments + totalQuizzes
  if (totalItems === 0) return 0

  const completedItems = submittedAssignments + submittedQuizzes
  return Math.round((completedItems / totalItems) * 100)
}

function serialize(row: Record<string, unknown>): Course {
  return { ...(row as unknown as Course), created_at: (row.created_at as Date).toISOString() }
}

function serializeWeek(row: Record<string, unknown>): CourseWeek {
  return { ...(row as unknown as CourseWeek), created_at: (row.created_at as Date).toISOString() }
}
