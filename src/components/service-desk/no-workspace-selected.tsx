"use client"

import { motion } from "framer-motion"

export function NoWorkspaceSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center bg-card border rounded-md p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          No Workspace Selected
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Please select a workspace from the sidebar to view its content.
        </p>
      </motion.div>
    </div>
  )
}
