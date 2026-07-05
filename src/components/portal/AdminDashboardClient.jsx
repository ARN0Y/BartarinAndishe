'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { INTERACTIVE_WORKSHEETS } from '@/data/interactiveWorksheets'
import JalaliDatePicker from '@/components/ui/JalaliDatePicker'
import AdminProfileView from './AdminProfileView'
import { rialToTomanWords } from '@/lib/numberToWords'
import {
  AdminPageHeader, AdminPanel, AdminBadge, AdminButton,
  AdminFilterBar, AdminFilterGroup, AdminFilterBtn,
  AdminTable, AdminPagination, inputCls, labelCls,
  AdminTableHeaderSelect, applyTableSort,
} from '@/components/admin/ui/AdminUI'
import AdminSearchInput from '@/components/admin/AdminSearchInput'
import AdminAcademicYearBar from '@/components/admin/AdminAcademicYearBar'
import AdminContractSettingsPanel from '@/components/admin/AdminContractSettingsPanel'
import AdminSpotDifferencePanel from '@/components/admin/AdminSpotDifferencePanel'
import AdminMatchingPanel from '@/components/admin/AdminMatchingPanel'
import AdminClassesPanel from '@/components/admin/AdminClassesPanel'
import AdminExcursionsPanel from '@/components/admin/AdminExcursionsPanel'
import AdminSiteContentPanel from '@/components/admin/AdminSiteContentPanel'
import AdminManualAddStudent from '@/components/admin/AdminManualAddStudent'
import StudentMultiSelect from '@/components/admin/StudentMultiSelect'
import { resolveGradeLabel } from '@/lib/gradeLevel'
import { matchesSearch } from '@/lib/searchUtils'
import Link from 'next/link'
import {
  studentCodesMatch,
  formatStudentCodeConflictMessage,
} from '@/lib/studentCode'
import {
  sortStudentRows,
  sortProfileEntries,
} from '@/lib/studentListSort'
import {
  confirmDuplicateWarning,
  findDuplicateCashPayment,
  findDuplicateSchedule,
  postFinanceWithDuplicateRetry,
} from '@/lib/financeDuplicates'
import {
  filterFinanceStudents,
  searchFinanceChecks,
} from '@/lib/financeSearch'
import { getInvoiceBalanceDisplay, formatBalanceToman } from '@/lib/invoiceBalance'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  ClipboardList, CheckCircle2, Wallet, Users, Clock, AlertTriangle,
  TrendingUp, ChevronLeft, Mail, Megaphone, BookOpen, FileText,
  MessageSquare, ArrowLeft, CircleDollarSign, Receipt, Gamepad2,
} from 'lucide-react'

