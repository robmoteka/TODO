const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Model użytkownika
const userSchema = new Schema({
  nazwa: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Proszę podać poprawny adres email']
  },
  haslo: {
    type: String,
    required: true,
    minlength: 6
  },
  imie: {
    type: String,
    required: false
  },
  nazwisko: {
    type: String,
    required: false
  },
  rola: {
    type: String,
    enum: ['admin', 'manager', 'uzytkownik'],
    default: 'uzytkownik'
  },
  aktywny: {
    type: Boolean,
    default: true
  },
  dataUtworzenia: {
    type: Date,
    default: Date.now
  },
  ostatnieLogowanie: {
    type: Date
  },
  preferencje: {
    powiadomieniaEmail: {
      type: Boolean,
      default: true
    },
    powiadomieniaAplikacja: {
      type: Boolean,
      default: true
    },
    motyw: {
      type: String,
      enum: ['jasny', 'ciemny', 'systemowy'],
      default: 'systemowy'
    }
  }
}, {
  timestamps: {
    createdAt: 'dataUtworzenia',
    updatedAt: 'dataAktualizacji'
  }
});

// Middleware przed zapisem - hashowanie hasła
userSchema.pre('save', async function(next) {
  // Hashuj hasło tylko jeśli zostało zmodyfikowane lub jest nowe
  if (!this.isModified('haslo')) return next();
  
  try {
    // Generowanie soli
    const salt = await bcrypt.genSalt(10);
    // Hashowanie hasła
    this.haslo = await bcrypt.hash(this.haslo, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metoda do porównywania hasła
userSchema.methods.porownajHaslo = async function(haslo) {
  return await bcrypt.compare(haslo, this.haslo);
};

// Metoda do generowania bezpiecznej wersji użytkownika (bez hasła)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.haslo;
  return user;
};

// Eksport modelu
const User = mongoose.model('User', userSchema);
module.exports = User;
