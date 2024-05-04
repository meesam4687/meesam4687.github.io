function Text() {
    let openRepos = () => { window.location.href = "https://github.com/meesam4687?tab=repositories" }
    return (
        <div className="aboutText"><p className="txt1">Hello&nbsp;<img className="waveGif" src="https://em-content.zobj.net/source/noto-emoji-animations/344/waving-hand_light-skin-tone_1f44b-1f3fb_1f3fb.gif"></img></p>
            <p className="txt1">I am Meesam</p>
            <p className="txt1">I make&nbsp;<span onClick={openRepos}>random stuff</span></p>
        </div>
    );
}

export default Text;