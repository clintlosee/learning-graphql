// Named export
const message = 'Some message from myModule'

// Default export - no name and only one
const location = 'SLC'

const getGreeting = (name) => {
  return `Hello ${name}!`
}

export {
  message,
  getGreeting,
  location as default
}
