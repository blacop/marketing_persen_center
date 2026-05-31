import { X, ChevronRight } from 'lucide-react'

export interface DrillDownDetail {
  type: string
  data: any
}

interface DrillDownModalProps {
  detail: DrillDownDetail
  onClose: () => void
  onDrillDown: (detail: DrillDownDetail) => void
  renderContent: (detail: DrillDownDetail, onDrillDown: (d: DrillDownDetail) => void) => React.ReactNode
}

export function DrillDownModal({ detail, onClose, onDrillDown, renderContent }: DrillDownModalProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(46,16,101,0.18)', backdropFilter: 'blur(3px)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      paddingTop: 80,
    }} onClick={onClose}>
      <div style={{
        width: 760, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
        background: 'var(--bg-primary)', borderRadius: 16,
        border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(46,16,101,0.15)',
        padding: 24,
      }} onClick={e => e.stopPropagation()}>
        {renderContent(detail, onDrillDown)}
      </div>
    </div>
  )
}

/* Reusable sub-components for detail views */

export function DetailHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      <button onClick={onClose} style={{ border: 'none', background: 'var(--bg-card)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
        <X size={18} />
      </button>
    </div>
  )
}

export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function DetailRow({ label, value, clickable, onClick, color }: { label: string; value: string | number; clickable?: boolean; onClick?: () => void; color?: string }) {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', borderRadius: 8,
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        marginBottom: 4,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
      onMouseEnter={clickable ? e => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)' } : undefined}
      onMouseLeave={clickable ? e => { e.currentTarget.style.background = 'var(--bg-card)' } : undefined}
    >
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
        {clickable && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
      </div>
    </div>
  )
}

export function ClickableTable({ headers, rows, onRowClick }: {
  headers: string[]
  rows: { cells: (string | number)[]; onClick?: () => void }[]
  onRowClick?: (index: number) => void
}) {
  return (
    <table className="data-table" style={{ width: '100%' }}>
      <thead>
        <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            onClick={row.onClick || (onRowClick ? () => onRowClick(i) : undefined)}
            style={{
              cursor: (row.onClick || onRowClick) ? 'pointer' : 'default',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (row.onClick || onRowClick) e.currentTarget.style.background = 'rgba(168,85,247,0.06)' }}
            onMouseLeave={e => { if (row.onClick || onRowClick) e.currentTarget.style.background = '' }}
          >
            {row.cells.map((c, j) => <td key={j}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
