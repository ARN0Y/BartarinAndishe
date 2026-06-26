import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import {
  formatFinancialPlanForApi,
  getOrCreateFinancialPlan,
  markFinancialPlanReady,
  reopenFinancialPlan,
  saveFinancialPlan,
} from '@/lib/services/financialPlanService'

export async function GET(_, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const studentId = Number(id)
    const plan = await getOrCreateFinancialPlan(studentId)
    return Response.json({ plan: formatFinancialPlanForApi(plan) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت قرارداد مالی')
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const studentId = Number(id)
    const body = await request.json()
    const plan = await saveFinancialPlan(studentId, body)
    return Response.json({ ok: true, plan: formatFinancialPlanForApi(plan) })
  } catch (error) {
    const message = error.message || 'خطا در ذخیره قرارداد مالی'
    return Response.json({ message }, { status: 422 })
  }
}

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const studentId = Number(id)
    const body = await request.json()
    const action = body.action

    if (action === 'ready') {
      const plan = await markFinancialPlanReady(studentId)
      return Response.json({ ok: true, plan: formatFinancialPlanForApi(plan) })
    }

    if (action === 'reopen') {
      const plan = await reopenFinancialPlan(studentId)
      return Response.json({ ok: true, plan: formatFinancialPlanForApi(plan) })
    }

    return Response.json({ message: 'عملیات نامعتبر.' }, { status: 400 })
  } catch (error) {
    const message = error.message || 'خطا در به‌روزرسانی وضعیت قرارداد مالی'
    return Response.json({ message }, { status: 422 })
  }
}
