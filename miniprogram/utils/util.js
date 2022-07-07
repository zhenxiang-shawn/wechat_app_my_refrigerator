// 限制字符串显示长度

var filterStr = function (str, limit) {
    return str.length > limit ? str.substring(0, limit) + "..." : str
  }
  
  function formatDate(date) {
    const year  = date.getFullYear()
    const month = date.getMonth() + 1
    const day   = date.getDate()
    return [year, month, day].map(formatNumber).join('-')
  }
  
  function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  module.exports = {
    filterStr: filterStr,
    formatDate: formatDate
  }