
const speed = 9;

const moveBackground = () => {
    let mouseXPos = (event.x / window.innerWidth)*100;
    let mouseYPos = (event.y / window.innerHeight)*100;
    document.getElementById('animatedTextHeading').style.backgroundPosition = `${mouseXPos / speed}% ${mouseYPos / speed}%`;
}

document.body.addEventListener('mousemove', moveBackground);