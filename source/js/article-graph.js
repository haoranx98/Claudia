(function () {
    var dataElement = document.getElementById('articleGraphData')
    var canvas = document.getElementById('articleGraph')
    if (!dataElement || !canvas) return

    var data = JSON.parse(dataElement.textContent || '{}')
    var nodes = data.nodes || []
    var edges = data.edges || []
    var positions = {}
    var scale = 1
    var offset = { x: 0, y: 0 }
    var movingCanvas = false
    var canvasStart

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    var viewport = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    var edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    var nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    viewport.append(edgeGroup, nodeGroup)
    svg.append(viewport)
    canvas.append(svg)

    function setupPositions() {
        var centerX = (canvas.clientWidth || 260) / 2
        var centerY = (canvas.clientHeight || 220) / 2
        var radius = Math.min(centerX, centerY) * .65
        var relatedCount = Math.max(nodes.length - 1, 1)
        nodes.forEach(function (node, index) {
            var angle = relatedCount === 1
                ? -Math.PI / 4
                : -Math.PI / 2 + (index - 1) / relatedCount * Math.PI * 2
            positions[node.id] = index === 0
                ? { x: centerX, y: centerY }
                : { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }
        })
    }

    function applyTransform() {
        viewport.setAttribute('transform', 'translate(' + offset.x + ' ' + offset.y + ') scale(' + scale + ')')
    }

    function render() {
        setupPositions()
        edgeGroup.innerHTML = ''
        nodeGroup.innerHTML = ''

        edges.forEach(function (edge) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.classList.add('article-graph-edge')
            line.setAttribute('x1', positions[edge.source].x)
            line.setAttribute('y1', positions[edge.source].y)
            line.setAttribute('x2', positions[edge.target].x)
            line.setAttribute('y2', positions[edge.target].y)
            edgeGroup.append(line)
        })

        nodes.forEach(function (node) {
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            var text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            var position = positions[node.id]
            group.classList.add('article-graph-node')
            if (node.current) group.classList.add('is-current')
            circle.setAttribute('r', node.current ? 8 : 6)
            text.setAttribute('x', 10)
            text.setAttribute('y', 4)
            text.textContent = node.label.length > 18 ? node.label.slice(0, 17) + '...' : node.label
            group.append(circle, text)
            group.setAttribute('transform', 'translate(' + position.x + ' ' + position.y + ')')
            group.addEventListener('click', function () {
                if (node.url) window.location.href = node.url
            })
            group.addEventListener('pointerdown', function (event) {
                event.stopPropagation()
                var rect = canvas.getBoundingClientRect()
                group.setPointerCapture(event.pointerId)
                function move(moveEvent) {
                    position.x = (moveEvent.clientX - rect.left - offset.x) / scale
                    position.y = (moveEvent.clientY - rect.top - offset.y) / scale
                    group.setAttribute('transform', 'translate(' + position.x + ' ' + position.y + ')')
                    renderEdges()
                }
                function end() {
                    group.removeEventListener('pointermove', move)
                    group.removeEventListener('pointerup', end)
                }
                group.addEventListener('pointermove', move)
                group.addEventListener('pointerup', end)
            })
            nodeGroup.append(group)
        })
        applyTransform()
    }

    function renderEdges() {
        edges.forEach(function (edge, index) {
            var line = edgeGroup.querySelectorAll('line')[index]
            if (!line) return
            line.setAttribute('x1', positions[edge.source].x)
            line.setAttribute('y1', positions[edge.source].y)
            line.setAttribute('x2', positions[edge.target].x)
            line.setAttribute('y2', positions[edge.target].y)
        })
    }

    canvas.addEventListener('pointerdown', function (event) {
        if (event.target !== svg) return
        movingCanvas = true
        canvasStart = { x: event.clientX - offset.x, y: event.clientY - offset.y }
        svg.setPointerCapture(event.pointerId)
    })
    canvas.addEventListener('pointermove', function (event) {
        if (!movingCanvas) return
        offset.x = event.clientX - canvasStart.x
        offset.y = event.clientY - canvasStart.y
        applyTransform()
    })
    canvas.addEventListener('pointerup', function () { movingCanvas = false })
    canvas.addEventListener('wheel', function (event) {
        event.preventDefault()
        scale = Math.min(2.5, Math.max(.6, scale * (event.deltaY < 0 ? 1.1 : .9)))
        applyTransform()
    }, { passive: false })
    window.addEventListener('resize', render)
    render()
})()
