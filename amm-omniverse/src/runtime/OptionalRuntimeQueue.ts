type RuntimeTask = () => Promise<unknown>

// Keep background imports from competing with the route's first render. Start
// only one per browser turn and permit at most two outstanding imports.
export function createOptionalRuntimeQueue(schedule: (run: () => void) => void) {
  const tasks: RuntimeTask[] = []
  let active = 0
  let scheduled = false
  const pump = () => {
    if (scheduled || active >= 2 || tasks.length === 0) return
    scheduled = true
    schedule(() => {
      scheduled = false
      const task = tasks.shift()
      if (!task) return
      active++
      Promise.resolve().then(task).catch(error => {
        console.warn('[TRYAMM] Background runtime unavailable.', error)
      }).finally(() => { active--; pump() })
      pump()
    })
  }
  return (task: RuntimeTask) => { tasks.push(task); pump() }
}

export const queueOptionalRuntime = createOptionalRuntimeQueue(run => {
  // A timer boundary allows the React commit and browser paint to happen before
  // idle work, including on Safari versions without requestIdleCallback.
  window.setTimeout(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, {timeout: 1000})
    else run()
  }, 50)
})
