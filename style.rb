require 'yaml'
require 'json'
require './constants'

gsi_style = JSON.parse($stdin.read)

style = <<-EOS
version: 8
center: #{CENTER}
zoom: #{ZOOM}
sprite: #{gsi_style['sprite']}
glyphs: #{gsi_style['glyphs']}
layers: []
EOS

style = YAML.load(style)
style['sources'] = gsi_style['sources']
style['sources'][DATA_LAYER] = {
  :type => 'vector',
  :tiles => [DATA_TILE_URL],
  :maxzoom => DATA_TILE_MAXZOOM
}
gsi_style['layers'].each {|layer|
  layer.delete('metadata')
  style['layers'].insert(-1, layer)
}
style['layers'].push({
  :id => DATA_LAYER,
  :type => 'symbol',
  :source => DATA_LAYER,
  'source-layer' => DATA_LAYER,
  :layout => {
    'text-allow-overlap' => true,
    'text-field' => '♻',
    'text-size' => [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      5, 10,
      18, 100
    ],
    'text-font' => [
      'NotoSansCJKjp-Regular'
    ]
  },
  :paint => {
    'text-color': '#0f0'
  }
})

print JSON.pretty_generate(style)

