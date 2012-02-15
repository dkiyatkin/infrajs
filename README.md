# Описание

Клиентский веб-фреймворк, для создания интерактивных быстрых сайтов, с помощью JS.

**Слой** — объект описывающий правила для вставки html, js, css и других элементов в существующий документ.

**Контроллер** — `infra.index` массив или объект, представляет собой или один родительский слой, или массив родительских слоев.


## Параметры слоя

Назначаются вручную.

### layer.tag = 'selector'

Указывает в какое место документа будет вставляться слой.

### layer.div = 'id'

Узкий аналог `layer.tag`, указывается id элемента куда слой будет помещен.



## Системные параметры слоя

Появляются после оброботки контроллера системой. Назначаются автоматически.

### layer.node = [NodeList] || {HTMLElement}

Найденный DOM-узел или узлы, куда вставиться слой.