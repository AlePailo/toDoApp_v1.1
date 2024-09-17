import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'
import { getDatabase, ref, push, remove, onValue, update } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js'

const appSettings = {
    databaseURL : "https://todo-app-ale-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const thingsToDo = ref(database, "toDo")

onValue(thingsToDo, (snapshot) => {
    if(snapshot.exists()) {
        addedElements.innerHTML = ""
        let thingsArr = Object.entries(snapshot.val())
        thingsArr.forEach(thing => appendEl(thing))
    } else {
        addedElements.innerHTML = "*verso di grilli*"
    }
})



const addEl = document.querySelector("#addEl")
const btnAdd = document.querySelector("#btnAdd")
const addedElements = document.querySelector(".addedElements")
const deleteELX = document.querySelectorAll(".fa-xmark")
const deleteSection = document.querySelector(".delete")
const askConfirmDeletion = document.querySelector(".askConfirmDeletion")
const confirmDeletion = document.querySelector("#confirmDeletion")
const denyDeletion = document.querySelector("#denyDeletion")
const back = document.querySelector("#back")
const optionsSpan = document.querySelector("#options")
const edit = document.querySelector("#edit")
const bin = document.querySelector("#bin")
const confirmEdit = document.querySelector("#confirmEdit")

btnAdd.addEventListener("click", addToElements)

//addEl.addEventListener("click", removeCheckBoxesAndDeleteSection)

addEl.addEventListener("keyup", (e) => {
    if(e.key == "Enter") {
        addToElements()
    }
})

function addToElements(e) {
    if(!addEl.value == " ") {
        let addedEl = addEl.value
        addedElements.innerHTML = ""
        push(thingsToDo, addedEl)
        addEl.value = ""
    } else {
        e.preventDefault()
    }
}

function appendEl(thing) {
    let key = thing[0]
    let text = thing[1]
    const newElement = document.createElement("p")
    addedElements.appendChild(newElement)
    const elText = document.createTextNode(text)
    newElement.appendChild(elText)
    newElement.classList.add("newEl")
    addX(newElement, key)
    newElement.setAttribute('spellCheck', false)
    newElement.setAttribute("dbKey", key)
    newElement.addEventListener("focusout", () => {
        let obj = {
            [key] : newElement.innerText
        }
        update(ref(database, 'toDo/'), obj)
    })
    newElement.addEventListener("touchstart", tapStart)
    newElement.addEventListener("touchend", tapEnd)
    newElement.addEventListener("touchmove", tapEnd)
    newElement.addEventListener("click", allowEdit)
    //newElement.addEventListener("click", detectDblClick)
    newElement.addEventListener("focusout", function() {
        this.setAttribute("contenteditable", false)
    })
    newElement.addEventListener("contextmenu", (e) => {
        e.preventDefault()
    })
}

function addX(el, key) {
    let v = document.createElement("INPUT")
    v.setAttribute("type", "checkbox")
    v.classList.add("checkSelect")
    let x = document.createElement("i")
    x.classList.add("fa-solid")
    x.classList.add("fa-xmark")
    el.appendChild(v)
    /*x.addEventListener("click", () => {
        addedElements.removeChild(x.parentElement)
        let elLocationInDB = ref(database, `toDo/${key}`)
        remove(elLocationInDB)
    })*/
}

back.addEventListener("click", () => {
    removeCheckBoxesAndDeleteSection()
    addEl.readOnly = false
})

let timer


function searchForCheckBoxes() {
    let checkSelect = document.querySelectorAll(".checkSelect")
    return checkSelect
}

function removeCheckBoxesAndDeleteSection() {
    deleteSection.classList.remove("visible")
    let checkSelect = searchForCheckBoxes()
    for(let checkbox of checkSelect) {
        checkbox.classList.remove("visible")
    }
}

function tapStart(e) {
    this.style.background = "green";
    //e.preventDefault()
    timer = setTimeout(() => {
        timer = null
        deleteSection.classList.add("visible")
        addEl.readOnly = true
        //let checkSelect = document.querySelectorAll(".checkSelect")
        let checkSelect = searchForCheckBoxes()
        console.log(checkSelect)
        for(let checkbox of checkSelect) {
            checkbox.classList.add("visible")
            checkbox.checked = false
        }
        this.children[0].checked = true
        this.setAttribute('long-pressed', true);
        this.style.background = "#bef570"

        /*edit.addEventListener("click", () => {
            for(let checkbox of checkSelect) {
                if(checkbox.checked) {
                    optionsSpan.style.display = "none"
                    confirmEdit.style.display = "block"
                    let p = checkbox.parentElement
                    let oldText = p.innerText
                    console.log(oldText)
                    p.setAttribute('contenteditable', true)
                    p.focus()
                    setCursorAtPEnd(p)
                    for(checkbox of checkSelect) {
                        checkbox.classList.remove("visible")
                    }
                    confirmEdit.addEventListener("click", () => {
                        p.setAttribute('contenteditable', false)
                        p.blur()
                        confirmEdit.style.display = "none"
                        optionsSpan.style.display = "flex"
                        for(checkbox of checkSelect) {
                            checkbox.classList.add("visible")
                        }
                    })
                }
            }
        })*/
        
        setInterval(() => {
            if(deleteSection.classList.contains("visible")) {
                if(Array.from(checkSelect).every(checkbox => checkbox.checked == false)) {
                    for(let checkbox of checkSelect) {
                        checkbox.classList.remove("visible")
                    }
                    deleteSection.classList.remove("visible")
                } /*else {
                    let count = 0
                    for(let checkbox of checkSelect) {
                        if(checkbox.checked) {
                            count++
                        }
                    }
                    if(count == 1) {
                        edit.style.display = "block"
                    } else {
                        edit.style.display = "none"
                    }
                }*/
            }
        },50)
    },500)
}

function clearTimer() {
    clearTimeout(timer)
}

function tapEnd() {
    clearTimer()
    this.style.background = "#bef570"
}

function setCursorAtPEnd(p) {
    let sel = window.getSelection();
    sel.selectAllChildren(p);
    sel.collapseToEnd();
}

bin.addEventListener("click", askConfirmDeletionDisplay)

function askConfirmDeletionDisplay() {
    askConfirmDeletion.style.display = "flex"
    addEl.readOnly = true 
}

function askConfirmDeletionHide() {
    setTimeout(() => {
        askConfirmDeletion.style.display = "none"
    },100)
}

function removeChecks() {
    const checkSelect = document.querySelectorAll(".checkSelect")
    /*Array.from(checkSelect).forEach( check => {
        check.checked = "false"
    })*/
    console.log(checkSelect)
}

denyDeletion.addEventListener("click", () => {
    askConfirmDeletionHide()
    addEl.readOnly = false
})

confirmDeletion.addEventListener("click", () => {
    let checkSelect = searchForCheckBoxes()
    for(let checkbox of checkSelect) {
        if(checkbox.checked) {
            let key = checkbox.parentElement.getAttribute("dbKey")
            let elLocationInDB = ref(database, `toDo/${key}`)
            remove(elLocationInDB)
        }
    }
    askConfirmDeletionHide()
    deleteSection.classList.remove("visible")
    addEl.readOnly = false
})


function allowEdit() {
    if(!deleteSection.classList.contains("visible")) {
        this.setAttribute("contenteditable", true)
        this.focus()
        setCursorAtPEnd(this)
    } else {
        if(this.children[0].checked) {
            if(this.getAttribute('long-pressed') == "true") {
                this.removeAttribute('long-pressed')
            } else {
                this.children[0].checked = false
            }
        } else {
            this.children[0].checked = true
        }
    }
}



// EDIT ON DOUBLE CLICK LOGIC 

/*

let timer2
let tooLong
let pCalling


function detectDblClick() {
    if(timer2 != undefined && pCalling == this) {
        clearTimeout(timer2)
        this.setAttribute("contenteditable", true)
        this.focus()
        setCursorAtPEnd(this)
        timer2 = undefined
    } else {
        timer2 = setTimeout(() => {
            tooLong = true
            timer2 = undefined
        },500)
        pCalling = this
    }
}

*/