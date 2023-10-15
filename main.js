const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d', {willReadFrequently: true})
let w = can.width
let h = can.height
let vals = {size: 10, hue: 30, sat: 90, lig: 60}
let party = 1
let bnum = 0
let lift = 0
let loadout = []
let pardfun = noop
let brush

// hey, start here!
// - experiment with second array for choosing effect?
// - party mode: random brush change every ten seconds? presses random buttons? maybe it's a brush?
// - multiplayer? how?
// - drawing prompts?
// - it's like a game engine you can plug into a game...

// AUDIO BRUSHES!!!
// loadout is simple: you pick a set of brushes, and that's your loadout for that canvas


let brushes = [
  { 'name': 'pard paint'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255); fill(e,v)}
  , 'pard': (data, i) => {
              if(data[i] || data[i + 1] || data[i + 2]) {
                data[i + 0] = (data[i + 0] + 1) % 256 // red
                data[i + 1] = (data[i + 1] + 1) % 256 // green
                data[i + 2] = (data[i + 2] + 1) % 256 // blue
              }
            }
  },
  { 'name': 'basic black'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'pynt': (e,v) => {ctx.fillStyle = '#000000'; fill(e,v)}
  },
  { 'name': 'eraser'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'pynt': (e,v) => clear(e,v)
  },
  { 'name': 'miniflood'
  , 'vals': {'liv': 31}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 250); clear(e,{size:1}); fill(e,{size:1})}
  , 'pard': (data, i, v) => {
              if(data[i + 3] === 250) {
                let rand = Math.floor(Math.random() * 4)
                let n = [i - w * 4, i + 4, i + w * 4, i - 4][rand]
                if(data[n + 3] === 0 || data[n + 3] === 250) {
                  data[n + 0] = (data[i + 0] + 1) % 256 // red
                  data[n + 1] = (data[i + 1] + 1) % 256 // green
                  data[n + 2] = (data[i + 2] + 1) % 256 // blue
                  data[n + 3] = data[i + 3]
                }
                if(1 > Math.random() * v.liv/10) {
                  data[n + 3] = 255
                }
              }
            }
  },
  { 'name': 'floodwaves'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 252); clear(e,v); fill(e,v)}
  , 'pard': (data, i) => {
              if(data[i + 3] === 252) {
                let rand = Math.floor(Math.random() * 4)
                let n = [i - w * 4, i + 4, i + w * 4, i - 4][rand]
                if(data[n + 3] === 0 || data[n + 3] === 252) {
                  data[n + 0] = (data[i + 0] + 1) % 256 // red
                  data[n + 1] = (data[i + 1] + 1) % 256 // green
                  data[n + 2] = (data[i + 2] + 1) % 256 // blue
                  data[n + 3] = data[i + 3]
                }
              }
            }
  },
  { 'name': 'lightning'
  , 'vals': {liv: 31, jump: 1}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.jump = (v.jump + 1) % 8
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 244); fill(e,{size:1})}
  , 'pard': (data, i) => {
              if(data[i + 3] === 244) {
                ctx.fillStyle = filler(vals.hue, vals.sat, vals.lig, 244);
                ;[-4,0,4].forEach(j => {
                  if(Math.random() < 1/vals.liv*10 && data.length > i+w*4+j+4) {
                    let rand = Math.floor(Math.random() * 3)
                    data.set(data.slice(i,i+4), i+w*4+j)
                    data[i+w*4+j+rand] += j*vals.jump
                  }
                })
                data[i + 3] = 255
              }
            }
  },
]


document.addEventListener('keydown', e => {
  if(e.code === 'ArrowUp' || e.code === 'KeyW') {
    brush?.upup?.(vals)
  }
  if(e.code === 'ArrowDown' || e.code === 'KeyS') {
    brush?.down?.(vals)
  }
  if(e.code === 'ArrowLeft' || e.code === 'KeyA') {
    brush?.left?.(vals)
  }
  if(e.code === 'ArrowRight' || e.code === 'KeyD') {
    brush?.righ?.(vals)
  }
  if(e.code === 'Space') {
    lift = (lift + 1) % 2
  }
  if(e.code === 'KeyP') {
    party = (party + 1) % 2
  }
  if(e.code === 'KeyQ') {
    bnum = rem(bnum - 1, loadout.length)
    brush = loadout[bnum]
  }
  if(e.code === 'KeyE') {
    bnum = (bnum + 1) % loadout.length
    brush = loadout[bnum]
  }

  if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault()

  show_mode()
})

