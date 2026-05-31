/**
 * 通用CSV导出工具 — 将数据数组导出为CSV文件并触发浏览器下载
 */
export function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const bom = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const headerLine = headers.join(',')
  const dataLines = rows.map(row =>
    row.map(cell => {
      const str = String(cell)
      // 如果包含逗号、换行或引号，用双引号包裹
      return str.includes(',') || str.includes('\n') || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(',')
  )
  const csv = bom + [headerLine, ...dataLines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 从对象数组导出CSV — 自动提取 headers
 */
export function exportObjectsCsv(
  filename: string,
  data: Record<string, string | number>[],
  headerMap?: Record<string, string>, // key → 中文列名
) {
  if (data.length === 0) return
  const keys = Object.keys(data[0])
  const headers = keys.map(k => headerMap?.[k] ?? k)
  const rows = data.map(item => keys.map(k => item[k]))
  exportCsv(filename, headers, rows)
}
