window.$claudia = {
    throttle: function (func, time) {
        var wait = false
        return function () {
            if (wait) return
            wait = true

            setTimeout(function () {
                func()
                wait = false
            }, time || 100)
        }
    },
    fadeInImage: function(imgs, imageLoadedCallback) {
        var images = imgs || document.querySelectorAll('.js-img-fadeIn')

        function loaded(event) {
            var image = event.currentTarget

            image.ontransitionend = function () {
                image.ontransitionend = null
                image.style.transition = null
            }
            image.style.transition = 'opacity 320ms'
            image.style.opacity = 1

            if (image.parentElement && image.parentElement.classList.contains('skeleton')) {
                image.parentElement.classList.remove('skeleton')
            }
            imageLoadedCallback && imageLoadedCallback(image)
        }

        images.forEach(function (img) {
            if (img.complete) {
                return loaded({ currentTarget: img })
            }

            img.addEventListener('load', loaded)
        })
    },
    blurBackdropImg: function(image) {
        if (!image.dataset.backdrop) return

        var parent = image.parentElement //TODO: Not finish yes, must be a pure function
        var parentWidth = Math.round(parent.getBoundingClientRect().width)
        var childImgWidth = Math.round(image.getBoundingClientRect().width)

        var isCovered = parentWidth === childImgWidth
        var blurImg = parent.previousElementSibling //TODO: Not finish yes, must be a pure function

        isCovered ? blurImg.classList.add('is-hidden') : blurImg.classList.remove('is-hidden')
    },
    getSystemTheme(callback) {
        var media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', function (e){
            callback && callback(e.matches ? "dark" : "light")
        })

        callback && callback(media.matches ? 'dark' : 'light')
    },
    enableDraggableMusicPlayer: function () {
        var player = document.getElementById('musicPlayer')
        if (!player) return

        var handle = player.querySelector('.music-player-handle')
        var savedPosition = localStorage.getItem('claudia-music-player-position')
        if (savedPosition) {
            var position = JSON.parse(savedPosition)
            player.style.left = position.left + 'px'
            player.style.top = position.top + 'px'
            player.style.right = 'auto'
            player.style.bottom = 'auto'
        }

        handle.addEventListener('pointerdown', function (event) {
            var bounds = player.getBoundingClientRect()
            var offsetX = event.clientX - bounds.left
            var offsetY = event.clientY - bounds.top
            handle.setPointerCapture(event.pointerId)

            function move(moveEvent) {
                var left = Math.min(Math.max(0, moveEvent.clientX - offsetX), window.innerWidth - bounds.width)
                var top = Math.min(Math.max(0, moveEvent.clientY - offsetY), window.innerHeight - bounds.height)
                player.style.left = left + 'px'
                player.style.top = top + 'px'
                player.style.right = 'auto'
                player.style.bottom = 'auto'
            }

            function end() {
                handle.removeEventListener('pointermove', move)
                handle.removeEventListener('pointerup', end)
                localStorage.setItem('claudia-music-player-position', JSON.stringify({
                    left: parseFloat(player.style.left),
                    top: parseFloat(player.style.top)
                }))
            }

            handle.addEventListener('pointermove', move)
            handle.addEventListener('pointerup', end)
        })
    }
}

document.addEventListener('DOMContentLoaded', function () {
    $claudia.enableDraggableMusicPlayer()

    document.addEventListener('keydown', function (event) {
        if ((event.key === '/' || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
            var searchInput = document.getElementById('searchInput')
            if (!searchInput) return
            event.preventDefault()
            searchInput.focus()
            document.getElementById('searchButton').click()
        }
    })
})
