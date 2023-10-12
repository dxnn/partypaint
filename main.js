const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d', {willReadFrequently: true})
let w = can.width
let h = can.height
let vals = {size: 10, hue: 0, sat: 90, lig: 50}
let party = 0
let bnum = 0
let lift = 0
let loadout = {}

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
    bnum = rem(bnum - 1, brushes.length)
    brush = brushes[bnum]
  }
  if(e.code === 'KeyE') {
    bnum = (bnum + 1) % brushes.length
    brush = brushes[bnum]
  }

  show_mode()
})

can.addEventListener('mousemove', e => {
  if(lift === 0)
    brush.pynt(e, vals)
})

function show_mode() {
  el('mode').innerHTML = `${lift&&'invisible'||''} ${party&&'PARTY!!!'||''} ${['draw','paint','erase','floodwaves','miniflood'][bnum]}
                          ${vals.size}px ${vals.hue}H ${vals.sat}S ${vals.lig}L`
}

function filler(h, s, l, a) { // 0 - 100
  return `hsl(${h * 3.6}, ${s}%, ${l}%, ${a}%)`
}

function partypaint() {
  if(party) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    for(let i = 0; i < data.length; i += 4)
      loadout.pardfun(data, i, vals)
    ctx.putImageData(imageData, 0, 0)
  }
}

let brushes = [
  { 'name': 'basic black'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'pynt': (e,v) => {ctx.fillStyle = '#000000'; fill(e,v)}
  },
  { 'name': 'pard paint'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, 90, v.lig, 100); fill(e,v)}
  , 'pard': (data, i) => {
              if(data[i] || data[i + 1] || data[i + 2]) {
                data[i + 0] = (data[i + 0] + 1) % 256 // red
                data[i + 1] = (data[i + 1] + 1) % 256 // green
                data[i + 2] = (data[i + 2] + 1) % 256 // blue
              }
            }
  },
  { 'name': 'eraser'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'pynt': (e,v) => clear(e,v)
  },
  { 'name': 'floodwaves'
  , 'upup': v => v.size += 1
  , 'down': v => v.size -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, 90, v.lig, 99); clear(e,v); fill(e,v)}
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
  { 'name': 'miniflood'
  , 'vals': {'liveness': 10}
  , 'upup': v => v.liveness += 1
  , 'down': v => v.liveness -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': (e,v) => {ctx.fillStyle = filler(v.hue, 90, v.lig, 98); clear(e,v); fill(e,v)}
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
                if(1 > Math.random() * v.liveness) {
                  data[n + 3] = 255
                }
              }
            }
  },
]
let brush = brushes[0] // make_brush(brushes[0])

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
}

function set_loadout() {
  // just load everything for now

  for(let b = 0; b < brushes.length; b++) {
    let brush = brushes[b]
    if(brush.pard)
      loadout.pardfun = loadout.pardfun ? par(loadout.pardfun, brush.pard) : brush.pard
    if(brush.vals)
      vals = {...vals, ...brush.vals}
  }
}

function go(f) {
  requestAnimationFrame(e => {
    f()
    go(f)
  })
}

el('export').addEventListener('click', save)
el('import').addEventListener('change', load)

show_mode()
set_loadout()
go(partypaint)