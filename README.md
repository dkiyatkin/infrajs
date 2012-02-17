# Описание
Клиентский веб-фреймворк, для создания интерактивных быстрых сайтов, с помощью JS.

**Слой** — объект описывающий правила для вставки html, js, css и других элементов в существующий документ.

**Контроллер** — `infra.index` массив или объект, представляет собой один родительский слой, или массив родительских слоев.


## Пользователские параметры слоя

Все текстовые данные загружаемых файлов сохраняются в `infra.load.cache['path/to/file'].text`.
Если нужно распарсить шаблон, результат хранится у каждого слоя отдельно в `layer.htmlString`

### layer.tag = 'selector'
Указывает в какое место документа будет вставляться слой.

### layer.state = 'state'
Состояние при котором слой должен показаться, задается в виде строки регулярного выражения, по-умолчанию равно '/'.

### layer.css = '/path/to/style.css'
Путь для загрузки CSS-стилей слоя.

### layer.json = '/path/to/json/data.json'
Путь для загрузки json-данных.

### layer.tpl = '/path/to/template.tpl'
Путь для загрузки шаблона. В качестве контекста для шаблона передается `{layer}`.

### layer.label = 'layerLabel'
Метка слоя, может быть одинаковой у нескольких слоев.
Получить массив слоев с определенной меткой — `infra.labels['layerLabel']`.

### layer.ext = '/path/to/ext/layer.js'
Путь для загрузки внешнего слоя. После загрузки параметры внешнего слоя добавляются к локальному, но при совпадении не переопределяются.

### layer.config = {config}
Пользовательские данные слоя. Если есть `layer.ext.config`, то	от туда рекурсивно добавляются новые значения, но при совпадении не переопределяются.

### layer.oncheck([cb])
Текущий слой будет доступен в переменной `{this}`.
Если задана функция `cb()`, то сборка дожидается окончания выполнения этой функции.
Функция `layer.oncheck` срабатывает каждый раз, когда слой прошел проверку на показ.
Все данные слоя только после этого начинают загружаются, если они не загружены были до этого.

### layer.onload([cb])
Текущий слой будет доступен в переменной `{this}`.
Если задана функция `cb()`, то сборка дожидается окончания выполнения этой функции.
Функция `layer.onload` срабатывает каждый раз, при окончании загрузки всех данных слоя,
после этого слой идет на обработку для вставки в DOM, парситься шаблон и тд.

### layer.onshow([cb])
Текущий слой будет доступен в переменной `{this}`.
Если задана функция `cb()`, то сборка дожидается окончания выполнения этой функции.
Функция `layer.onshow` срабатывает каждый раз, когда слой распарсился и вставился в DOM.

### layer.tags = {tags}
Содержит объект, ключи в котором вида `layer.tag`, в значениях ключей определяются новые слои.
У новых слоев `layer.tag` будет равен его ключу. Причем анализ `layer.tag` нового слоя, будет
проходить относительно `layer.tag` родительского слоя.
Все новые слои попадают в массив `layer.childs` родительского слоя.
У каждого нового слоя параметр `layer.parent` ссылается на родителя.

### layer.states = {states}
Содержит объект, ключи в котором вида `layer.state`, в значениях ключей определяются новые слои.
У новых слоев `layer.state` будет равен его ключу. Причем анализ `layer.state` нового слоя, будет
проходить относительно `layer.state` родительского слоя.
Все новые слои попадают в массив `layer.childs` родительского слоя.
У каждого нового слоя параметр `layer.parent` ссылается на родителя.


## Системные параметры слоя
Появляются после оброботки контроллера системой, также эти параметры можно определять вручную.
При наличии соответствующих условий, параметры могут быть произвольно изменены системой.
Если же условий для изменения нет, системный параметр, заданный вручную или нет, обработается как нужно.

### layer.data = {data}
Данные слоя, обычно используемые для вставки в шаблон.
Данные так же хранятся в `infra.load.cache['/path/to/json/data.json'].data`
Загружаются и парсятся из файла определенного в `layer.json`.

### layer.tplString = '<p>{{tplString}}</p>'
Текстовый шаблон для вставки в дом.

### layer.htmlString = '<p>htmlString</p>'
Текстовые распарсенные шаблонные данные для вставки в дом.

### layer.node = [NodeList] || {HTMLElement}
DOM-узел или узлы, куда вставиться слой.

### layer.id = 'layerId'
Уникальный id слоя. Получить нужный слой по id — `infra.ids['layerId']`.

### layer.parent = {parentLayer}
Ссылка на родительский слой.

### layer.childs = [childLayers]
Ссылка на массив дочерних слоев.
