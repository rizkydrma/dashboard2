const rules = {
  name: {
    required: {
      value: true,
      message: 'Nama Product tidak boleh kosong',
    },
    maxLength: {
      value: 50,
      message: 'Panjang nama product maksimal 50 karakter',
    },
  },
  price: {
    required: {
      value: true,
      message: 'Isi Price',
    },
  },
  stock: {
    required: {
      value: true,
      message: 'Pilih Stock',
    },
  },
  description: {
    required: {
      value: true,
      message: 'Deskripsi Product tidak boleh kosong',
    },
    maxLength: {
      value: 350,
      message: 'Panjang nama product maksimal 350 karakter',
    },
  },
  category: {
    required: {
      value: true,
      message: 'Category tidak boleh kosong',
    },
  },
  image: {
    required: {
      value: true,
      message: 'image tidak boleh kosong',
    },
  },
};

export { rules };
