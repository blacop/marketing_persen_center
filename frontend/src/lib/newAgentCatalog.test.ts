import { describe, expect, it } from 'vitest'
import { inferRunnableAgentTypeFromMetadata, resolveRunnableAgentDisplayMetadata } from './newAgentCatalog'

describe('new agent catalog metadata helpers', () => {
  it('识别千川投放与千川数据后端 Agent，避免把它们当成自定义乱码卡片', () => {
    expect(inferRunnableAgentTypeFromMetadata({
      name: 'Ã¥ÂÂƒÃ¥Â·ÂÃ¦ÂŠÂ•Ã¦Â”Â¾ Agent',
      agentDefId: 'qianchuan-delivery-v1',
      description: 'Ã¨Â´ÂŸÃ¨Â´Â£Ã¥Â°Â†Ã¨Â§Â†Ã©Â¢Â‘Ã§Â´Â Ã¦ÂÂÃ¦ÂŠÂ•Ã¦Â”Â¾',
      agentUniqueId: 'qianchuan-delivery-v1',
    })).toBe('qianchuan-delivery')

    expect(inferRunnableAgentTypeFromMetadata({
      name: 'Ã¥ÂÂƒÃ¥Â·ÂÃ¦Â•Â°Ã¦ÂÂ® Agent',
      agentDefId: 'qianchuan-data-v1',
      description: 'Ã¨Â´ÂŸÃ¨Â´Â£Ã¤Â»ÂŽÃ¥Â·Â¨Ã©Â‡ÂÃ¥ÂÂƒÃ¥Â·ÂÃ¨ÂŽÂ·Ã¥ÂÂ–',
      agentUniqueId: 'qianchuan-data-v1',
    })).toBe('qianchuan-data')
  })

  it('对已知新智能体优先使用标准中文名称与描述覆盖后端乱码', () => {
    const metadata = resolveRunnableAgentDisplayMetadata({
      agentDefId: 'qianchuan-delivery-v1',
      agentUniqueId: 'qianchuan-delivery-v1',
      backendName: 'Ã¥ÂÂƒÃ¥Â·ÂÃ¦ÂŠÂ•Ã¦Â”Â¾ Agent',
      backendDescription: 'Ã¨Â´ÂŸÃ¨Â´Â£Ã¥Â°Â†Ã¨Â§Â†Ã©Â¢Â‘Ã§Â´Â Ã¦ÂÂÃ¦ÂŠÂ•Ã¦Â”Â¾Ã¨Â‡Â³Ã¥Â·Â¨Ã©Â‡ÂÃ¥ÂÂƒÃ¥Â·Â',
    })

    expect(metadata.name).toBe('千川投放 Agent')
    expect(metadata.description).toContain('巨量千川')
    expect(metadata.description).not.toContain('Ã')
  })

  it('Beukay 总控智能体使用新的展示名和化妆品图标', () => {
    const metadata = resolveRunnableAgentDisplayMetadata({
      agentDefId: 'beukay-claw-runtime',
      agentUniqueId: 'beukay-claw',
      backendName: 'BeukayClaw',
    })

    expect(metadata.name).toBe('Beukay agent')
    expect(metadata.preset?.iconEmoji).toBe('💄')
  })
})
