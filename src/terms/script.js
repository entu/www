function adjustHeight() {
    const terms = document.getElementById('terms')
    const termsTop = terms.getBoundingClientRect().top
    const windowHeight = window.innerHeight
    let adjustedHeight = windowHeight - termsTop

    const footer = document.getElementById('footer')
    const footerHeight = footer.offsetHeight

    adjustedHeight = adjustedHeight - footerHeight

    document.getElementById('terms').style.height = adjustedHeight + 'px'
}

window.onload = adjustHeight
window.onresize = adjustHeight
