{/* ssot for "today" as an ISO date - using getTimezoneOffset
 to correct for local time, 
 otherwise toISOString() can roll to the wrong day near midnight since it works in UTC */}

export const todayISO = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000)
  return local.toISOString().slice(0, 10)
}