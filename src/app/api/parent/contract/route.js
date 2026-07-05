import { requireParent } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { getStudentInvoice } from '@/lib/services/manualPaymentService'
import { buildTuitionContractFields, validateSignerProfile, resolveContractDate } from '@/lib/tuitionContractBuilder'
import { getContractSettings } from '@/lib/services/contractSettingsService'
import { getContractArticles } from '@/lib/services/contractArticlesService'
import { formatFinancialPlanForApi, getFinancialPlan } from '@/lib/services/financialPlanService'
import { syncFinancialPlanToInvoice } from '@/lib/services/contractInvoiceSync'
import { dateToJalali } from '@/lib/jalali'
import { SIGNER_ROLES } from '@/data/tuitionContractMeta'

const planInclude = {
  lines: {
    orderBy: { sortOrder: 'asc' },
    include: { amanatCashRows: { orderBy: { sortOrder: 'asc' } } },
  },
}

async function loadContractContext(studentId) {
  const [student, profile, contract, invoice, preReg, financialPlan] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.studentProfile.findUnique({ where: { studentId } }),
    prisma.tuitionContract.findUnique({ where: { studentId } }),
    getStudentInvoice(studentId),
    prisma.preRegistration.findFirst({
      where: { studentId },
      select: { academicYear: true },
    }),
    getFinancialPlan(studentId),
  ])

  const academicYear = student?.academicYear || preReg?.academicYear || null

  return { student, profile, contract, invoice, academicYear, financialPlan }
}

export async function GET(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)
    const { searchParams } = new URL(request.url)
    const previewRole = searchParams.get('signerRole')
    const { student, profile, contract, invoice, academicYear, financialPlan } =
      await loadContractContext(studentId)

    const profileCompleted = Boolean(profile?.profileCompleted)

    if (contract) {
      const snapshot = JSON.parse(contract.snapshot)
      // امضا/مهر رسمی مدیر و مؤسس همیشه از تنظیمات جاری خوانده شود (نه snapshot منجمد)
      // تا ویرایش‌های مدیر روی قراردادهای امضاشده هم بازتاب پیدا کند.
      try {
        const currentSettings = academicYear ? await getContractSettings(academicYear) : null
        if (currentSettings) {
          if (currentSettings.managerSignatureUrl) snapshot.managerSignatureUrl = currentSettings.managerSignatureUrl
          if (currentSettings.managerStampUrl) snapshot.managerStampUrl = currentSettings.managerStampUrl
          if (currentSettings.founderSignatureUrl) snapshot.founderSignatureUrl = currentSettings.founderSignatureUrl
        }
      } catch { /* در صورت خطا از snapshot استفاده می‌شود */ }
      return Response.json({
        profileCompleted,
        signed: true,
        financialPlanReady: true,
        contract: {
          signerRole: contract.signerRole,
          workshopConsent: contract.workshopConsent,
          contractAccepted: contract.contractAccepted,
          smsConsent: contract.smsConsent,
          contractDate: contract.contractDate,
          signedAt: contract.signedAt,
          parentSignatureUrl: contract.parentSignatureUrl,
          snapshot,
        },
        fields: snapshot,
        signerOptions: Object.values(SIGNER_ROLES),
        contractSettingsConfigured: true,
      })
    }

    const signerRole =
      previewRole === 'mother' ? 'mother' : previewRole === 'father' ? 'father' : 'father'
    const contractSettings = academicYear
      ? await getContractSettings(academicYear)
      : null
    const planForBuilder = financialPlan
      ? formatFinancialPlanForApi(financialPlan)
      : null
    const customArticles = await getContractArticles()
    const fields = buildTuitionContractFields({
      student,
      profile: profile || {},
      financialPlan: planForBuilder,
      gradeLevel: invoice.gradeLevel,
      signerRole,
      contractDate: resolveContractDate(),
      academicYear,
      contractSettings,
      parentSignatureUrl: '',
      customArticles,
    })

    return Response.json({
      profileCompleted,
      signed: false,
      financialPlanReady: Boolean(financialPlan?.readyForParent),
      contract: null,
      fields,
      signerOptions: Object.values(SIGNER_ROLES),
      contractSettingsConfigured: Boolean(contractSettings?.tuitionRial),
    })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت قرارداد')
  }
}

