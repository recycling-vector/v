require './constants'
require 'json'

first = true
fields = nil
while gets
  r = $_.strip.split(',')
  raise unless r.size == DATA_N_FIELDS
  if first 
    fields = r 
    first = false
  end
  f = {
    :type => 'Feature',
    :geometry => {
      :type => 'Point',
      :coordinates => [
        r[4].to_f, r[3].to_f
      ]
    },
    :properties => {
    },
    :tippecanoe => {
      :layer => DATA_LAYER,
      :maxzoom => DATA_TILE_MAXZOOM,
      :minzoom => DATA_TILE_MINZOOM
    }
  }
  DATA_N_FIELDS.times {|i|
    f[:properties][fields[i]] = r[i]
  }
  print "\x1e#{JSON.dump(f)}\n"
end
