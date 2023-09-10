const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d')
let w = can.width
let h = can.height
let size = 5
let party = 0
let paintmode = 0
let hue = 0
let lightness = 50

can.addEventListener('mousemove', e => {
  if(paintmode === 0) {
    ctx.fillStyle = '#000000'
  }
  if(paintmode === 1) {
    ctx.fillStyle = filler(hue, 99, lightness, 100)
  }
  ctx.fillRect(e.offsetX, e.offsetY, size, size)
})

document.addEventListener('keydown', e => {
  if(e.code === 'ArrowUp') {
    size = size + 1
  }
  if(e.code === 'ArrowDown') {
    size = size - 1
  }
  if(e.code === 'ArrowLeft') {
    lightness = (lightness + 10) % 101
  }
  if(e.code === 'ArrowRight') {
    hue = hue + 10
  }
  if(e.code === 'Space') {
    paintmode = (paintmode + 1) % 2
  }
  if(e.code === 'KeyP') {
    party = (party + 1) % 2
  }
})

function go() {
  requestAnimationFrame(e => {
    if (party) {
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] || data[i + 1] || data[i + 2]) {
          data[i] = (data[i] + 1) % 256; // red
          data[i + 1] = (data[i + 1] + 1) % 256; // green
          data[i + 2] = (data[i + 2] + 1) % 256; // blue
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
    go()
  })
}

go()


function filler(h, s, l, a) { // 0 - 100
  return `hsl(${h * 3.6}, ${s}%, ${l}%, ${a}%)`
}