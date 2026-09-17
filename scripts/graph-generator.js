hexo.extend.generator.register('claudia-knowledge-graph', function () {
    return {
        path: 'graph/index.html',
        data: { title: 'Knowledge Graph' },
        layout: ['graph']
    }
})
