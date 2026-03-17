'use client'

import React, { useState, useCallback } from 'react'
import { ContentRenderer } from '@/components/content-renderer'
import { ContentBlock, ArticleContent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Copy, Move, Trash2, Download, Eye, EyeOff, GripVertical, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DraggableItem } from '@/components/ui/drag-drop'

// Default template based on index.zh_hk.json
const getDefaultTemplate = (): ArticleContent => ({
  title: "content 格式參考",
  description: "content 格式參考",
  slug: "welcome",
  category: "welcome",
  lastModified: new Date().toISOString(),
  blocks: [
    {
      type: "heading",
      level: 1,
      content: "content 格式參考"
    },
    {
      type: "text",
      content: "content 格式參考"
    },
    {
      type: "callout",
      variant: "info",
      title: "🚀 開始使用",
      content: "用⌘K快速搜尋文檔，或者喺側邊欄探索唔同嘅部分。所有嘢都設計得好直觀同易用。"
    }
  ]
})

// Content block type templates
const BLOCK_TEMPLATES: Record<string, Partial<ContentBlock>> = {
  text: { type: 'text', content: '輸入文字內容...' },
  heading: { type: 'heading', level: 2, content: '標題' },
  code: { type: 'code', language: 'javascript', content: '// 輸入代碼\nconsole.log("Hello World");', title: '代碼示例' },
  image: { type: 'image', src: '/assets/images/example.png', alt: '圖片描述', caption: '**圖片標題**：圖片說明。' },
  video: { type: 'video', src: '/assets/videos/example.mp4', alt: '視頻描述' },
  youtube_video: { type: 'youtube_video', src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', alt: 'YouTube 視頻' },
  list: { type: 'list', listType: 'unordered', items: ['項目 1', '項目 2', '項目 3'] },
  callout: { type: 'callout', variant: 'info', title: '提示標題', content: '提示內容...' },
  blockquote: { type: 'blockquote', content: '引用內容...', title: '引用來源' },
  link: { type: 'link', title: '鏈接標題', href: 'https://example.com', content: '訪問鏈接', description: '鏈接描述' },
  'line-break': { type: 'line-break' },
  'horizontal-rule': { type: 'horizontal-rule' },
  terminal: { type: 'terminal', content: '$ npm install\n+ package@1.0.0\ninstalled successfully!', title: '終端命令' },
  table: {
    type: 'table',
    title: '表格標題',
    headers: ['欄目 1', '欄目 2', '欄目 3'],
    rows: [
      ['行 1 欄 1', '行 1 欄 2', '行 1 欄 3'],
      ['行 2 欄 1', '行 2 欄 2', '行 2 欄 3']
    ]
  },
  'task-list': {
    type: 'task-list',
    title: '任務清單',
    taskItems: [
      { content: '已完成任務', completed: true },
      { content: '待完成任務', completed: false }
    ]
  },
  'download-link': {
    type: 'download-link',
    title: '下載文件',
    content: '點擊下載文件說明',
    href: '/assets/downloads/file.pdf',
    fileType: 'PDF',
    fileSize: '2.3 MB'
  },
  footnote: { type: 'footnote', footnoteId: '1', footnoteText: '腳註內容說明' },
  'definition-list': {
    type: 'definition-list',
    title: '術語定義',
    definitions: [
      { term: '**術語 1**', definition: '術語 1 的定義說明' },
      { term: '*術語 2*', definition: '術語 2 的定義說明' }
    ]
  }
}

export default function CreatePage() {
  const [content, setContent] = useState<ArticleContent | null>(null)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(false)
  const [isAddBlocksCollapsed, setIsAddBlocksCollapsed] = useState(false)
  const [jsonCopied, setJsonCopied] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Initialize content on client side to avoid hydration mismatch
  React.useEffect(() => {
    setContent(getDefaultTemplate())
  }, [])

  const updateContent = useCallback((updates: Partial<ArticleContent>) => {
    setContent(prev => prev ? ({ ...prev, ...updates, lastModified: new Date().toISOString() }) : null)
  }, [])

  const updateBlock = useCallback((index: number, updates: Partial<ContentBlock>) => {
    setContent(prev => prev ? ({
      ...prev,
      blocks: prev.blocks.map((block, i) => i === index ? { ...block, ...updates } : block),
      lastModified: new Date().toISOString()
    }) : null)
  }, [])

  const addBlock = useCallback((type: string, insertIndex?: number) => {
    const template = BLOCK_TEMPLATES[type]
    if (!template || !content) return

    const newBlock = { ...template } as ContentBlock
    const index = insertIndex ?? content.blocks.length

    setContent(prev => prev ? ({
      ...prev,
      blocks: [
        ...prev.blocks.slice(0, index),
        newBlock,
        ...prev.blocks.slice(index)
      ],
      lastModified: new Date().toISOString()
    }) : null)

    setSelectedBlockIndex(index)
  }, [content])

  const removeBlock = useCallback((index: number) => {
    setContent(prev => prev ? ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
      lastModified: new Date().toISOString()
    }) : null)
    setSelectedBlockIndex(null)
  }, [])

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setContent(prev => {
      if (!prev) return null
      const newBlocks = [...prev.blocks]
      const [movedBlock] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, movedBlock)

      return {
        ...prev,
        blocks: newBlocks,
        lastModified: new Date().toISOString()
      }
    })

    setSelectedBlockIndex(toIndex)
  }, [])

  const copyJsonToClipboard = useCallback(async () => {
    if (!content) return
    try {
      // Create a copy without title and description for JSON output
      const { title, description, ...jsonOutput } = content
      await navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2))
      setJsonCopied(true)
      setTimeout(() => setJsonCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }, [content])

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((draggedIndex: number, targetIndex: number) => {
    moveBlock(draggedIndex, targetIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [moveBlock])

  // Memoize the preview content to ensure proper updates
  const previewBlocks = React.useMemo(() => {
    return content?.blocks || []
  }, [content?.blocks, content?.lastModified])

  // Show loading state until content is initialized
  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加載內容編輯器...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">內容創建器</h1>
              <p className="text-muted-foreground">創建和預覽內容，生成 JSON 格式</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                className="flex items-center gap-2"
              >
                {isLeftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {isLeftPanelCollapsed ? '展開' : '收起'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? '隱藏預覽' : '顯示預覽'}
              </Button>
              {!showPreview && (
                <Button
                  onClick={copyJsonToClipboard}
                  className="flex items-center gap-2"
                >
                  {jsonCopied ? (
                    <>已複製!</>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      複製 JSON
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Editor (Scrollable) */}
        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-y-auto relative",
          isLeftPanelCollapsed ? "w-12" : showPreview ? "flex-1" : "w-full"
        )}>
          {/* Collapsed state toggle button */}
          {isLeftPanelCollapsed && (
            <div className="absolute top-4 left-3 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLeftPanelCollapsed(false)}
                className="w-8 h-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className={cn(
            "container mx-auto px-6 py-6 max-w-4xl transition-all duration-300",
            isLeftPanelCollapsed ? "opacity-0 pointer-events-none scale-95" : "opacity-100 pointer-events-auto scale-100"
          )}>
            <div className="space-y-6">
              {/* Content Metadata */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>基本資訊</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
                      className="h-8 w-8 p-0"
                    >
                      {isBasicInfoCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {!isBasicInfoCollapsed && (
                  <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">標題</Label>
                    <Input
                      id="title"
                      value={content.title}
                      onChange={(e) => updateContent({ title: e.target.value })}
                      placeholder="輸入內容標題"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <Input
                      id="description"
                      value={content.description || ''}
                      onChange={(e) => updateContent({ description: e.target.value })}
                      placeholder="輸入內容描述"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={content.slug}
                        onChange={(e) => updateContent({ slug: e.target.value })}
                        placeholder="content-slug"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">分類</Label>
                      <Input
                        id="category"
                        value={content.category}
                        onChange={(e) => updateContent({ category: e.target.value })}
                        placeholder="分類名稱"
                      />
                    </div>
                  </div>
                  </CardContent>
                )}
              </Card>

              {/* Add Block Buttons */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>添加內容塊</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddBlocksCollapsed(!isAddBlocksCollapsed)}
                      className="h-8 w-8 p-0"
                    >
                      {isAddBlocksCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {!isAddBlocksCollapsed && (
                  <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(BLOCK_TEMPLATES).map(([type, template]) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock(type)}
                        className="justify-start text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {type === 'line-break' ? '換行' :
                         type === 'horizontal-rule' ? '分隔線' :
                         type === 'task-list' ? '任務清單' :
                         type === 'download-link' ? '下載鏈接' :
                         type === 'definition-list' ? '定義列表' :
                         type === 'youtube_video' ? 'YouTube' :
                         type}
                      </Button>
                    ))}
                  </div>
                  </CardContent>
                )}
              </Card>

              {/* Content Blocks Editor */}
              <div className="space-y-4">
                {content.blocks.map((block, index) => (
                  <DraggableItem
                    key={`block-${index}`}
                    id={`block-${index}`}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedIndex === index}
                    isOver={dragOverIndex === index}
                  >
                    <BlockEditor
                      block={block}
                      index={index}
                      isSelected={selectedBlockIndex === index}
                      onSelect={() => setSelectedBlockIndex(index)}
                      onUpdate={(updates) => updateBlock(index, updates)}
                      onRemove={() => removeBlock(index)}
                      onMoveUp={index > 0 ? () => moveBlock(index, index - 1) : undefined}
                      onMoveDown={index < content.blocks.length - 1 ? () => moveBlock(index, index + 1) : undefined}
                      isDraggable={true}
                    />
                  </DraggableItem>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Fixed Preview */}
        {showPreview && (
          <div className={cn(
            "border-l bg-muted/10 transition-all duration-300 ease-in-out",
            isLeftPanelCollapsed ? "flex-1" : "w-1/2"
          )}>
            <div className="h-full flex flex-col">
              {/* Preview Header */}
              <div className="border-b bg-background px-6 py-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">預覽</h2>
              </div>

              {/* Preview Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="border rounded-lg p-6 bg-background min-h-[calc(50vh-100px)]">
                    <ContentRenderer
                      key={content.lastModified}
                      blocks={previewBlocks}
                      showTableOfContents={false}
                    />
                  </div>
                </div>
              </div>

              {/* JSON Output - Fixed at bottom */}
              <div className="border-t bg-background flex-shrink-0">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">JSON 輸出</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyJsonToClipboard}
                      className="text-xs"
                    >
                      {jsonCopied ? '已複製!' : '複製'}
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32 font-mono">
                      {JSON.stringify((() => {
                        const { title, description, ...jsonOutput } = content
                        return jsonOutput
                      })(), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Block Editor Component
interface BlockEditorProps {
  block: ContentBlock
  index: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ContentBlock>) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isDraggable?: boolean
}

function BlockEditor({
  block,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isDraggable = false
}: BlockEditorProps) {
  return (
    <Card className={cn(
      'transition-all cursor-pointer',
      isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
    )} onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {isDraggable && <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />}
            #{index + 1} {block.type}
          </CardTitle>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onMoveUp() }}>
                ↑
              </Button>
            )}
            {onMoveDown && (
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onMoveDown() }}>
                ↓
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <BlockFieldEditor block={block} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  )
}

// Field Editor for different block types
function BlockFieldEditor({
  block,
  onUpdate
}: {
  block: ContentBlock
  onUpdate: (updates: Partial<ContentBlock>) => void
}) {
  const renderFieldEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div>
            <Label>內容</Label>
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="輸入文字內容..."
              rows={3}
            />
          </div>
        )

      case 'heading':
        return (
          <div className="space-y-3">
            <div>
              <Label>標題內容</Label>
              <Input
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="輸入標題..."
              />
            </div>
            <div>
              <Label>標題級別</Label>
              <Select value={String(block.level || 2)} onValueChange={(value) => onUpdate({ level: Number(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                  <SelectItem value="5">H5</SelectItem>
                  <SelectItem value="6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'line-break':
      case 'horizontal-rule':
        return (
          <div className="text-center text-muted-foreground py-4">
            {block.type === 'line-break' ? '換行符' : '水平分隔線'}
          </div>
        )

      default:
        return (
          <div>
            <Label>內容</Label>
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="輸入內容..."
              rows={3}
            />
          </div>
        )
    }
  }

  return renderFieldEditor()
}