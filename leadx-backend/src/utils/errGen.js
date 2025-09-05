const errGen = (status, message) => {
  const err = new Error(message)
  err.status = status
  return err
}

export default errGen