can.addEventListener('mousemove', e => {
  if(lift === 0)
    brush.pynt(e, vals)
})

function filler(h, s, l, a) { // 0 - 100, 0-255
  return `hsl(${h * 3.6}, ${s}%, ${l}%, ${a/255})`
}

function partypaint() {
  if(party) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    for(let i = 0; i < data.length; i += 4)
      pardfun(data, i, vals)
    ctx.putImageData(imageData, 0, 0)
  }
}
function noop() {}
// function par(f, g) {return (...args) => {f(...args); g(...args)}}
function par(f, g) {return (a,b,c) => {f(a,b,c); g(a,b,c)}}
function rem(n, r) { return (n % r + r) % r }
function fill(e,v) {ctx.fillRect(e.offsetX, e.offsetY, v.size, v.size)}
function clear(e,v) {ctx.clearRect(e.offsetX, e.offsetY, v.size, v.size)}

function save() {
  can.toBlob(function(blob) {
    let url = URL.createObjectURL(blob);
    el('hiddensaver').setAttribute('href', url);
    el('hiddensaver').click()
  });
}


// function chunker(arrayBuffer) {
//   let arr = new Uint8Array(arrayBuffer)
//   let cs = getChunks(arr)
//   return cs
// }
// function add_toda_chunk(cs, profile) {
//   let iend = cs.pop()
//   let profile_chunk = {chunkType: 'toDa', data: slam_obj(profile)}
//   cs.push(profile_chunk)
//   cs.push(iend)
//   return cs
// }


function load(t) {
  let file = t.srcElement.files?.[0]
  if(!file) return
  ctx.clearRect(0, 0, w, h)
  let img = new Image()
  img.src = URL.createObjectURL(file)
  img.onload = _ => ctx.drawImage(img, 0, 0)
  el('import').blur()
}

function show_brushes() {
  let sel = el('options')
  sel.innerHTML = '<option>Add a brush</option>' + brushes.map(b => `<option>${b.name}</option>`).join('')
}

function show_mode() {
  el('mode').innerHTML  = `${lift&&'invisible'||''} ${party&&'PARTY!!!'||''} ${brush.name} :: `
  for(k in vals)
    el('mode').innerHTML += `${vals[k]}${k} `
}

function set_loadout() {
  pardfun = noop
  el('loaded').innerHTML = ''

  if(!loadout.length)
    loadout = brushes.slice(0,5)

  for(let b = 0; b < loadout.length; b++) {
    let brush = loadout[b]
    if(brush.pard)
      pardfun = pardfun === noop ? brush.pard : par(pardfun, brush.pard)
    if(brush.vals)
      vals = {...brush.vals, ...vals}
    el('loaded').innerHTML += `<span class="loaded" fwump="${b}" style="color: hsl(${[...brush.name].map(c=>c.charCodeAt(0)-90).reduce((acc,n)=>acc+n*7,0)}, 80%, 50%)">${brush.name}</span>`
  }
  if(!brush)
    brush = loadout[0]
  show_mode()
}

function add_brush(e) {
  let index = +el('options').selectedIndex - 1
  loadout.push(brushes[index])
  set_loadout()
  el('options').selectedIndex = 0
  el('options').blur()
}

function rm_brush(e) {
  if(e.target.className !== 'loaded') return
  let i = +e.target.attributes.fwump?.value
  loadout.splice(i,1)
  set_loadout()
}

function go(f) {
  requestAnimationFrame(e => {
    f()
    go(f)
  })
}

el('export').addEventListener('click', save)
el('import').addEventListener('change', load)
el('options').addEventListener('change', add_brush)
el('loaded').addEventListener('click', rm_brush)

set_loadout()
show_brushes()
show_mode()
go(partypaint)