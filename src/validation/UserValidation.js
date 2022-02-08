const rules = {
  full_name: {
    required: {
      value: true,
      message: 'Full Name harus di isi!',
    },
    maxLength: {
      value: 55,
      message: 'Panjang full name maksimal 55 karakter',
    },
  },
  email: {
    required: {
      value: true,
      message: 'Email harus di isi!',
    },
    maxLength: {
      value: 55,
      message: 'Panjang Email maksimal 55 karakter',
    },
  },
  password: {
    required: {
      value: true,
      message: 'Password harus di isi!',
    },
    maxLength: {
      value: 55,
      message: 'Panjang Password maksimal 55 karakter',
    },
  },
  confirmPassword: {
    required: {
      value: true,
      message: 'confirmPassword harus di isi!',
    },
    maxLength: {
      value: 55,
      message: 'Panjang confirmPassword maksimal 55 karakter',
    },
  },
  role: {
    required: {
      value: true,
      message: 'Role harus diisi!',
    },
  },
  active: {
    required: {
      value: true,
      message: 'Role harus diisi!',
    },
  },
};

export { rules };
