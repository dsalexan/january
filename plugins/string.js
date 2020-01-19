String.prototype.isEmpty =
  String.prototype.isEmpty ||
  function() {
    const str = this.toString()
    return str === undefined || str === null || str === ''
  }
