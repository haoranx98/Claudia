(function () {
    var dataElement = document.getElementById('knowledgeGraphData')
    var canvas = document.getElementById('knowledgeGraph')
    if (!dataElement || !canvas) return

    var data = JSON.parse(dataElement.textContent || '{}')
    var nodes = data.nodes || []
    var edges = data.edges || []
    var visibleFilter = 'all'
    var query = ''
    var scale = 1
    var offset = { x: 0, y: 0 }
    var draggingCanvas = false
    var dragStart
    var positions = {}

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    var viewport = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    var edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    var nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.setAttribute('aria-hidden', 'true')
    viewport.append(edgeGroup, nodeGroup)
    svg.append(viewport)
    canvas.append(svg)

    function visible(node) {
        return (visibleFilter === 'all' || node.type === visibleFilter) && (!query || node.label.toLowerCase().indexOf(query) > -1)
    }

    function setupPositions() {
        var width = canvas.clientWidth || 800
        var height = canvas.clientHeight || 500
        var centerX = width / 2
        var centerY = height / 2
        nodes.forEach(function (node, index) {
            if (positions[node.id]) return
            var angle = index / Math.max(nodes.length, 1) * Math.PI * 2
            var radius = Math.min(width, height) * .32
            positions[node.id] = { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }
        })
    }

    function nodeMap() {
        var map = {}
        nodes.forEach(function (node) { map[node.id] = node })
        return map
    }

    function render() {
        setupPositions()
        var map = nodeMap()
        edgeGroup.innerHTML = ''
        nodeGroup.innerHTML = ''
        var active = {}
        nodes.forEach(function (node) { active[node.id] = visible(node) })

        edges.forEach(function (edge) {
            if (!active[edge.source] || !active[edge.target]) return
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.classList.add('graph-edge')
            line.setAttribute('x1', positions[edge.source].x)
            line.setAttribute('y1', positions[edge.source].y)
            line.setAttribute('x2', positions[edge.target].x)
            line.setAttribute('y2', positions[edge.target].y)
            edgeGroup.append(line)
        })

        nodes.forEach(function (node) {
            if (!active[node.id]) return
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            var text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            var position = positions[node.id]
            var radius = node.type === 'post' ? 9 : 7
            group.classList.add('graph-node')
            group.dataset.type = node.type
            circle.setAttribute('r', radius)
            text.setAttribute('x', radius + 5)
            text.setAttribute('y', 4)
            text.textContent = node.label.length > 28 ? node.label.slice(0, 27) + '...' : node.label
            group.append(circle, text)
            group.setAttribute('transform', 'translate(' + position.x + ' ' + position.y + ')')
            group.addEventListener('click', function () {
                if (node.url) window.location.href = node.url
            })
            group.addEventListener('pointerdown', function (event) {
                event.stopPropagation()
                group.setPointerCapture(event.pointerId)
                var rect = canvas.getBoundingClientRect()
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
        var lines = edgeGroup.querySelectorAll('line')
        var map = nodeMap()
        var activeEdges = edges.filter(function (edge) { return visible(map[edge.source]) && visible(map[edge.target]) })
        activeEdges.forEach(function (edge, index) {
            var line = lines[index]
            if (!line) return
            line.setAttribute('x1', positions[edge.source].x)
            line.setAttribute('y1', positions[edge.source].y)
            line.setAttribute('x2', positions[edge.target].x)
            line.setAttribute('y2', positions[edge.target].y)
        })
    }

    function applyTransform() {
        viewport.setAttribute('transform', 'translate(' + offset.x + ' ' + offset.y + ') scale(' + scale + ')')
    }

    canvas.addEventListener('pointerdown', function (event) {
        if (event.target !== svg) return
        draggingCanvas = true
        dragStart = { x: event.clientX - offset.x, y: event.clientY - offset.y }
        svg.setPointerCapture(event.pointerId)
    })
    canvas.addEventListener('pointermove', function (event) {
        if (!draggingCanvas) return
        offset.x = event.clientX - dragStart.x
        offset.y = event.clientY - dragStart.y
        applyTransform()
    })
    canvas.addEventListener('pointerup', function () { draggingCanvas = false })
    canvas.addEventListener('wheel', function (event) {
        event.preventDefault()
        scale = Math.min(2.5, Math.max(.5, scale * (event.deltaY < 0 ? 1.1 : .9)))
        applyTransform()
    }, { passive: false })

    document.querySelectorAll('.graph-filter').forEach(function (button) {
        button.addEventListener('click', function () {
            visibleFilter = button.dataset.filter
            document.querySelectorAll('.graph-filter').forEach(function (item) { item.classList.toggle('is-active', item === button) })
            render()
        })
    })
    document.getElementById('graphSearch').addEventListener('input', function (event) {
        query = event.target.value.trim().toLowerCase()
        render()
    })
    document.getElementById('graphReset').addEventListener('click', function () {
        scale = 1
        offset = { x: 0, y: 0 }
        positions = {}
        render()
    })
    window.addEventListener('resize', render)
    render()
})()
