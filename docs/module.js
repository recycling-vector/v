import {
  CSV
} from "./CSV.js"

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
    const start = 5
    const length = 15
    const items = csv[0].slice(start, start + length)
    const popup = new maplibregl.Popup({
      closeButton: false, closeOnClick: false
    })
    map.on('click', 'places', (e) => {
      let idx = e.features[0].properties.idx
      let u = new SpeechSynthesisUtterance()
      u.lang = 'ja-JP'
      const collectedItems = items.filter(
        item => csv[idx][items.indexOf(item)] === 't'
      )
      u.text = csv[idx][0] + '。' +
        csv[idx][2] + '。' + (collectedItems.length ? 
        collectedItems.join('、') + '' :
        '回収はありません。') 
      if (voice) u.voice = voice
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    })
    map.addSource('places', {
      type: 'geojson',
      data: geojson
    })
    map.addLayer({
      id: 'places',
      type: 'symbol',
      source: 'places',
      layout: {
        'text-field': '♻',
        'text-size': [
          'interpolate',
          ['exponential', 2],
          ['zoom'],
          5, 10,
          18, 100
        ],
        'text-font': [
          'NotoSansCJKjp-Regular'
        ]
      },
      paint: {
        'text-color': '#0f0'
      }
    })
    map.on('mouseenter', 'places', e => {
      map.getCanvas().style.cursor = 'pointer'
      const coordinates = 
        e.features[0].geometry.coordinates.slice()
      const idx = e.features[0].properties.idx
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 
	  360 : -360
      }
      const collectedItems = items.filter(
        item => csv[idx][items.indexOf(item)] === 't'
      )
      const html = 
        `<h3>${csv[idx][0]}</h3>${csv[idx][2]}` +
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

const csv = await CSV.fetch('data.csv')
const geojson = {
  type: 'FeatureCollection',
  features: []
}
for(let i = 1; i < csv.length; i++) {
  geojson.features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [
        parseFloat(csv[i][4]),
        parseFloat(csv[i][3])
      ]
    },
    properties: {
      idx: i
    }
  })
}

window.onload = () => {
  showMap()
}
