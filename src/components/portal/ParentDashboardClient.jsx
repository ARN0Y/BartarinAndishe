'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { INTERACTIVE_WORKSHEETS } from '@/data/interactiveWorksheets'
import StudentProfileForm from './StudentProfileForm'
import TuitionContractPanel from './TuitionContractPanel'
import ParentPasswordCard from './ParentPasswordCard'
import ParentShell from './ParentShell'
import PrintInvoiceButton from '@/components/ui/PrintInvoiceButton'
import CardNumberCopy from '@/components/CardNumberCopy'
import InvoicePrintHeader from '@/components/ui/InvoicePrintHeader'
import InvoicePrintWatermark from '@/components/ui/InvoicePrintWatermark'
import InvoicePrintFooter from '@/components/ui/InvoicePrintFooter'
import { getInvoiceBalanceDisplay, formatBalanceToman } from '@/lib/invoiceBalance'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableFooter, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import {
  UserCircle, FileSignature, Wallet, BookOpen, Inbox,
  FileText, Lock, Check, ChevronLeft, RefreshCw,
  ReceiptText, ShieldCheck, ClipboardCheck, MailOpen, Download,
  Gamepad2, ExternalLink, CircleDollarSign, LayoutDashboard, Settings,
  ArrowLeft,
} from 'lucide-react'

const TAB_ICONS = {
  overview: LayoutDashboard,
  profile: UserCircle,
  contract: FileSignature,
  finance: Wallet,
  worksheets: BookOpen,
  messages: Inbox,
  settings: Settings,
}

const PARENT_TABS = [
  { key: 'overview', label: 'داشبورد' },
  { key: 'profile', label: 'پرونده نوآموز' },
  { key: 'contract', label: 'قرارداد شهریه' },
  { key: 'finance', label: 'امور مالی', requiresContract: true },
  { key: 'worksheets', label: 'کاربرگ‌ها', requiresContract: true },
  { key: 'messages', label: 'پیام‌ها', requiresContract: true },
  { key: 'settings', label: 'تنظیمات و رمز' },
]

const TAB_SUBTITLE = {
  overview: 'نمای کلی پرونده، مالی و خدمات',
  profile: 'تکمیل و مشاهدهٔ اطلاعات نوآموز',
  contract: 'مطالعه و امضای قرارداد شهریه',
  finance: 'فاکتور، اقساط و پرداخت‌ها',
  worksheets: 'کاربرگ‌ها و تمرین‌های تعاملی',
  messages: 'صندوق پیام‌های مدیریت',
  settings: 'مدیریت رمز عبور و حساب',
}

function isTabLocked(tabKey, profileCompleted, contractSigned) {
  if (tabKey === 'overview' || tabKey === 'profile' || tabKey === 'settings') return false
  if (tabKey === 'contract') return !profileCompleted
  return !profileCompleted || !contractSigned
}

function defaultParentTab(profileCompleted, contractSigned) {
  if (!profileCompleted) return 'profile'
  if (!contractSigned) return 'contract'
  return 'overview'
}

function rialToToman(rial) {
  const value = Math.floor((Number(rial) || 0) / 10)
  return new Intl.NumberFormat('fa-IR').format(value)
}

