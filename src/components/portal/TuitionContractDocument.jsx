'use client'

import { DEFAULT_CONTRACT_ARTICLES } from '@/data/tuitionContractArticles'

function SignatureImg({ src, alt, className = '' }) {
  if (!src) return null
  return <img src={src} alt={alt} className={`max-h-20 w-auto object-contain ${className}`} />
}

function SignatureRow({ label, date, url, alt, placeholder = '................................', images }) {
  const items = images?.length ? images : url ? [{ src: url, alt: alt || 'امضا' }] : []
  return (
    <div className="mt-4 flex items-center justify-between gap-6 border-t border-dotted border-navy/20 pt-4">
      <div className="min-w-0 flex-1 text-sm">
        <p>{label}</p>
        {date ? <p className="mt-1 font-bold text-navy">{date}</p> : <p className="mt-1 text-slate-400">{placeholder}</p>}
      </div>
      <div className="flex h-20 w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-navy/15 bg-white p-2">
        {items.length ? (
          items.map((img) => <SignatureImg key={img.src} src={img.src} alt={img.alt} className="max-h-[2.75rem] max-w-full" />)
        ) : (
          <span className="text-xs text-slate-300">امضا</span>
        )}
      </div>
    </div>
  )
}

function HighlightTitle({ children, className = '' }) {
  return (
    <span className={`inline-block rounded-md bg-amber-100 px-2 py-0.5 font-extrabold text-navy ring-1 ring-amber-200/80 ${className}`}>
      {children}
    </span>
  )
}

function ArticleTitle({ children }) {
  return (
    <h3 className="mt-6 mb-3">
      <HighlightTitle className="text-sm">{children}</HighlightTitle>
    </h3>
  )
}

// ── رندر متن با توکن {..} و بولد **..** ──
function buildTokens(f) {
  const rial = (v) => (v ? `${v} تومان` : '')
  return {
    'تاریخ': f.contractDate,
    'مدیر': `${f.managerName || ''} ${f.managerTitle || ''}`.trim(),
    'ولی': f.parentLine,
    'ولی-کامل': f.parentFullName,
    'نوآموز': f.studentFullName,
    'تلفن-منزل': f.homePhone,
    'موبایل': f.mobilePhone,
    'آدرس': f.address,
    'شهریه': f.tuitionRialFormatted ? `${f.tuitionRialFormatted} ریال` : '',
    'شهریه-حروف': f.tuitionRialWords,
    'پایه': f.gradeLabel,
    'سال-تحصیلی': f.academicYear,
    'مؤسس': f.founderName,
    'یونیفرم-پسر-از': rial(f.uniformBoyFromToman),
    'یونیفرم-پسر-تا': rial(f.uniformBoyToToman),
    'یونیفرم-دختر-از': rial(f.uniformGirlFromToman),
    'یونیفرم-دختر-تا': rial(f.uniformGirlToToman),
    'کیف': rial(f.bagSetToman),
    'شماره-حساب': f.bankAccount,
    'بانک': f.bankName,
    'صاحب-حساب': f.accountHolder,
    'کدملی-حساب': f.accountNationalId,
  }
}

function renderRich(text, tokens) {
  const parts = String(text || '').split(/(\{[^}]+\}|\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.length > 2 && part.startsWith('{') && part.endsWith('}')) {
      const key = part.slice(1, -1)
      const val = tokens[key]
      if (val != null && String(val).trim() !== '') {
        return <span key={i} className="font-bold text-navy">{val}</span>
      }
      return (
        <span key={i} className="inline-block min-w-[5rem] border-b border-dotted border-navy/50 px-1 text-slate-400">
          ...............
        </span>
      )
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-extrabold text-navy">{part.slice(2, -2)}</span>
    }
    return <span key={i}>{part}</span>
  })
}

