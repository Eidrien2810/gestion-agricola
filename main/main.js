const d = document
const $ = (identifier) => d.querySelector(identifier)

class InventoryItem {
  constructor(id, nombre, categoria, marca, cantidad, stock,userId) {
    this.id = id
    this.nombre = nombre
    this.categoria = categoria
    this.marca = marca
    this.cantidad = cantidad
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
if(userId===null) window.location.replace("../login/login.html")

const $modalBox = $('.modal-box')
const $modalForm = $('.modal-form')
const $tbody = d.querySelector('tbody')
let modalMode = 'insert'
let appMode = 'index'
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
  const $stockTd = `<td>
  <button class="plus-btn">+</button>
  <button class="minus-btn">-</button>
</td>`
  const $optionsTd = `<td>
  <button class="edit-btn">Editar</button>
  <button class="deactivate-btn">Desactivar</button>
</td>`
  const classList = ['td--id', 'td--nombre', 'td--categoria', 'td--marca', 'td--cantidad', 'td--stock', 'td--cambio-stock', 'td--opciones']
  for (let i = 0; i < inventory.length; i++) {
    const obj = inventory[i]
    const keys = Object.keys(obj)
    const $tr = document.createElement('tr')
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      const value = obj[key];
      const $td = document.createElement('td')
      $td.textContent = value
      $td.classList.add(classList[j])
      $tr.append($td)
    }
    $tr.innerHTML += $stockTd
    $tr.innerHTML += $optionsTd
    currentRow = $tr
    $tbody.append($tr)
    stockStatus()
  }
}
function increaseStock(e){
  const $stock = Array.from(e.target.parentElement.parentElement.children).find(td => td.matches('.td--stock'))
  $stock.textContent = Number($stock.textContent) + 1
  stockStatus()
}
function decreaseStock(e){
  const $stock = Array.from(e.target.parentElement.parentElement.children).find(td => td.matches('.td--stock'))

  if (Number($stock.textContent) > 0){
    $stock.textContent = Number($stock.textContent) - 1
  }
  stockStatus()
}
function openEditModal(e){
  currentRow = e.target.parentElement.parentElement
  const trList = Array.from(currentRow.children).slice(0, 6).map(td => td.textContent)

  Array.from($modalForm.querySelectorAll('input')).forEach((input, i) => {
    input.value = trList[i]
  })
  openModal()
}
function updateData(){
  if (areInputsValid()){
    const id = currentRow.querySelector('.td--id').textContent
    const trList = Array.from($modalForm.querySelectorAll('input')).map(el => el.value)
    const index = inventory.findIndex(obj => obj.id == id)
    const obj = new InventoryItem(...trList)
    inventory[index] = obj
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
    const newInventory = inventory.filter(obj => obj.id != id)
    inventory = newInventory
    console.log(inventory)
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
  const [id, nombre, categoria, marca, cantidad, stock] = Array.from($modalForm.querySelectorAll('input')).map(input => input.value)
  if (modalMode == 'update'){
    const lastId = currentRow.querySelector('.td--id').textContent
    const newInventory = inventory.filter(obj => obj.id !== lastId)

    //filtra que si el id y el usuario es el mismo que lo ponga como invalido
    if (newInventory.some(obj => obj.id === id && obj.userId===userId)){
      alert('id repetido')
      return false
    }
  } else {
    if (inventory.some(obj => obj.id == id && obj.userId===userId)) {
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