function DashboardMetric({ icon: Icon, label, value, hint, tone = 'default' }) {
  const iconCls = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  }[tone]

  return (
    <Card className="rounded-xl transition-shadow hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconCls)}>
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </span>
        </div>
        <p className="mt-3 truncate text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
        {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

function WorkflowStep({ done, locked, active, label, description, icon: Icon, onClick, actionLabel }) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border p-4 transition-colors',
        done && 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/70 dark:bg-emerald-950/25',
        active && !done && 'border-primary/30 bg-primary/5',
        locked && 'border-border bg-muted/30 opacity-80',
        !done && !active && !locked && 'border-border bg-card',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
            done
              ? 'border-emerald-200 bg-emerald-600 text-white dark:border-emerald-800'
              : locked
                ? 'border-border bg-muted text-muted-foreground'
                : 'border-border bg-background text-foreground',
          )}
        >
          {locked ? <Lock className="h-5 w-5" /> : done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {onClick && !locked && !done ? (
        <Button size="sm" variant={active ? 'default' : 'outline'} className="mt-3 w-full" onClick={onClick}>
          {actionLabel || 'ادامه'}
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}

function StatusChip({ profileCompleted, contractSigned }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold',
      contractSigned
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        : profileCompleted
          ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'border-border bg-muted text-muted-foreground',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', contractSigned ? 'bg-emerald-500' : profileCompleted ? 'bg-amber-500' : 'bg-muted-foreground')} />
      {contractSigned ? 'فعال' : profileCompleted ? 'در انتظار قرارداد' : 'پرونده ناقص'}
    </span>
  )
}

export default function ParentDashboardClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const validTabs = PARENT_TABS.map((t) => t.key)
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [contractSigned, setContractSigned] = useState(false)

  function switchTab(tab) {
    if (!validTabs.includes(tab)) return
    setActiveTab(tab)
    router.replace(`/payment/parent/dashboard?tab=${tab}`, { scroll: false })
  }

  function trySwitchTab(tab, profileCompleted, contractSignedState) {
    if (isTabLocked(tab, profileCompleted, contractSignedState)) {
      switchTab(defaultParentTab(profileCompleted, contractSignedState))
      return
    }
    switchTab(tab)
  }

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [profileRes, contractRes] = await Promise.all([
        fetch('/api/parent/profile'),
        fetch('/api/parent/contract'),
      ])
      const profileJson = await profileRes.json()
      const contractJson = contractRes.ok ? await contractRes.json() : { signed: false }
      if (!profileRes.ok) {
        throw new Error(profileJson.message || 'خطا در دریافت اطلاعات نوآموز')
      }

      const signed = Boolean(contractJson.signed)
      setContractSigned(signed)
      setProfileData(profileJson)

      if (signed) {
        const invoiceRes = await fetch('/api/parent/invoice')
        const invoiceJson = await invoiceRes.json()
        if (!invoiceRes.ok) {
          throw new Error(invoiceJson.message || 'خطا در دریافت فاکتور')
        }
        setData(invoiceJson)
      } else {
        setData(null)
      }
    } catch (err) {
      setError(err.message)
      setProfileData(null)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshUnreadCount() {
    try {
      const res = await fetch('/api/parent/messages')
      const json = await res.json()
      if (!res.ok) return
      setUnreadCount((json.messages || []).filter((m) => !m.isRead).length)
    } catch {
      setUnreadCount(0)
    }
  }

  async function markAllRead(list) {
    const unread = list.filter((m) => !m.isRead).map((m) => m.id)
    if (!unread.length) return
    await fetch('/api/parent/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unread }),
    })
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })))
    setUnreadCount(0)
  }

  function handleProfileSaved(updatedProfile) {
    const completed = Boolean(updatedProfile?.profileCompleted)
    setProfileData((prev) => ({
      ...prev,
      profile: { ...(prev?.profile || {}), ...updatedProfile, profileCompleted: completed },
    }))
    if (completed) {
      switchTab('contract')
    }
  }

  async function loadAndMarkMessages() {
    setMessagesLoading(true)
    try {
      const res = await fetch('/api/parent/messages')
      const json = await res.json()
      const list = json.messages || []
      setMessages(list)
      const unread = list.filter((m) => !m.isRead).length
      setUnreadCount(unread)
      if (unread) await markAllRead(list)
    } catch { setMessages([]) }
    finally { setMessagesLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { refreshUnreadCount() }, [])
  useEffect(() => {
    if (loading || !profileData) return
    const profileCompleted = profileData?.profile?.profileCompleted
    const wanted = validTabs.includes(tabParam) ? tabParam : defaultParentTab(profileCompleted, contractSigned)
    if (isTabLocked(wanted, profileCompleted, contractSigned)) {
      switchTab(defaultParentTab(profileCompleted, contractSigned))
      return
    }
    setActiveTab(wanted)
  }, [loading, profileData, contractSigned, tabParam])

  useEffect(() => {
    if (activeTab === 'messages' && contractSigned) loadAndMarkMessages()
    else if (contractSigned) refreshUnreadCount()
  }, [activeTab, contractSigned])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
        <Card className="w-full max-w-sm rounded-xl">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">در حال آماده‌سازی پنل اولیا</p>
              <p className="mt-1 text-xs text-muted-foreground">اطلاعات پرونده، قرارداد و مالی همزمان بررسی می‌شود.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!profileData?.student) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>پنل والدین بارگذاری نشد</AlertTitle>
          <AlertDescription>{error || 'لطفا دوباره وارد شوید؛ سشن والد معتبر نیست یا پاسخ سرور کامل نیست.'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const student = profileData.student
  const studentFullName = `${student.firstName} ${student.lastName}`
  const invoice = data?.invoice
  const worksheets = data?.worksheets ?? []
  const visibleInteractiveSlugs = data?.visibleInteractiveSlugs ?? []
  const spotDifferenceGames = data?.spotDifferenceGames ?? []
  const matchingGames = data?.matchingGames ?? []
  const schedules = invoice?.schedules ?? data?.schedules ?? []
  const profileCompleted = profileData?.profile?.profileCompleted
  const studentPhoto = profileData?.profile?.photoUrl
  const balance = invoice ? getInvoiceBalanceDisplay(invoice.remaining) : null
  const totalPaidRial = invoice?.payments?.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0) || 0
  const unpaidSchedules = schedules.filter((schedule) => !schedule.isPaid)
  const completionScore = (() => {
    let score = 0
    if (profileCompleted) score += 35
    if (contractSigned) score += 35
    if (invoice) score += 20
    if (unreadCount === 0) score += 10
    return Math.min(score, 100)
  })()

  const navBadge = contractSigned ? unreadCount : 0
  const groups = [
    {
      label: 'نمای کلی',
      items: [{ key: 'overview', label: 'داشبورد', icon: TAB_ICONS.overview, locked: false }],
    },
    {
      label: 'پرونده و قرارداد',
      items: [
        { key: 'profile', label: 'پرونده نوآموز', icon: TAB_ICONS.profile, locked: false },
        { key: 'contract', label: 'قرارداد شهریه', icon: TAB_ICONS.contract, locked: isTabLocked('contract', profileCompleted, contractSigned) },
      ],
    },
    {
      label: 'خدمات',
      items: [
        { key: 'finance', label: 'امور مالی', icon: TAB_ICONS.finance, locked: isTabLocked('finance', profileCompleted, contractSigned) },
        { key: 'worksheets', label: 'کاربرگ‌ها', icon: TAB_ICONS.worksheets, locked: isTabLocked('worksheets', profileCompleted, contractSigned) },
        { key: 'messages', label: 'پیام‌ها', icon: TAB_ICONS.messages, locked: isTabLocked('messages', profileCompleted, contractSigned), badgeCount: navBadge },
      ],
    },
    {
      label: 'حساب کاربری',
      items: [{ key: 'settings', label: 'تنظیمات و رمز', icon: TAB_ICONS.settings, locked: false }],
    },
  ]

  const goto = (key) => trySwitchTab(key, profileCompleted, contractSigned)

  return (
    <ParentShell
      student={{ name: studentFullName, code: student.studentCode, nationalId: student.nationalId, photo: studentPhoto }}
      completionScore={completionScore}
      groups={groups}
      activeTab={activeTab}
      onNavigate={goto}
      title={`داشبورد خانوادهٔ ${studentFullName}`}
      subtitle={TAB_SUBTITLE[activeTab]}
      statusChip={<StatusChip profileCompleted={profileCompleted} contractSigned={contractSigned} />}
    >
      {activeTab === 'overview' && (
        <OverviewPanel
          studentFullName={studentFullName}
          studentCode={student.studentCode}
          profileCompleted={profileCompleted}
          contractSigned={contractSigned}
          invoice={invoice}
          balance={balance}
          totalPaidRial={totalPaidRial}
          unpaidSchedules={unpaidSchedules}
          unreadCount={unreadCount}
          onGoto={goto}
        />
      )}

      {activeTab === 'profile' && (
        <StudentProfileForm
          student={profileData?.student}
          initialProfile={profileData?.profile}
          registrationStatus={profileData?.student?.registrationStatus}
          preRegBirthDate={profileData?.preRegBirthDate}
          readOnly={profileCompleted}
          onSaved={handleProfileSaved}
        />
      )}

      {activeTab === 'contract' && (
        <TuitionContractPanel
          profileCompleted={profileCompleted}
          onSigned={async () => {
            setContractSigned(true)
            await load()
            switchTab('overview')
          }}
        />
      )}

      {activeTab === 'finance' && contractSigned && invoice && (
        <InvoiceView invoice={invoice} schedules={schedules} />
      )}

      {activeTab === 'worksheets' && contractSigned && (
        <WorksheetsList
          worksheets={worksheets}
          visibleInteractiveSlugs={visibleInteractiveSlugs}
          spotDifferenceGames={spotDifferenceGames}
          matchingGames={matchingGames}
        />
      )}

      {activeTab === 'messages' && contractSigned && (
        <MessagesPanel
          messages={messages}
          messagesLoading={messagesLoading}
          unreadCount={unreadCount}
          onRefresh={loadAndMarkMessages}
        />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-5">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" />
                اطلاعات حساب
              </CardTitle>
              <CardDescription>اطلاعات ورود و حساب اولیای نوآموز</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="نام نوآموز" value={studentFullName} />
              <InfoRow label="کد ملی" value={student.nationalId} ltr />
              {student.studentCode ? <InfoRow label="کد نوآموز" value={student.studentCode} ltr /> : null}
              <InfoRow label="سال تحصیلی" value={student.academicYear} ltr />
            </CardContent>
          </Card>
          <ParentPasswordCard />
        </div>
      )}
    </ParentShell>
  )
}

