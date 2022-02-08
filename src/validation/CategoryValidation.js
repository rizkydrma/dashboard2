const rules = {
  name: {
    required: { value: true, message: 'Email tidak boleh kosong' },
    maxLength: { value: 255, message: 'Panjang email maksimal 255 karakter' },
  },
  color: {
    required: { value: true, message: 'Warna tidak boleh kosong' },
  },
};

export { rules };
