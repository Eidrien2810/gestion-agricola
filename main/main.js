import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { getDocs, doc, deleteDoc, setDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js"
import { signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js"
import { auth, db } from "../firebase.js";

const d = document
const $ = (identifier) => d.querySelector(identifier)

class InventoryItem {
  constructor(id, nombre, categoria, marca, monto, stock,userId,docId) {
    this.id = id
    this.nombre = nombre
    this.categoria = categoria
    this.marca = marca
    this.monto = monto
    this.stock = stock
    this.userId = userId
    this.docId= docId
  }
}
//declara cual usuario es que esta colectado y sino hay usuario va para el login aunque se cambiara para hacer un auth
let userId

let inventory=[]
onAuthStateChanged(auth,async(user)=>{
  if(user){
    userId=user.uid
    const userDropbtn = document.getElementById("userDropBtn")
    userDropbtn.innerHTML = user.email
    try {
      let allInv = await getDocs(collection(db, "Inventory"));
      allInv = allInv.docs
      if(allInv.length){
        allInv.forEach(doc=>{
          const docId=doc.id
          let item=doc.data()
          if(item.userId==userId){
            const itemInv=[]
             itemInv.push(item.id)
             itemInv.push(item.nombre)
             itemInv.push(item.categoria)
             itemInv.push(item.marca)
             itemInv.push(new Intl.NumberFormat('es-DO', { style: 'currency', currency:'DOP' }).format(item.monto))
             itemInv.push(item.stock)
             itemInv.push(item.userId)
             itemInv.push(docId)
             inventory.push(itemInv)
          }
        })
      }
      //cargar la tabla desde el principio
      reloadTable()
      closeModal()
      isDataEmpty() 
    } catch (error) {
      console.log(error)
    }
  }else{
      window.location.replace("../login/login.html")
  }
})

const $modalBox = $('.modal-box')
const $modalForm = $('.modal-form')
const $tbody = d.querySelector('tbody')
let modalMode = 'insert'
let currentRow = null

//filtra el inventario de respectivo usuario



const searchBar = document.querySelector('.search-bar');
searchBar.addEventListener('input', () => {
  const searchText = searchBar.value;
  filterRowsByNombre(searchText);
})


d.addEventListener('DOMContentLoaded', e => resetInputs())

d.addEventListener('click', (e) => {
  if (e.target.matches(`.${$modalBox.classList[0]}`) || e.target.matches('.close-btn')){
    closeModal()
  }
  if (e.target.matches('.open-btn')){
    modalMode = 'insert'
    openModal()
    resetInputs()
  }
  if (e.target.matches('.plus-btn')){
    increaseStock(e)
  }
  if (e.target.matches('.minus-btn')){
    decreaseStock(e)
  }
  if (e.target.matches('.edit-btn')){
    modalMode = 'update'
    openEditModal(e)

  }
  if (e.target.matches('.deactivate-btn')){
    openDeleteModal(e)
    isDataEmpty()
  }
})
$modalForm.addEventListener('submit', e => {
  e.preventDefault()
  if (modalMode === 'insert'){
    insertData()
  } else if (modalMode === 'update'){
    updateData()
  }
})
function openModal(){
  $modalBox.classList.remove('hidden')
}
function closeModal(){
  $modalBox.classList.add('hidden')
}
async function insertData(){
  if (areInputsValid()) {
    const trList = Array.from($modalForm.querySelectorAll('input')).map(el => el.value)

    // coloca el user id 
    trList.push(userId)
    try {
    //guarda la data en la base de datos
    
      await addDoc(collection(db,'Inventory'),{
        id:trList[0],
        nombre:trList[1],
        categoria:trList[2],
        marca:trList[3],
        monto:Number(trList[4]),
        stock:Number(trList[5]),
        userId:trList[6],
      })
      .then((r)=>{
        trList[4] = new Intl.NumberFormat('es-DO', { style: 'currency', currency:'DOP' }).format(trList[4])
        trList[7]=r.id
      inventory.push(new InventoryItem(...trList))
      })
    } catch (error) {
      console.log(error)
    }

    reloadTable()
    closeModal()
    isDataEmpty()
  }
}
function reloadTable(){
  $tbody.innerHTML = ''
  const $optionsTd = `<td>
  <button class="edit-btn">Editar</button>
  <button class="deactivate-btn">Eliminar</button>
</td>`
  const classList = ['td--id', 'td--nombre', 'td--categoria', 'td--marca', 'td--monto', 'td--stock', 'td--opciones']
  for (let i = 0; i < inventory.length; i++) {
    const obj = inventory[i]
    const keys = Object.keys(obj)
    const $tr = document.createElement('tr')
    for (let j = 0; j < keys.length; j++) {
      if(j===6 || j===7)break
      const key = keys[j];
      const value = obj[key];
      const $td = document.createElement('td')
      $td.textContent = value
      $td.classList.add(classList[j])
      $tr.append($td)
    }
    $tr.innerHTML += $optionsTd
    currentRow = $tr
    $tbody.append($tr)
    stockStatus()
  }
}


function openEditModal(e){
  currentRow = e.target.parentElement.parentElement
  const trList = Array.from(currentRow.children).slice(0, 6).map(td => td.textContent)
  Array.from($modalForm.querySelectorAll('input')).forEach((input, i) => {
    if (i == 4){
      let iMonto =trList[i].slice(3).split(',').join('')
      input.value = Number(iMonto)
      return
    }
    input.value = trList[i]
  })
  openModal()
}
async function updateData(){
  if (areInputsValid()){
    const id = currentRow.querySelector('.td--id').textContent
    const trList = Array.from($modalForm.querySelectorAll('input')).map(el => el.value)

    //colocar el user que tiene el login
    trList.push(userId)

    //validar el objeto y el user correspondiente
    const index = inventory.findIndex(obj =>Array.isArray(obj)? obj[0] == id && obj[6]==userId : obj.id == id && obj.userId==userId)
    const docId = inventory.find(obj =>Array.isArray(obj)? obj[0] == id && obj[6]==userId : obj.id == id && obj.userId==userId)[7]

    trList.push(docId)
    const obj = new InventoryItem(...trList)
    try {
      //hacer el cambio en la base de datos
      
        await setDoc(doc(db,'Inventory',docId), {
            id:obj.id,
            nombre:obj.nombre,
            categoria:obj.categoria,
            marca:obj.marca,
            monto:obj.monto,
            stock:Number(obj.stock),
            userId:obj.userId,
        });
        obj.monto = new Intl.NumberFormat('es-DO', { style: 'currency', currency:'DOP' }).format(obj.monto)
        
      inventory[index] = Object.values(obj)
  
    } catch (error) {
      console.log(error)
    }

    reloadTable()
    closeModal()
  }
}
function resetInputs(){
  Array.from($modalForm.querySelectorAll('input')).forEach(input => {
    input.value = ''
  })
}
function openDeleteModal(e){
  currentRow = e.target.parentElement.parentElement
  const id = currentRow.querySelector('.td--id').textContent
  const modalRes = confirm(`Deseas eliminar la fila id ${id}`)
  deleteData(modalRes)
}
async function deleteData(res){
  if (res) {
    const id = currentRow.querySelector('.td--id').textContent

    //valida el id y el user id
    const newInventory = inventory.filter(obj =>Array.isArray(obj)? obj[0]!=id : obj.id != id)
    
    try {
        //se borre en la base de datos

        let newInv= inventory.filter(obj =>Array.isArray(obj)? obj[0]==id && obj[6]==userId: obj.id == id && obj.userId==userId)
        newInv = Array.isArray(newInv)? newInv[0][7]:newInv[0].docId;
        await deleteDoc(doc(db,'Inventory',newInv))
        inventory = newInventory
    } catch (error) {
      console.log(error)
    }


    reloadTable()
  }
}
function isDataEmpty(){
  const empty = d.querySelector('.empty-table') 
  if ($tbody.childElementCount > 0){
    empty.classList.add('hidden')
  } else {
    empty.classList.remove('hidden')
  }
}
function areInputsValid(){
  const [id, nombre, categoria, marca, monto, stock] = Array.from($modalForm.querySelectorAll('input')).map(input => input.value)
  if (modalMode == 'update'){
    const lastId = currentRow.querySelector('.td--id').textContent
    const newInventory = inventory.filter(obj =>Array.isArray(obj)? obj[0] !== lastId : obj.id !== lastId)

    //filtra que si el id y el usuario es el mismo que lo ponga como invalido
    if (newInventory.some(obj =>{
      return Array.isArray(obj)? obj[0] === id && obj[6]===userId : obj.id === id && obj.userId===userId
    })){
      alert('id repetido')
      return false
    }
  } else {
    if (inventory.some(obj =>{
      return Array.isArray(obj)? obj[0] === id && obj[6]===userId : obj.id === id && obj.userId===userId
    })) {
      alert('id repetido')
      return false
    }
  }
  return true
}
function stockStatus(){
  Array.from($tbody.querySelectorAll('.td--stock')).forEach(td => {
    const stock = Number(td.textContent)
    if (stock > 9){
      td.classList = `${td.classList[0]} high`
    } else if (stock < 10 && stock > 0){
      td.classList = `${td.classList[0]} medium`
    } else {
      td.classList = `${td.classList[0]} low`
    }
  })
}
function filterRowsByNombre(searchText) {
  const rows = document.querySelectorAll('tbody tr');
  const normalizedSearchText = searchText.trim().toLowerCase();

  rows.forEach(row => {
    const nombre = row.querySelector('.td--nombre').textContent.trim().toLowerCase();
    if (nombre.includes(normalizedSearchText)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

//log out
document.querySelector('.log-out').addEventListener('click',async()=>{
  try {
    await signOut(auth)
    window.location.replace("../login/login.html")
  } catch (error) {
    console.log(error)
  }
})

// abre el dropdown
document.getElementById('userDropBtn').addEventListener('click',()=>{
  document.getElementById("myDropdown").classList.toggle("show");
})

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}