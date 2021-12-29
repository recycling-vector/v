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
gsi_style['layers'].each {|layer|
  layer.delete('metadata')
  style['layers'].insert(-1, layer)
}

print JSON.pretty_generate(style)