function formatThousands(val) {
  const digits = String(val || '').replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

function validateJalali(str) {
  if (!str) return false
  const parts = str.split('/')
  if (parts.length !== 3) return false
  if (!parts[0] || !parts[1] || !parts[2]) return false
  const [y, m, d] = parts.map(Number)
  return y > 1300 && y < 1500 && m >= 1 && m <= 12 && d >= 1 && d <= 31
}

function studentCodeConflict(students, code, { excludeStudentId = null } = {}) {
  const trimmed = String(code || '').trim()
  if (!trimmed) return null
  const dup = students.find(
    (s) => studentCodesMatch(s.studentCode, trimmed)
      && (excludeStudentId == null || s.studentId !== excludeStudentId),
  )
  if (!dup) return null
  return formatStudentCodeConflictMessage(trimmed, dup)
}

function studentTableHeaderColumns({
  sortBy,
  sortDir,
  gender,
  onSortChange,
  onGenderChange,
  extraColumns = [],
}) {
  const mainSortValue = `${sortBy}:${sortDir}`
  const codeSortValue = ['studentCode', 'genderThenCode'].includes(sortBy) ? mainSortValue : ''

  return [
    {
      key: 'firstName',
      label: 'نام',
      header: (
        <AdminTableHeaderSelect
          label="نام"
          value={sortBy === 'firstName' ? mainSortValue : ''}
          onChange={onSortChange}
          options={[
            { value: 'firstName:asc', label: 'صعودی (ا→ی)' },
            { value: 'firstName:desc', label: 'نزولی (ی→ا)' },
          ]}
        />
      ),
    },
    {
      key: 'lastName',
      label: 'نام خانوادگی',
      header: (
        <AdminTableHeaderSelect
          label="نام خانوادگی"
          value={['newest', 'lastName'].includes(sortBy) ? mainSortValue : ''}
          onChange={onSortChange}
          placeholder={null}
          options={[
            { value: 'newest:asc', label: 'جدیدترین ثبت‌نام' },
            { value: 'lastName:asc', label: 'صعودی (ا→ی)' },
            { value: 'lastName:desc', label: 'نزولی (ی→ا)' },
          ]}
        />
      ),
    },
    { key: 'nid', label: 'کد ملی' },
    {
      key: 'code',
      label: 'کد نوآموز',
      header: (
        <AdminTableHeaderSelect
          label="کد نوآموز"
          value={codeSortValue}
          onChange={onSortChange}
          options={[
            { value: 'studentCode:asc', label: 'کد یکتا ↑' },
            { value: 'studentCode:desc', label: 'کد یکتا ↓' },
            { value: 'genderThenCode:asc', label: 'جنسیت + کد' },
          ]}
        />
      ),
    },
    {
      key: 'gender',
      label: 'جنسیت',
      header: (
        <AdminTableHeaderSelect
          label="جنسیت"
          value={gender}
          onChange={onGenderChange}
          placeholder={null}
          options={[
            { value: 'all', label: 'همه' },
            { value: 'دختر', label: 'دختر' },
            { value: 'پسر', label: 'پسر' },
          ]}
        />
      ),
    },
    ...extraColumns,
  ]
}

export default function AdminDashboardClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tab, setTabState] = useState(() => searchParams?.get('tab') || 'overview')
  const academicYear = searchParams?.get('year') || '1405-1406'
  const yearQs = `academicYear=${encodeURIComponent(academicYear)}`

  function setTab(key) {
    setTabState(key)
    setError('')
    router.replace(`/admin/dashboard?tab=${key}&year=${encodeURIComponent(academicYear)}`, { scroll: false })
  }

  // sync tab with URL changes
  useEffect(() => {
    const t = searchParams?.get('tab')
    if (t) setTabState(t)
  }, [searchParams])

  // pagination & filtering pre-regs
  const [preRegFilter, setPreRegFilter] = useState('all') // 'all' | 'Pending' | 'Confirmed' | 'Rejected'
  const [preRegGender, setPreRegGender] = useState('all')
  const [preRegPage, setPreRegPage] = useState(1)
  const PRE_REG_PER_PAGE = 10
  // filtering confirmed profiles
  const [confirmedGender, setConfirmedGender] = useState('all')
  const [confirmedSortBy, setConfirmedSortBy] = useState('newest')
  const [confirmedSortDir, setConfirmedSortDir] = useState('asc')
  // filtering finance students
  const [financeGender, setFinanceGender] = useState('all')
  const [financeSortBy, setFinanceSortBy] = useState('newest')
  const [financeSortDir, setFinanceSortDir] = useState('asc')
  const [financeSearch, setFinanceSearch] = useState('')
  const [financeSearchMode, setFinanceSearchMode] = useState('') // '' | 'check' | 'date'
  const [financeFilterYear, setFinanceFilterYear] = useState('')
  const [financeFilterMonth, setFinanceFilterMonth] = useState('')
  const [financeFilterCheck, setFinanceFilterCheck] = useState('')
  const [preRegSearch, setPreRegSearch] = useState('')
  const [confirmedSearch, setConfirmedSearch] = useState('')
  const [expandedPreRegId, setExpandedPreRegId] = useState(null)
  const [editingPreRegId, setEditingPreRegId] = useState(null)
  const [editPreRegForm, setEditPreRegForm] = useState({})
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [editStudentForm, setEditStudentForm] = useState({})
  const [msgMode, setMsgMode] = useState('single') // single | bulk

  // messages & announcements state
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [msgForm, setMsgForm] = useState({ subject: '', body: '' })
  const [msgAttachment, setMsgAttachment] = useState(null)
  const [msgStudentIds, setMsgStudentIds] = useState([])
  const [msgSending, setMsgSending] = useState(false)

  const [announcements, setAnnouncements] = useState([])
  const [annLoading, setAnnLoading] = useState(false)
  const [annText, setAnnText] = useState('')
  const [annSaving, setAnnSaving] = useState(false)
  const [preRegs, setPreRegs] = useState([])
  const [gradeRanges, setGradeRanges] = useState([])
  const [confirmForm, setConfirmForm] = useState({})
  const [confirmSaving, setConfirmSaving] = useState(null)
  const [students, setStudents] = useState([])
  const msgStudentOptions = useMemo(
    () => students.map((s) => ({
      id: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      nationalId: s.nationalId,
    })),
    [students],
  )
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [worksheets, setWorksheets] = useState([])
  const [interactiveCodes, setInteractiveCodes] = useState([])
  const [form, setForm] = useState({ title: '', description: '', file: null })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [payForm, setPayForm] = useState({ amountPaid: '', paymentDate: '', description: '' })
  const [paying, setPaying] = useState(false)
  const [visibilitySaving, setVisibilitySaving] = useState(null)
  const [completedProfiles, setCompletedProfiles] = useState([])
  const [viewingProfile, setViewingProfile] = useState(null)
  // اقساط و پرداخت‌های آتی
  const [schedules, setSchedules] = useState([])
  const [schedLoading, setSchedLoading] = useState(false)
  const [filterYear, setFilterYear] = useState(() => {
    const gy = new Date().getFullYear()
    return gy - (new Date().getMonth() < 2 ? 622 : 621)
  })
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() < 2 ? 10 : (new Date().getMonth() - 2))
  const [schedForm, setSchedForm] = useState({ studentId: '', amountDue: '', description: '' })
  const [schedSaving, setSchedSaving] = useState(false)
  const [inlineFormTab, setInlineFormTab] = useState('cash')
  const [inlineSchedForm, setInlineSchedForm] = useState({ amountDue: '', dueDate: '', description: '' })
  // ویرایش پرداخت نقدی
  const [editingPayment, setEditingPayment] = useState(null) // { id, amountPaid, paymentDate, description }
  const [tuitionInput, setTuitionInput] = useState('')
  const [tuitionSaving, setTuitionSaving] = useState(false)
  const [editPaySaving, setEditPaySaving] = useState(false)
  // ویرایش قسط
  const [editingSched, setEditingSched] = useState(null) // { id, amountDue, dueDate, description }
  const [editSchedSaving, setEditSchedSaving] = useState(false)

  async function loadCompletedProfiles() {
    const res = await fetch(`/api/admin/profiles?${yearQs}`)
    const json = await res.json()
    if (!res.ok) {
      setError(json.message || 'خطا در بارگذاری ثبت‌نام‌های قطعی')
      setCompletedProfiles([])
      return
    }
    setCompletedProfiles(json.profiles || [])
  }

  async function loadGradeRanges() {
    const res = await fetch(`/api/admin/grade-ranges?${yearQs}`)
    const json = await res.json()
    setGradeRanges(json.ranges || [])
  }

  function displayGrade(birthDate, storedGradeLevel) {
    return resolveGradeLabel(birthDate, gradeRanges, storedGradeLevel) || '—'
  }

  async function loadPreRegs() {
    const res = await fetch(`/api/admin/pre-registrations?${yearQs}`)
    const json = await res.json()
    setPreRegs(json.registrations || [])
  }

  async function handlePreReg(id, action, reg = {}) {
    setConfirmSaving(id)
    setError('')
    const body = { action }
    if (action === 'confirm') {
      const f = confirmForm[id] || {}
      body.nationalId = f.nationalId ?? reg.nationalId ?? ''
      body.firstName = f.firstName || ''
      body.lastName = f.lastName || ''
      body.studentCode = (f.studentCode || '').trim()
      if (!body.studentCode) {
        setError('کد نوآموز الزامی است.')
        setConfirmSaving(null)
        return
      }
      const codeDup = studentCodeConflict(students, body.studentCode)
      if (codeDup) {
        setError(codeDup)
        setConfirmSaving(null)
        return
      }
    }
    const res = await fetch(`/api/admin/pre-registrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json.message || 'خطا در پردازش پیش ثبت‌نام')
      setConfirmSaving(null)
      return
    }
    setConfirmSaving(null)
    setConfirmForm((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    loadPreRegs()
    load()
    window.dispatchEvent(new Event('admin-nav-badges-refresh'))
  }

  async function deletePreReg(id) {
    if (!confirm('این پیش ثبت‌نام حذف شود؟')) return
    await fetch(`/api/admin/pre-registrations/${id}`, { method: 'DELETE' })
    loadPreRegs()
    window.dispatchEvent(new Event('admin-nav-badges-refresh'))
  }

  async function load() {
    const [studentsRes, worksheetRes, codesRes] = await Promise.all([
      fetch(`/api/admin/students?${yearQs}`),
      fetch('/api/worksheets'),
      fetch('/api/admin/interactive-codes'),
    ])
    const studentsJson = await studentsRes.json()
    const worksheetJson = await worksheetRes.json()
    const codesJson = await codesRes.json()
    if (!studentsRes.ok) setError(studentsJson.message)
    const list = studentsJson.students || []
    setStudents(list)
    setWorksheets(worksheetJson.worksheets || [])
    const codes = codesJson.codes || []
    setInteractiveCodes(codes)
    if (selectedStudent) {
      const updated = list.find((s) => s.studentId === selectedStudent.studentId)
      if (updated) setSelectedStudent(updated)
    }
  }

  async function loadComments() {
    setCommentsLoading(true)
    try {
      const res = await fetch('/api/admin/comments')
      const json = await res.json()
      setComments(json.comments || [])
    } catch {
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }

  async function loadSchedules(dueYear, dueMonth) {
    setSchedLoading(true)
    try {
      const res = await fetch(
        `/api/admin/payment-schedules?dueYear=${dueYear}&dueMonth=${dueMonth}&${yearQs}`
      )
      const json = await res.json()
      setSchedules(json.schedules || [])
    } finally {
      setSchedLoading(false)
    }
  }

  function reloadAcademicYearData() {
    loadPreRegs()
    loadCompletedProfiles()
    load()
    if (tab === 'finance') loadSchedules(filterYear, filterMonth)
  }

  async function addSchedule(e) {
    e.preventDefault()
    const dueDate = `${filterYear}/${String(filterMonth).padStart(2, '0')}/01`
    const studentSchedules = schedules.filter((s) => s.studentId === Number(schedForm.studentId))
    const dup = findDuplicateSchedule(studentSchedules, dueDate, schedForm.amountDue)
    if (!confirmDuplicateWarning(dup, 'قسط')) return

    setSchedSaving(true)
    try {
      const payload = { ...schedForm, amountDue: Number(schedForm.amountDue), dueDate }
      const { ok, json, cancelled } = await postFinanceWithDuplicateRetry('/api/admin/payment-schedules', payload)
      if (cancelled) return
      if (!ok) { setError(json.message); return }
      setSchedForm({ studentId: '', amountDue: '', description: '' })
      loadSchedules(filterYear, filterMonth)
    } catch (err) { setError(err.message) }
    finally { setSchedSaving(false) }
  }

  async function toggleSchedPaid(s) {
    await fetch(`/api/admin/payment-schedules/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid: !s.isPaid }),
    })
    loadSchedules(filterYear, filterMonth)
  }

  async function deleteSchedule(id) {
    if (!confirm('این قسط حذف شود؟')) return
    await fetch(`/api/admin/payment-schedules/${id}`, { method: 'DELETE' })
    loadSchedules(filterYear, filterMonth)
  }

  async function loadMessages() {
    setMessagesLoading(true)
    try {
      const res = await fetch('/api/admin/messages')
      const json = await res.json()
      setMessages(json.messages || [])
    } catch { setMessages([]) }
    finally { setMessagesLoading(false) }
  }

  async function updatePreReg(id) {
    setError('')
    const res = await fetch(`/api/admin/pre-registrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', ...editPreRegForm }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.message || 'خطا در ویرایش'); return }
    setEditingPreRegId(null)
    loadPreRegs()
  }

  async function updateStudent(id) {
    setError('')
    const res = await fetch(`/api/admin/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editStudentForm),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.message || 'خطا در ویرایش'); return }
    setEditingStudentId(null)
    loadCompletedProfiles()
    load()
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (msgMode === 'single' && !msgStudentIds.length) {
      setError('لطفاً حداقل یک گیرنده انتخاب کنید.')
      return
    }
    setMsgSending(true)
    setError('')
    try {
      const fd = new FormData()
      fd.set('subject', msgForm.subject)
      fd.set('body', msgForm.body)
      if (msgMode === 'single') {
        fd.set('toStudentIds', JSON.stringify(msgStudentIds))
      }
      if (msgAttachment) {
        fd.set('attachment', msgAttachment)
      }
      const res = await fetch('/api/admin/messages', { method: 'POST', body: fd })
      const text = await res.text()
      let json
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error('خطا در ارتباط با سرور. لطفاً سرور را یک بار ری‌استارت کنید.')
      }
      if (!res.ok) {
        setError(json.message || 'خطا در ارسال پیام')
        return
      }
      setMsgForm({ subject: '', body: '' })
      setMsgAttachment(null)
      setMsgStudentIds([])
      loadMessages()
    } catch (err) {
      setError(err.message || 'خطا در ارسال پیام')
    } finally { setMsgSending(false) }
  }

  async function deleteMessage(id) {
    if (!confirm('این پیام حذف شود؟')) return
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    loadMessages()
  }

  async function loadAnnouncements() {
    setAnnLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      const json = await res.json()
      setAnnouncements(json.public || json.announcements || [])
    } catch {
      setAnnouncements([])
    } finally { setAnnLoading(false) }
  }

  async function addAnnouncement(e) {
    e.preventDefault()
    if (!annText.trim()) return
    setAnnSaving(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: annText, scope: 'public' }),
      })
      if (res.ok) { setAnnText(''); loadAnnouncements() }
    } finally { setAnnSaving(false) }
  }


  async function toggleAnnouncement(ann) {
    await fetch(`/api/admin/announcements/${ann.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ann.isActive }),
    })
    loadAnnouncements()
  }

  async function deleteAnnouncement(id) {
    if (!confirm('این اعلان حذف شود؟')) return
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    loadAnnouncements()
  }

  useEffect(() => { load(); loadPreRegs(); loadCompletedProfiles(); loadGradeRanges() }, [academicYear])
  useEffect(() => { if (tab === 'comments') loadComments() }, [tab])
  useEffect(() => { if (tab === 'preReg') loadPreRegs() }, [tab, academicYear])
  useEffect(() => { if (tab === 'confirmed') loadCompletedProfiles() }, [tab, academicYear])
  useEffect(() => { if (tab === 'finance') loadSchedules(filterYear, filterMonth) }, [tab, academicYear])
  useEffect(() => { if (tab === 'messages') loadMessages() }, [tab])
  useEffect(() => { if (tab === 'announcements') loadAnnouncements() }, [tab])

  async function submitWorksheet(event) {
    event.preventDefault()
    setError('')
    const fd = new FormData()
    fd.set('title', form.title)
    fd.set('description', form.description)
    if (form.file) fd.set('file', form.file)
    const res = await fetch(editing ? `/api/worksheets/${editing.id}` : '/api/worksheets', {
      method: editing ? 'PUT' : 'POST',
      body: fd,
    })
    const json = await res.json()
    if (!res.ok) { setError(json.message); return }
    setForm({ title: '', description: '', file: null })
    setEditing(null)
    load()
  }

  async function removeWorksheet(id) {
    if (!confirm('این کاربرگ حذف شود؟')) return
    await fetch(`/api/worksheets/${id}`, { method: 'DELETE' })
    load()
  }

  function editWorksheet(item) {
    setEditing(item)
    setForm({ title: item.title, description: item.description, file: null })
  }

  async function addPayment(e) {
    e.preventDefault()
    if (!selectedStudent) return
    if (!validateJalali(payForm.paymentDate)) {
      setError('تاریخ شمسی نادرست است — فرمت صحیح: ۱۴۰۳/۰۸/۱۵')
      return
    }
    const dup = findDuplicateCashPayment(selectedStudent.payments, payForm.paymentDate, payForm.amountPaid)
    if (!confirmDuplicateWarning(dup, 'پرداخت نقدی')) return

    setPaying(true)
    setError('')
    try {
      const payload = {
        studentId: selectedStudent.studentId,
        amountPaid: Number(payForm.amountPaid),
        paymentDate: payForm.paymentDate,
        description: payForm.description,
      }
      const { ok, json, cancelled } = await postFinanceWithDuplicateRetry('/api/admin/manual-payments', payload)
      if (cancelled) return
      if (!ok) { setError(json.message); return }
      setPayForm({ amountPaid: '', paymentDate: '', description: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setPaying(false)
    }
  }

  async function deletePayment(paymentId) {
    if (!confirm('این پرداخت حذف شود؟')) return
    await fetch(`/api/admin/manual-payments/${paymentId}`, { method: 'DELETE' })
    load()
  }

  async function toggleInteractiveVisibility(iw, isVisible) {
    setVisibilitySaving(iw.id)
    try {
      await fetch('/api/admin/interactive-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: iw.id, title: iw.title, isVisible }),
      })
      await load()
    } finally {
      setVisibilitySaving(null)
    }
  }

  async function toggleWorksheetVisibility(id, isVisible) {
    setVisibilitySaving(`file-${id}`)
    try {
      await fetch(`/api/worksheets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible }),
      })
      await load()
    } finally {
      setVisibilitySaving(null)
    }
  }

  async function toggleApprove(comment) {
    await fetch(`/api/admin/comments/${comment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !comment.approved }),
    })
    loadComments()
  }

  async function deleteComment(id) {
    if (!confirm('این نظر حذف شود؟')) return
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    loadComments()
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>
      ) : null}

      {['overview', 'preReg', 'confirmed', 'classes', 'excursions', 'finance', 'contract'].includes(tab) ? (
        <AdminAcademicYearBar onChanged={reloadAcademicYearData} />
      ) : null}

      {/* ───── کلاس‌بندی ───── */}
      {tab === 'classes' && <AdminClassesPanel academicYear={academicYear} />}

      {/* ───── اردوها ───── */}
      {tab === 'excursions' && <AdminExcursionsPanel academicYear={academicYear} />}

      {/* ───── محتوای سایت ───── */}
      {tab === 'siteContent' && <AdminSiteContentPanel />}

      {/* ───── نمای کلی ───── */}
      {tab === 'overview' && (
        <AdminOverview
          students={students}
          preRegs={preRegs}
          completedProfiles={completedProfiles}
          academicYear={academicYear}
          onNavigate={setTab}
        />
      )}

      {/* ───── ثبت‌نام‌های قطعی ───── */}
      {tab === 'confirmed' && (() => {
        const filteredConfirmed = sortProfileEntries(
          completedProfiles.filter((e) => {
            if (confirmedGender !== 'all' && e.student?.gender !== confirmedGender && e.gender !== confirmedGender) return false
            if (!matchesSearch(confirmedSearch, e.student?.firstName, e.student?.lastName, e.student?.nationalId)) return false
            return true
          }),
          confirmedSortBy,
          confirmedSortDir,
        )
        return (
        <section className="space-y-5">
          <AdminPageHeader
            title="ثبت‌نام‌های قطعی"
            count={filteredConfirmed.length}
            description={`فرم‌های تکمیل‌شده — سال تحصیلی ${academicYear}`}
            actions={
              <>
                <AdminManualAddStudent academicYear={academicYear} onAdded={() => { loadCompletedProfiles(); load() }} />
                <AdminButton variant="secondary" onClick={loadCompletedProfiles}>بارگذاری مجدد</AdminButton>
                <a href={`/api/admin/profiles/export?${yearQs}`}>
                  <AdminButton variant="primary">خروجی اکسل</AdminButton>
                </a>
              </>
            }
          />

          <AdminFilterBar>
            <div className="flex-1 min-w-[200px] max-w-sm">
              <AdminSearchInput value={confirmedSearch} onChange={setConfirmedSearch} placeholder="جستجوی نام، کد ملی..." />
            </div>
          </AdminFilterBar>

          <AdminPanel noPadding>
            <AdminTable
              columns={studentTableHeaderColumns({
                sortBy: confirmedSortBy,
                sortDir: confirmedSortDir,
                gender: confirmedGender,
                onSortChange: (raw) => applyTableSort(raw, setConfirmedSortBy, setConfirmedSortDir),
                onGenderChange: setConfirmedGender,
                extraColumns: [
                  { key: 'status', label: 'وضعیت' },
                  { key: 'actions', label: 'عملیات', className: 'w-44' },
                ],
              })}
              emptyMessage="هنوز هیچ فرم ثبت‌نامی تکمیل نشده است."
            >
              {filteredConfirmed.flatMap((entry) => {
                const sid = entry.student.id
                const rows = [
                <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{entry.student.firstName}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{entry.student.lastName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground ltr text-right">{entry.student.nationalId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary ltr text-right">{entry.student.studentCode || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.gender || entry.student?.gender || '—'}</td>
                  <td className="px-4 py-3"><AdminBadge variant="success">تکمیل‌شده</AdminBadge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <AdminButton variant="secondary" size="sm" onClick={() => setViewingProfile(entry)}>مشاهده</AdminButton>
                      <AdminButton variant="ghost" size="sm" onClick={() => {
                        setEditingStudentId(editingStudentId === sid ? null : sid)
                        setEditStudentForm({
                          firstName: entry.student.firstName,
                          lastName: entry.student.lastName,
                          nationalId: entry.student.nationalId,
                          studentCode: entry.student.studentCode || '',
                        })
                      }}>ویرایش</AdminButton>
                    </div>
                  </td>
                </tr>,
                ]
                if (editingStudentId === sid) {
                  const editCodeConflict = studentCodeConflict(students, editStudentForm.studentCode, { excludeStudentId: sid })
                  rows.push(
                    <tr key={`edit-${sid}`} className="bg-muted/50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl">
                          <div>
                            <label className={labelCls}>نام</label>
                            <input value={editStudentForm.firstName} onChange={(e) => setEditStudentForm((v) => ({ ...v, firstName: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>نام خانوادگی</label>
                            <input value={editStudentForm.lastName} onChange={(e) => setEditStudentForm((v) => ({ ...v, lastName: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>کد ملی</label>
                            <input value={editStudentForm.nationalId} onChange={(e) => setEditStudentForm((v) => ({ ...v, nationalId: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className={`${inputCls} ltr text-right`} maxLength={10} />
                          </div>
                          <div>
                            <label className={labelCls}>کد نوآموز</label>
                            <input
                              value={editStudentForm.studentCode || ''}
                              onChange={(e) => setEditStudentForm((v) => ({ ...v, studentCode: e.target.value }))}
                              className={`${inputCls} ltr text-right ${editCodeConflict ? 'border-red-400 focus:border-red-500' : ''}`}
                              placeholder="یکتا در همین سال تحصیلی"
                            />
                            {editCodeConflict ? (
                              <p className="mt-1 text-[10px] font-semibold text-red-600">{editCodeConflict}</p>
                            ) : (
                              <p className="mt-1 text-[10px] text-muted-foreground">در هر سال یک کد یکتا؛ در سال‌های دیگر می‌تواند تکرار شود.</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <AdminButton
                            variant="primary"
                            size="sm"
                            disabled={!!editCodeConflict}
                            onClick={() => updateStudent(sid)}
                          >
                            ذخیره
                          </AdminButton>
                          <AdminButton variant="secondary" size="sm" onClick={() => setEditingStudentId(null)}>انصراف</AdminButton>
                        </div>
                      </td>
                    </tr>
                  )
                }
                return rows
              })}
            </AdminTable>
          </AdminPanel>
        </section>
        )
      })()}

      {/* ───── پیش ثبت‌نام ───── */}
      {tab === 'preReg' && (() => {
        const filtered = preRegs.filter((r) => {
          if (preRegFilter !== 'all' && r.status !== preRegFilter) return false
          if (preRegGender !== 'all' && r.gender !== preRegGender) return false
          if (!matchesSearch(preRegSearch, r.firstName, r.lastName, r.nationalId, r.phone)) return false
          return true
        })
        const totalPages = Math.ceil(filtered.length / PRE_REG_PER_PAGE)
        const paginated = filtered.slice((preRegPage - 1) * PRE_REG_PER_PAGE, preRegPage * PRE_REG_PER_PAGE)

        const statusBadge = (status) => {
          if (status === 'Confirmed') return <AdminBadge variant="success">تأییدشده</AdminBadge>
          if (status === 'Rejected') return <AdminBadge variant="danger">رد شده</AdminBadge>
          return <AdminBadge variant="pending">در انتظار</AdminBadge>
        }

        return (
        <section className="space-y-5">
          <AdminPageHeader
            title="پیش ثبت‌نام‌ها"
            count={filtered.length}
            description={`درخواست‌های ثبت‌نام — سال تحصیلی ${academicYear}`}
            actions={<AdminButton variant="secondary" onClick={loadPreRegs}>بارگذاری مجدد</AdminButton>}
          />

          <AdminFilterBar>
            <div className="flex-1 min-w-[200px] max-w-sm">
              <AdminSearchInput value={preRegSearch} onChange={(v) => { setPreRegSearch(v); setPreRegPage(1) }} placeholder="جستجوی نام، کد ملی، تلفن..." />
            </div>
            <AdminFilterGroup label="وضعیت:">
              {[
                { v: 'all', label: 'همه' },
                { v: 'Pending', label: 'معلق' },
                { v: 'Confirmed', label: 'تأییدشده' },
                { v: 'Rejected', label: 'ردشده' },
              ].map(({ v, label }) => (
                <AdminFilterBtn key={v} active={preRegFilter === v} onClick={() => { setPreRegFilter(v); setPreRegPage(1) }}>{label}</AdminFilterBtn>
              ))}
            </AdminFilterGroup>
            <AdminFilterGroup label="جنسیت:">
              {[{ v: 'all', label: 'همه' }, { v: 'دختر', label: 'دختر' }, { v: 'پسر', label: 'پسر' }].map(({ v, label }) => (
                <AdminFilterBtn key={v} active={preRegGender === v} onClick={() => { setPreRegGender(v); setPreRegPage(1) }}>{label}</AdminFilterBtn>
              ))}
            </AdminFilterGroup>
          </AdminFilterBar>

          <AdminPanel noPadding>
            <AdminTable
              columns={[
                { key: 'name', label: 'نام' },
                { key: 'phone', label: 'تماس' },
                { key: 'birth', label: 'تاریخ تولد' },
                { key: 'grade', label: 'پایه' },
                { key: 'gender', label: 'جنسیت' },
                { key: 'code', label: 'کد نوآموز' },
                { key: 'date', label: 'تاریخ ثبت' },
                { key: 'status', label: 'وضعیت' },
                { key: 'actions', label: 'عملیات', className: 'w-48' },
              ]}
              emptyMessage="هیچ پیش ثبت‌نامی یافت نشد."
            >
              {paginated.flatMap((r) => {
                const cf = confirmForm[r.id] || {}
                const confirmCodeConflict = studentCodeConflict(students, cf.studentCode)
                const rows = [
                  <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{r.firstName} {r.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground ltr text-right">{r.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.birthDate || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.gradeLevel || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.gender || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary ltr text-right">
                      {r.student?.studentCode || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {r.status === 'Pending' && (
                          <>
                            <AdminButton variant="success" size="sm" onClick={() => setExpandedPreRegId(expandedPreRegId === r.id ? null : r.id)}>
                              تأیید
                            </AdminButton>
                            <AdminButton variant="danger" size="sm" onClick={() => handlePreReg(r.id, 'reject')}>رد</AdminButton>
                          </>
                        )}
                        <AdminButton variant="ghost" size="sm" onClick={() => deletePreReg(r.id)}>حذف</AdminButton>
                        <AdminButton variant="secondary" size="sm" onClick={() => {
                          if (editingPreRegId === r.id) { setEditingPreRegId(null); return }
                          setEditingPreRegId(r.id)
                          setEditPreRegForm({
                            firstName: r.firstName,
                            lastName: r.lastName,
                            nationalId: r.nationalId || '',
                            phone: r.phone,
                            birthDate: r.birthDate || '',
                            gender: r.gender || '',
                          })
                        }}>ویرایش</AdminButton>
                      </div>
                    </td>
                  </tr>,
                ]
                if (expandedPreRegId === r.id && r.status === 'Pending') {
                  rows.push(
                    <tr key={`${r.id}-form`} className="bg-muted/50">
                      <td colSpan={9} className="px-4 py-4">
                        <p className="mb-3 text-xs font-semibold text-muted-foreground">
                          {r.nationalId ? 'کد ملی از فرم خوانده شد — در صورت نیاز تصحیح کنید:' : 'برای تأیید، کد ملی و کد نوآموز را وارد کنید:'}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl">
                          <div>
                            <label className={labelCls}>کد ملی <span className="text-red-500">*</span></label>
                            <input
                              value={cf.nationalId ?? r.nationalId ?? ''}
                              onChange={(e) => setConfirmForm((v) => ({ ...v, [r.id]: { ...cf, nationalId: e.target.value } }))}
                              className={`${inputCls} ltr text-right`}
                              placeholder="10 رقم"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>کد نوآموز <span className="text-red-500">*</span></label>
                            <input
                              value={cf.studentCode ?? ''}
                              onChange={(e) => setConfirmForm((v) => ({ ...v, [r.id]: { ...cf, studentCode: e.target.value } }))}
                              className={`${inputCls} ltr text-right ${confirmCodeConflict ? 'border-red-400 focus:border-red-500' : ''}`}
                              placeholder="یکتا در همین سال تحصیلی"
                            />
                            {confirmCodeConflict ? (
                              <p className="mt-1 text-[10px] font-semibold text-red-600">{confirmCodeConflict}</p>
                            ) : (
                              <p className="mt-1 text-[10px] text-muted-foreground">در هر سال یک کد یکتا؛ در سال‌های دیگر می‌تواند تکرار شود.</p>
                            )}
                          </div>
                          <div>
                            <label className={labelCls}>نام (اختیاری)</label>
                            <input
                              value={cf.firstName || ''}
                              onChange={(e) => setConfirmForm((v) => ({ ...v, [r.id]: { ...cf, firstName: e.target.value } }))}
                              className={inputCls}
                              placeholder={r.firstName}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>نام خانوادگی (اختیاری)</label>
                            <input
                              value={cf.lastName || ''}
                              onChange={(e) => setConfirmForm((v) => ({ ...v, [r.id]: { ...cf, lastName: e.target.value } }))}
                              className={inputCls}
                              placeholder={r.lastName}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <AdminButton
                            variant="success"
                            size="sm"
                            disabled={confirmSaving === r.id || !!confirmCodeConflict}
                            onClick={() => { handlePreReg(r.id, 'confirm', r); setExpandedPreRegId(null) }}
                          >
                            {confirmSaving === r.id ? 'در حال ثبت...' : 'تأیید نهایی'}
                          </AdminButton>
                          <AdminButton variant="secondary" size="sm" onClick={() => setExpandedPreRegId(null)}>انصراف</AdminButton>
                        </div>
                      </td>
                    </tr>
                  )
                }
                if (editingPreRegId === r.id) {
                  rows.push(
                    <tr key={`${r.id}-edit`} className="bg-accent/50">
                      <td colSpan={9} className="px-4 py-4">
                        <p className="mb-3 text-xs font-bold text-foreground">ویرایش اطلاعات پیش ثبت‌نام</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl">
                          <div>
                            <label className={labelCls}>نام</label>
                            <input value={editPreRegForm.firstName || ''} onChange={(e) => setEditPreRegForm((v) => ({ ...v, firstName: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>نام خانوادگی</label>
                            <input value={editPreRegForm.lastName || ''} onChange={(e) => setEditPreRegForm((v) => ({ ...v, lastName: e.target.value }))} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>کد ملی</label>
                            <input value={editPreRegForm.nationalId || ''} onChange={(e) => setEditPreRegForm((v) => ({ ...v, nationalId: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className={`${inputCls} ltr text-right`} maxLength={10} />
                          </div>
                          <div>
                            <label className={labelCls}>تلفن</label>
                            <input value={editPreRegForm.phone || ''} onChange={(e) => setEditPreRegForm((v) => ({ ...v, phone: e.target.value }))} className={`${inputCls} ltr text-right`} />
                          </div>
                          <div>
                            <label className={labelCls}>تاریخ تولد</label>
                            <input value={editPreRegForm.birthDate || ''} onChange={(e) => setEditPreRegForm((v) => ({ ...v, birthDate: e.target.value }))} className={inputCls} placeholder="1400/01/01" />
                          </div>
                          <div>
                            <label className={labelCls}>جنسیت</label>
                            <select value={editPreRegForm.gender || ''} onChange={(e) => setEditPreRegForm((v) => ({ ...v, gender: e.target.value }))} className={inputCls}>
                              <option value="">—</option>
                              <option value="دختر">دختر</option>
                              <option value="پسر">پسر</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <AdminButton variant="primary" size="sm" onClick={() => updatePreReg(r.id)}>ذخیره تغییرات</AdminButton>
                          <AdminButton variant="secondary" size="sm" onClick={() => setEditingPreRegId(null)}>انصراف</AdminButton>
                        </div>
                      </td>
                    </tr>
                  )
                }
                return rows
              })}
            </AdminTable>
            <AdminPagination page={preRegPage} totalPages={totalPages} onPageChange={setPreRegPage} />
          </AdminPanel>
        </section>
        )
      })()}

{/* ───── مدیریت مالی — لیست نوآموزان ───── */}
      {tab === 'finance' && (() => {
        const JALALI_MONTHS_FINANCE = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']

        const hasFinanceFilter = financeSearchMode === 'date'
          ? (financeFilterYear || financeFilterMonth)
          : financeSearchMode === 'check'
            ? financeFilterCheck.trim()
            : false

        const filteredStudents = sortStudentRows(
          filterFinanceStudents(students, {
            nameQuery: financeSearch,
            gender: financeGender,
          }),
          financeSortBy,
          financeSortDir,
        )

        const matchingChecks = hasFinanceFilter
          ? searchFinanceChecks(students, {
            mode: financeSearchMode,
            checkQuery: financeFilterCheck,
            year: financeFilterYear,
            month: financeFilterMonth,
            nameQuery: financeSearch,
            gender: financeGender,
          })
          : []

        function setFinanceMode(mode) {
          setFinanceSearchMode(mode)
          if (mode !== 'check') setFinanceFilterCheck('')
          if (mode !== 'date') {
            setFinanceFilterYear('')
            setFinanceFilterMonth('')
          }
        }

        return (
        <section className="space-y-5">
          <AdminPageHeader
            title="مدیریت مالی"
            count={hasFinanceFilter ? matchingChecks.length : filteredStudents.length}
            description={
              hasFinanceFilter
                ? `نتایج جستجو — سال تحصیلی ${academicYear}`
                : `سال تحصیلی ${academicYear} — نوآموزان ثبت‌نام قطعی`
            }
            actions={
              <>
                <AdminButton asChild variant="secondary">
                  <a href={`/api/admin/finance/export?${yearQs}`}>خروجی اکسل همین سال</a>
                </AdminButton>
                <AdminButton asChild variant="secondary">
                  <a href="/api/admin/finance/export?allYears=1">خروجی اکسل همه سال‌ها</a>
                </AdminButton>
              </>
            }
          />

          {/* نوار خلاصه مالی */}
          {!hasFinanceFilter ? (() => {
            const wt = filteredStudents.filter((s) => s.totalTuition != null)
            const paid = filteredStudents.reduce((a, s) => a + Number(s.total || 0), 0)
            const debt = wt.reduce((a, s) => a + Math.max(0, Number(s.remaining || 0)), 0)
            const debtors = wt.filter((s) => Number(s.remaining || 0) > 0).length
            const settled = wt.filter((s) => Number(s.remaining || 0) <= 0).length
            return (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={CircleDollarSign} label="مجموع پرداخت‌شده" value={fa(Math.floor(paid / 10))} sub="تومان" tone="success" accent="bg-emerald-500" />
                <StatCard icon={AlertTriangle} label="مانده بدهی" value={fa(Math.floor(debt / 10))} sub="تومان" tone={debt > 0 ? 'danger' : 'success'} accent={debt > 0 ? 'bg-destructive' : 'bg-emerald-500'} />
                <StatCard icon={Clock} label="بدهکاران" value={fa(debtors)} sub={`${fa(settled)} نفر تسویه‌شده`} tone="warning" accent="bg-amber-500" />
                <StatCard icon={Users} label="نوآموزان این فهرست" value={fa(filteredStudents.length)} sub={`سال ${academicYear}`} tone="info" accent="bg-sky-500" />
              </div>
            )
          })() : null}

          {/* نوار فیلتر */}
          <AdminPanel noPadding>
            <div className="p-4 space-y-4">
              {/* ردیف اول: جستجوی نام */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px] max-w-sm">
                  <AdminSearchInput value={financeSearch} onChange={setFinanceSearch} placeholder="جستجوی نام، کد ملی..." />
                </div>
              </div>

              {/* ردیف دوم: نوع جستجوی مالی */}
              <div className="flex flex-wrap items-end gap-3 border-t border-border pt-3">
                <AdminFilterGroup label="جستجو بر اساس:">
                  {[
                    { v: '', label: 'همه' },
                    { v: 'check', label: 'شماره چک' },
                    { v: 'date', label: 'تاریخ (سال و ماه)' },
                  ].map(({ v, label }) => (
                    <AdminFilterBtn
                      key={v || 'all'}
                      active={financeSearchMode === v}
                      onClick={() => setFinanceMode(v)}
                    >
                      {label}
                    </AdminFilterBtn>
                  ))}
                </AdminFilterGroup>
              </div>

              {financeSearchMode === 'date' ? (
                <div className="flex flex-wrap items-end gap-3 border-t border-border pt-3">
                  <span className="text-xs font-bold text-muted-foreground bg-muted rounded px-2 py-1">سال و ماه</span>
                  <div>
                    <label className={labelCls}>سال (شمسی)</label>
                    <select
                      value={financeFilterYear}
                      onChange={(e) => setFinanceFilterYear(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">همه سال‌ها</option>
                      {[1402,1403,1404,1405,1406,1407].map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>ماه</label>
                    <select
                      value={financeFilterMonth}
                      onChange={(e) => setFinanceFilterMonth(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">همه ماه‌ها</option>
                      {JALALI_MONTHS_FINANCE.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              {financeSearchMode === 'check' ? (
                <div className="flex flex-wrap items-end gap-3 border-t border-border pt-3">
                  <span className="text-xs font-bold text-muted-foreground bg-muted rounded px-2 py-1">شماره چک</span>
                  <div className="flex-1 min-w-[200px] max-w-xs">
                    <input
                      value={financeFilterCheck}
                      onChange={(e) => setFinanceFilterCheck(e.target.value)}
                      placeholder="شماره چک را وارد کنید..."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring ltr"
                    />
                  </div>
                </div>
              ) : null}

              {hasFinanceFilter ? (
                <div className="border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => setFinanceMode('')}
                    className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition"
                  >
                    پاک کردن فیلتر مالی
                  </button>
                </div>
              ) : null}
            </div>
          </AdminPanel>

          <AdminPanel noPadding>
            {hasFinanceFilter ? (
              <AdminTable
                columns={[
                  { key: 'name', label: 'نام نوآموز' },
                  { key: 'check', label: 'شماره چک' },
                  { key: 'date', label: 'تاریخ چک' },
                  { key: 'amount', label: 'مبلغ' },
                  { key: 'status', label: 'وضعیت' },
                  { key: 'actions', label: 'عملیات', className: 'w-32' },
                ]}
                emptyMessage="چکی با این مشخصات یافت نشد."
              >
                {matchingChecks.map((c) => (
                  <tr key={c.key} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-foreground">{c.studentName}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground/70 ltr text-right">{c.nationalId}</span>
                    </td>
                    <td className="px-4 py-3 ltr text-right">
                      {c.checkNumber
                        ? <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{c.checkNumber}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 ltr text-right text-muted-foreground whitespace-nowrap">{c.checkDate || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {Number(c.amount).toLocaleString('en-US')} ریال
                    </td>
                    <td className="px-4 py-3">
                      {c.isPaid
                        ? <AdminBadge variant="success">تأیید شده</AdminBadge>
                        : <AdminBadge variant="warning">در انتظار پرداخت</AdminBadge>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/dashboard/finance/${c.studentId}`}>
                        <AdminButton variant="primary" size="sm">مشاهده مالی</AdminButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            ) : (
              <AdminTable
                columns={studentTableHeaderColumns({
                  sortBy: financeSortBy,
                  sortDir: financeSortDir,
                  gender: financeGender,
                  onSortChange: (raw) => applyTableSort(raw, setFinanceSortBy, setFinanceSortDir),
                  onGenderChange: setFinanceGender,
                  extraColumns: [
                    { key: 'paid', label: 'پرداخت‌شده' },
                    { key: 'tuition', label: 'شهریه کل' },
                    { key: 'remaining', label: 'مانده' },
                    { key: 'actions', label: 'عملیات', className: 'w-32' },
                  ],
                })}
                emptyMessage="نوآموزی یافت نشد."
              >
                {filteredStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{s.firstName}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{s.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground ltr text-right">{s.nationalId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary ltr text-right">{s.studentCode || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.gender || '—'}</td>
                    <td className="px-4 py-3 text-foreground">{s.totalFormatted} ریال</td>
                    <td className="px-4 py-3">
                      {s.totalTuition
                        ? <span className="text-foreground">{s.totalTuitionFormatted} ریال</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {s.totalTuition != null ? (() => {
                        const bal = getInvoiceBalanceDisplay(s.remaining)
                        if (!bal || bal.tone === 'settled') {
                          return <span className="text-sm font-semibold text-emerald-600">تسویه</span>
                        }
                        if (bal.tone === 'credit') {
                          return <span className="text-sm font-semibold text-sky-700">{formatBalanceToman(bal.displayRial)}</span>
                        }
                        return <span className="text-sm font-semibold text-red-600">{s.remainingFormatted} ریال</span>
                      })() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/dashboard/finance/${s.studentId}`}>
                        <AdminButton variant="primary" size="sm">مشاهده مالی</AdminButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            )}
          </AdminPanel>

          {/* فیلتر اقساط ماهانه */}
          <AdminPanel>
            <h3 className="mb-4 text-sm font-bold text-foreground border-b border-border pb-2">اقساط سررسید بر اساس ماه</h3>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div>
                <label className={labelCls}>سال</label>
                <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className={inputCls}>
                  {[1403,1404,1405,1406,1407,1408,1409,1410].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>ماه</label>
                <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className={inputCls}>
                  {['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m, i) => (
                    <option key={i+1} value={i+1}>{m}</option>
                  ))}
                </select>
              </div>
              <AdminButton variant="primary" onClick={() => loadSchedules(filterYear, filterMonth)}>نمایش</AdminButton>
              {schedules.length > 0 && (
                <AdminBadge variant="info">{schedules.length} مورد — {rialToTomanWords(schedules.reduce((s, x) => s + x.amountDue, 0))}</AdminBadge>
              )}
            </div>
            {schedLoading ? (
              <p className="text-sm text-muted-foreground/70 py-4 text-center">در حال بارگذاری...</p>
            ) : schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground/70 py-4 text-center">برای این ماه قسطی ثبت نشده است.</p>
            ) : (
              <AdminTable
                columns={[
                  { key: 'name', label: 'نوآموز' },
                  { key: 'due', label: 'سررسید' },
                  { key: 'amount', label: 'مبلغ' },
                  { key: 'desc', label: 'توضیحات' },
                  { key: 'status', label: 'وضعیت' },
                  { key: 'actions', label: 'عملیات', className: 'w-36' },
                ]}
              >
                {schedules.map((sc) => (
                  <tr key={sc.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold">{sc.student.firstName} {sc.student.lastName}</td>
                    <td className="px-4 py-3 ltr text-right text-sm">{sc.dueDate}</td>
                    <td className="px-4 py-3 font-semibold">{Number(sc.amountDue).toLocaleString('en-US')} ریال</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{sc.description || '—'}</td>
                    <td className="px-4 py-3">
                      <AdminBadge variant={sc.isPaid ? 'success' : 'pending'}>{sc.isPaid ? 'پرداخت‌شده' : 'سررسید'}</AdminBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <AdminButton variant={sc.isPaid ? 'secondary' : 'success'} size="sm" onClick={() => toggleSchedPaid(sc)}>
                          {sc.isPaid ? 'برگشت' : 'تأیید'}
                        </AdminButton>
                        <AdminButton variant="danger" size="sm" onClick={() => deleteSchedule(sc.id)}>حذف</AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            )}
          </AdminPanel>
        </section>
        )
      })()}

      {/* FINANCE_SECTION_END */}

      {tab === 'contract' && (
        <AdminContractSettingsPanel academicYear={academicYear} />
      )}

      {/* ───── کاربرگ‌ها ───── */}
      {tab === 'worksheets' && (
        <section className="space-y-6">
          <AdminPageHeader
            title="کاربرگ‌ها"
            description="مدیریت محتوای آموزشی تعاملی و فایلی و تعیین نمایش در پنل والدین"
          />

          {/* کاربرگ‌های تعاملی */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">کاربرگ‌های تعاملی</h2>
              <Badge variant="secondary">{INTERACTIVE_WORKSHEETS.length.toLocaleString('fa-IR')}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {INTERACTIVE_WORKSHEETS.map((iw) => {
                const existing = interactiveCodes.find((c) => c.slug === iw.id)
                const isVisible = existing?.isVisible ?? false
                return (
                  <Card key={iw.id} className="rounded-xl">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-foreground">{iw.title}</p>
                        <Badge variant={isVisible ? 'success' : 'secondary'}>{isVisible ? 'فعال' : 'غیرفعال'}</Badge>
                      </div>
                      <p className="mt-1.5 min-h-9 text-xs leading-6 text-muted-foreground">{iw.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-semibold text-foreground">نمایش در پنل والدین</span>
                        <Switch
                          checked={isVisible}
                          disabled={visibilitySaving === iw.id}
                          onCheckedChange={(val) => toggleInteractiveVisibility(iw, val)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* بازی پیدا کردن تفاوت */}
          <AdminSpotDifferencePanel />

          {/* بازی وصل‌کردنی */}
          <AdminMatchingPanel />

          {/* کاربرگ‌های فایلی */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">کاربرگ‌های فایلی</h2>
              <Badge variant="secondary">{worksheets.length.toLocaleString('fa-IR')}</Badge>
            </div>
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <Card className="h-fit rounded-xl">
                <CardContent className="p-5">
                  <form onSubmit={submitWorksheet}>
                    <h3 className="text-sm font-bold text-foreground">{editing ? 'ویرایش کاربرگ' : 'آپلود کاربرگ جدید'}</h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className={labelCls}>عنوان <span className="text-red-500">*</span></label>
                        <input
                          value={form.title}
                          onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                          className={inputCls}
                          placeholder="عنوان کاربرگ"
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>توضیحات <span className="text-red-500">*</span></label>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                          className={`${inputCls} min-h-24 resize-y`}
                          placeholder="توضیحات"
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>فایل {editing ? '(در صورت تغییر)' : <span className="text-red-500">*</span>}</label>
                        <input
                          type="file"
                          accept=".pdf,image/*,.docx"
                          onChange={(e) => setForm((v) => ({ ...v, file: e.target.files?.[0] }))}
                          className={`${inputCls} h-auto py-2 file:ml-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-semibold`}
                          required={!editing}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <AdminButton type="submit" variant="primary" className="flex-1">
                        {editing ? 'ذخیره تغییرات' : 'ثبت کاربرگ'}
                      </AdminButton>
                      {editing && (
                        <AdminButton
                          type="button"
                          variant="secondary"
                          onClick={() => { setEditing(null); setForm({ title: '', description: '', file: null }) }}
                        >
                          انصراف
                        </AdminButton>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {worksheets.length === 0 ? (
                <Card className="rounded-xl border-dashed shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/35" strokeWidth={1.4} />
                    <p className="text-sm font-semibold text-foreground">هنوز کاربرگ فایلی ثبت نشده است</p>
                    <p className="mt-1 text-xs text-muted-foreground">از فرم کنار، اولین کاربرگ را آپلود کنید.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {worksheets.map((w) => (
                    <Card key={w.id} className="rounded-xl">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-muted-foreground">{w.createdAtFormatted}</p>
                          <Badge variant={w.isVisible ? 'success' : 'secondary'}>{w.isVisible ? 'فعال' : 'غیرفعال'}</Badge>
                        </div>
                        <h3 className="mt-2 font-bold text-foreground">{w.title}</h3>
                        <p className="mt-1.5 text-sm leading-7 text-muted-foreground line-clamp-3">{w.description}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                          <span className="text-xs font-semibold text-foreground">نمایش در پنل والدین</span>
                          <Switch
                            checked={Boolean(w.isVisible)}
                            disabled={visibilitySaving === `file-${w.id}`}
                            onCheckedChange={(val) => toggleWorksheetVisibility(w.id, val)}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <AdminButton asChild variant="secondary" size="sm">
                            <a href={w.fileUrl} target="_blank" rel="noopener noreferrer">مشاهده</a>
                          </AdminButton>
                          <AdminButton variant="ghost" size="sm" onClick={() => editWorksheet(w)}>ویرایش</AdminButton>
                          <AdminButton variant="danger" size="sm" onClick={() => removeWorksheet(w.id)}>حذف</AdminButton>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ───── نظرات ───── */}
      {tab === 'comments' && (
        <section className="space-y-5">
          <AdminPageHeader
            title="مدیریت نظرات"
            count={comments.length}
            description="نظرات ارسالی از صفحه اصلی سایت"
            actions={<AdminButton variant="secondary" onClick={loadComments}>بارگذاری مجدد</AdminButton>}
          />
          <AdminPanel noPadding>
            <AdminTable
              loading={commentsLoading}
              columns={[
                { key: 'name', label: 'نام' },
                { key: 'text', label: 'متن نظر' },
                { key: 'date', label: 'تاریخ' },
                { key: 'status', label: 'وضعیت' },
                { key: 'actions', label: 'عملیات', className: 'w-40' },
              ]}
              emptyMessage="هنوز نظری ثبت نشده است."
            >
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs"><p className="line-clamp-2 text-sm">{c.text}</p></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdAtFormatted}</td>
                  <td className="px-4 py-3">
                    <AdminBadge variant={c.approved ? 'success' : 'pending'}>
                      {c.approved ? 'تأییدشده' : 'در انتظار'}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <AdminButton variant={c.approved ? 'secondary' : 'success'} size="sm" onClick={() => toggleApprove(c)}>
                        {c.approved ? 'لغو تأیید' : 'تأیید'}
                      </AdminButton>
                      <AdminButton variant="danger" size="sm" onClick={() => deleteComment(c.id)}>حذف</AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </AdminPanel>
        </section>
      )}


      {/* ───── پیام‌رسانی ───── */}
      {tab === 'messages' && (
        <section className="space-y-5">
          <AdminPageHeader title="پیام‌رسانی" description="ارسال پیام تکی یا دسته‌جمعی به اولیا" count={messages.length} />

          <AdminPanel>
            <h3 className="mb-4 text-sm font-bold text-foreground">پیام جدید</h3>
            <div className="mb-4 flex gap-2">
              <AdminFilterBtn active={msgMode === 'single'} onClick={() => { setMsgMode('single'); setMsgStudentIds([]) }}>پیام تکی</AdminFilterBtn>
              <AdminFilterBtn active={msgMode === 'bulk'} onClick={() => { setMsgMode('bulk'); setMsgStudentIds([]) }}>پیام دسته‌جمعی</AdminFilterBtn>
            </div>
            <form onSubmit={sendMessage} className="space-y-4">
              {msgMode === 'single' && (
                <StudentMultiSelect
                  students={msgStudentOptions}
                  selectedIds={msgStudentIds}
                  onChange={setMsgStudentIds}
                  academicYear={academicYear}
                  label="گیرنده"
                  showAllWhenEmpty={false}
                  required
                />
              )}
              {msgMode === 'bulk' && (
                <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">این پیام برای همه اولیا ارسال می‌شود.</p>
              )}
              <div>
                <label className={labelCls}>موضوع <span className="text-red-500">*</span></label>
                <input value={msgForm.subject} onChange={(e) => setMsgForm((v) => ({ ...v, subject: e.target.value }))} className={inputCls} placeholder="موضوع پیام" required />
              </div>
              <div>
                <label className={labelCls}>متن پیام <span className="text-red-500">*</span></label>
                <textarea value={msgForm.body} onChange={(e) => setMsgForm((v) => ({ ...v, body: e.target.value }))} rows={4} className={`${inputCls} resize-y`} placeholder="متن پیام..." required />
              </div>
              <div>
                <label className={labelCls}>فایل ضمیمه (اختیاری)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,image/jpeg,image/png,image/webp"
                  onChange={(e) => setMsgAttachment(e.target.files?.[0] || null)}
                  className={inputCls}
                />
                {msgAttachment ? (
                  <p className="mt-1.5 text-xs font-semibold text-primary">
{msgAttachment.name} ({(msgAttachment.size / 1024).toFixed(0)} KB)
                    <button
                      type="button"
                      onClick={() => setMsgAttachment(null)}
                      className="mr-2 text-red-600 hover:text-red-800"
                    >
                      حذف
                    </button>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">PDF، Word، Excel، ZIP، TXT یا تصویر — حداکثر ۱۰ مگابایت</p>
                )}
              </div>
              <AdminButton type="submit" variant="primary" disabled={msgSending}>
                {msgSending ? 'در حال ارسال...' : 'ارسال پیام'}
              </AdminButton>
            </form>
          </AdminPanel>

          <AdminPanel noPadding>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">پیام‌های ارسال‌شده</h3>
              <AdminButton variant="secondary" size="sm" onClick={loadMessages}>بارگذاری مجدد</AdminButton>
            </div>
            <AdminTable
              loading={messagesLoading}
              columns={[
                { key: 'subject', label: 'موضوع' },
                { key: 'body', label: 'متن' },
                { key: 'attachment', label: 'ضمیمه' },
                { key: 'to', label: 'گیرنده' },
                { key: 'date', label: 'تاریخ' },
                { key: 'actions', label: '', className: 'w-20' },
              ]}
              emptyMessage="هنوز پیامی ارسال نشده است."
            >
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold text-foreground">{m.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs"><p className="line-clamp-2 text-sm">{m.body}</p></td>
                  <td className="px-4 py-3 text-sm">
                    {m.attachmentUrl ? (
                      <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-foreground">
    {m.attachmentName || 'دانلود'}
                      </a>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {m.student ? `${m.student.firstName || ''} ${m.student.lastName || ''}`.trim() : 'همه اولیا'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/70">{new Date(m.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className="px-4 py-3"><AdminButton variant="danger" size="sm" onClick={() => deleteMessage(m.id)}>حذف</AdminButton></td>
                </tr>
              ))}
            </AdminTable>
          </AdminPanel>
        </section>
      )}

      {/* ───── اعلان‌ها ───── */}
      {tab === 'announcements' && (
        <section className="space-y-5">
          <AdminPageHeader
            title="مدیریت اعلان‌ها"
            description="اعلان عمومی در بالای صفحه اصلی سایت برای همه بازدیدکنندگان نمایش داده می‌شود"
            count={announcements.length}
          />

          <AdminPanel>
            <h3 className="mb-1 text-sm font-bold text-foreground">اعلان عمومی — بالای سایت</h3>
            <p className="mb-4 text-xs text-muted-foreground">برای همه بازدیدکنندگان صفحه اصلی نمایش داده می‌شود.</p>
            <form onSubmit={addAnnouncement} className="flex gap-3">
              <input value={annText} onChange={(e) => setAnnText(e.target.value)} className={`${inputCls} flex-1`} placeholder="متن اعلان عمومی..." required />
              <AdminButton type="submit" variant="primary" disabled={annSaving}>{annSaving ? '...' : 'افزودن'}</AdminButton>
            </form>
          </AdminPanel>

          <AdminPanel noPadding>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">لیست اعلان‌های عمومی</h3>
              <AdminButton variant="secondary" size="sm" onClick={loadAnnouncements}>بارگذاری مجدد</AdminButton>
            </div>
            <AdminTable
              loading={annLoading}
              columns={[
                { key: 'text', label: 'متن' },
                { key: 'status', label: 'وضعیت' },
                { key: 'date', label: 'تاریخ' },
                { key: 'actions', label: 'عملیات', className: 'w-40' },
              ]}
              emptyMessage="هنوز اعلان عمومی ثبت نشده است."
            >
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50">
                  <td className={`px-4 py-3 text-sm ${a.isActive ? 'text-foreground' : 'text-muted-foreground/70 line-through'}`}>{a.text}</td>
                  <td className="px-4 py-3"><AdminBadge variant={a.isActive ? 'success' : 'default'}>{a.isActive ? 'فعال' : 'غیرفعال'}</AdminBadge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/70">{new Date(a.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <AdminButton variant="secondary" size="sm" onClick={() => toggleAnnouncement(a)}>{a.isActive ? 'غیرفعال' : 'فعال'}</AdminButton>
                      <AdminButton variant="danger" size="sm" onClick={() => deleteAnnouncement(a.id)}>حذف</AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </AdminPanel>
        </section>
      )}

      {/* مودال نمایش فرم ثبت‌نام */}
      {viewingProfile && (
        <AdminProfileView
          profileEntry={viewingProfile}
          onClose={() => setViewingProfile(null)}
          onUpdated={loadCompletedProfiles}
        />
      )}
    </div>
  )
}

/* ───────────────────────── نمای کلی داشبورد ───────────────────────── */

const fa = (n) => Number(n || 0).toLocaleString('fa-IR')

function StatCard({ icon: Icon, label, value, sub, tone = 'default', accent }) {
  const toneCls = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-destructive/10 text-destructive',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  }[tone]

  return (
    <Card className="relative overflow-hidden rounded-2xl">
      {accent ? <span className={cn('absolute inset-x-0 top-0 h-1', accent)} /> : null}
      <CardContent className="flex items-start gap-4 p-5">
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', toneCls)}>
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-extrabold leading-none text-foreground">{value}</p>
          {sub ? <p className="mt-1.5 truncate text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({ icon: Icon, label, desc, onClick, tone = 'default' }) {
  const toneCls = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/30 hover:bg-muted/40"
    >
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', toneCls)}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-x-0.5" />
    </button>
  )
}

function AdminOverview({ students, preRegs, completedProfiles, academicYear, onNavigate }) {
  const preRegTotal = preRegs.length
  const preRegPending = preRegs.filter((r) => r.status === 'Pending').length
  const confirmedCount = students.length
  const completedCount = completedProfiles.length

  const withTuition = students.filter((s) => s.totalTuition != null)
  const totalTuition = withTuition.reduce((sum, s) => sum + Number(s.totalTuition || 0), 0)
  const totalPaid = students.reduce((sum, s) => sum + Number(s.total || 0), 0)
  const totalDebt = withTuition.reduce((sum, s) => sum + Math.max(0, Number(s.remaining || 0)), 0)
  const debtorCount = withTuition.filter((s) => Number(s.remaining || 0) > 0).length
  const settledCount = withTuition.filter((s) => Number(s.remaining || 0) <= 0).length
  const paidPct = totalTuition > 0 ? Math.min(100, Math.round((totalPaid / totalTuition) * 100)) : 0

  const recentPreRegs = [...preRegs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  const statusBadge = (status) => {
    if (status === 'Confirmed') return <Badge variant="success">تأییدشده</Badge>
    if (status === 'Rejected') return <Badge variant="danger">ردشده</Badge>
    return <Badge variant="pending">در انتظار</Badge>
  }

  return (
    <section className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden rounded-2xl border-primary/10">
        <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">سال تحصیلی {academicYear}</Badge>
              {preRegPending > 0 ? <Badge variant="warning">{fa(preRegPending)} پیش‌ثبت‌نام در انتظار</Badge> : null}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
              نمای کلی مدیریت
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              وضعیت ثبت‌نام، نوآموزان و امور مالی کودکستان در یک نگاه. برای مدیریت هر بخش از میان‌برهای زیر یا منوی کناری استفاده کنید.
            </p>
          </div>
          <div className="relative flex shrink-0 flex-wrap gap-2">
            {preRegPending > 0 ? (
              <AdminButton variant="primary" onClick={() => onNavigate('preReg')}>
                بررسی پیش‌ثبت‌نام‌ها
                <ChevronLeft className="h-4 w-4" />
              </AdminButton>
            ) : null}
            <AdminButton variant="secondary" onClick={() => onNavigate('finance')}>
              <Wallet className="h-4 w-4" />
              مدیریت مالی
            </AdminButton>
          </div>
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="پیش‌ثبت‌نام‌ها"
          value={fa(preRegTotal)}
          sub={preRegPending > 0 ? `${fa(preRegPending)} مورد در انتظار بررسی` : 'همه بررسی شده‌اند'}
          tone="info"
          accent="bg-sky-500"
        />
        <StatCard
          icon={Users}
          label="نوآموزان ثبت‌نام قطعی"
          value={fa(confirmedCount)}
          sub={`${fa(completedCount)} پرونده تکمیل‌شده`}
          tone="primary"
          accent="bg-primary"
        />
        <StatCard
          icon={CircleDollarSign}
          label="مجموع پرداخت‌شده"
          value={`${fa(Math.floor(totalPaid / 10))}`}
          sub="تومان — مجموع دریافتی امسال"
          tone="success"
          accent="bg-emerald-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="مانده بدهی"
          value={`${fa(Math.floor(totalDebt / 10))}`}
          sub={debtorCount > 0 ? `${fa(debtorCount)} نوآموز بدهکار` : 'بدون بدهی معوق'}
          tone={totalDebt > 0 ? 'danger' : 'success'}
          accent={totalDebt > 0 ? 'bg-destructive' : 'bg-emerald-500'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Finance summary */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                وضعیت وصول شهریه
              </h2>
              <Badge variant={paidPct >= 100 ? 'success' : paidPct >= 50 ? 'info' : 'warning'}>
                {fa(paidPct)}٪ وصول‌شده
              </Badge>
            </div>

            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all"
                style={{ width: `${paidPct}%` }}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Receipt className="h-3.5 w-3.5" /> شهریه کل
                </p>
                <p className="mt-1.5 text-lg font-extrabold text-foreground">{fa(Math.floor(totalTuition / 10))}</p>
                <p className="text-[11px] text-muted-foreground">تومان</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleDollarSign className="h-3.5 w-3.5" /> پرداخت‌شده
                </p>
                <p className="mt-1.5 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{fa(Math.floor(totalPaid / 10))}</p>
                <p className="text-[11px] text-muted-foreground">تومان</p>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> مانده
                </p>
                <p className="mt-1.5 text-lg font-extrabold text-destructive">{fa(Math.floor(totalDebt / 10))}</p>
                <p className="text-[11px] text-muted-foreground">تومان</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {fa(settledCount)} تسویه‌شده
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {fa(debtorCount)} بدهکار
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-foreground">میان‌برها</h2>
            <p className="mt-1 text-xs text-muted-foreground">دسترسی سریع به بخش‌های پرکاربرد</p>
            <div className="mt-4 grid gap-2.5">
              <QuickAction icon={ClipboardList} label="پیش‌ثبت‌نام" desc="تأیید و مدیریت درخواست‌ها" tone="info" onClick={() => onNavigate('preReg')} />
              <QuickAction icon={Wallet} label="مدیریت مالی" desc="پرداخت‌ها، اقساط و چک‌ها" tone="success" onClick={() => onNavigate('finance')} />
              <QuickAction icon={Mail} label="پیام‌رسانی" desc="ارسال پیام به اولیا" tone="violet" onClick={() => onNavigate('messages')} />
              <QuickAction icon={BookOpen} label="کاربرگ‌ها" desc="مدیریت محتوای آموزشی" tone="warning" onClick={() => onNavigate('worksheets')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent pre-registrations */}
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Clock className="h-5 w-5 text-muted-foreground" />
              آخرین پیش‌ثبت‌نام‌ها
            </h2>
            <AdminButton variant="ghost" size="sm" onClick={() => onNavigate('preReg')}>
              مشاهده همه
              <ArrowLeft className="h-3.5 w-3.5" />
            </AdminButton>
          </div>
          {recentPreRegs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.4} />
              <p className="mt-3 text-sm font-semibold text-foreground">هنوز پیش‌ثبت‌نامی ثبت نشده است</p>
              <p className="mt-1 text-xs text-muted-foreground">درخواست‌های جدید اینجا نمایش داده می‌شوند.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentPreRegs.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-muted/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {String(r.firstName || '').charAt(0)}{String(r.lastName || '').charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{r.firstName} {r.lastName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground ltr text-right">{r.phone}</p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">{r.gender || '—'}</span>
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground md:block">
                    {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                  {statusBadge(r.status)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
