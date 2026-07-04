'use client'

import { useState } from 'react'
import AdminHomeContentEditor from './AdminHomeContentEditor'
import AdminContentListEditor from './AdminContentListEditor'
import AdminMemoryAlbumsPanel from './AdminMemoryAlbumsPanel'
import AdminContractArticlesEditor from './AdminContractArticlesEditor'
import AdminSiteLayoutPanel from './AdminSiteLayoutPanel'
import { Home, BookOpenCheck, Sparkles, Images, FileSignature, PanelRight } from 'lucide-react'

const SUBTABS = [
  { key: 'home', label: 'صفحهٔ اصلی', icon: Home },
  { key: 'layout', label: 'چیدمان و ساید‌بار', icon: PanelRight },
  { key: 'parentResource', label: 'آنچه والدین باید بدانند', icon: BookOpenCheck },
  { key: 'extraSkill', label: 'مهارت‌های فوق‌برنامه', icon: Sparkles },
  { key: 'memories', label: 'آلبوم خاطرات', icon: Images },
  { key: 'contract', label: 'مواد قرارداد', icon: FileSignature },
]

export default function AdminSiteContentPanel() {
  const [sub, setSub] = useState('home')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/40 p-1.5">
        {SUBTABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSub(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                sub === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {sub === 'home' && <AdminHomeContentEditor />}
      {sub === 'layout' && <AdminSiteLayoutPanel />}
      {sub === 'parentResource' && (
        <AdminContentListEditor
          section="parentResource"
          title="آنچه والدین باید بدانند"
          description="مقالات و ویدیوهای کوتاه دربارهٔ فرزندپروری. موارد فعال در صفحهٔ اصلی نمایش داده می‌شوند."
          allowVideo
        />
      )}
      {sub === 'extraSkill' && (
        <AdminContentListEditor
          section="extraSkill"
          title="مهارت‌های فوق‌برنامه"
          description="مهارت‌های فوق‌برنامهٔ کودکستان (هوش، رباتیک، هنر و...). موارد فعال در صفحهٔ اصلی نمایش داده می‌شوند."
          allowVideo={false}
        />
      )}
      {sub === 'memories' && <AdminMemoryAlbumsPanel />}
      {sub === 'contract' && <AdminContractArticlesEditor />}
    </div>
  )
}
