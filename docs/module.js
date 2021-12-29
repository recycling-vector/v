const style = href => {
  const e = document.createElement('link')
  e.href = href
  e.rel = 'stylesheet'
  document.head.appendChild(e)
}

const script = src => {
  const e = document.createElement('script')
  e.src = src
  document.head.appendChild(e)
}

const init = () => {
  style('style.css')
  style('maplibre-gl.css')
  script('maplibre-gl.js')
  const map = document.createElement('div')
  map.id = 'map'
  document.body.appendChild(map)
}
init()

const showMap = async () => {
  const mapgl = maplibregl
  const map = new mapgl.Map({
    container: 'map',
    hash: true,
    style: 'style.json',
    maxZoom: 17.8
  })
  map.addControl(new mapgl.NavigationControl())
  map.addControl(new mapgl.ScaleControl({
    maxWidth: 200, unit: 'metric'
  }))
  map.addControl(new mapgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true
  }))

  let voice = null
  for(let v of speechSynthesis.getVoices()) {
    if (v.name == 'Kyoko') voice = v
  }

  map.on('load', () => {
    const popup = new maplibregl.Popup({
      closeButton: false, closeOnClick: false
    })
    map.on('click', 'places', (e) => {
      const props = e.features[0].properties
      let u = new SpeechSynthesisUtterance()
      u.lang = 'ja-JP'
      u.text = props['店名'] + '。' +
        props['住所'] + '。' +
        Object.keys(props).filter(
          k => props[k] == 't'
        ).join('、')
      if (voice) u.voice = voice
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    })
    map.on('mouseenter', 'places', e => {
      map.getCanvas().style.cursor = 'pointer'
      const coordinates = 
        e.features[0].geometry.coordinates.slice()
      const props = e.features[0].properties
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 
	  360 : -360
      }
      const collectedItems = Object.keys(props).filter(
        k => props[k] == 't'
      )
      const html = 
        `<h3>${props.店名}</h3>${props.住所}` +
        (
	  collectedItems.length != 0 ?
	  '<ul>' + 
	  collectedItems.map(item => `<li>${item}</li>`).join('') +
          '</ul>' :
          '<p>回収はありません</p>'
        )
      popup.setLngLat(coordinates).setHTML(html).addTo(map)
    })
    map.on('mouseleave', 'places', () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
  })
}

window.onload = () => {
  showMap()
}
