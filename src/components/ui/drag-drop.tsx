'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface DraggableItemProps {
  id: string
  index: number
  children: React.ReactNode
  onDragStart?: (index: number) => void
  onDragEnd?: () => void
  onDragOver?: (index: number) => void
  onDrop?: (draggedIndex: number, targetIndex: number) => void
  className?: string
  isDragging?: boolean
  isOver?: boolean
}

export function DraggableItem({
  id,
  index,
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  className,
  isDragging,
  isOver
}: DraggableItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString())
    onDragStart?.(index)
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver?.(index)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (draggedIndex !== index) {
      onDrop?.(draggedIndex, index)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'transition-all duration-200',
        isDragging && 'opacity-50 scale-95',
        isOver && 'border-t-2 border-primary',
        className
      )}
    >
      {children}
    </div>
  )
}