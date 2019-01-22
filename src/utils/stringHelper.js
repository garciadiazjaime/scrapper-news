function cleanString(data) {
  if (!data) {
    return null
  }

  return data
    .replace(/[\t\n]+/g, '')
    .replace(/(<([^>]+)>)/ig, '')
    .replace(/(<([^>]+)>)/ig, '')
    .replace(/Archivado en:/ig, '')
    .replace(/\[email protected\]/ig, '')
    .trim()
}

module.exports = {
  cleanString
}
