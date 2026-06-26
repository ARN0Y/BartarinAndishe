/** ۱۰ سوال آموزش صدای حرف «ب» — گزینه‌ها با ایموجی کارتونی */

const RAW_QUESTIONS = [
  {
    id: 1,
    type: 'start',
    prompt: 'کدام تصویر با صدای «بـ» شروع می‌شود؟',
    correctId: 'baba',
    options: [
      { id: 'baba', label: 'بابا', emoji: '👨‍👧', bg: 'from-sky-200 to-sky-400' },
      { id: 'seeb', label: 'سیب', emoji: '🍎', bg: 'from-red-200 to-red-400' },
      { id: 'toop', label: 'توپ', emoji: '⚽', bg: 'from-green-200 to-green-400' },
    ],
  },
  {
    id: 2,
    type: 'start',
    prompt: 'کدام تصویر با صدای «بـ» شروع می‌شود؟',
    correctId: 'badkonak',
    options: [
      { id: 'badkonak', label: 'بادکنک', emoji: '🎈', bg: 'from-pink-200 to-pink-400' },
      { id: 'aab', label: 'آب', emoji: '💧', bg: 'from-blue-200 to-blue-400' },
      { id: 'nan', label: 'نان', emoji: '🍞', bg: 'from-amber-200 to-amber-400' },
    ],
  },
  {
    id: 3,
    type: 'start',
    prompt: 'کدام تصویر با صدای «بـ» شروع می‌شود؟',
    correctId: 'babr',
    options: [
      { id: 'babr', label: 'ببر', emoji: '🐯', bg: 'from-orange-200 to-orange-400' },
      { id: 'khargoosh', label: 'خرگوش', emoji: '🐰', bg: 'from-purple-200 to-purple-400' },
      { id: 'ketab', label: 'کتاب', emoji: '📚', bg: 'from-indigo-200 to-indigo-400' },
    ],
  },
  {
    id: 4,
    type: 'end',
    prompt: 'کدام تصویر با صدای «ب» تمام می‌شود؟',
    correctId: 'aab',
    options: [
      { id: 'aab', label: 'آب', emoji: '💧', bg: 'from-cyan-200 to-cyan-400' },
      { id: 'baba', label: 'بابا', emoji: '👨‍👧', bg: 'from-sky-200 to-sky-400' },
      { id: 'toop', label: 'توپ', emoji: '⚽', bg: 'from-lime-200 to-lime-400' },
    ],
  },
  {
    id: 5,
    type: 'end',
    prompt: 'کدام تصویر با صدای «ب» تمام می‌شود؟',
    correctId: 'seeb',
    options: [
      { id: 'seeb', label: 'سیب', emoji: '🍎', bg: 'from-rose-200 to-rose-400' },
      { id: 'nan', label: 'نان', emoji: '🍞', bg: 'from-yellow-200 to-yellow-400' },
      { id: 'badkonak', label: 'بادکنک', emoji: '🎈', bg: 'from-fuchsia-200 to-fuchsia-400' },
    ],
  },
  {
    id: 6,
    type: 'end',
    prompt: 'کدام تصویر با صدای «ب» تمام می‌شود؟',
    correctId: 'ketab',
    options: [
      { id: 'ketab', label: 'کتاب', emoji: '📖', bg: 'from-violet-200 to-violet-400' },
      { id: 'gorbe', label: 'گربه', emoji: '🐱', bg: 'from-amber-200 to-yellow-400' },
      { id: 'khargoosh', label: 'خرگوش', emoji: '🐰', bg: 'from-teal-200 to-teal-400' },
    ],
  },
  {
    id: 7,
    type: 'start',
    prompt: 'کدام تصویر با صدای «بـ» شروع می‌شود؟',
    correctId: 'barf',
    options: [
      { id: 'barf', label: 'برف', emoji: '❄️', bg: 'from-slate-200 to-blue-300' },
      { id: 'leb', label: 'لب', emoji: '👄', bg: 'from-pink-200 to-pink-300' },
      { id: 'lebass', label: 'لباس', emoji: '👕', bg: 'from-emerald-200 to-emerald-400' },
    ],
  },
  {
    id: 8,
    type: 'end',
    prompt: 'کدام تصویر با صدای «ب» تمام می‌شود؟',
    correctId: 'leb',
    options: [
      { id: 'leb', label: 'لب', emoji: '👄', bg: 'from-red-200 to-pink-400' },
      { id: 'barf', label: 'برف', emoji: '❄️', bg: 'from-blue-100 to-blue-300' },
      { id: 'babr', label: 'ببر', emoji: '🐯', bg: 'from-orange-200 to-orange-400' },
    ],
  },
  {
    id: 9,
    type: 'start',
    prompt: 'کدام تصویر با صدای «بـ» شروع می‌شود؟',
    correctId: 'bastani',
    options: [
      { id: 'bastani', label: 'بستنی', emoji: '🍦', bg: 'from-cyan-200 to-teal-400' },
      { id: 'seeb', label: 'سیب', emoji: '🍎', bg: 'from-red-200 to-red-400' },
      { id: 'aab', label: 'آب', emoji: '💧', bg: 'from-blue-200 to-blue-500' },
    ],
  },
  {
    id: 10,
    type: 'end',
    prompt: 'کدام تصویر با صدای «ب» تمام می‌شود؟',
    correctId: 'ketab2',
    options: [
      { id: 'ketab2', label: 'کتاب', emoji: '📚', bg: 'from-indigo-200 to-purple-400' },
      { id: 'toop', label: 'توپ', emoji: '🏀', bg: 'from-amber-200 to-orange-400' },
      { id: 'nan', label: 'نان', emoji: '🥖', bg: 'from-yellow-200 to-amber-400' },
    ],
  },
]

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Returns questions with randomly-ordered options (call once per game session) */
export function getShuffledQuestions() {
  return RAW_QUESTIONS.map((q) => ({ ...q, options: shuffle(q.options) }))
}

export const BE_PHONICS_QUESTIONS = RAW_QUESTIONS
