const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const fs = require("fs")



if (require('electron-squirrel-startup')) {
  app.quit();
}
let mainWindow;
const createWindow = () => {

  let mainWindowState = windowStateKeeper({
    defaultWidth: 900,
    defaultHeight: 700
  });

  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindowState.manage(mainWindow);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const isMac = process.platform === 'darwin'
let openFilePath = ''
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ?
        { role: 'close' }
        :
        { label: 'New', accelerator: "CmdorCtrl + N", role: 'reload' },
      { label: 'New Window', accelerator: "CmdorCtrl + Shift + N", click: createWindow },
      {
        label: 'Open...', accelerator: "CmdorCtrl + O", click: async () => {
          const { canceled, filePaths } = await dialog.showOpenDialog();
          if (!canceled) {
            openFilePath = filePaths[0]
            fs.readFile(openFilePath, (err, data) => {
              let getData = data.toString()
              mainWindow.webContents.send('file', getData)
            })

          }
        }
      },
      {
        label: 'Save', accelerator: "CmdorCtrl + S", click: async () => {
          mainWindow.webContents.send('dataSave')

        }
      },
      { label: 'Save As...', accelerator: "CmdorCtrl + Shift + S", click:async ()=>{
        mainWindow.webContents.send("saveAs")
      }},
      { type: 'separator' },
      {label:"Print...", accelerator: "CmdorCtrl + P" , role:'print',click:()=>{
        mainWindow.webContents.send("print")
      }},
      { type: 'separator' },
      { role: 'quit' },

    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      // { role: 'reload' },
      // { role: 'forceReload' },
      // { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'zoomIn' },
      { role: 'zoomOut'},
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://kironmoyroy.com')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

const saveTxtData = (path,data)=>{
  fs.writeFile(path,data,(err)=>{
    if(err){
      console.log(err);
    }else{
      console.log("Saved");
    }
  })
}

ipcMain.handle("dataSave", async (event, data) => {
  if(openFilePath === ''){
    const { canceled, filePath } = await dialog.showSaveDialog()
    if (!canceled) {
      openFilePath = filePath
    }
  }
  saveTxtData(openFilePath,data)
  
})

ipcMain.handle('saveAs', async (event,data)=>{
  const { canceled, filePath } = await dialog.showSaveDialog()
  if (!canceled) {
    openFilePath =filePath
    saveTxtData(openFilePath,data)
  }

})


const mouseTemplate = [

  
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },

      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut'},
      ])
 
]

ipcMain.handle("mouseMenu",()=>{
  const mouseMenu = Menu.buildFromTemplate(mouseTemplate)
  mouseMenu.popup(mainWindow)
})