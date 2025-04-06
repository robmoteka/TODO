const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Model reakcji na rozwiązanie
const reactionSchema = new Schema({
  rodzaj: {
    type: String,
    required: true
  },
  liczba: {
    type: Number,
    default: 0
  }
});

// Model proponowanego rozwiązania
const proposedSolutionSchema = new Schema({
  autor: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  tresc: {
    type: String,
    required: true
  },
  reakcje: [reactionSchema]
});

// Model uwagi do zadania
const commentSchema = new Schema({
  autor: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  tresc: {
    type: String,
    required: true
  }
});

// Model wykonawcy zadania
const executorSchema = new Schema({
  imieNazwisko: {
    type: String,
    required: true
  },
  rola: {
    type: String,
    default: 'odpowiedzialny'
  },
  dataWpisu: {
    type: Date,
    default: Date.now
  }
});

// Model historii procesu realizacji
const processHistorySchema = new Schema({
  data: {
    type: Date,
    default: Date.now
  },
  autor: {
    type: String,
    required: true
  },
  zmiana: {
    type: String,
    required: true
  }
});

// Model procesu realizacji
const executionProcessSchema = new Schema({
  wykonawcy: [executorSchema],
  terminRealizacji: {
    type: Date,
    required: false
  },
  statusRealizacji: {
    type: String,
    enum: ['nierozpoczete', 'w_trakcie', 'wstrzymane', 'zakonczone'],
    default: 'nierozpoczete'
  },
  postepRealizacji: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  historiaProcesow: [processHistorySchema]
});

// Główny model zadania
const taskSchema = new Schema({
  idZadania: {
    type: Number,
    required: true,
    unique: true
  },
  priorytet: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  branze: [{
    type: String,
    required: true
  }],
  maszyna: {
    type: String,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  opis: {
    type: String,
    required: true
  },
  proponowaneRozwiazania: [proposedSolutionSchema],
  uwagi: [commentSchema],
  status: {
    type: String,
    enum: ['nowe', 'w_trakcie', 'rozwiazane', 'zamkniete'],
    default: 'nowe'
  },
  procesRealizacji: {
    type: executionProcessSchema,
    default: () => ({})
  },
  dataUtworzenia: {
    type: Date,
    default: Date.now
  },
  dataAktualizacji: {
    type: Date,
    default: Date.now
  },
  utworzonyPrzez: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'dataUtworzenia',
    updatedAt: 'dataAktualizacji'
  }
});

// Middleware przed zapisem - aktualizacja daty modyfikacji
taskSchema.pre('save', function(next) {
  this.dataAktualizacji = Date.now();
  next();
});

// Metoda statyczna do generowania kolejnego ID zadania
taskSchema.statics.getNextTaskId = async function() {
  const lastTask = await this.findOne().sort('-idZadania');
  return lastTask ? lastTask.idZadania + 1 : 1;
};

// Eksport modelu
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
