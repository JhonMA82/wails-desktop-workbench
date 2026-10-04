# Third-party licences

Mandatory boilerplate dependencies must remain open source and commercially usable without paid runtime or developer licences.

The installed npm dependency graph (including development tools and transitives) is recorded in NPM_LICENSES.json. Every installed package declares a licence; the graph contains MIT, MIT-0, ISC, Apache-2.0, BSD-2/3-Clause, 0BSD, MPL-2.0, CC-BY-4.0, BlueOak-1.0.0, Python-2.0 and Unlicense packages. These require no paid runtime/developer licence. Python-2.0 is a licence identifier of a JavaScript dependency; no Python runtime is bundled.

GO_LICENSES.json records the exact modules used by the compiled Linux host and their available licence-file headers. Wails is MIT. Go's standard toolchain is BSD. System GTK/WebKit libraries have their own LGPL/BSD licences; native distributions must preserve their notices and comply with redistribution obligations. Open source does not waive attribution/copyleft obligations.

The locally adapted shadcn Button pattern and component conventions originate from shadcn/ui (MIT):

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Upstream references: https://github.com/shadcn-ui/ui, https://github.com/caplin/FlexLayout, https://github.com/wailsapp/wails.
