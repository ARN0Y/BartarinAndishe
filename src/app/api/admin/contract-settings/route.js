import { requireAdmin } from '@/lib/api/guards'
import { jsonError } from '@/lib/errors'
import { normalizeAcademicYear } from '@/lib/academicYear'
import {
  getContractSettings,
  saveContractSettings,
  formatContractSettingsForDisplay,
} from '@/lib/services/contractSettingsService'
import { saveUploadedImage } from '@/lib/uploadImage'

export async function GET(request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const academicYear = normalizeAcademicYear(searchParams.get('year') || searchParams.get('academicYear'))
    const settings = await getContractSettings(academicYear)
    return Response.json({ academicYear, settings: formatContractSettingsForDisplay(settings) })
  } catch (error) {
    return jsonError(error, 'خطا در دریافت تنظیمات قرارداد')
  }
}

export async function PUT(request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const academicYear = normalizeAcademicYear(body.year || body.academicYear)
    const settings = await saveContractSettings(academicYear, body)
    return Response.json({ ok: true, academicYear, settings })
  } catch (error) {
    return jsonError(error, 'خطا در ذخیره تنظیمات قرارداد')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const formData = await request.formData()
    const file = formData.get('file')
    const assetType = String(formData.get('assetType') || '')
    const academicYear = normalizeAcademicYear(formData.get('year') || formData.get('academicYear'))

    const allowedTypes = ['managerSignature', 'managerStamp', 'founderSignature']
    if (!allowedTypes.includes(assetType)) {
      return Response.json({ message: 'نوع فایل نامعتبر است.' }, { status: 422 })
    }

    const filenameMap = {
      managerSignature: `manager-signature-${academicYear}.png`,
      managerStamp: `manager-stamp-${academicYear}.png`,
      founderSignature: `founder-signature-${academicYear}.png`,
    }

    const url = await saveUploadedImage(file, {
      uploadDir: 'uploads/contract',
      filename: filenameMap[assetType],
      maxWidth: 1200,
      maxHeight: 800,
      quality: 88,
    })

    const fieldMap = {
      managerSignature: 'managerSignatureUrl',
      managerStamp: 'managerStampUrl',
      founderSignature: 'founderSignatureUrl',
    }

    const settings = await saveContractSettings(academicYear, { [fieldMap[assetType]]: url })
    return Response.json({ ok: true, url, settings })
  } catch (error) {
    return jsonError(error, error.message || 'خطا در آپلود تصویر')
  }
}
