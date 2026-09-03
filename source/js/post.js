var $posts = {
    scroller: function () {
        function Scroller() {
            this.callbacks = []
            return this
        }
        Scroller.prototype.bindScrollEvent = function () {
            var _that = this

            window.addEventListener('scroll', function (event) {
                var wait = false
                var beforeOffsetY = window.pageYOffset

                if (wait) return
                wait = true

                setTimeout(function () {
                    var params = {
                        event: event,
                        beforeOffsetY: beforeOffsetY,
                    }
                    _that.callbacks.forEach(function (func) { func(params) })

                    wait = false
                }, 150)
            })
        }

        return Scroller
    },
    showTopic: function (evt) {
        var topicEl = document.getElementById('postTopic')
        var postTitle = document.getElementById('postTitle')

        var postTitleCoordinate = postTitle.getBoundingClientRect()
        var threshold = postTitle.offsetTop + postTitleCoordinate.height

        // show title
        if (window.pageYOffset > threshold) {
            var beforeOffsetY = evt && evt.beforeOffsetY
            var isScrollToTop = beforeOffsetY - window.pageYOffset > 0

            topicEl.classList.remove('is-hidden-topic-bar')

            if (beforeOffsetY - window.pageYOffset === 0) {
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-post-title')
                topicEl.classList.remove('immediately-show')

                if (topicEl.classList.contains('is-show-scrollToTop-tips')) {
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.add('is-flash-scrollToTop-tips')
                }
                else {
                    topicEl.classList.add('immediately-show')
                }
            }
            // scroll to up👆
            else if (isScrollToTop) {
                // show scroll to top tips
                if (window.pageYOffset > window.innerHeight * 2) {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-switch-post-title')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-show-scrollToTop-tips')
                }
                // show post title
                else {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-switch-post-title')
                }
            }
            // scroll to down👇
            else if (beforeOffsetY - window.pageYOffset !== 0) {
                topicEl.classList.remove('immediately-show')
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-scrollToTop-tips')
                topicEl.classList.remove('is-flash-scrollToTop-tips')
                topicEl.classList.add('is-show-post-title')
            }
        }
        else{
            // hidden all
            topicEl.classList.remove('is-flash-scrollToTop-tips')
            topicEl.classList.remove('is-show-scrollToTop-tips')
            topicEl.classList.remove('is-switch-post-title')
            topicEl.classList.remove('is-show-post-title')
            topicEl.classList.remove('immediately-show')

            topicEl.classList.add('is-hidden-topic-bar')
        }
    },
    catalogueHighlight: function () {
        var directory = document.querySelectorAll('.toc a')
        if (directory.length === 0) {
            return false
        }

        var tocContainer = document.querySelector('.toc')
        return function () {
            var contentTocList = []
            var activeClassName = 'is-active'

            directory.forEach(function (link) {
                if (!link.href) return
                var id = decodeURI(link.href).split('#')[1]
                contentTocList.push(document.getElementById(id))
            })
            var spacing = 60
            var activeTopicEl = null
            var scrollTop = window.pageYOffset
            for (var i = 0; i < contentTocList.length; i++) {
                var currentTopic = contentTocList[i]

                if (currentTopic.offsetTop > scrollTop + spacing / 2) {
                    // jump to next loop
                    continue
                }

                if (!activeTopicEl) {
                    activeTopicEl = currentTopic
                } else if (currentTopic.offsetTop + spacing >= activeTopicEl.offsetTop - spacing) {
                    activeTopicEl = currentTopic
                }

                var beforeActiveEl = document.querySelector('.toc' + ' .' + activeClassName)
                beforeActiveEl && beforeActiveEl.classList.remove(activeClassName)

                var selectTarget = '.toc a[href="#' + encodeURI(activeTopicEl.id) + '"]'
                var direc = document.querySelector(selectTarget)
                direc.classList.add(activeClassName)

                var tocContainerHeight = tocContainer.getBoundingClientRect().height
                if (direc.offsetTop >= tocContainerHeight - spacing) {
                    tocContainer.scrollTo({
                        // top: direc.offsetTop - spacing,
                        top: direc.offsetTop + 100 - tocContainerHeight,
                    })
                }
                else {
                    tocContainer.scrollTo({ top: 0 })
                }
            }
        }
    },
    smoothScrollToTop: function() {
        var Y_TopValve = (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop);
        if (Y_TopValve > 1) {
            window.requestAnimationFrame($posts.smoothScrollToTop);
            scrollTo(0, Math.floor(Y_TopValve * 0.85));
        } else {
            scrollTo(0, 0);
        }
    },
    addValineComment() {
        var el = document.getElementById('vcomments')
        new Valine({
            el: '#vcomments',
            appId: el.dataset.comment_valine_id,
            appKey: el.dataset.comment_valine_key
        })
    },
    addCodeLanguageLabels: function () {
        var languageNames = {
            bash: 'Shell',
            c: 'C',
            cpp: 'C++',
            cs: 'C#',
            css: 'CSS',
            html: 'HTML',
            java: 'Java',
            javascript: 'JavaScript',
            js: 'JavaScript',
            json: 'JSON',
            markdown: 'Markdown',
            md: 'Markdown',
            php: 'PHP',
            py: 'Python',
            python: 'Python',
            sh: 'Shell',
            shell: 'Shell',
            sql: 'SQL',
            ts: 'TypeScript',
            typescript: 'TypeScript',
            xml: 'XML',
            yaml: 'YAML',
            yml: 'YAML'
        }

        document.querySelectorAll('.post-content figure.highlight').forEach(function (block) {
            var language = Array.prototype.find.call(block.classList, function (className) {
                return className !== 'highlight'
            })
            if (!language) return

            var label = document.createElement('span')
            label.className = 'code-language'
            label.textContent = languageNames[language] || language
            block.insertBefore(label, block.firstChild)

            var copyButton = document.createElement('button')
            copyButton.className = 'copy-code'
            copyButton.type = 'button'
            copyButton.textContent = 'Copy'
            copyButton.setAttribute('aria-label', 'Copy code')
            copyButton.addEventListener('click', function () {
                var code = block.querySelector('.code').innerText

                function copied() {
                    copyButton.textContent = 'Copied'
                    setTimeout(function () {
                        copyButton.textContent = 'Copy'
                    }, 1500)
                }

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(code).then(copied)
                    return
                }

                var textarea = document.createElement('textarea')
                textarea.value = code
                textarea.style.position = 'fixed'
                textarea.style.opacity = '0'
                document.body.appendChild(textarea)
                textarea.select()
                document.execCommand('copy')
                textarea.remove()
                copied()
            })
            block.insertBefore(copyButton, block.firstChild)

            if (block.querySelectorAll('.line').length > 16) {
                block.classList.add('is-collapsed')
                var toggleCode = document.createElement('button')
                toggleCode.className = 'toggle-code'
                toggleCode.type = 'button'
                toggleCode.textContent = 'Show full code'
                toggleCode.addEventListener('click', function () {
                    block.classList.remove('is-collapsed')
                    toggleCode.remove()
                })
                block.append(toggleCode)
            }
        })
    },
    renderMermaid: function () {
        if (!window.mermaid) return

        var diagrams = []
        document.querySelectorAll('.post-content figure.highlight, .post-content pre > code.highlight').forEach(function (block, index) {
            var code = block.querySelector('.code') ? block.querySelector('.code').innerText : block.innerText
            var isMermaid = block.classList.contains('mermaid') || /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|timeline|journey|quadrantChart|sankey)/m.test(code.trim())
            if (!isMermaid) return

            var diagram = document.createElement('div')
            diagram.className = 'mermaid-diagram'
            diagram.id = 'mermaid-diagram-' + index
            diagram.textContent = code
            diagram.dataset.mermaidSource = code
            ;(block.matches('code.highlight') ? block.parentElement : block).replaceWith(diagram)
            diagrams.push(diagram)
        })

        if (diagrams.length) {
            mermaid.run({ nodes: diagrams }).then(function () {
                diagrams.forEach(function (diagram) {
                    var menu = document.createElement('div')
                    menu.className = 'mermaid-copy-menu'

                    var toggle = document.createElement('button')
                    toggle.className = 'mermaid-copy-toggle'
                    toggle.type = 'button'
                    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"></path></svg>'
                    toggle.setAttribute('aria-label', 'Copy diagram')
                    toggle.setAttribute('aria-expanded', 'false')

                    var options = document.createElement('div')
                    options.className = 'mermaid-copy-options'

                    function showCopied(button) {
                        var label = button.textContent
                        button.textContent = 'Copied'
                        setTimeout(function () {
                            button.textContent = label
                        }, 1500)
                    }

                    function copyText(text, button) {
                        if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(text).then(function () { showCopied(button) })
                            return
                        }

                        var textarea = document.createElement('textarea')
                        textarea.value = text
                        textarea.style.position = 'fixed'
                        textarea.style.opacity = '0'
                        document.body.appendChild(textarea)
                        textarea.select()
                        document.execCommand('copy')
                        textarea.remove()
                        showCopied(button)
                    }

                    var copySource = document.createElement('button')
                    copySource.className = 'mermaid-copy-option'
                    copySource.type = 'button'
                    copySource.textContent = 'Copy Mermaid code'
                    copySource.addEventListener('click', function () {
                        copyText(diagram.dataset.mermaidSource, copySource)
                        menu.classList.remove('is-open')
                        toggle.setAttribute('aria-expanded', 'false')
                    })

                    var copySvg = document.createElement('button')
                    copySvg.className = 'mermaid-copy-option'
                    copySvg.type = 'button'
                    copySvg.textContent = 'Copy SVG image'
                    copySvg.addEventListener('click', function () {
                        var svg = diagram.querySelector('svg')
                        if (!svg) return

                        var source = new XMLSerializer().serializeToString(svg)
                        if (navigator.clipboard && window.isSecureContext && window.ClipboardItem) {
                            var item = new ClipboardItem({ 'image/svg+xml': new Blob([source], { type: 'image/svg+xml' }) })
                            navigator.clipboard.write([item]).then(function () { showCopied(copySvg) }).catch(function () {
                                copyText(source, copySvg)
                            })
                        } else {
                            copyText(source, copySvg)
                        }
                        menu.classList.remove('is-open')
                        toggle.setAttribute('aria-expanded', 'false')
                    })

                    toggle.addEventListener('click', function () {
                        var isOpen = menu.classList.toggle('is-open')
                        toggle.setAttribute('aria-expanded', String(isOpen))
                    })

                    options.append(copySource, copySvg)
                    menu.append(toggle, options)
                    diagram.append(menu)
                })
            })
        }
    },
    loadUtterances: function () {
        var container = document.getElementById('utterances')
        if (!container || !window.IntersectionObserver) return

        var observer = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return
            var script = document.createElement('script')
            script.async = true
            script.src = 'https://utteranc.es/client.js'
            script.setAttribute('repo', container.dataset.repo)
            script.setAttribute('issue-term', container.dataset.issueTerm)
            script.setAttribute('theme', container.dataset.theme)
            if (container.dataset.label) script.setAttribute('label', container.dataset.label)
            container.append(script)
            observer.disconnect()
        }, { rootMargin: '300px' })
        observer.observe(container)
    },
    mounted: function () {
        hljs && hljs.initHighlighting()
        this.renderMermaid()
        this.addCodeLanguageLabels()
        this.loadUtterances()

        var Scroller = this.scroller()
        var scrollerInstance = new Scroller()

        var catalogueHighlight = this.catalogueHighlight()
        catalogueHighlight && scrollerInstance.callbacks.push(catalogueHighlight)

        scrollerInstance.callbacks.push(this.showTopic)

        scrollerInstance.bindScrollEvent()

        $claudia.fadeInImage(document.querySelectorAll('.post-content img'))

        var progress = document.getElementById('readingProgress')
        if (progress) {
            window.addEventListener('scroll', function () {
                var scrollable = document.documentElement.scrollHeight - window.innerHeight
                progress.style.width = (scrollable > 0 ? window.pageYOffset / scrollable * 100 : 0) + '%'
            })
        }

        document.getElementById('postTopic').addEventListener('click', this.smoothScrollToTop)

        window.Valine && this.addValineComment()
    }
}

$posts.mounted()
