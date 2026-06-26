'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Inbox } from 'lucide-react'
import {
  Table, TableBody, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

/* ── Design Tokens ─────────────────────────────────── */
export const inputCls =
  'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export const labelCls = 'mb-1.5 block text-sm font-medium text-foreground'

/* ── Page Header ─────────────────────────────────── */
export function AdminPageHeader({ title, description, count, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {count != null ? <Badge variant="secondary">{count.toLocaleString('fa-IR')} مورد</Badge> : null}
        </div>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── Panel (Card wrapper) ─────────────────────── */
export function AdminPanel({ children, className = '', noPadding = false }) {
  return (
    <Card className={cn('overflow-hidden rounded-lg', className)}>
      {noPadding ? children : <CardContent className="p-5">{children}</CardContent>}
    </Card>
  )
}

/* ── Badge ─────────────────────────────────── */
export function AdminBadge({ variant = 'default', children, className }) {
  const variantMap = {
    default: 'secondary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    pending: 'pending',
  }
  return (
    <Badge variant={variantMap[variant] || 'secondary'} className={className}>
      {children}
    </Badge>
  )
}

/* ── Button ─────────────────────────────────── */
export function AdminButton({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}) {
  const variantMap = {
    primary: 'default',
    secondary: 'outline',
    danger: 'destructive',
    success: 'success',
    ghost: 'ghost',
    link: 'link',
  }
  const sizeMap = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
  }
  return (
    <Button
      type={type}
      variant={variantMap[variant] || 'default'}
      size={sizeMap[size] || 'default'}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}

/* ── Filter Bar ─────────────────────────────── */
export function AdminFilterBar({ children }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
      {children}
    </div>
  )
}

/* ── Filter Group ─────────────────────────────── */
export function AdminFilterGroup({ label, children }) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-xs font-semibold text-muted-foreground pl-1">{label}</span>}
      {children}
    </div>
  )
}

/* ── Filter Button ─────────────────────────────── */
export function AdminFilterBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-background text-foreground ring-1 ring-border hover:bg-accent'
      )}
    >
      {children}
    </button>
  )
}

/* ── Table header controls ─────────────────────── */
export function AdminTableHeaderSelect({ label, value, onChange, options, placeholder = '—' }) {
  return (
    <div className="flex min-w-[84px] flex-col items-end gap-1">
      <span className="text-[11px] font-bold leading-none text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full min-w-[84px] max-w-[132px] rounded-md border border-border bg-background px-1.5 text-[10px] font-semibold text-foreground outline-none focus:ring-1 focus:ring-ring"
      >
        {placeholder != null ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export function applyTableSort(raw, setSortBy, setSortDir) {
  if (!raw) return
  const [by, dir] = raw.split(':')
  setSortBy(by)
  setSortDir(dir || 'asc')
}

/* ── Table ─────────────────────────────────── */
export function AdminTable({ columns, children, emptyMessage, loading }) {
  if (loading) {
    return (
      <Card className="rounded-lg border-dashed shadow-none">
        <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          در حال بارگذاری...
        </CardContent>
      </Card>
    )
  }
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <Card className="rounded-lg border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/35" strokeWidth={1.4} />
          <p className="text-sm font-semibold text-foreground">داده‌ای برای نمایش وجود ندارد</p>
          <p className="mt-1 text-xs text-muted-foreground">{emptyMessage || 'موردی یافت نشد.'}</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table className="min-w-full text-sm">
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-muted/60">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'h-auto min-h-11 whitespace-nowrap px-3 py-2 text-right align-bottom text-xs font-bold text-muted-foreground',
                  col.className
                )}
              >
                {col.header ?? col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border bg-card [&_td]:px-4 [&_td]:py-3 [&_tr]:transition-colors [&_tr:hover]:bg-muted/35">
          {children}
        </TableBody>
      </Table>
    </div>
  )
}

/* ── Pagination ─────────────────────────────── */
export function AdminPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          قبلی
        </Button>
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          بعدی
        </Button>
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────── */
export function AdminEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
