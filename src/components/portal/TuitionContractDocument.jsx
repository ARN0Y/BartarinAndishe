'use client'

function SignatureImg({ src, alt, className = '' }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      className={`max-h-20 w-auto object-contain ${className}`}
    />
  )
}

/** برچسب امضا در یک طرف، تصویر امضا روبروی آن */
function SignatureRow({ label, date, url, alt, placeholder = '................................', images }) {
  const items = images?.length
    ? images
    : url
      ? [{ src: url, alt: alt || 'امضا' }]
      : []

  return (
    <div className="mt-4 flex items-center justify-between gap-6 border-t border-dotted border-navy/20 pt-4">
      <div className="min-w-0 flex-1 text-sm">
        <p>{label}</p>
        {date ? (
          <p className="mt-1 font-bold text-navy">{date}</p>
        ) : (
          <p className="mt-1 text-slate-400">{placeholder}</p>
        )}
      </div>
      <div className="flex h-20 w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-navy/15 bg-white p-2">
        {items.length ? (
          items.map((img) => (
            <SignatureImg key={img.src} src={img.src} alt={img.alt} className="max-h-[2.75rem] max-w-full" />
          ))
        ) : (
          <span className="text-xs text-slate-300">امضا</span>
        )}
      </div>
    </div>
  )
}

function Fill({ value, placeholder = '........................................' }) {
  const text = value && String(value).trim() ? value : placeholder
  const filled = Boolean(value && String(value).trim())
  return (
    <span
      className={`inline-block min-w-[6rem] border-b border-dotted border-navy/50 px-1 font-bold leading-8 ${
        filled ? 'text-navy' : 'text-slate-400'
      }`}
    >
      {text}
    </span>
  )
}

