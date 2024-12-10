const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')

// Get the user data path for persistent storage
const userDataPath = app.getPath('userData');
const todosFilePath = path.join(userDataPath, 'todos.json');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile('index.html')

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.on('save-todos', (event, todos) => {
  try {
    fs.writeFileSync(todosFilePath, JSON.stringify(todos), 'utf-8');
  } catch (error) {
    console.error('Error saving todos:', error);
  }
});


ipcMain.handle('load-todos', () => {
  try {
    if (fs.existsSync(todosFilePath)) {
      const data = fs.readFileSync(todosFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading todos:', error);
  }
  return [];
});