function InfoRow({ label, value, ltr = false }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-sm font-bold text-foreground', ltr && 'ltr text-right font-mono')}>{value || '—'}</p>
    </div>
  )
}

function OverviewPanel({ studentFullName, studentCode, profileCompleted, contractSigned, invoice, balance, totalPaidRial, unpaidSchedules, unreadCount, onGoto }) {
  const workflowSteps = [
    {
      key: 'profile',
      label: 'پرونده نوآموز',
      description: profileCompleted ? 'اطلاعات اصلی تکمیل و تأیید شده است.' : 'فرم اطلاعات نوآموز باید کامل شود.',
      icon: UserCircle,
      done: profileCompleted,
      locked: false,
      actionLabel: 'تکمیل فرم',
    },
    {
      key: 'contract',
      label: 'قرارداد شهریه',
      description: contractSigned ? 'قرارداد امضا و ثبت شده است.' : 'پس از تکمیل پرونده فعال می‌شود.',
      icon: FileSignature,
      done: contractSigned,
      locked: !profileCompleted,
      actionLabel: 'مشاهده قرارداد',
    },
    {
      key: 'finance',
      label: 'امور مالی',
      description: invoice ? 'فاکتور، اقساط و پرداخت‌ها آماده است.' : 'بعد از امضای قرارداد نمایش داده می‌شود.',
      icon: Wallet,
      done: Boolean(invoice),
      locked: !profileCompleted || !contractSigned,
      actionLabel: 'مشاهده مالی',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-l from-pink-deep/10 via-card to-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-pink-deep">پنل اختصاصی اولیا</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              خوش آمدید، خانوادهٔ {studentFullName}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
              {contractSigned
                ? 'دسترسی کامل به خدمات پنل فعال است؛ امور مالی، کاربرگ‌ها و پیام‌ها در دسترس‌اند.'
                : profileCompleted
                  ? 'پرونده تکمیل شده است؛ برای فعال‌سازی خدمات، قرارداد شهریه را امضا کنید.'
                  : 'برای شروع، فرم اطلاعات نوآموز را کامل کنید تا مراحل بعدی فعال شوند.'}
            </p>
          </div>
          {studentCode ? (
            <span className="hidden shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
              کد نوآموز: <span className="ltr font-bold text-foreground">{studentCode}</span>
            </span>
          ) : null}
        </div>
        {!contractSigned ? (
          <div className="mt-4">
            <Button size="sm" onClick={() => onGoto(profileCompleted ? 'contract' : 'profile')}>
              {profileCompleted ? 'امضای قرارداد شهریه' : 'تکمیل فرم اطلاعات'}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          icon={CircleDollarSign}
          label="پرداخت‌شده"
          value={invoice ? `${rialToToman(totalPaidRial)} تومان` : 'پس از قرارداد'}
          hint={invoice ? 'جمع پرداخت‌های ثبت‌شده' : 'هنوز فاکتور فعال نیست'}
          tone="success"
        />
        <DashboardMetric
          icon={ReceiptText}
          label="مانده مالی"
          value={invoice && balance ? (balance.tone === 'settled' ? 'تسویه شده' : formatBalanceToman(balance.displayRial)) : 'نامشخص'}
          hint={balance?.label || 'وابسته به قرارداد شهریه'}
          tone={balance?.tone === 'settled' ? 'success' : 'warning'}
        />
        <DashboardMetric
          icon={ClipboardCheck}
          label="اقساط باز"
          value={contractSigned ? unpaidSchedules.length.toLocaleString('fa-IR') : 'قفل'}
          hint={contractSigned ? 'قسط در انتظار پرداخت' : 'بعد از امضا فعال می‌شود'}
          tone="info"
        />
        <DashboardMetric
          icon={MailOpen}
          label="پیام‌ها"
          value={unreadCount > 0 ? `${unreadCount.toLocaleString('fa-IR')} خوانده‌نشده` : 'بدون پیام جدید'}
          hint="صندوق ارتباط با مدیریت"
          tone={unreadCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Workflow */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5" />
            مسیر فعال‌سازی خدمات
          </CardTitle>
          <CardDescription>سه گام تا دسترسی کامل به خدمات پنل</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {workflowSteps.map(({ key, ...step }) => (
            <WorkflowStep key={key} {...step} onClick={() => onGoto(key)} />
          ))}
        </CardContent>
      </Card>

      {/* Quick links */}
      {contractSigned ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink icon={Wallet} label="امور مالی" desc="فاکتور و پرداخت‌ها" onClick={() => onGoto('finance')} />
          <QuickLink icon={BookOpen} label="کاربرگ‌ها" desc="تمرین‌ها و فایل‌ها" onClick={() => onGoto('worksheets')} />
          <QuickLink icon={Inbox} label="پیام‌ها" desc="ارتباط با مدیریت" onClick={() => onGoto('messages')} badge={unreadCount} />
        </div>
      ) : null}
    </div>
  )
}

function QuickLink({ icon: Icon, label, desc, onClick, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/30 hover:bg-muted/40"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
        {badge ? (
          <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
            {badge > 9 ? '9+' : badge.toLocaleString('fa-IR')}
          </span>
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <ChevronLeft className="mr-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
    </button>
  )
}

function MessagesPanel({ messages, messagesLoading, unreadCount, onRefresh }) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Inbox className="h-5 w-5" />
            صندوق پیام‌ها
          </CardTitle>
          <CardDescription className="mt-2">ارتباط‌های ثبت‌شده از طرف مدیریت کودکستان</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? <Badge variant="danger">{unreadCount.toLocaleString('fa-IR')} جدید</Badge> : <Badge variant="secondary">خوانده شده</Badge>}
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            بازخوانی
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {messagesLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            در حال بارگذاری پیام‌ها...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-10 text-center">
            <MailOpen className="h-10 w-10 text-muted-foreground/45" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-foreground">پیامی ثبت نشده است</p>
            <p className="mt-1 text-xs text-muted-foreground">وقتی مدیریت پیامی ارسال کند، همین‌جا نمایش داده می‌شود.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[560px] pr-1">
            <div className="space-y-3">
              {messages.map((m) => (
                <article
                  key={m.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    m.isRead ? 'border-border bg-card' : 'border-primary/25 bg-primary/5',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!m.isRead ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                        <h3 className="text-sm font-bold text-foreground">{m.subject}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{m.body}</p>
                    </div>
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString('fa-IR', { dateStyle: 'medium' })}
                    </time>
                  </div>
                  {m.attachmentUrl ? (
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                        {m.attachmentName ? `دریافت ${m.attachmentName}` : 'دریافت ضمیمه'}
                      </a>
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function InvoiceView({ invoice, schedules = [] }) {
  const unpaid = schedules.filter((s) => !s.isPaid)
  const balance = getInvoiceBalanceDisplay(invoice.remaining)
  const totalPaid = invoice.payments.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)

  return (
    <div className="space-y-5">
      <div className="no-print flex justify-end">
        <PrintInvoiceButton />
      </div>

      <div id="invoice-print-root" className="relative space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm">
        <InvoicePrintWatermark />
        <InvoicePrintHeader invoice={invoice} />

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-lg shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">جمع پرداخت‌شده</p>
              <p className="mt-2 text-xl font-extrabold text-foreground">{rialToToman(totalPaid)} تومان</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">شهریه کل</p>
              <p className="mt-2 text-xl font-extrabold text-foreground">
                {invoice.totalTuition ? `${rialToToman(invoice.totalTuition)} تومان` : 'ثبت نشده'}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{balance?.label || 'مانده'}</p>
              <p
                className={cn(
                  'mt-2 text-xl font-extrabold',
                  balance?.tone === 'settled' ? 'text-emerald-600' : balance?.tone === 'credit' ? 'text-sky-600' : 'text-destructive',
                )}
              >
                {balance?.tone === 'settled' ? 'تسویه شده' : balance ? formatBalanceToman(balance.displayRial) : 'نامشخص'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle className="text-base">پرداخت‌های ثبت‌شده</CardTitle>
            <CardDescription>ریز پرداخت‌های تایید شده در پرونده مالی</CardDescription>
          </CardHeader>
          <CardContent>
            {invoice.payments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                هیچ پرداختی ثبت نشده است.
              </div>
            ) : (
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>تاریخ پرداخت</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>توضیحات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-mono ltr text-right">{p.dateFormatted}</TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground">{p.amountFormatted}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{rialToToman(p.amountPaid)} تومان</span>
                      </TableCell>
                      <TableCell>
                        {p.description?.includes('قسط') ? (
                          <span className="flex flex-wrap items-center gap-2">
                            <Badge variant="info">قسط</Badge>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{p.description || '—'}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {unpaid.length > 0 ? (
          <Card className="rounded-lg border-amber-200 bg-amber-50/45 shadow-none dark:border-amber-900/60 dark:bg-amber-950/20">
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base text-amber-900 dark:text-amber-200">اقساط در انتظار پرداخت</CardTitle>
                <CardDescription className="mt-1 text-amber-800/80 dark:text-amber-200/75">
                  {unpaid.length.toLocaleString('fa-IR')} قسط باز، جمع {rialToToman(unpaid.reduce((a, s) => a + s.amountDue, 0))} تومان
                </CardDescription>
              </div>
              <Badge variant="warning">پیگیری مالی</Badge>
            </CardHeader>
            <CardContent>
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-amber-100/70 dark:bg-amber-950/50">
                    <TableHead>تاریخ سررسید</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaid.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono ltr text-right">{s.dueDate}</TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground">{s.amountFormatted || Number(s.amountDue).toLocaleString('en-US')}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{rialToToman(s.amountDue)} تومان</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.description || '—'}</TableCell>
                      <TableCell><Badge variant="warning">در انتظار پرداخت</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>جمع اقساط باز</TableCell>
                    <TableCell colSpan={2} className="font-bold">{rialToToman(unpaid.reduce((a, s) => a + s.amountDue, 0))} تومان</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        <InvoicePrintFooter />
      </div>

      {unpaid.length > 0 && <CardNumberCopy />}
    </div>
  )
}

function WorksheetsList({ worksheets, visibleInteractiveSlugs = [], spotDifferenceGames = [], matchingGames = [] }) {
  const visibleInteractive = INTERACTIVE_WORKSHEETS.filter((item) =>
    visibleInteractiveSlugs.includes(item.id),
  )
  const hasInteractive = visibleInteractive.length > 0 || spotDifferenceGames.length > 0 || matchingGames.length > 0
  const hasFile = worksheets.length > 0

  if (!hasInteractive && !hasFile) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/45" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-bold text-foreground">هنوز کاربرگی فعال نشده است</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">بعد از فعال‌سازی توسط مدیریت، فایل‌ها و تمرین‌های تعاملی اینجا نمایش داده می‌شوند.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {hasInteractive ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gamepad2 className="h-5 w-5" />
              کاربرگ‌های تعاملی
            </CardTitle>
            <CardDescription>تمرین‌هایی که مستقیم در مرورگر اجرا می‌شوند.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleInteractive.map((item) => (
                <InteractiveWorksheetCard key={item.id} item={item} />
              ))}
              {spotDifferenceGames.map((game) => (
                <SpotDifferenceWorksheetCard key={game.id} game={game} />
              ))}
              {matchingGames.map((game) => (
                <MatchingWorksheetCard key={game.id} game={game} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {hasFile ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              کاربرگ‌های فایلی
            </CardTitle>
            <CardDescription>فایل‌های PDF یا تصویر برای دانلود و مشاهده.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {worksheets.map((item) => (
                <WorksheetCard key={item.id} worksheet={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function WorksheetSurface({ badge, title, description, href, tone = 'default' }) {
  const toneCls = {
    default: 'border-border bg-card',
    amber: 'border-amber-200 bg-amber-50/45 dark:border-amber-900/60 dark:bg-amber-950/20',
    violet: 'border-violet-200 bg-violet-50/45 dark:border-violet-900/60 dark:bg-violet-950/20',
    emerald: 'border-emerald-200 bg-emerald-50/45 dark:border-emerald-900/60 dark:bg-emerald-950/20',
  }[tone]

  return (
    <article className={cn('rounded-lg border p-5 transition-colors hover:bg-muted/35', toneCls)}>
      <Badge variant={tone === 'amber' ? 'warning' : tone === 'emerald' ? 'success' : tone === 'violet' ? 'info' : 'secondary'}>{badge}</Badge>
      <h3 className="mt-3 text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-7 text-muted-foreground">{description}</p>
      <Button asChild className="mt-4" size="sm">
        <Link href={href}>
          شروع تمرین
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </article>
  )
}

function SpotDifferenceWorksheetCard({ game }) {
  return (
    <WorksheetSurface
      badge="پیدا کردن تفاوت"
      title={game.title}
      description={game.description || ((game.stageCount || 0) + ' مرحله - تفاوت‌ها را با دقت پیدا کن.')}
      href={`/payment/parent/worksheets/spot/${game.slug}`}
      tone="amber"
    />
  )
}

function MatchingWorksheetCard({ game }) {
  return (
    <WorksheetSurface
      badge="وصل‌کردنی"
      title={game.title}
      description={game.description || ((game.stageCount || 0) + ' مرحله - ' + (game.pairCount || 0) + ' جفت تصویر')}
      href={`/payment/parent/worksheets/match/${game.slug}`}
      tone="violet"
    />
  )
}

function InteractiveWorksheetCard({ item }) {
  return (
    <WorksheetSurface
      badge={item.badge}
      title={item.title}
      description={item.description}
      href={item.href}
      tone="emerald"
    />
  )
}

function WorksheetCard({ worksheet }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted/35">
      <Badge variant="secondary">{worksheet.createdAtFormatted}</Badge>
      <h3 className="mt-3 text-base font-bold text-foreground">{worksheet.title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{worksheet.description}</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <a href={worksheet.fileUrl} target="_blank" rel="noopener noreferrer">
          <Download className="h-3.5 w-3.5" />
          دانلود یا مشاهده فایل
        </a>
      </Button>
    </article>
  )
}
