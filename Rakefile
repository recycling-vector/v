require './constants'

desc 'サイトを手元でホストする'
task :host do
  sh 'budo -d docs'
end

desc '地図のスタイルファイルを作成する'
task :style do
  sh <<-EOS
curl #{BASE_STYLE_URL} |
ruby style.rb > docs/style.json
  EOS
end

desc '最新の MapLibre GL JS をダウンロードする'
task :maplibre do
  %w{maplibre-gl.css maplibre-gl.js maplibre-gl.js.map}.each {|fn|
    sh <<-EOS
curl -L -o docs/#{fn} https://unpkg.com/maplibre-gl@#{LIBRE_VERSION}/dist/#{fn}
    EOS
  }
end
