'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ContentFrameProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -24,
    scale: 0.98
  }
}

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  duration: 0.6
}

export function ContentFrame({ children, className, animate = true }: ContentFrameProps) {
  if (!animate) {
    return (
      <div className={cn('flex-1 overflow-auto', className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </div>
  )
}