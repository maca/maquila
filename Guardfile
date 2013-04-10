require 'guard/shell'

def compile_coffee file
  `coffee --compile --output lib #{file}`
end

def run_tests
  `phantomjs test/lib/phantom-jasmine/lib/run_jasmine_test.coffee ./test/test-runner.html`
end

guard :shell do
  watch %r{src/(.+).coffee$} do |m|
    compile_coffee m[0]
    run_tests
  end

  watch %r{test/(.+).js$} do
    run_tests
  end
end
