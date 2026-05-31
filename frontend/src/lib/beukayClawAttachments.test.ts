import { describe, expect, it } from 'vitest'
import { buildBeukayClawMessage, formatAttachmentSize, readBeukayClawAttachment } from './beukayClawAttachments'

describe('beukayClawAttachments', () => {
  it('formats file size for attachment preview', () => {
    expect(formatAttachmentSize(12)).toBe('12 B')
    expect(formatAttachmentSize(2048)).toBe('2.0 KB')
    expect(formatAttachmentSize(3 * 1024 * 1024)).toBe('3.0 MB')
  })

  it('reads text-like files and builds a message payload with attachment context', async () => {
    const attachment = await readBeukayClawAttachment({
      name: 'brief.txt',
      type: 'text/plain',
      size: 24,
      text: async () => '产品名：种子气垫\n卖点：持妆',
    } as File)

    expect(attachment.preview).toContain('种子气垫')

    const message = buildBeukayClawMessage('帮我生成脚本蓝图', [attachment])
    expect(message).toContain('帮我生成脚本蓝图')
    expect(message).toContain('## 用户上传文件')
    expect(message).toContain('brief.txt')
    expect(message).toContain('产品名：种子气垫')
  })

  it('keeps binary files as metadata only', async () => {
    const attachment = await readBeukayClawAttachment({
      name: 'demo.mp4',
      type: 'video/mp4',
      size: 1024,
      text: async () => 'should not read binary',
    } as File)

    expect(attachment.preview).toBeUndefined()
    expect(buildBeukayClawMessage('拆解这个视频', [attachment])).toContain('内容预览：该文件为二进制或暂不支持前端文本预览')
  })
})