function ArticleBlock({ article, tokens }) {
  const clauses = article.clauses || []
  return (
    <div>
      {article.title ? <ArticleTitle>{article.title}</ArticleTitle> : null}
      {article.numbered ? (
        <ol className="list-none space-y-2 pr-0">
          {clauses.map((c, i) => (
            <li key={i} className="text-justify text-[13px] leading-8 text-navy/90">
              <HighlightTitle>{i + 1}-</HighlightTitle> {renderRich(c, tokens)}
            </li>
          ))}
        </ol>
      ) : (
        <div className="space-y-2">
          {clauses.map((c, i) => (
            <p key={i} className="text-justify text-[13px] leading-8 text-navy/90">{renderRich(c, tokens)}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TuitionContractDocument({ fields }) {
  const f = fields || {}
  const tokens = buildTokens(f)
  const articles = Array.isArray(f.articles) && f.articles.length ? f.articles : DEFAULT_CONTRACT_ARTICLES

  return (
    <article className="contract-document space-y-1 text-navy">
      <header className="border-b border-navy/15 pb-4 text-center">
        <img
          src={f.logoUrl || '/images/logo.svg'}
          alt="لوگوی کودکستان برترین اندیشه"
          className="mx-auto mb-3 h-16 w-auto object-contain"
        />
        <p className="text-sm font-bold text-navy">بسمه تعالی</p>
        <h2 className="mt-2 text-base font-extrabold sm:text-lg">
          قرارداد شهریه و دریافت خدمات {f.schoolName}
        </h2>
        <p className="mt-1 text-sm font-bold">سال تحصیلی {f.academicYear}</p>
        <p className="mt-1 text-xs text-slate-muted">{f.copiesNote}</p>
      </header>

      {/* مواد قرارداد — از پنل مدیر قابل‌ویرایش */}
      {articles.map((article, idx) => (
        <ArticleBlock key={idx} article={article} tokens={tokens} />
      ))}

      {/* جدول پرداخت شهریه (پویا — از قرارداد مالی) */}
      <ArticleTitle>جدول پرداخت شهریه</ArticleTitle>
      <div className="mt-2 overflow-x-auto">
        {(f.paymentRows || []).some((row) => row.amountRial || row.paymentTypeDate) ? (
          <table className="min-w-full border-collapse border border-navy/20 text-[12px]">
            <thead>
              <tr className="bg-pink-soft/40">
                <th className="border border-navy/20 px-2 py-2 font-bold">ردیف</th>
                <th className="border border-navy/20 px-2 py-2 font-bold">نوع/ تاریخ پرداخت</th>
                <th className="border border-navy/20 px-2 py-2 font-bold">شماره فیش / چک</th>
                <th className="border border-navy/20 px-2 py-2 font-bold">بانک</th>
                <th className="border border-navy/20 px-2 py-2 font-bold">کد شعبه</th>
                <th className="border border-navy/20 px-2 py-2 font-bold">مبلغ به ریال</th>
              </tr>
            </thead>
            <tbody>
              {(f.paymentRows || []).map((row) => (
                <tr key={row.row}>
                  <td className="border border-navy/20 px-2 py-2 text-center">{row.row}</td>
                  <td className="border border-navy/20 px-2 py-2">{row.paymentTypeDate || '—'}</td>
                  <td className="border border-navy/20 px-2 py-2">{row.checkNumber || '—'}</td>
                  <td className="border border-navy/20 px-2 py-2">{row.bankName || '—'}</td>
                  <td className="border border-navy/20 px-2 py-2">{row.bankBranch || '—'}</td>
                  <td className="border border-navy/20 px-2 py-2 font-bold">{row.amountRial || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="rounded-xl border border-dashed border-navy/15 bg-slate-50/60 px-4 py-6 text-center text-[12px] text-slate-500">
            {f.financialPlanReady
              ? 'جدول پرداخت: ردیفی در قرارداد مالی ثبت نشده است.'
              : 'جدول پرداخت پس از تکمیل «قرارداد مالی» توسط مدیریت در اینجا نمایش داده می‌شود.'}
          </p>
        )}
      </div>

      {/* برنامهٔ پرداخت نقدی چک‌های امانت (پویا) */}
      {f.hasAmanatChecks && (f.amanatCashSchedules || []).length > 0 ? (
        <div className="mt-8 space-y-4 border-t border-dashed border-navy/15 pt-6">
          <p className="text-justify text-[13px] leading-8 text-navy/90">
            اینجانب <span className="font-bold text-navy">{f.parentFullName}</span> ولی نوآموز{' '}
            <span className="font-bold text-navy">{f.studentFullName}</span> ضمن تحویل چک(های) امانت، متعهد می‌شوم مبالغ
            پرداخت نقدی مقرر در جدول(های) ذیل را مطابق تاریخ‌های تعیین‌شده توسط مدیریت کودکستان، در موعد مقرر پرداخت نمایم.
            {f.amanatCommitmentAccepted ? (
              <span className="mt-2 block text-xs font-bold text-emerald-700">
                ✓ تعهد پرداخت نقدی چک(های) امانت توسط والدین پذیرفته شده است.
              </span>
            ) : null}
          </p>
          {f.amanatCashSchedules.map((schedule, sIdx) => (
            <div key={sIdx} className="rounded-xl border border-navy/10 bg-slate-50/60 p-4 text-navy/90">
              <p className="text-[13px] font-extrabold text-navy">
                برنامه پرداخت نقدی چک امانت{schedule.checkNumber ? ` — شماره ${schedule.checkNumber}` : ''}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border-collapse border border-navy/20 text-[12px]">
                  <thead>
                    <tr className="bg-pink-soft/30">
                      <th className="border border-navy/20 px-2 py-2 font-bold">ردیف</th>
                      <th className="border border-navy/20 px-2 py-2 font-bold">تاریخ پرداخت</th>
                      <th className="border border-navy/20 px-2 py-2 font-bold">مبلغ (ریال)</th>
                      <th className="border border-navy/20 px-2 py-2 font-bold">مبلغ (تومان)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(schedule.rows || []).map((row) => (
                      <tr key={row.row}>
                        <td className="border border-navy/20 px-2 py-2 text-center">{row.row}</td>
                        <td className="border border-navy/20 px-2 py-2 font-bold">{row.paymentDate}</td>
                        <td className="border border-navy/20 px-2 py-2 font-bold">{row.amountRial}</td>
                        <td className="border border-navy/20 px-2 py-2">{row.amountToman} تومان</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* امضاها (پویا) */}
      <div className="contract-signatures mt-12 space-y-8 border-t-2 border-navy/25 pt-8 text-[13px]">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p>نام و نام خانوادگی ولی نوآموز : <span className="font-bold text-navy">{f.parentFullName}</span></p>
            <SignatureRow label="امضا و تاریخ" date={f.contractDate || null} url={f.parentSignatureUrl} alt="امضای ولی" />
          </div>
          <div>
            <p>نام و نام خانوادگی مدیر کودکستان: <span className="font-bold">{f.managerName} {f.managerTitle}</span></p>
            <SignatureRow
              label="امضا و تاریخ مهر کودکستان"
              date={f.contractDate || null}
              images={[
                f.managerStampUrl ? { src: f.managerStampUrl, alt: 'مهر کودکستان' } : null,
                f.managerSignatureUrl ? { src: f.managerSignatureUrl, alt: 'امضای مدیر' } : null,
              ].filter(Boolean)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-dotted border-navy/15 pt-6 text-navy/90">
          <p className="flex-1 text-[13px]">
            موارد فوق مورد تایید اینجانب <span className="font-bold">{f.founderName}</span> {f.founderTitle} می‌باشد.
          </p>
          <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-lg border border-dashed border-navy/15 bg-white p-2">
            {f.founderSignatureUrl ? (
              <SignatureImg src={f.founderSignatureUrl} alt="امضای مؤسس" className="max-h-full max-w-full" />
            ) : (
              <span className="text-xs text-slate-400">امضا مؤسس</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
