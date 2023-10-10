const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d', {willReadFrequently: true})
let w = can.width
let h = can.height
let size = 5
let party = 0
let paintmode = 0
let lightness = 50
let hue = 0
let up = 0

can.addEventListener('mousemove', e => {
  if(paintmode === 0) {
    ctx.fillStyle = '#000000'
  }
  if(paintmode === 1) {
    ctx.fillStyle = filler(hue, 90, lightness, 100)
  }
  if(paintmode === 3) {
    ctx.fillStyle = filler(hue, 90, lightness, 99)
  }
  if(up === 0) {
    if(paintmode === 2 || paintmode === 3) {
      ctx.clearRect(e.offsetX, e.offsetY, size, size)
    }
    if(paintmode !== 2) {
      ctx.fillRect(e.offsetX, e.offsetY, size, size)
    }
  }
  console.log(ctx.fillStyle)
})

document.addEventListener('keydown', e => {
  if(e.code === 'ArrowUp' || e.code === 'KeyW') {
    size = size + 1
  }
  if(e.code === 'ArrowDown' || e.code === 'KeyS') {
    size = size - 1
  }
  if(e.code === 'ArrowLeft' || e.code === 'KeyA') {
    lightness = (lightness + 10) % 101
  }
  if(e.code === 'ArrowRight' || e.code === 'KeyD') {
    hue = hue + 10
  }
  if(e.code === 'Space') {
    paintmode = (paintmode + 1) % 4
  }
  if(e.code === 'KeyP' || e.code === 'KeyE') {
    party = (party + 1) % 2
  }
  if(e.code === 'KeyQ') {
    up = (up + 1) % 2
  }

  show_mode()
})

function show_mode() {
  el('mode').innerHTML = `${['draw','paint','erase','fill'][paintmode]} ${size}px ${hue}H 0S ${lightness}L ${up&&'invisible'||''} ${party&&'PARTY!!!'||''}`
}

function filler(h, s, l, a) { // 0 - 100
  return `hsl(${h * 3.6}, ${s}%, ${l}%, ${a}%)`
}

function partypaint() {
  if (party) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] || data[i + 1] || data[i + 2]) {
        data[i + 0] = (data[i + 0] + 1) % 256 // red
        data[i + 1] = (data[i + 1] + 1) % 256 // green
        data[i + 2] = (data[i + 2] + 1) % 256 // blue
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }
}

function floodfill() {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 252) {
      let rand = Math.floor(Math.random()*4)
      let n = [i-w*4,i+4,i+w*4,i-4][rand]
      if(data[n+3] === 0 || data[n+3] === 252) {
        data[n + 0] = (data[i + 0] + 1) % 256 // red
        data[n + 1] = (data[i + 1] + 1) % 256 // green
        data[n + 2] = (data[i + 2] + 1) % 256 // blue
        data[n + 3] = data[i + 3]
      }
      // if(1 > Math.random() * 10) {
      //   data[n + 3] = 255
      // }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function comp(f, g) {
  return x => f(g(x))
}

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



async function load(t) {
  let file = t.srcElement.files?.[0]
  let img = new Image()
  img.src = URL.createObjectURL(file)
  img.onload = _ => ctx.drawImage(img, 0, 0)
}

el('export').addEventListener('click', save)
el('import').addEventListener('change', load)

function go(f) {
  requestAnimationFrame(e => {
    f()
    go(f)
  })
}

show_mode()
go(comp(floodfill, partypaint))