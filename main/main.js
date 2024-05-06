const d = document
const $ = (identifier) => d.querySelector(identifier)

class InventoryItem {
  constructor(id, nombre, categoria, marca, monto, stock,userId) {
    this.id = id
    this.nombre = nombre
    this.categoria = categoria
    this.marca = marca
    this.monto = monto
    this.stock = stock
    this.userId = userId
  }
}

//busca el inventario del usuario
let localInventory = JSON.parse(window.sessionStorage.getItem("inventory"))||[];
localInventory = localInventory.map(obj=>{
  if(typeof obj=== 'object')return Object.values(obj)
  return obj
})
window.sessionStorage.setItem('inventory',JSON.stringify(localInventory))

console.log(localInventory)

//reseterar el local inventory
//window.sessionStorage.removeItem("inventory")


//declara cual usuario es que esta colectado y sino hay usuario va para el login aunque se cambiara para hacer un auth
const userId = window.sessionStorage.getItem("userId")
if(userId===null) window.location.replace("../index.html")

const $modalBox = $('.modal-box')
const $modalForm = $('.modal-form')
const $tbody = d.querySelector('tbody')
let modalMode = 'insert'
let currentRow = null

//filtra el inventario de respectivo usuario
let inventory = localInventory.filter(element=>element[6]==userId)


const searchBar = document.querySelector('.search-bar');
searchBar.addEventListener('input', () => {
  const searchText = searchBar.value;
  filterRowsByNombre(searchText);
})


//cargar la tabla desde el principio
reloadTable()
closeModal()
isDataEmpty() 


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
function insertData(){
  if (areInputsValid()) {
    const trList = Array.from($modalForm.querySelectorAll('input')).map(el => el.value)
    const currency = d.querySelector('.select--monto').value
    trList[4] = new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(trList[4])

    // coloca el user id 
    trList.push(userId)

    inventory.push(new InventoryItem(...trList))
    //guarda la data local
    localInventory.push([...trList])

    window.sessionStorage.setItem("inventory",JSON.stringify(localInventory))
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
      if(j===6)break
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
function increaseStock(e){
  const $stock = Array.from(e.target.parentElement.parentElement.children).find(td => td.matches('.td--stock'))

  //tomar el id del item a hacer incremento de stock y hacer ese cambio en el local inventory
  const  $id = Array.from(e.target.parentElement.parentElement.children).find(td => td.matches('.td--id')).textContent
  localInventory.map(obj=>{
    if(obj[0]===$id && obj[6]===userId) return obj[5]= Number($stock.textContent) + 1
    return obj
  })
  window.sessionStorage.setItem('inventory',JSON.stringify(localInventory))

  $stock.textContent = Number($stock.textContent) + 1
  stockStatus()
}
function decreaseStock(e){
  const $stock = Array.from(e.target.parentElement.parentElement.children).find(td => td.matches('.td--stock'))

  //declarar el id del item
  const  $id = Array.from(e.target.parentElement.parentElement.children).find(td => td.matches('.td--id')).textContent

  if (Number($stock.textContent) > 0){
  
  //hacer cambio en el local inventory del decremento
  localInventory.map(obj=>{
    if(obj[0]===$id && obj[6]===userId) return obj[5]= Number($stock.textContent) - 1
    return obj
  })
  window.sessionStorage.setItem('inventory',JSON.stringify(localInventory))

    $stock.textContent = Number($stock.textContent) - 1
  }
  stockStatus()
}
function openEditModal(e){
  currentRow = e.target.parentElement.parentElement
  const trList = Array.from(currentRow.children).slice(0, 6).map(td => td.textContent)
  // console.log(trList)
  Array.from($modalForm.querySelectorAll('input')).forEach((input, i) => {
    if (i == 4){
      input.value = Number(trList[i].slice(3))
      return
    }
    input.value = trList[i]
  })
  openModal()
}
function updateData(){
  if (areInputsValid()){
    const id = currentRow.querySelector('.td--id').textContent
    const trList = Array.from($modalForm.querySelectorAll('input')).map((el, i) => {
      if (i == 4) {
        const currency = d.querySelector('.select--monto').value
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(el.value)
      }
      return el.value
    })

    //colocar el user que tiene el login
    trList.push(userId)

    //validar el objeto y el user correspondiente
    const index = inventory.findIndex(obj =>Array.isArray(obj)? obj[0] == id && obj[6]==userId : obj.id == id && obj.userId==userId)
    const localIndex= localInventory.findIndex(obj =>Array.isArray(obj)? obj[0] == id && obj[6]==userId : obj.id == id && obj.userId==userId)

    const obj = new InventoryItem(...trList)
    console.log(obj)
    inventory[index] = obj

    //hacer el cambio en el local inventory
    localInventory[localIndex]= obj
    window.sessionStorage.setItem("inventory",JSON.stringify(localInventory))

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
function deleteData(res){
  if (res) {
    const id = currentRow.querySelector('.td--id').textContent

    //valida el id y el user id
    const newInventory = inventory.filter(obj =>Array.isArray(obj)? obj[0]!=id : obj.id != id)
    inventory = newInventory

    // que tambien se borre del inventario local
    localInventory= localInventory.filter(obj=>obj[6]!==userId)

    localInventory.push(...Object.values(inventory))

    window.sessionStorage.setItem("inventory",JSON.stringify(localInventory))

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
  const currency = $modalForm.querySelector('select').value
  if (currency == 'Divisa'){
    alert('Selecciona una divisa')
    return false
  }
  if (modalMode == 'update'){
    const lastId = currentRow.querySelector('.td--id').textContent
    const newInventory = inventory.filter(obj =>Array.isArray(obj)? obj[0] !== lastId : obj.id !== lastId)

    //filtra que si el id y el usuario es el mismo que lo ponga como invalido
    if (newInventory.some(obj =>Array.isArray(obj)? obj[0] === id && obj[6]===userId : obj.id === id && obj.userId===userId)){
      alert('id repetido')
      return false
    }
  } else {
    if (inventory.some(obj =>Array.isArray(obj)? obj[0] === id && obj[6]===userId : obj.id === id && obj.userId===userId)) {
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


function logOut (){
  window.sessionStorage.removeItem("userId")
  window.location.replace("../login/login.html")
}

//colocar nombre de la usuario
const userDropbtn = document.getElementById("userDropBtn")
const user = JSON.parse(window.sessionStorage.getItem("users")).find(obj=>obj.id==userId)
console.log(user)
userDropbtn.innerHTML = user.username

function userDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

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