function HighlightTitle({ children, className = '' }) {
  return (
    <span
      className={`inline-block rounded-md bg-amber-100 px-2 py-0.5 font-extrabold text-navy ring-1 ring-amber-200/80 ${className}`}
    >
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

function Para({ children }) {
  return <p className="text-justify text-[13px] leading-8 text-navy/90">{children}</p>
}

function ListItem({ n, children }) {
  return (
    <li className="text-justify text-[13px] leading-8 text-navy/90">
      <HighlightTitle>{n}-</HighlightTitle> {children}
    </li>
  )
}

function ClauseBlock({ n, title, children }) {
  return (
    <li className="text-justify text-[13px] leading-8 text-navy/90">
      <p>
        <HighlightTitle>
          {n}- {title}
        </HighlightTitle>
      </p>
      <div className="mt-1">{children}</div>
    </li>
  )
}


export default function TuitionContractDocument({ fields, signed = false }) {
  const f = fields || {}

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

      <ArticleTitle>ماده 1- طرفین قرارداد</ArticleTitle>
      <Para>
        قرارداد زیر در تاریخ <Fill value={f.contractDate} /> بین{' '}
        <span className="font-bold">{f.managerName} {f.managerTitle}</span> و{' '}
        <Fill value={f.parentLine} /> ولی نوآموز <Fill value={f.studentFullName} /> تلفن منزل :{' '}
        <Fill value={f.homePhone} /> تلفن همراه : <Fill value={f.mobilePhone} /> آدرس منزل :{' '}
        <Fill value={f.address} placeholder="........................................................................................................................................................" />
      </Para>

      <ArticleTitle>ماده 2- موضوع و مبلغ شهریه</ArticleTitle>
      <Para>
        انجام برنامه های مصوب سازمان ملی تعلیم و تربیت ، شهریه مصوب برای 22 ساعت آموزشی در هفته،{' '}
        <span className="font-bold">مبلغ شهریه</span> به عدد (ریال){' '}
        <Fill value={f.tuitionRialFormatted ? `${f.tuitionRialFormatted} ریال` : ''} /> و به حروف{' '}
        <Fill value={f.tuitionRialWords} placeholder="......................................................................." />{' '}
        برای کل یک سال تحصیلی (8 ماه) می باشد. نرخ خدمات بابت هزینه های کارگاه های هوش ، لیوان چینی، رباتیک
        و ..... به مدت 5 ماه در ساعت درسی و توسط مربی مجرب و مجزا برگزار می گردد که هزینه فعالیت های
        تکمیلی و مکمل متعاقبا اعلام و دریافت خواهد شد.
      </Para>

      <ArticleTitle>ماده 3 – تعهدات طرفین</ArticleTitle>
      <ol className="list-none space-y-2 pr-0">
        <ListItem n={1}>
          ساعت فعالیت کودکستان بر اساس مجوز فعالیت صادر شده حداکثر از ساعت 30: 7 تا 30: 12 می باشد. آموزش
          کودکستان 5 روز در هفته ( از شنبه تا چهارشنبه ) ارائه می گردد و روزهای پنج شنبه تعطیل است.
        </ListItem>
        <ListItem n={2}>
          والدین موظف هستند رأس زمان اتمام کار کودکستان، (حداکثر 30 : 12 ) جهت تحویل کودک خود مراجعه و در
          صورت بی توجهی بعد از زمان ذکر شده کودکستان هیچ گونه مسئولیتی و تعهدی در برابر فرزند شما نخواهد
          داشت.
        </ListItem>
        <ListItem n={3}>
          هرگونه عدم استفاده از خدمات کودکستان به خاطر تعطیلات رسمی، تعطیلات عید، آلودگی هوا، حوادث بیماری
          واگیردار، کرونا و .... که خارج از اختیارات کودکستان باشد، مشمول کسری شهریه نمی گردد. ودر این
          موارد رقمی کسر یا بازگردانده نخواهد شد، در این ایام کودکستان تنها به ارائه آموزش غیرحضوری،
          آفلاین مطابق بخشنامه سازمان ملی تعلیم و تربیت کودک اقدام می نماید و شهریه ثابت گروه سنی بالای 4 سال
          تمام و کامل دریافت می گردد.
        </ListItem>
        <ListItem n={4}>
          ارتباط تلفنی با مربیان در ساعات درسی ممنوع می باشد و ملاقات حضوری با مربی از قبل و در طول سال
          تحصیلی و به صورت دوره ای و متناسب با برنامه کودکستان جهت تبادل نظر و اطلاع از وضعیت نوآموز در
          محل کودکستان با صلاح دید مدیریت اطلاع رسانی و انجام می گردد. ولی موظف است در جلساتی که به صورت
          دوره ای و متناسب با برنامه کودکستان برگزار می گردد شرکت نماید.
        </ListItem>
        <ListItem n={5}>
          جهت استفاده از سرویس مدرسه، ولی نوآموز می بایست در سامانه معرفی شده توسط تاکسیرانی ثبت نام نماید.
          هرگونه سؤالی در مورد هزینه ها، مشکلات سرویس، هماهنگی راننده و ... توسط مسئولی که توسط شرکت زیر
          نظر تاکسیرانی انجام می گیرد. لازم به ذکر است شماره همراه مسئول سرویس در اختیار
          والدین قرار خواهد گرفت.
        </ListItem>
        <ListItem n={6}>
          تهیه وسایل عمومی کتاب، لوازم التحریر بر عهده والدین می باشد. کودکستان لیستی از وسایل مورد نیاز
          نوآموز برای استفاده در طول سال تحصیلی را با ذکر تعداد، مارک، قیمت و .... در اختیار ولی نوآموز
          قرار می دهد و والدین ملزم به تهیه از فروشگاه پیشنهادی از طرف کودکستان و یا هر جای دیگری به
          صلاح دید خود می باشد.{' '}
          <span className="font-bold">
            تذکر: برخی از اقلام به منظور یکسان سازی برای تمام کودکان مثل: کتابهای درسی، کلاسور، برخی نوشت
            افزار و .... توسط کودکستان تهیه گرددو هزینه آن دریافت می گردد.
          </span>
        </ListItem>
        <ClauseBlock n={7} title="فرم و کیف و جامدادی">
          <p>
            فرم لباس نوآموزان در داخل کودکستان و در حضور ولی نوآموز اندازه گیری می گردد. لذا والدین گرامی
            در انتخاب سایز دقت لازم را داشته باشند، چون تغییر سایز امکان پذیر نمی باشد. قیمت هزینه فرم نوآموز پسر{' '}
            <span className="font-extrabold text-navy">«بستگی به سایز»</span> بین{' '}
            <Fill value={f.uniformBoyFromToman ? `${f.uniformBoyFromToman} تومان` : ''} placeholder="..............." />{' '}
            و{' '}
            <Fill value={f.uniformBoyToToman ? `${f.uniformBoyToToman} تومان` : ''} placeholder="..............." />{' '}
            متغیر می‌باشد و قیمت هزینه فرم نوآموز دختر با مقنعه{' '}
            <span className="font-extrabold text-navy">«بستگی به سایز»</span> بین{' '}
            <Fill value={f.uniformGirlFromToman ? `${f.uniformGirlFromToman} تومان` : ''} placeholder="..............." />{' '}
            و{' '}
            <Fill value={f.uniformGirlToToman ? `${f.uniformGirlToToman} تومان` : ''} placeholder="..............." />{' '}
            متغیر می‌باشد.
          </p>
          <p className="mt-1">
            قیمت کیف و جامدادی با چاپ عکس نوآموز بر روی آن مبلغ{' '}
            <Fill value={f.bagSetToman ? `${f.bagSetToman} تومان` : ''} placeholder="----------- تومان" />{' '}
            که به صورت نقدی یا کارت به کارت یا با دستگاه پوز دریافت می گردد.
          </p>
        </ClauseBlock>
        <ClauseBlock n={8} title="بیمه حوادث">
          <p>
            همه نوآموزان می بایست تحت پوشش بیمه حوادث در محدوده داخل کودکستان و اردوها، با اخذ هزینه مربوطه
            از والدین مطابق باتعرفه پیش بینی شده در قرارداد بین کودکستان با شرکت بیمه باشند و این امر
            اجباری است.
          </p>
        </ClauseBlock>
        <ClauseBlock n={9} title="هزینه اردوها">
          <p>
            هزینه اردوهای متناسب با واحد کار کودکستان (آموزشی، علمی، تفریحی) بر عهده والدین می باشد و پس
            از تصویب شورای مدرسه و اخذ مجوز از اداره آموزش و پرورش ناحیه 4 به اطلاع والدین رسانده می شود.
            والدین به صلاح دید خود می توانند پس از امضا رضایت نامه، فرزندانشان در اردو شرکت نماید.
          </p>
        </ClauseBlock>
        <ClauseBlock n={10} title="هزینه فیلم و عکس">
          <p>
            ابتدای سال تحصیلی نمونه ای از آلبوم عکس سال قبل به رؤیت والدین رسانده می شود و والدین در صورت
            تمایل می توانند به انتخاب فیلم و عکس بپردازند. سفارش فیلم و عکس کاملاً <span className="font-bold">اختیاری</span> است.
          </p>
        </ClauseBlock>
        <ListItem n={11}>
          کودکستان هیچ گونه مسئولیتی در مورد برنامه و آموزش های عقب افتاده روزانه نوآموز که بر اثر غیبت و
          تأخیر می باشد را ندارد.
        </ListItem>
        <ListItem n={12}>
          حضور نوآموز در کودکستان الزامی است و در صورت مشکل غیبت، ولی محترم می بایست مراتب را جهت موجه
          نمودن غیبت کودک خود قبل از ساعت 9 صبح همان روز به اطلاع کودکستان برسانند.
        </ListItem>
        <ListItem n={13}>
          والدین می بایست به صورت کتبی هرگونه بیماری، عادت یا حساسیت غذایی کودک را به کودکستان و مربی
          اطلاع دهند.
        </ListItem>
        <ListItem n={14}>
          در صورت انصراف از دریافت خدمات کودکستان، والدین می بایست حداکثر ظرف مدت یک ماه نسبت به دریافت
          وسایل کودک خود اقدام نمایند، در غیراین صورت کودکستان هیچ مسئولیتی در قبال نگهداری وسایل ندارد.
        </ListItem>
      </ol>

      <div className="mt-6 rounded-xl border border-navy/10 bg-slate-50/60 p-4">
        <Para>
          ولی محترم نوآموز <Fill value={f.studentFullName} /> ضمن تشکر و قدردانی از همکاری نزدیک شما با
          کودکستان برترین اندیشه لازم به ذکر است این مرکز اقدام به تشکیل کلاس های{' '}
          <span className="underline underline-offset-2">تکمیلی، مکمل و اختیاری</span>
          <br />
          لیوان چینی، رباتیک و کارگاه هوش و .... در ساعت درسی رسمی ( به مدت 5 ماه ) توسط مربی مجرب و مجزا
          نموده است.
        </Para>
        <Para>
          هزینه این کلاس ها، جشن ها و جوایز مناسبات ملی و مذهبی 10 تا 30 درصد شهریه مصوب کودکستان و تعیین
          درصد آن با تصمیم شورای مدرسه و پس از تأیید کارشناس کودکستان ناحیه یا معاون آموزشی ابتدایی به
          والدین اعلام می گردد.
        </Para>
        <p className="mt-4 text-left text-sm font-bold">{f.founderName}</p>
        <p className="text-left text-xs text-slate-muted">{f.founderTitle}</p>
        <Para>
          <span className="mt-4 block">
            اینجانب ولی نوآموز <Fill value={f.parentFullName} /> رضایت و مشارکت خود را نسبت به موارد فوق
            الذکر و امکانات آموزشی و فعالیت های تکمیلی جهت فرزندم در {f.gradeLabel} را اعلام می دارم.
          </span>
        </Para>
      </div>

      <ArticleTitle>ماده 4- انصراف از ثبت نام</ArticleTitle>
      <Para>
        به استناد ماده 32 آیین نامه تعیین شهریه خدمات تربیتی ، آموزشی و مراقبتی کودکستان ها، بر اساس
        قرارداد منعقد شده سالیانه در صورتی که ولی متربی از ثبت نام کودک خود رسماً و به صورت مکتوب انصراف
        دهد، کودکستان مجاز است:
      </Para>
      <Para>
        الف) در صورت انصراف ولی قانونی کودک قبل از دریافت خدمات تربیتی، آموزشی و مراقبتی ، حداکثر یک نهم
        را کسر و مابقی به ولی کودک مسترد گردد.
      </Para>
      <Para>
        ب) در صورت انصراف ولی قانونی کودک در سه ماه اول مندرج در قرارداد، حداکثر نصف شهریه را کسر و مابقی
        را به ولی کودک مسترد نماید
      </Para>
      <Para>
        ج) در صورت انصراف بعد از سه ماهه اول مطابق قرارداد، 100 درصد شهریه را به عنوان جبران خسارت محاسبه
        و کسر نماید.
      </Para>

      <ArticleTitle>ماده 5- نحوه پرداخت شهریه</ArticleTitle>
      <Para>
        احتراما اینجانب <Fill value={f.parentFullName} /> ولی نوآموز ، ضمن آگاهی کامل از دستور العمل
        پرداخت شهریه کودکستان، متعهد به پرداخت شهریه فرزندم به مبلغ{' '}
        <Fill value={f.tuitionRialFormatted ? `${f.tuitionRialFormatted} ریال` : ''} /> به حروف{' '}
        <Fill value={f.tuitionRialWords} placeholder="..............................................................." />{' '}
        مطابق با زمان های مقرر در جدول ذیل در وجه مؤسس کودکستان برترین اندیشه به شماره حساب {f.bankAccount}{' '}
        {f.bankName} به نام {f.accountHolder} با کدملی {f.accountNationalId} ثبت و اقدام گردد.
      </Para>

      <div className="mt-4 overflow-x-auto">
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

      {f.hasAmanatChecks && (f.amanatCashSchedules || []).length > 0 ? (
        <div className="mt-8 space-y-4 border-t border-dashed border-navy/15 pt-6">
          <Para>
            اینجانب <Fill value={f.parentFullName} /> ولی نوآموز <Fill value={f.studentFullName} /> ضمن تحویل
            چک(های) امانت، متعهد می‌شوم مبالغ پرداخت نقدی مقرر در جدول(های) ذیل را مطابق تاریخ‌های تعیین‌شده
            توسط مدیریت کودکستان، در موعد مقرر پرداخت نمایم.
            {f.amanatCommitmentAccepted ? (
              <span className="mt-2 block text-xs font-bold text-emerald-700">
                ✓ تعهد پرداخت نقدی چک(های) امانت توسط والدین پذیرفته شده است.
              </span>
            ) : null}
          </Para>
          {f.amanatCashSchedules.map((schedule, sIdx) => (
            <div key={sIdx} className="rounded-xl border border-navy/10 bg-slate-50/60 p-4 text-navy/90">
              <p className="text-[13px] font-extrabold text-navy">
                برنامه پرداخت نقدی چک امانت
                {schedule.checkNumber ? ` — شماره ${schedule.checkNumber}` : ''}
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

      {(f.customArticles || []).length > 0 ? (
        <div className="mt-8 space-y-4 border-t border-dashed border-navy/15 pt-6">
          {f.customArticles.map((article, idx) => (
            <div key={idx}>
              {article.title ? <ArticleTitle>{article.title}</ArticleTitle> : null}
              {(article.clauses || []).length > 0 ? (
                <ol className="list-none space-y-2 pr-0">
                  {article.clauses.map((clause, cIdx) => (
                    <ListItem key={cIdx} n={cIdx + 1}>{clause}</ListItem>
                  ))}
                </ol>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="contract-signatures mt-12 space-y-8 border-t-2 border-navy/25 pt-8 text-[13px]">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p>نام و نام خانوادگی ولی نوآموز : <Fill value={f.parentFullName} /></p>
            <SignatureRow
              label="امضا و تاریخ"
              date={f.contractDate || null}
              url={f.parentSignatureUrl}
              alt="امضای ولی"
            />
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
            موارد فوق مورد تایید اینجانب <span className="font-bold">{f.founderName}</span> {f.founderTitle} می باشد.
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