export async function POST(request) {
  try {
    const session = await requireParent()
    const studentId = Number(session.studentId)
    const body = await request.json()
    const signerRole = body.signerRole === 'mother' ? 'mother' : 'father'
    const workshopConsent = Boolean(body.workshopConsent)
    const contractAccepted = Boolean(body.contractAccepted)
    const amanatCommitmentAccepted = Boolean(body.amanatCommitmentAccepted)

    if (!contractAccepted) {
      return Response.json({ message: 'پذیرش متن قرارداد الزامی است.' }, { status: 400 })
    }
    if (!workshopConsent) {
      return Response.json({ message: 'رضایت نسبت به کارگاه‌های تکمیلی الزامی است.' }, { status: 400 })
    }

    const parentSignatureUrl = String(body.parentSignatureUrl || '').trim()
    if (!parentSignatureUrl) {
      return Response.json({ message: 'بارگذاری تصویر امضای والدین الزامی است.' }, { status: 400 })
    }

    const { student, profile, contract, invoice, academicYear, financialPlan } =
      await loadContractContext(studentId)

    if (!profile?.profileCompleted) {
      return Response.json(
        { message: 'ابتدا فرم تکمیل اطلاعات نوآموز را کامل کنید.' },
        { status: 403 },
      )
    }

    if (contract) {
      return Response.json({ message: 'قرارداد قبلاً ثبت شده است.' }, { status: 409 })
    }

    if (!financialPlan?.readyForParent) {
      return Response.json(
        { message: 'قرارداد مالی هنوز توسط مدیریت تکمیل نشده است. لطفاً بعداً مراجعه کنید.' },
        { status: 403 },
      )
    }

    const planWithLines = await prisma.studentFinancialPlan.findUnique({
      where: { studentId },
      include: planInclude,
    })
    const hasAmanatChecks = (planWithLines?.lines || []).some(
      (l) => l.lineType === 'check' && l.checkKind === 'amanat',
    )
    if (hasAmanatChecks && !amanatCommitmentAccepted) {
      return Response.json(
        { message: 'پذیرش تعهد پرداخت نقدی چک(های) امانت الزامی است.' },
        { status: 400 },
      )
    }

    const missing = validateSignerProfile(profile, signerRole)
    if (missing.length) {
      return Response.json(
        { message: `اطلاعات ناقص در فرم ثبت‌نام: ${missing.join('، ')}` },
        { status: 400 },
      )
    }

    const contractSettings = academicYear
      ? await getContractSettings(academicYear)
      : null

    if (!contractSettings?.tuitionRial) {
      return Response.json(
        { message: 'مبلغ شهریه برای این سال تحصیلی توسط مدیریت تعریف نشده است.' },
        { status: 400 },
      )
    }

    const contractDate = dateToJalali(new Date())
    const planForBuilder = formatFinancialPlanForApi(financialPlan)
    const customArticles = await getContractArticles()
    const fields = buildTuitionContractFields({
      student,
      profile,
      financialPlan: planForBuilder,
      gradeLevel: invoice.gradeLevel,
      signerRole,
      contractDate,
      academicYear,
      contractSettings,
      parentSignatureUrl,
      amanatCommitmentAccepted: hasAmanatChecks ? amanatCommitmentAccepted : false,
      customArticles,
    })

    const saved = await prisma.$transaction(async (tx) => {
      const created = await tx.tuitionContract.create({
        data: {
          studentId,
          signerRole,
          workshopConsent,
          contractAccepted,
          smsConsent: false,
          contractDate,
          parentSignatureUrl,
          snapshot: JSON.stringify(fields),
        },
      })

      await syncFinancialPlanToInvoice(tx, studentId, planWithLines)

      return created
    })

    return Response.json({
      ok: true,
      contract: {
        signerRole: saved.signerRole,
        workshopConsent: saved.workshopConsent,
        contractAccepted: saved.contractAccepted,
        smsConsent: saved.smsConsent,
        contractDate: saved.contractDate,
        signedAt: saved.signedAt,
        parentSignatureUrl: saved.parentSignatureUrl,
        snapshot: fields,
      },
    })
  } catch (error) {
    return jsonError(error, 'خطا در ثبت قرارداد')
  }
}
