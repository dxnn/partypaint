const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d', {willReadFrequently: true})
let w = can.width
let h = can.height
let size = 5
let party = 0
let bnum = 0
let hue = 0
let sat = 90
let lig = 50
let up = 0

document.addEventListener('keydown', e => {
  if(e.code === 'ArrowUp' || e.code === 'KeyW') {
    brush?.upup?.()
  }
  if(e.code === 'ArrowDown' || e.code === 'KeyS') {
    brush?.down?.()
  }
  if(e.code === 'ArrowLeft' || e.code === 'KeyA') {
    brush?.left?.()
  }
  if(e.code === 'ArrowRight' || e.code === 'KeyD') {
    brush?.righ?.()
  }
  if(e.code === 'Space') {
    up = (up + 1) % 2
  }
  if(e.code === 'KeyP') {
    party = (party + 1) % 2
  }
  if(e.code === 'KeyQ') {
    bnum = rem(bnum - 1, 4)
    brush = brushes[bnum]
  }
  if(e.code === 'KeyE') {
    bnum = (bnum + 1) % 4
    brush = brushes[bnum]
  }

  show_mode()
})

can.addEventListener('mousemove', e => {
  if(up === 0)
    brush.pynt(e)
})

function show_mode() {
  el('mode').innerHTML = `${up&&'invisible'||''} ${party&&'PARTY!!!'||''} ${['draw','paint','erase','fill'][bnum]} ${size}px ${hue}H ${sat}S ${lig}L`
}

function filler(h, s, l, a) { // 0 - 100
  return `hsl(${h * 3.6}, ${s}%, ${l}%, ${a}%)`
}

function partypaint() {
  if(party) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    for(let i = 0; i < data.length; i += 4) {
      for(let b = 0; b < brushes.length; b++)
        brushes[b]?.pard?.(data, i) // optimize this... could do a compose over the loadout to get a single pard fun
    }

    ctx.putImageData(imageData, 0, 0)
  }
}

let brushes = [
  { 'name': 'basic black'
  , 'upup': _ => size += 1
  , 'down': _ => size -= 1
  , 'pynt': e => {ctx.fillStyle = '#000000'; fill(e)}
  },
  { 'name': 'pard paint'
  , 'upup': _ => size += 1
  , 'down': _ => size -= 1
  , 'left': _ => hue = (hue + 10) % 101
  , 'righ': _ => lig = (lig + 10) % 101
  , 'pynt': e => {ctx.fillStyle = filler(hue, 90, lig, 100); fill(e)}
  , 'pard': (data, i) => {
              if (data[i] || data[i + 1] || data[i + 2]) {
                data[i + 0] = (data[i + 0] + 1) % 256 // red
                data[i + 1] = (data[i + 1] + 1) % 256 // green
                data[i + 2] = (data[i + 2] + 1) % 256 // blue
              }
            }
  },
  { 'name': 'eraser'
  , 'upup': _ => size += 1
  , 'down': _ => size -= 1
  , 'pynt': e => clear(e)
  },
  { 'name': 'floodwaves'
  , 'upup': _ => size += 1
  , 'down': _ => size -= 1
  , 'left': _ => hue = (hue + 10) % 101
  , 'righ': _ => lig = (lig + 10) % 101
  , 'pynt': e => {ctx.fillStyle = filler(hue, 90, lig, 99); clear(e); fill(e)}
  , 'pard': (data, i) => {
              if (data[i + 3] === 252) {
                let rand = Math.floor(Math.random() * 4)
                let n = [i - w * 4, i + 4, i + w * 4, i - 4][rand]
                if (data[n + 3] === 0 || data[n + 3] === 252) {
                  data[n + 0] = (data[i + 0] + 1) % 256 // red
                  data[n + 1] = (data[i + 1] + 1) % 256 // green
                  data[n + 2] = (data[i + 2] + 1) % 256 // blue
                  data[n + 3] = data[i + 3]
                }
              }
      //   // if(1 > Math.random() * 10) {
      //   //   data[n + 3] = 255
      //   // }
            }
  },
]
let brush = brushes[0] // make_brush(brushes[0])

function noop() {}
function rem(n, r) { return (n % r + r) % r }
function fill(e) {ctx.fillRect(e.offsetX, e.offsetY, size, size)}
function clear(e) {ctx.clearRect(e.offsetX, e.offsetY, size, size)}

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
  let img = new Image()
  img.src = URL.createObjectURL(file)
  img.onload = _ => ctx.drawImage(img, 0, 0)
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
go(partypaint)