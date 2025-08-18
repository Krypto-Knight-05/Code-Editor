let HTMLeditor = CodeMirror.fromTextArea(
    document.getElementById("HTMLeditor"),
    {
        mode: "htmlmixed",
        lineNumbers: true,
        tabSize: 2
    }
)

let CSSeditor = CodeMirror.fromTextArea(
    document.getElementById("CSSeditor"),
    {
        mode: "css",
        lineNumbers: true,
    }
)

let JSeditor = CodeMirror.fromTextArea(
    document.getElementById("JSeditor"),
    {
        mode:  "javascript",
        lineNumbers: true,
    }
)

let iframe = document.querySelector('iframe')

HTMLeditor.setValue(localStorage.getItem("HTMLcode") || "")
CSSeditor.setValue(localStorage.getItem("CSScode") || "")
JSeditor.setValue(localStorage.getItem("JScode") || "")

function updateframe(){
    let css = `<style>${CSSeditor.getValue()}</style>`
    let html = HTMLeditor.getValue()
    let js =  `<script>
                let nativeLog = console.log
                let nativeErr = console.error

                const send = (type, msg)=>{
                    parent.postMessage({type, msg}, "*")
                }
                
                send("clear", "xyz")
                
                console.log = (...args)=>{
                    send("log", args.map(String).join(' '))
                    nativeLog.apply(console, args)
                }

                console.error = (...args)=>{
                    send("error", args.map(String).join(' '))
                    nativeErr.apply(console, args)
                }

                ${JSeditor.getValue()}
                </script>`

    iframe.srcdoc = css + html + js
}

HTMLeditor.on("change", function(){
    localStorage.setItem("HTMLcode", HTMLeditor.getValue())
    updateframe()
})

CSSeditor.on("change", function(){
    localStorage.setItem("CSScode", CSSeditor.getValue())
    updateframe()
})

JSeditor.on("change", function(){
    localStorage.setItem("JScode", JSeditor.getValue())
    updateframe()
})

updateframe()

//buttons

let Download = document.getElementById('Download')
let Clear = document.getElementById('Clear')

Download.onclick = ()=>{
    let code = iframe.srcdoc 
    let a = document.createElement("a") //anchor tag
    let blob = new Blob([code], {type: "text/html"}); //html file stored temporarily in memory
    let url = URL.createObjectURL(blob) //address of that file in browser memory
    a.href = url //link a to that file
    a.download = "editor_ka_code.html" //after this when you click, it wont go to that file but download it and save it as the name given
    a.click() //click in js
    URL.revokeObjectURL(url) //clear memory
}
Clear.addEventListener('click', (event)=>{
    HTMLeditor.setValue("")
    CSSeditor.setValue("")
    JSeditor.setValue("")
    
    updateframe()
})

// terminal

const term = new Terminal()
term.open(document.getElementById('terminal'))
// term.write("Terminal\n");
term.onData(data=>{
    term.write(data) // echo back typed characters
})

window.addEventListener("message", (event)=>{
    if(event.data.type==="clear"){
        term.clear();
    }
    if(event.data.type==="log"){
        term.write("\x1b[32m" + event.data.msg + "\x1b[0m"); // green logs
    }
    if (event.data.type === "error") {
        term.write("\x1b[31m" + event.data.msg + "\x1b[0m"); // red errors
    }
    term.write("\r\n")
})