const { ipcRenderer, contextBridge } = require("electron");




window.addEventListener("DOMContentLoaded",()=>{
   let txt =  document.querySelector(".textarea")
    ipcRenderer.on('file',(event,data)=>{
        txt.value = data
    }),
    ipcRenderer.on('dataSave',()=>{
        ipcRenderer.invoke("dataSave",txt.value)
    })
    ipcRenderer.on('saveAs',()=>{
        ipcRenderer.invoke('saveAs',txt.value)
    })
    ipcRenderer.on("print",()=>{
        alert("Printing is not Working right now")
    })

    document.addEventListener("contextmenu",async()=>{
       await ipcRenderer.invoke("mouseMenu")
    })
})