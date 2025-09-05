class Respo {
  constructor(success, message, data = undefined) {
    this.success = success
    this.message = message
    this.data = data
  }
}

const respo = (success, message, data = undefined) => {
  return new Respo(success, message, data)
}

export default respo
