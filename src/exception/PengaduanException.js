class PengaduanException {
  constructor(msg) {
    this.status = false;
    this.message = msg;
    this.name = PengaduanException;
  }
}

export default PengaduanException;
