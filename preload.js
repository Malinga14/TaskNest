const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld('electronAPI', {
    saveTodos: (todos) => ipcRenderer.send('save-todos', todos),
    loadTodos: () => ipcRenderer.invoke('load-todos'),

    getVersions: () => ({
        chrome: process.versions.chrome,
        node: process.versions.node,
        electron: process.versions.electron
    })
});