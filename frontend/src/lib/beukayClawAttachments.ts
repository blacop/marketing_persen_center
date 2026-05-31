export type BeukayClawAttachment = {
  id: string
  name: string
  type: string
  size: number
  preview?: string
  truncated?: boolean
}

const TEXT_FILE_EXTENSIONS = [
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.csv',
  '.tsv',
  '.yaml',
  '.yml',
  '.xml',
  '.html',
  '.css',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.sql',
  '.log',
]

const DEFAULT_TEXT_PREVIEW_LIMIT = 12_000

export function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function isTextLikeFile(file: Pick<File, 'name' | 'type'>) {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return type.startsWith('text/')
    || type.includes('json')
    || type.includes('xml')
    || TEXT_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export async function readBeukayClawAttachment(file: File, previewLimit = DEFAULT_TEXT_PREVIEW_LIMIT): Promise<BeukayClawAttachment> {
  const attachment: BeukayClawAttachment = {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    type: file.type || 'unknown',
    size: file.size,
  }

  if (!isTextLikeFile(file)) {
    return attachment
  }

  const rawText = await file.text()
  attachment.preview = rawText.length > previewLimit ? rawText.slice(0, previewLimit) : rawText
  attachment.truncated = rawText.length > previewLimit
  return attachment
}

export function buildBeukayClawMessage(text: string, attachments: BeukayClawAttachment[]) {
  const trimmedText = text.trim()
  if (attachments.length === 0) return trimmedText

  const attachmentBlocks = attachments.map((file, index) => {
    const preview = file.preview
      ? `内容预览：\n${file.preview}${file.truncated ? '\n...（内容已截断）' : ''}`
      : '内容预览：该文件为二进制或暂不支持前端文本预览，请先根据文件元信息判断下一步需要调用的 Agent 或追问用户。'

    return [
      `### 文件 ${index + 1}`,
      `- 文件名：${file.name}`,
      `- 类型：${file.type}`,
      `- 大小：${formatAttachmentSize(file.size)}`,
      preview,
    ].join('\n')
  }).join('\n\n')

  return `${trimmedText}\n\n## 用户上传文件\n${attachmentBlocks}`
}
